# Bountix Escrow Contract (BountixEscrowV0)

Minimal, USDC-only escrow for Bountix task rewards on **Base mainnet**.

## Deployment status

> **Deployed to Base mainnet** (2026-06-01). **Unverified on Basescan** — Hardhat
> `verify` currently fails because the config/plugin targets the deprecated
> Etherscan V1 endpoint. The contract is deployed and functional; verification can
> be retried after the Etherscan API V2 config is fixed.

| Field | Value |
| --- | --- |
| Network | Base Mainnet (chainId 8453) |
| Contract | `BountixEscrowV0` |
| Address | [`0x89FAF386c052B55363fdEe45B04c48fcDcb5A692`](https://basescan.org/address/0x89FAF386c052B55363fdEe45B04c48fcDcb5A692) |
| Deploy tx | `0x149860d385931981830c5a1706486d42d865e3d5fc055092976a7f0fdaf53280` |
| Deployer / owner | `0xc123D813037fA84623bc733Fc910A27aD708E0EA` |
| Resolver (initial) | deployer address (changeable via `updateResolver`) |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (native Circle USDC on Base) |
| Min escrow | 1 USDC = `1_000_000` (USDC has 6 decimals) |
| Basescan verified | No (see note above) |

Deploy cost: gas used `1057406` at `0.006` gwei = `0.000006344436` ETH.

## Model

Roles:
- **Owner** — set to the deployer at construction (`Ownable`).
- **Resolver** — a second admin address; changeable by the owner.
- **Admin** = owner **or** resolver. Admin-only actions: assign worker, release, refund, resolve disputes.

Lifecycle: `None → Funded → (Released | Refunded)`, with an optional `Disputed` branch.

```
payer funds (USDC)        admin assigns worker        admin releases
   None ───────────► Funded ───────────────► Funded ──────────────► Released
                       │  │                                  
       admin refunds   │  └── payer/worker dispute ──► Disputed ──► Released/Refunded (admin)
   ◄───────────────────┘                                (resolveDispute)
   Refunded
```

The `EscrowState` enum is `{ None:0, Funded:1, Released:2, Refunded:3, Disputed:4 }`. Once an escrow leaves `Funded` it cannot be released/refunded again — this prevents double release/refund.

## Functions

| Function | Caller | Notes |
| --- | --- | --- |
| `fundEscrow(bytes32 taskId, uint256 amount)` | payer | Requires `amount >= 1_000_000` and a fresh `taskId`. Worker starts unset. Caller must `approve` USDC first. |
| `assignWorker(bytes32 taskId, address worker)` | admin | Sets/reassigns worker while `Funded`. |
| `releaseEscrow(bytes32 taskId)` | admin | Pays the assigned worker. Reverts if no worker assigned. |
| `refundEscrow(bytes32 taskId)` | admin | Returns funds to the payer. |
| `disputeEscrow(bytes32 taskId)` | payer or worker | Flags a `Funded` escrow as `Disputed`. Moves no funds. |
| `resolveDispute(bytes32 taskId, bool releaseToWorker)` | admin | Pays worker (`true`) or refunds payer (`false`). |
| `updateResolver(address newResolver)` | owner | Changes the resolver. |
| `getEscrow(bytes32 taskId) view` | anyone | Returns the `Escrow` struct. |

## Events

- `EscrowFunded(bytes32 taskId, address payer, uint256 amount)`
- `WorkerAssigned(bytes32 taskId, address worker)`
- `EscrowReleased(bytes32 taskId, address worker, uint256 amount)`
- `EscrowRefunded(bytes32 taskId, address payer, uint256 amount)`
- `EscrowDisputed(bytes32 taskId, address by)`
- `EscrowResolved(bytes32 taskId, address recipient, uint256 amount, bool releasedToWorker)`
- `ResolverUpdated(address oldResolver, address newResolver)`

## Local commands

```bash
npm run compile        # hardhat compile
npm run test:contract  # hardhat test  (runs against the local Hardhat network)
```

## Deployment

### 1. Safe `.env` setup (do this on the VPS, never in chat)

> **NEVER paste your private key into chat. NEVER commit `.env`.**

`.env` is already covered by `.gitignore` (`.env`, `.env*.local`). Create it on the VPS in the project root:

```bash
cd /root/taskops
nano .env
# add (private key WITHOUT 0x prefix, from your dedicated deployer wallet):
#   PRIVATE_KEY=...
#   BASE_RPC_URL=https://mainnet.base.org
#   BASESCAN_API_KEY=...           # optional, for verification
chmod 600 .env        # restrict file permissions
git status            # confirm .env does NOT appear
```

Use a **dedicated deployer wallet**, not your main wallet.

### 2. Estimate cost & confirm balance (read-only, sends no transaction)

```bash
npm run estimate:base
```

Prints the deployer address, ETH balance, estimated deploy gas/cost, and whether the balance is sufficient. Fund the wallet on Base if it reports INSUFFICIENT/TIGHT.

### 3. Deploy

```bash
npm run deploy:base
```

The script refuses to run if not on chainId 8453, re-checks the estimate against the balance, deploys, waits for 3 confirmations, and prints the contract address, tx hash, gas used, and cost.

### 4. After deployment

1. Record the address + tx hash in the table at the top of this file.
2. (Optional) Verify on Basescan:
   ```bash
   npx hardhat verify --network base <ADDRESS> 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 <RESOLVER>
   ```
   > **Known issue:** this currently fails because the config/plugin targets the
   > deprecated Etherscan V1 endpoint. Retry after migrating to the Etherscan API
   > V2 config. The deployed contract is unaffected.
3. (Optional) Move the resolver from the deployer to a dedicated admin address via `updateResolver`.

## Security notes

- USDC-only; token address is an immutable set at deploy.
- `SafeERC20` for all transfers; `ReentrancyGuard` on every fund-moving function.
- State machine prevents double release/refund.
- Minimum amount (1 USDC) enforced on `fundEscrow`.
- Frontend is **not** wired to this contract — there is no live payment UI yet.
