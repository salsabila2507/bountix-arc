// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BountixEscrowV1
 * @notice USDC-only escrow for Bountix task rewards on Base mainnet.
 * @dev
 *  - V1 is standalone. BountixEscrowV0 is not upgraded or modified.
 *  - USDC is immutable and set once at deploy.
 *  - Minimum escrow amount is 1 USDC (1_000_000 with 6 decimals).
 *  - Admin means owner or resolver, matching V0 operations.
 *  - Platform fee is charged at release time and paid to treasury.
 *  - Raffle payouts require assigned winners and gross payout amounts
 *    that exactly sum to the escrowed amount, preventing stranded funds.
 */
contract BountixEscrowV1 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Base native USDC used for all escrows.
    IERC20 public immutable usdc;

    /// @notice Minimum escrow amount: 1 USDC (USDC has 6 decimals).
    uint256 public constant MIN_AMOUNT = 1_000_000;

    /// @notice Basis point denominator. 10_000 = 100%.
    uint256 public constant BPS_DENOMINATOR = 10_000;

    /// @notice Maximum platform fee: 10%.
    uint256 public constant MAX_FEE_BPS = 1_000;

    /// @notice Default platform fee: 2.5%.
    uint256 public constant DEFAULT_FEE_BPS = 250;

    /// @notice Address allowed to act as admin alongside the owner.
    address public resolver;

    /// @notice Receives platform fees on release.
    address public treasury;

    /// @notice Platform fee in basis points. Defaults to 250 = 2.5%.
    uint256 public feeBps;

    enum EscrowKind {
        None,
        Single,
        Raffle
    }

    enum EscrowState {
        None,
        Funded,
        Released,
        Refunded
    }

    struct Escrow {
        address payer;
        address worker;
        uint256 amount;
        uint256 assignedTotal;
        EscrowKind kind;
        EscrowState state;
    }

    struct RafflePayout {
        address winner;
        uint256 grossAmount;
    }

    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => RafflePayout[]) private rafflePayouts;

    event EscrowFunded(
        bytes32 indexed taskId,
        address indexed payer,
        uint256 amount,
        EscrowKind kind
    );
    event WorkerAssigned(bytes32 indexed taskId, address indexed worker);
    event EscrowReleased(
        bytes32 indexed taskId,
        address indexed worker,
        uint256 grossAmount,
        uint256 feeAmount,
        uint256 netAmount
    );
    event RaffleWinnersAssigned(
        bytes32 indexed taskId,
        address[] winners,
        uint256[] grossAmounts
    );
    event RaffleEscrowReleased(
        bytes32 indexed taskId,
        uint256 grossAmount,
        uint256 totalFee,
        uint256 totalNet,
        uint256 winnerCount
    );
    event EscrowRefunded(bytes32 indexed taskId, address indexed payer, uint256 amount);
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ResolverUpdated(address indexed oldResolver, address indexed newResolver);

    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == resolver, "Not authorized");
        _;
    }

    constructor(
        address _usdc,
        address _resolver,
        address _treasury
    ) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_resolver != address(0), "Invalid resolver address");
        require(_treasury != address(0), "Invalid treasury address");

        usdc = IERC20(_usdc);
        resolver = _resolver;
        treasury = _treasury;
        feeBps = DEFAULT_FEE_BPS;
    }

    receive() external payable {
        revert("No ETH accepted");
    }

    fallback() external payable {
        revert("No ETH accepted");
    }

    function fundEscrow(bytes32 taskId, uint256 amount) external nonReentrant {
        _fund(taskId, amount, EscrowKind.Single);
    }

    function fundRaffleEscrow(bytes32 taskId, uint256 amount) external nonReentrant {
        _fund(taskId, amount, EscrowKind.Raffle);
    }

    function assignWorker(bytes32 taskId, address worker) external onlyAdmin {
        require(worker != address(0), "Invalid worker address");
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(escrow.kind == EscrowKind.Single, "Not single escrow");

        escrow.worker = worker;

        emit WorkerAssigned(taskId, worker);
    }

    function releaseEscrow(bytes32 taskId) external onlyAdmin nonReentrant {
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(escrow.kind == EscrowKind.Single, "Not single escrow");
        require(escrow.worker != address(0), "Worker not assigned");

        escrow.state = EscrowState.Released;

        uint256 feeAmount = _feeAmount(escrow.amount);
        uint256 netAmount = escrow.amount - feeAmount;

        if (feeAmount > 0) {
            usdc.safeTransfer(treasury, feeAmount);
        }
        usdc.safeTransfer(escrow.worker, netAmount);

        emit EscrowReleased(
            taskId,
            escrow.worker,
            escrow.amount,
            feeAmount,
            netAmount
        );
    }

    function assignRaffleWinners(
        bytes32 taskId,
        address[] calldata winners,
        uint256[] calldata grossAmounts
    ) external onlyAdmin {
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(escrow.kind == EscrowKind.Raffle, "Not raffle escrow");
        require(winners.length > 0, "No winners");
        require(winners.length == grossAmounts.length, "Array length mismatch");

        delete rafflePayouts[taskId];

        uint256 total;
        for (uint256 i = 0; i < winners.length; i++) {
            require(winners[i] != address(0), "Invalid winner address");
            require(grossAmounts[i] > 0, "Invalid payout amount");

            total += grossAmounts[i];
            rafflePayouts[taskId].push(
                RafflePayout({winner: winners[i], grossAmount: grossAmounts[i]})
            );
        }

        require(total == escrow.amount, "Payout total mismatch");
        escrow.assignedTotal = total;

        emit RaffleWinnersAssigned(taskId, winners, grossAmounts);
    }

    function releaseRaffleEscrow(bytes32 taskId) external onlyAdmin nonReentrant {
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(escrow.kind == EscrowKind.Raffle, "Not raffle escrow");

        RafflePayout[] storage payouts = rafflePayouts[taskId];
        require(payouts.length > 0, "Raffle winners not assigned");
        require(escrow.assignedTotal == escrow.amount, "Payout total mismatch");

        escrow.state = EscrowState.Released;

        uint256 totalFee;
        uint256 totalNet;

        for (uint256 i = 0; i < payouts.length; i++) {
            uint256 feeAmount = _feeAmount(payouts[i].grossAmount);
            uint256 netAmount = payouts[i].grossAmount - feeAmount;
            totalFee += feeAmount;
            totalNet += netAmount;

            usdc.safeTransfer(payouts[i].winner, netAmount);
        }

        if (totalFee > 0) {
            usdc.safeTransfer(treasury, totalFee);
        }

        emit RaffleEscrowReleased(
            taskId,
            escrow.amount,
            totalFee,
            totalNet,
            payouts.length
        );
    }

    function refundEscrow(bytes32 taskId) external onlyAdmin nonReentrant {
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");

        escrow.state = EscrowState.Refunded;
        uint256 amount = escrow.amount;
        address payer = escrow.payer;

        usdc.safeTransfer(payer, amount);

        emit EscrowRefunded(taskId, payer, amount);
    }

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee exceeds max");

        uint256 oldFeeBps = feeBps;
        feeBps = newFeeBps;

        emit FeeUpdated(oldFeeBps, newFeeBps);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");

        address oldTreasury = treasury;
        treasury = newTreasury;

        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function updateResolver(address newResolver) external onlyOwner {
        require(newResolver != address(0), "Invalid resolver address");

        address oldResolver = resolver;
        resolver = newResolver;

        emit ResolverUpdated(oldResolver, newResolver);
    }

    function getEscrow(bytes32 taskId) external view returns (Escrow memory) {
        return escrows[taskId];
    }

    function getRafflePayouts(bytes32 taskId) external view returns (RafflePayout[] memory) {
        return rafflePayouts[taskId];
    }

    function _fund(bytes32 taskId, uint256 amount, EscrowKind kind) private {
        require(amount >= MIN_AMOUNT, "Amount below minimum (1 USDC)");
        require(escrows[taskId].state == EscrowState.None, "Escrow already exists");
        require(kind == EscrowKind.Single || kind == EscrowKind.Raffle, "Invalid escrow kind");

        escrows[taskId] = Escrow({
            payer: msg.sender,
            worker: address(0),
            amount: amount,
            assignedTotal: 0,
            kind: kind,
            state: EscrowState.Funded
        });

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        emit EscrowFunded(taskId, msg.sender, amount, kind);
    }

    function _feeAmount(uint256 grossAmount) private view returns (uint256) {
        return (grossAmount * feeBps) / BPS_DENOMINATOR;
    }
}
