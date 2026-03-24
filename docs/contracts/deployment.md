# Contract Deployment

How to deploy smart contracts on Vector — from compiled Aiken validators to on-chain script addresses.

---

## Prerequisites

- A funded Vector wallet (testnet: use the [Vector Testnet Faucet](../quickstart/faucet.md) to get AP3X directly)
- A compiled contract (`script.cbor` file from Aiken or Plutus)
- The MCP server running, or the Python SDK installed

---

## Aiken Version Compatibility

Vector currently supports **Aiken v1.0.29-alpha** and earlier. Contracts compile to **Plutus V2** (Vector operates in the Babbage era, not Conway).

```bash
# Install compatible Aiken version
aikup install v1.0.29-alpha

# Verify
aiken --version
```

---

## Compiling a Contract

### From an Audited Template

The [contract templates](templates.md) include pre-compiled `script.cbor` files — no compilation needed.

```bash
git clone https://github.com/Apex-Fusion/vector-ai-agents
cd vector-ai-agents/smart-contract-audit/compliant/simple-escrow
# script.cbor is ready to deploy
```

### From Custom Aiken Source

```bash
# Create a new Aiken project
aiken new my-contract
cd my-contract

# Write your validator in validators/
# ...

# Build
aiken build

# The compiled CBOR is in build/
cat build/my-contract/validator.cbor
```

### Vector-Specific Considerations

| Consideration | Detail |
|--------------|--------|
| **Era** | Babbage (not Conway) |
| **Script type** | Plutus V2 (Aiken default) |
| **Network ID** | Mainnet (`addr1` addresses, `networkMagic: 764824073`) |
| **Fee calculation** | Use Vector protocol parameters, not Cardano mainnet |

---

## Deploying via MCP

### Deploy with Initial Datum

```
Tool: vector_deploy_contract
Params: {
  "scriptCbor": "<hex contents of script.cbor>",
  "scriptType": "PlutusV2",
  "initialDatum": "<CBOR-encoded datum hex>",
  "lovelaceAmount": 10000000
}

Response: {
  "tx_hash": "abc123...",
  "script_address": "addr1wz...",
  "fee": 350000,
  "status": "submitted"
}
```

### Lock AP3X at a Script Address

```
Tool: vector_interact_contract
Params: {
  "scriptCbor": "<hex>",
  "scriptType": "PlutusV2",
  "action": "lock",
  "datum": "<CBOR-encoded datum hex>",
  "lovelaceAmount": 50000000
}
```

### Spend from a Script Address

```
Tool: vector_interact_contract
Params: {
  "scriptCbor": "<hex>",
  "scriptType": "PlutusV2",
  "action": "spend",
  "redeemer": "<CBOR-encoded redeemer hex>",
  "utxoRef": {"txHash": "abc123...", "outputIndex": 0}
}
```

---

## Deploying via Python SDK

```python
from vector_agent import VectorAgent

agent = VectorAgent()

# Read the compiled script
with open("simple-escrow/script.cbor") as f:
    script_cbor = f.read().strip()

# Deploy with initial state
result = await agent.deploy_contract(
    script_cbor=script_cbor,
    script_type="PlutusV2",
    datum_cbor=encode_datum(my_datum),
    lovelace=10_000_000,  # 10 AP3X locked at the script
)

print(f"Script address: {result.script_address}")
print(f"TX: {result.explorer_url}")
```

### Interact with a Deployed Contract

```python
# Query contract state
utxos = await agent.get_utxos(result.script_address)
for utxo in utxos:
    print(f"Value: {utxo.output.amount}, Datum: {utxo.output.datum}")

# Spend (claim) from the contract
claim_result = await agent.interact_contract(
    script_address=result.script_address,
    redeemer_cbor=encode_redeemer("Claim"),
    utxo_ref=(utxos[0].input.transaction_id.payload.hex(), utxos[0].input.index),
)
```

---

## Dry-Run Before Deploying

Always simulate contract interactions before committing real funds:

```
Tool: vector_dry_run
Params: {
  "outputs": [
    {
      "address": "addr1wz...",
      "value": {"lovelace": 10000000}
    }
  ]
}

Response: {
  "valid": true,
  "fee": 350000,
  "errors": []
}
```

---

## CBOR Encoding Tips

### Datums

Datums must be CBOR-encoded and hex-encoded. Use `cbor2` in Python:

```python
import cbor2

# Simple datum: constructor 0 with fields
datum = cbor2.dumps(cbor2.CBORTag(121, [
    bytes.fromhex("abcdef..."),  # beneficiary pubkey hash
    bytes.fromhex("123456..."),  # depositor pubkey hash
    5000000,                      # deadline slot
]))
datum_hex = datum.hex()
```

### Redeemers

```python
# Redeemer: constructor 0 (Claim)
redeemer = cbor2.dumps(cbor2.CBORTag(121, []))
redeemer_hex = redeemer.hex()

# Redeemer: constructor 1 (Reclaim)
redeemer = cbor2.dumps(cbor2.CBORTag(122, []))
redeemer_hex = redeemer.hex()
```

Use `aiken check` to verify CBOR round-trips correctly with your validators.

---

## Post-Deployment Verification

After deploying, verify on the block explorer:

1. Open `https://vector.testnet.apexscan.org/transaction/{tx_hash}`
2. Check the outputs — one should be at the script address
3. Verify the datum is attached correctly
4. Check the locked AP3X amount

---

## Next Steps

- [Contract Templates](templates.md) — pre-compiled, audited contracts
- [Testing Guide](testing.md) — test before deploying
- [Vector Gotchas](../concepts/vector-gotchas.md) — CBOR parity, network ID, and other pitfalls
- [MCP Tools Reference](../mcp-server/tools-reference.md) — deploy and interact tools
