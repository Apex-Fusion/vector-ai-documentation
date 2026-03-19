# Smart Contracts for Agents

How AI agents deploy, interact with, and reason about smart contracts on Vector.

---

## Overview

Smart contracts on Vector are **validators** — scripts that decide whether a UTxO can be spent. They're written in **Aiken** (the primary language) or **Plutus** (Haskell-based), compiled to on-chain code, and attached to UTxOs.

For an AI agent, smart contracts enable:

- **Escrow** — hold funds until conditions are met
- **Vesting** — release tokens over time
- **DEX operations** — swap tokens
- **Donation pools** — collect and distribute funds
- **Custom logic** — any on-chain programmable behavior

The agent doesn't need to write smart contracts — it uses **pre-audited templates** and interacts with them through the SDK or MCP tools.

---

## How Validators Work

A validator is a function that takes three inputs and returns `True` (allow) or `False` (reject):

```
validator(datum, redeemer, script_context) → Bool
```

| Input | What it is | Who provides it |
|-------|-----------|-----------------|
| **Datum** | Data stored with the UTxO | Set when the UTxO was created |
| **Redeemer** | Data provided by the spender | Provided by the agent's transaction |
| **Script Context** | Transaction details | Provided by the chain automatically |

### Example: Simple Escrow

```
Datum: { beneficiary: "addr_bob", deadline: slot_5000 }
Redeemer: { action: "claim" }

Validator logic:
  IF redeemer.action == "claim"
    AND current_slot > datum.deadline
    AND transaction is signed by datum.beneficiary
  THEN True (allow spend)
  ELSE False (reject)
```

An agent claiming the escrow would:

1. Build a transaction spending the escrow UTxO
2. Provide the redeemer `{ action: "claim" }`
3. Sign with the beneficiary's key
4. The validator checks the conditions and allows the spend

---

## Interacting with Contracts via MCP

### Deploying a Contract

```
Tool: vector_deploy_contract
Params: {
  "script": "590abc01...",          // compiled CBOR hex
  "datum": {                         // initial state
    "beneficiary": "addr1qz...",
    "deadline": 5000,
    "amount": 50000000
  },
  "value": { "lovelace": 50000000 } // 50 AP3X locked
}

Response: {
  "tx_hash": "abc123...",
  "script_address": "addr1wz..."
}
```

The agent provides a compiled script, initial datum, and the value to lock. The MCP server builds and submits the deployment transaction.

### Reading Contract State

```
Tool: vector_query_contract_state
Params: { "script_address": "addr1wz..." }

Response: {
  "utxos": [
    {
      "tx_hash": "abc123...",
      "value": { "lovelace": 50000000 },
      "datum": {
        "beneficiary": "addr1qz...",
        "deadline": 5000,
        "amount": 50000000
      }
    }
  ]
}
```

The agent reads all UTxOs at the contract address. Each UTxO represents a piece of contract state.

### Interacting with a Contract

```
Tool: vector_interact_contract
Params: {
  "script_address": "addr1wz...",
  "redeemer": { "action": "claim" },
  "utxo": "abc123...#0"
}

Response: {
  "tx_hash": "def456...",
  "fee": 400000,
  "status": "submitted"
}
```

The agent specifies which UTxO to spend, provides the redeemer, and the SDK handles script execution.

### Using the Python SDK

```python
# Deploy
result = await agent.deploy_contract(
    script=compiled_cbor_hex,
    datum={"beneficiary": "addr1qz...", "deadline": 5000},
    value={"lovelace": 50_000_000},
)
print(f"Contract at: {result['script_address']}")

# Query state
utxos = await agent.get_utxos(result["script_address"])
for utxo in utxos:
    print(f"Locked: {utxo['value']}, State: {utxo['datum']}")

# Interact
tx_hash = await agent.interact_with_contract(
    script_address=result["script_address"],
    redeemer={"action": "claim"},
)
```

---

## Available Contract Templates

Vector provides pre-audited contract templates that agents can deploy without writing Aiken code.

### Simple Escrow

Hold funds and release to a beneficiary after a deadline.

**Datum:**
```json
{
  "beneficiary": "addr1...",
  "deadline": 5000,
  "refund_address": "addr1..."
}
```

**Redeemer actions:**

| Action | Condition |
|--------|-----------|
| `claim` | After deadline, signed by beneficiary |
| `refund` | Before deadline, signed by depositor |

**Agent use case:** An agent deposits funds in escrow for a service. If the service is delivered (verified off-chain), the beneficiary claims. Otherwise, the agent gets a refund.

### Donation Pool

Accept donations from multiple sources, distribute to verified recipients.

**Datum:**
```json
{
  "recipients": [
    { "address": "addr1...", "share": 50 },
    { "address": "addr1...", "share": 30 },
    { "address": "addr1...", "share": 20 }
  ],
  "min_donation": 5000000,
  "admin": "addr1..."
}
```

**Redeemer actions:**

| Action | Condition |
|--------|-----------|
| `donate` | Anyone, amount >= min_donation |
| `distribute` | Admin only, splits pool to recipients by share |
| `update_recipients` | Admin only, modify recipient list |

**Agent use case:** An investment agent donates to environmental projects through a transparent on-chain pool.

### Vesting

Release tokens to a beneficiary on a time-based schedule.

**Datum:**
```json
{
  "beneficiary": "addr1...",
  "total_amount": 100000000,
  "start_slot": 1000,
  "end_slot": 10000,
  "claimed": 0
}
```

**Redeemer actions:**

| Action | Condition |
|--------|-----------|
| `claim` | Beneficiary only, amount proportional to elapsed time |

**Agent use case:** An agent receives a vesting grant for contributing to a DAO. It periodically claims unlocked tokens.

### Simple DEX

Basic token swap between two parties.

**Datum:**
```json
{
  "offered_token": "PolicyId.TokenA",
  "offered_amount": 1000,
  "requested_token": "lovelace",
  "requested_amount": 50000000,
  "seller": "addr1..."
}
```

**Redeemer actions:**

| Action | Condition |
|--------|-----------|
| `buy` | Anyone who provides the requested amount |
| `cancel` | Seller only |

**Agent use case:** An agent lists tokens for sale or purchases tokens from existing listings.

---

## The UTXO Model and Contracts

Understanding how UTxOs work with contracts is essential for agents.

### Contract State is UTxOs

Unlike Ethereum where contract state lives in storage slots, Vector contract state is the set of UTxOs at the script address. Each UTxO is an independent piece of state.

```
Donation Pool Contract (addr1wz...)
├── UTxO #1: 100 AP3X (donation from Agent A)
├── UTxO #2: 50 AP3X  (donation from Agent B)
└── UTxO #3: 25 AP3X  (donation from Agent C)

Total pool: 175 AP3X
```

### Concurrent Access

Because UTxOs are independent, multiple agents can interact with the same contract simultaneously — as long as they're spending different UTxOs.

```
Agent A spends UTxO #1 → ✓ (processed)
Agent B spends UTxO #2 → ✓ (processed in parallel)
Agent C spends UTxO #1 → ✗ (already spent by Agent A)
```

### Datum Continuity

When a contract interaction produces a new UTxO at the script address, the new datum represents the updated state:

```
Before: UTxO at script with datum { claimed: 0, total: 100 }
TX: Agent claims 25 AP3X
After:  UTxO at script with datum { claimed: 25, total: 100 }
        + UTxO at agent's address with 25 AP3X
```

---

## Agent Best Practices for Contracts

### Always Dry-Run First

Contract interactions are more complex than simple transfers. Always simulate:

```python
result = await agent.dry_run_contract(
    script_address="addr1wz...",
    redeemer={"action": "claim"},
)
if result["valid"]:
    # Proceed with real transaction
    await agent.interact_with_contract(...)
else:
    print(f"Would fail: {result['errors']}")
```

### Read State Before Acting

Query the contract's current UTxOs to understand its state before interacting:

```python
utxos = await agent.get_utxos(script_address)
# Check if the conditions for your action are met
# e.g., deadline passed, sufficient funds, etc.
```

### Handle Contention Gracefully

If another agent spends the UTxO you're targeting, your transaction will fail. Implement retry logic:

```python
for attempt in range(3):
    try:
        tx_hash = await agent.interact_with_contract(...)
        break
    except UTxOConflictError:
        # Refresh UTxO set and retry
        utxos = await agent.get_utxos(script_address)
        continue
```

### Use Templates Over Custom Contracts

Pre-audited templates have been tested for common attack vectors. Writing custom validators requires security expertise. For agent use cases, prefer templates and only go custom when necessary.

---

## Security Considerations

Smart contracts on UTXO chains have a different attack surface than Ethereum. Key risks for agents:

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Double satisfaction** | Validator satisfied by an unrelated output | Validators check that their specific UTxO is handled correctly |
| **Datum hijacking** | Attacker creates UTxO with misleading datum | Verify datum hash matches expected values |
| **Redeemer manipulation** | Unexpected redeemer values | Validators strictly validate all redeemer fields |
| **Reference input tricks** | Using reference inputs to mislead validators | Validators distinguish reference inputs from spent inputs |

All Vector template contracts are tested against these attack vectors. See the testing and security documentation for details.

---

## Next Steps

- [How Vector Works](how-vector-works.md) — UTXO model fundamentals
- [Agent Identity](agent-identity.md) — on-chain identity and registry
- [Autonomous Investor](../examples/autonomous-investor.md) — agent using contracts
- [MCP Tools Reference](../mcp-server/tools-reference.md) — contract deployment and interaction tools
