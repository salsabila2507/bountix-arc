// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BountixEscrowV0
 * @notice Minimal USDC-only escrow for Bountix task rewards on Base mainnet.
 * @dev
 *  - USDC only (no custom token). Set once at deploy via the `usdc` immutable.
 *  - Minimum task reward is 1 USDC (1_000_000 with 6 decimals).
 *  - Escrows are keyed by an off-chain taskId (bytes32).
 *  - Flow: payer funds -> admin assigns worker -> admin releases (or refunds).
 *  - "Admin" means the contract owner OR the configured resolver.
 *  - State machine prevents double release / double refund.
 */
contract BountixEscrowV0 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice USDC token used for all escrows (immutable, set at deploy).
    IERC20 public immutable usdc;

    /// @notice Minimum escrow amount: 1 USDC (USDC has 6 decimals).
    uint256 public constant MIN_AMOUNT = 1_000_000;

    /// @notice Address allowed to act as admin alongside the owner.
    address public resolver;

    /// @notice Lifecycle states for an escrow.
    enum EscrowState {
        None, // 0: never funded
        Funded, // 1: holds USDC, awaiting release/refund
        Released, // 2: paid out to worker (terminal)
        Refunded, // 3: returned to payer (terminal)
        Disputed // 4: flagged, awaiting resolveDispute
    }

    /// @notice Per-task escrow record.
    struct Escrow {
        address payer; // who funded the escrow
        address worker; // who receives funds on release (assigned by admin)
        uint256 amount; // USDC amount held (6 decimals)
        EscrowState state;
    }

    /// @notice taskId => escrow record.
    mapping(bytes32 => Escrow) public escrows;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------
    event EscrowFunded(bytes32 indexed taskId, address indexed payer, uint256 amount);
    event WorkerAssigned(bytes32 indexed taskId, address indexed worker);
    event EscrowReleased(bytes32 indexed taskId, address indexed worker, uint256 amount);
    event EscrowRefunded(bytes32 indexed taskId, address indexed payer, uint256 amount);
    event EscrowDisputed(bytes32 indexed taskId, address indexed by);
    event EscrowResolved(bytes32 indexed taskId, address indexed recipient, uint256 amount, bool releasedToWorker);
    event ResolverUpdated(address indexed oldResolver, address indexed newResolver);

    /// @notice Restricts to the owner or the resolver (the "admin" role).
    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == resolver, "Not authorized");
        _;
    }

    /**
     * @param _usdc USDC token address on Base mainnet.
     * @param _resolver Initial resolver (admin) address.
     */
    constructor(address _usdc, address _resolver) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_resolver != address(0), "Invalid resolver address");
        usdc = IERC20(_usdc);
        resolver = _resolver;
    }

    /**
     * @notice Payer funds a new escrow for a task. Worker is assigned later by an admin.
     * @dev Caller must `approve` this contract for `amount` USDC first.
     * @param taskId Unique off-chain task identifier.
     * @param amount USDC amount to escrow (>= MIN_AMOUNT).
     */
    function fundEscrow(bytes32 taskId, uint256 amount) external nonReentrant {
        require(amount >= MIN_AMOUNT, "Amount below minimum (1 USDC)");
        require(escrows[taskId].state == EscrowState.None, "Escrow already exists");

        escrows[taskId] = Escrow({
            payer: msg.sender,
            worker: address(0),
            amount: amount,
            state: EscrowState.Funded
        });

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        emit EscrowFunded(taskId, msg.sender, amount);
    }

    /**
     * @notice Admin assigns (or reassigns) the worker for a funded escrow.
     * @param taskId Task identifier.
     * @param worker Worker address to receive funds on release.
     */
    function assignWorker(bytes32 taskId, address worker) external onlyAdmin {
        require(worker != address(0), "Invalid worker address");
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");

        escrow.worker = worker;

        emit WorkerAssigned(taskId, worker);
    }

    /**
     * @notice Admin releases the escrowed USDC to the assigned worker.
     * @param taskId Task identifier.
     */
    function releaseEscrow(bytes32 taskId) external onlyAdmin nonReentrant {
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(escrow.worker != address(0), "Worker not assigned");

        escrow.state = EscrowState.Released;
        uint256 amount = escrow.amount;
        address worker = escrow.worker;

        usdc.safeTransfer(worker, amount);

        emit EscrowReleased(taskId, worker, amount);
    }

    /**
     * @notice Admin refunds the escrowed USDC back to the payer.
     * @param taskId Task identifier.
     */
    function refundEscrow(bytes32 taskId) external onlyAdmin nonReentrant {
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");

        escrow.state = EscrowState.Refunded;
        uint256 amount = escrow.amount;
        address payer = escrow.payer;

        usdc.safeTransfer(payer, amount);

        emit EscrowRefunded(taskId, payer, amount);
    }

    /**
     * @notice Payer or worker flags a funded escrow as disputed.
     * @dev Moves no funds; pauses normal release/refund and routes payout through resolveDispute.
     * @param taskId Task identifier.
     */
    function disputeEscrow(bytes32 taskId) external {
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(msg.sender == escrow.payer || msg.sender == escrow.worker, "Not a party");

        escrow.state = EscrowState.Disputed;

        emit EscrowDisputed(taskId, msg.sender);
    }

    /**
     * @notice Admin resolves a disputed escrow, paying out to worker or refunding the payer.
     * @param taskId Task identifier.
     * @param releaseToWorker True to pay the worker, false to refund the payer.
     */
    function resolveDispute(bytes32 taskId, bool releaseToWorker) external onlyAdmin nonReentrant {
        Escrow storage escrow = escrows[taskId];
        require(escrow.state == EscrowState.Disputed, "Escrow not disputed");

        uint256 amount = escrow.amount;
        address recipient;
        if (releaseToWorker) {
            require(escrow.worker != address(0), "Worker not assigned");
            escrow.state = EscrowState.Released;
            recipient = escrow.worker;
        } else {
            escrow.state = EscrowState.Refunded;
            recipient = escrow.payer;
        }

        usdc.safeTransfer(recipient, amount);

        emit EscrowResolved(taskId, recipient, amount, releaseToWorker);
    }

    /**
     * @notice Owner updates the resolver (admin) address.
     * @param newResolver New resolver address.
     */
    function updateResolver(address newResolver) external onlyOwner {
        require(newResolver != address(0), "Invalid resolver address");
        address oldResolver = resolver;
        resolver = newResolver;
        emit ResolverUpdated(oldResolver, newResolver);
    }

    /**
     * @notice Read an escrow record.
     * @param taskId Task identifier.
     */
    function getEscrow(bytes32 taskId) external view returns (Escrow memory) {
        return escrows[taskId];
    }
}
