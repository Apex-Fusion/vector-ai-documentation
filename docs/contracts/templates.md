# Smart Contract Templates

Four audited, compiled smart contract templates ready to deploy on Vector. No compilation required — just deploy and use.

All templates are located in the [vector-ai-agents repository](https://github.com/Apex-Fusion/vector-ai-agents/tree/main/smart-contract-audit/compliant).

---

## simple-escrow

**Status:** Audited, compiled, ready to deploy

A two-party escrow contract. One party locks funds with a deadline; the other can claim before the deadline, or the depositor reclaims after the deadline.

**GitHub:** [`smart-contract-audit/compliant/simple-escrow`](https://github.com/Apex-Fusion/vector-ai-agents/tree/main/smart-contract-audit/compliant/simple-escrow)

### Datum

```json
{
  "beneficiary": "addr1...",
  "depositor": "addr1...",
  "deadline": 5000000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `beneficiary` | address bytes | Who can claim the funds |
| `depositor` | address bytes | Who deposited (can reclaim after deadline) |
| `deadline` | integer | Slot number after which depositor can reclaim |

### Redeemer

```json
"Claim"
```
or
```json
"Reclaim"
```

| Value | Who can use | Condition |
|-------|-------------|-----------|
| `Claim` | Beneficiary | Before deadline |
| `Reclaim` | Depositor | After deadline |

### Deploy via MCP

```
Tool: vector_deploy_contract
Params: {
  "scriptCbor": "<hex from repo>",
  "scriptType": "PlutusV3",
  "initialDatum": "<CBOR-encoded datum>",
  "lovelaceAmount": 10000000
}
```

---

## donation-pool

**Status:** Audited, compiled, ready to deploy

A pooled donation contract where multiple contributors can deposit AP3X. The pool owner can distribute funds to recipients. Contributors can view the total pool.

**GitHub:** [`smart-contract-audit/compliant/donation-pool`](https://github.com/Apex-Fusion/vector-ai-agents/tree/main/smart-contract-audit/compliant/donation-pool)

### Datum

```json
{
  "owner": "addr1...",
  "recipients": ["addr1...", "addr1..."],
  "total_contributions": 50000000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `owner` | address bytes | Who can distribute funds |
| `recipients` | list of address bytes | Approved recipients |
| `total_contributions` | integer | Running total in DFM |

### Redeemer

```json
{ "Donate": {} }
```
or
```json
{ "Distribute": { "recipient": "addr1...", "amount": 5000000 } }
```

---

## vesting

**Status:** Audited, compiled, ready to deploy

A time-locked vesting contract. Funds are released linearly over a vesting period. Useful for token grants, team allocations, and long-term funding.

**GitHub:** [`smart-contract-audit/compliant/vesting`](https://github.com/Apex-Fusion/vector-ai-agents/tree/main/smart-contract-audit/compliant/vesting)

### Datum

```json
{
  "beneficiary": "addr1...",
  "vest_start": 4000000,
  "vest_end": 8000000,
  "total_amount": 100000000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `beneficiary` | address bytes | Who receives the vested funds |
| `vest_start` | integer | Slot when vesting begins |
| `vest_end` | integer | Slot when fully vested |
| `total_amount` | integer | Total AP3X locked in DFM |

### Redeemer

```json
{ "Claim": { "amount": 25000000 } }
```

The validator checks that the claimed amount does not exceed the linearly vested portion at the current slot.

---

## simple-dex

**Status:** Audited, compiled, ready to deploy

A simple on-chain DEX (decentralized exchange) for swapping native tokens against AP3X. Supports limit orders stored as UTxOs.

**GitHub:** [`smart-contract-audit/compliant/simple-dex`](https://github.com/Apex-Fusion/vector-ai-agents/tree/main/smart-contract-audit/compliant/simple-dex)

### Datum

```json
{
  "seller": "addr1...",
  "offer_token": "a1b2c3d4.MyToken",
  "offer_amount": 1000,
  "ask_lovelace": 5000000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `seller` | address bytes | Who receives the AP3X |
| `offer_token` | string | `PolicyId.AssetName` of token being sold |
| `offer_amount` | integer | Amount of token offered |
| `ask_lovelace` | integer | AP3X price in DFM |

### Redeemer

```json
"Buy"
```
or
```json
"Cancel"
```

| Value | Who can use | Condition |
|-------|-------------|-----------|
| `Buy` | Anyone | Must pay `ask_lovelace` DFM |
| `Cancel` | Seller only | Reclaim the offer |

---

## Deploying Templates

All templates include a pre-compiled `script.cbor` file. Deploy using the MCP tool or Python SDK:

### Via MCP

```
Tool: vector_deploy_contract
Params: {
  "scriptCbor": "<contents of script.cbor>",
  "scriptType": "PlutusV3",
  "initialDatum": "<CBOR-encoded initial datum>",
  "lovelaceAmount": <amount in DFM>
}
```

### Via Python SDK

```python
async with VectorAgent() as agent:
    result = await agent.deploy_contract(
        script_cbor=open("simple-escrow/script.cbor").read().strip(),
        script_type="PlutusV3",
        datum_cbor=encode_datum(my_datum),
        lovelace=10_000_000,
    )
    print(f"Contract deployed at: {result['script_address']}")
```

---

## Next Steps

- [Testing Guide](testing.md) — how to test contracts on Vector
- [Vector Gotchas](../concepts/vector-gotchas.md) — AP3X, network ID, CBOR parity
- [MCP Tools Reference](../mcp-server/tools-reference.md) — deploy and interact tools
