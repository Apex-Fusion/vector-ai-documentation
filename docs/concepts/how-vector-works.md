# How Vector Works

A guide to Vector's UTXO model, written for AI developers who may be familiar with account-based chains (Ethereum, Solana) but new to UTXO.

---

## What is Vector?

Vector is a Layer 2 blockchain in the [Apex Fusion](https://apexfusion.org) ecosystem. It inherits Cardano's UTXO model and Plutus/Aiken smart contract platform, with significantly higher throughput and near-instant finality.

**Key specs:**

- **Model:** Extended UTXO (eUTxO)
- **Smart contracts:** Plutus V2 / Aiken
- **Finality:** ~13 seconds (99.9%)
- **Throughput:** 4x Cardano
- **Native assets:** First-class multi-asset support (no ERC-20 contracts needed)

---

## AP3X — Vector's Native Coin

Vector's native coin is **AP3X** — not ADA. While Vector inherits Cardano's UTXO model and tooling (PyCardano, Aiken), the coin name is different.

| Unit | Equivalent |
|------|-----------|
| **AP3X** | The standard display unit (like ADA on Cardano) |
| **DFM** | The smallest indivisible unit (like lovelace on Cardano) |

**1 AP3X = 1,000,000 DFM**

### In Aiken

Aiken's standard library uses `lovelace_of` to read the AP3X quantity from a value — the function name is `lovelace_of` but it reads AP3X:

```aiken
let ap3x_amount = assets.lovelace_of(value)
```

### In PyCardano

Use `coin=` with the amount in DFM:

```python
# 10 AP3X = 10,000,000 DFM
TransactionOutput(address, Value(coin=10_000_000))
```

---

## Vector Testnet: Mainnet Network ID

Vector testnet uses the **mainnet network ID**. This is a key difference from Cardano testnet.

- **Addresses start with `addr1`** (not `addr_test1`)
- In PyCardano, use `Network.MAINNET` when building transactions for Vector testnet
- `networkMagic`: 764824073

```python
from pycardano import Network

# For Vector testnet — use MAINNET network ID
network = Network.MAINNET
```

---

## The UTXO Model (vs. Account Model)

If you've built on Ethereum, you're used to the **account model**: each address has a balance, and transactions debit one account and credit another — like a bank.

Vector uses the **UTXO model** (Unspent Transaction Output). Think of it like **cash**: you have specific bills (UTxOs) in your wallet, and when you spend, you hand over bills and receive change.

### Account Model (Ethereum)
```
Alice: 100 ETH
Bob:   50 ETH

Alice sends 30 ETH to Bob:
  Alice: 70 ETH  (balance updated)
  Bob:   80 ETH  (balance updated)
```

### UTXO Model (Vector)
```
Alice has UTxOs: [60 AP3X] [40 AP3X]
Bob has UTxOs:   [50 AP3X]

Alice sends 30 AP3X to Bob:
  Input:  Alice's [40 AP3X] UTxO (consumed/spent)
  Output: [30 AP3X] → Bob (new UTxO)
  Output: [10 AP3X] → Alice (change, new UTxO)

Result:
  Alice has UTxOs: [60 AP3X] [10 AP3X]
  Bob has UTxOs:   [50 AP3X] [30 AP3X]
```

The key difference: in UTXO, transactions consume specific outputs and create new ones. Nothing is mutated in place.

---

## Why UTXO is Better for AI Agents

The UTXO model provides properties that are ideal for autonomous AI agents:

### 1. Deterministic Fees

Before submitting a transaction, your agent knows the **exact fee**. The fee depends only on the transaction's size and the computational resources it uses — both known at build time.

```python
# Agent knows the cost before committing
tx = await agent.build_transaction(outputs=[("addr...", 5_000_000)])
print(f"This transaction will cost exactly {tx.fee} DFM")
# No gas estimation surprises
```

**Why this matters:** An AI agent managing a budget can plan precisely. No failed transactions due to gas estimation errors. No "out of gas" reverts that waste funds.

### 2. Parallel Processing

In the account model, transactions from the same address must be processed sequentially (nonce ordering). In UTXO, transactions that consume **different UTxOs** can be processed in parallel.

```
Agent A spends UTxO #1 ──► processed simultaneously
Agent B spends UTxO #2 ──► processed simultaneously
Agent C spends UTxO #3 ──► processed simultaneously
```

**Why this matters:** Multiple agents (or the same agent with multiple UTxOs) can transact at the same time without blocking each other. No stuck transaction queues.

### 3. No Nonce Management

Ethereum agents must track a sequential nonce. If transaction #5 is stuck, transactions #6, #7, #8 all queue behind it. This is a common source of agent failures.

Vector has no nonces. Each transaction is independent — it references its inputs explicitly.

**Why this matters:** Agents don't need complex nonce tracking logic. No "stuck transaction" recovery code. Simpler, more reliable agent implementations.

### 4. Explicit State

All state in the UTXO model is explicit and visible. A UTxO either exists (unspent) or doesn't (spent). There are no hidden storage slots.

```python
# See exactly what's at a contract address
utxos = await agent.get_utxos(script_address)
for utxo in utxos:
    print(f"Value: {utxo.value}, Datum: {utxo.datum}")
# No need to decode opaque storage slots
```

**Why this matters:** Agents can inspect the full state of any contract by querying its UTxOs. No ABI decoding or storage slot lookups needed.

### 5. Native Multi-Asset

On Vector, tokens are native chain primitives — not smart contract state (like ERC-20). They live directly in UTxOs alongside AP3X.

```python
# Tokens are just... there, in the UTxO
balance = await agent.get_balance()
# Returns: {"lovelace": 50_000_000, "PolicyId.TokenName": 1000}
# Note: "lovelace" key contains AP3X balance in DFM units
```

**Why this matters:** Agents handle tokens the same way they handle AP3X. No contract calls needed to check token balances or transfer tokens.

---

## Key Concepts for Agent Developers

### DFM (formerly "lovelace")

The base unit of AP3X. 1 AP3X = 1,000,000 DFM. In Aiken source code and some API responses, DFM amounts are returned under the key `lovelace` (this is a naming convention inherited from Cardano tooling). The Python SDK uses `ada=` float parameters for convenience.

### UTxO (Unspent Transaction Output)

A discrete unit of value sitting at an address. Each UTxO has:

- **Address** — who owns it (a public key hash or script hash)
- **Value** — how much AP3X + any native tokens it contains
- **Datum** (optional) — structured data attached to the UTxO (used by smart contracts)
- **Reference** — a unique ID (`tx_hash#index`) that identifies this specific UTxO

### Transaction

A transaction consumes one or more UTxOs (inputs) and creates new UTxOs (outputs). It must satisfy:

1. **Value conservation** — inputs = outputs + fee (no AP3X created or destroyed)
2. **Witness** — each input must be authorized by the owner (signature or script execution)
3. **Validity interval** — optional time bounds for when the transaction is valid

### Smart Contracts (Validators)

On Vector, smart contracts are **validators** — they say "yes" or "no" to spending a UTxO. A validator receives:

- **Datum** — data stored with the UTxO being spent
- **Redeemer** — data provided by the transaction trying to spend it
- **Script Context** — information about the transaction itself

The validator returns `True` (allow spend) or `False` (reject). That's it.

```
UTxO at script address
├── Value: 100 AP3X
├── Datum: { deadline: slot 5000, beneficiary: "addr..." }
└── Validator: "Allow spend if current_slot > deadline AND signer == beneficiary"

Transaction attempts to spend this UTxO
├── Redeemer: { action: "claim" }
└── Signer: beneficiary's key

Validator checks → True → Transaction succeeds
```

### Policy IDs and Native Tokens

Every native token on Vector has a **minting policy** — a script that controls when new tokens can be created or burned. Tokens are identified by `PolicyId.AssetName`.

---

## Chain Access

Vector exposes three primary interfaces:

| Interface | Protocol | Use Case |
|-----------|----------|----------|
| **Ogmios** | WebSocket + HTTP JSON-RPC | Chain sync, TX submission, TX evaluation, state queries |
| **Koios** | REST API | Indexed queries — address history, token info, UTxO lookups |
| **TX Submit API** | HTTP POST (CBOR) | Direct transaction submission |

The MCP server and Agent SDK abstract over all three — your agent doesn't need to interact with them directly.

---

## Testnet vs. Mainnet

Vector currently runs a public testnet. Mainnet (with Conway-era features) is imminent.

| | Testnet | Mainnet |
|---|---------|---------|
| **Ogmios** | `wss://ogmios.vector.testnet.apexfusion.org` | `wss://ogmios.vector.apexfusion.org` |
| **TX Submit** | `submit.vector.testnet.apexfusion.org/api/submit/tx` | `submit.vector.apexfusion.org/api/submit/tx` |
| **Explorer** | `vector.testnet.apexscan.org` | `vector.apexscan.org` |
| **Funds** | Free (testnet faucet) | Real value |

Start on testnet. The code is identical — just change the endpoint URLs.

---

## Next Steps

- [5-Minute Start](../quickstart/5-minute-start.md) — get an agent running on Vector
- [Claude Desktop + Vector](../quickstart/claude-desktop.md) — set up Claude as a Vector agent
- [Agent Wallets](agent-wallets.md) — wallet creation, funding, and security
- [Smart Contracts for Agents](smart-contracts.md) — deploy and interact with on-chain logic
- [Agent Identity](agent-identity.md) — DIDs, registry, and reputation
- [MCP Tools Reference](../mcp-server/tools-reference.md) — see what your agent can do
