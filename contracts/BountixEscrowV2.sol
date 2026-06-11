// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BountixEscrowV2
 * @notice FCFS (first-come-first-served) escrow with configurable budget,
 *         reward per winner, and max winners. Supports repeated payouts
 *         from a single escrow, duplicate payout prevention, and refund
 *         of unused funds. Preserves fee and treasury behavior from V1.
 */
contract BountixEscrowV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;

    uint256 public constant MIN_AMOUNT = 1_000_000;
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MAX_FEE_BPS = 1_000;
    uint256 public constant DEFAULT_FEE_BPS = 250;

    address public resolver;
    address public treasury;
    uint256 public feeBps;

    enum FCFSState { None, Active, Refunded }

    struct FCFSEscrow {
        address payer;
        uint256 budget;
        uint256 rewardPerWinner;
        uint256 maxWinners;
        uint256 winnerCount;
        uint256 remainingBudget;
        FCFSState state;
    }

    mapping(bytes32 => FCFSEscrow) public fcfsEscrows;
    mapping(bytes32 => mapping(address => bool)) public claimedWinners;

    event FCFSEscrowFunded(
        bytes32 indexed taskId,
        address indexed payer,
        uint256 budget,
        uint256 rewardPerWinner,
        uint256 maxWinners
    );
    event WinnerClaimed(
        bytes32 indexed taskId,
        address indexed winner,
        uint256 grossAmount,
        uint256 feeAmount,
        uint256 netAmount,
        uint256 remainingBudget,
        uint256 winnerCount
    );
    event FCFSEscrowRefunded(
        bytes32 indexed taskId,
        address indexed payer,
        uint256 amount
    );
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

    /**
     * @notice Payer funds a new FCFS escrow with a fixed budget, reward per winner, and max winners.
     * @param taskId Unique off-chain task identifier.
     * @param budget Total USDC budget for the escrow.
     * @param rewardPerWinner Gross reward per winner (fee deducted before transfer).
     * @param maxWinners Maximum number of winners that can claim.
     */
    function fundFCFSEscrow(
        bytes32 taskId,
        uint256 budget,
        uint256 rewardPerWinner,
        uint256 maxWinners
    ) external nonReentrant {
        require(budget >= MIN_AMOUNT, "Budget below minimum (1 USDC)");
        require(rewardPerWinner > 0, "Invalid reward amount");
        require(maxWinners > 0, "Invalid max winners");
        require(fcfsEscrows[taskId].state == FCFSState.None, "FCFS escrow already exists");

        fcfsEscrows[taskId] = FCFSEscrow({
            payer: msg.sender,
            budget: budget,
            rewardPerWinner: rewardPerWinner,
            maxWinners: maxWinners,
            winnerCount: 0,
            remainingBudget: budget,
            state: FCFSState.Active
        });

        usdc.safeTransferFrom(msg.sender, address(this), budget);

        emit FCFSEscrowFunded(taskId, msg.sender, budget, rewardPerWinner, maxWinners);
    }

    /**
     * @notice FCFS claim by a winner. Each unique address can claim once.
     * @param taskId Task identifier.
     */
    function claimReward(bytes32 taskId) external nonReentrant {
        _payWinner(taskId, msg.sender);
    }

    /**
     * @notice Admin pays out one or more winners in a batch.
     * @param taskId Task identifier.
     * @param winners Array of winner addresses to pay.
     */
    function payWinners(bytes32 taskId, address[] calldata winners) external onlyAdmin nonReentrant {
        for (uint256 i = 0; i < winners.length; i++) {
            _payWinner(taskId, winners[i]);
        }
    }

    /**
     * @notice Admin refunds the remaining budget back to the payer.
     * @param taskId Task identifier.
     */
    function refundFCFSEscrow(bytes32 taskId) external onlyAdmin nonReentrant {
        FCFSEscrow storage escrow = fcfsEscrows[taskId];
        require(escrow.state == FCFSState.Active, "FCFS escrow not active");

        escrow.state = FCFSState.Refunded;
        uint256 refundAmount = escrow.remainingBudget;

        if (refundAmount > 0) {
            escrow.remainingBudget = 0;
            usdc.safeTransfer(escrow.payer, refundAmount);
        }

        emit FCFSEscrowRefunded(taskId, escrow.payer, refundAmount);
    }

    function _payWinner(bytes32 taskId, address winner) private {
        require(winner != address(0), "Invalid winner address");
        require(!claimedWinners[taskId][winner], "Already claimed");

        FCFSEscrow storage escrow = fcfsEscrows[taskId];
        require(escrow.state == FCFSState.Active, "FCFS escrow not active");
        require(escrow.winnerCount < escrow.maxWinners, "Max winners reached");
        require(escrow.remainingBudget >= escrow.rewardPerWinner, "Insufficient budget");

        claimedWinners[taskId][winner] = true;
        escrow.winnerCount++;
        escrow.remainingBudget -= escrow.rewardPerWinner;

        uint256 feeAmount = _feeAmount(escrow.rewardPerWinner);
        uint256 netAmount = escrow.rewardPerWinner - feeAmount;

        if (feeAmount > 0) {
            usdc.safeTransfer(treasury, feeAmount);
        }
        usdc.safeTransfer(winner, netAmount);

        emit WinnerClaimed(
            taskId,
            winner,
            escrow.rewardPerWinner,
            feeAmount,
            netAmount,
            escrow.remainingBudget,
            escrow.winnerCount
        );
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

    function getFCFSEscrow(bytes32 taskId) external view returns (FCFSEscrow memory) {
        return fcfsEscrows[taskId];
    }

    function hasClaimed(bytes32 taskId, address winner) external view returns (bool) {
        return claimedWinners[taskId][winner];
    }

    function _feeAmount(uint256 grossAmount) private view returns (uint256) {
        return (grossAmount * feeBps) / BPS_DENOMINATOR;
    }
}
