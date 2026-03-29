---
description: "6 common pitfalls on Vector: AP3X naming, mainnet network ID, CBOR encoding, Ogmios raw datums, Conway era, faucet."
---

# Vector-Specific Gotchas

Common pitfalls when building on Vector, especially if you're coming from Cardano or Ethereum.

---

## 1. AP3X is the Native Coin (Not ADA)

Vector's native coin is **AP3X**, not ADA. The smallest unit is **DFM** (1 AP3X = 1,000,000 DFM).

However, because Vector inherits Cardano's tooling, you will see `lovelace` used in many places:

| Context | What you see | What it means |
|---------|-------------|---------------|
| Aiken stdlib | `assets.lovelace_of(value)` | Returns AP3X amount in DFM |
| Ogmios API response | `"lovelace": 5000000` | 5 AP3X in DFM |
| PyCardano | `Value(coin=5_000_000)` | 5 AP3X in DFM |
| Python SDK | `balance.lovelace` | AP3X balance in DFM |

**Rule of thumb:** Wherever you see `lovelace` in Vector tooling, it refers to DFM (the smallest AP3X unit). In documentation and user-facing text, always say "AP3X" and "DFM".

### In Aiken

```aiken
// This reads the AP3X amount from a value (returns DFM)
let dfm_amount = assets.lovelace_of(value)
let ap3x_amount = dfm_amount / 1_000_000
```

### In PyCardano

```python
# 10 AP3X = 10,000,000 DFM
from pycardano import Value
output_value = Value(coin=10_000_000)
```

---

## 2. Testnet Uses Mainnet Network ID

Vector testnet uses the **mainnet network ID**. This catches many developers off guard.

### The symptom

You generate an address and it starts with `addr1` instead of `addr_test1`. This is correct — not a bug.

### In PyCardano

```python
from pycardano import Network

# WRONG for Vector testnet:
network = Network.TESTNET  # generates addr_test1 addresses

# CORRECT for Vector testnet:
network = Network.MAINNET  # generates addr1 addresses
```

### networkMagic

```
networkMagic: 764824073
```

This is the same magic number used by Cardano mainnet. Vector reuses it intentionally to simplify address handling (no test-vs-mainnet address confusion for users).

### Key addresses to check

- Your agent's wallet address should start with `addr1`
- Script addresses should start with `addr1w`
- If you see `addr_test1`, you're using the wrong network ID in PyCardano

---

## 3. CBOR Parity (for Contract Developers)

When building transactions in PyCardano that interact with Aiken contracts, CBOR encoding must match exactly.

### The issue

Aiken compiles validators that expect specific CBOR structures. PyCardano and Aiken may disagree on whether to use definite-length or indefinite-length CBOR arrays.

### The fix

Use indefinite-length arrays in PyCardano to match Aiken's CBOR expectations:

```python
from pycardano import PlutusData
import cbor2

# Use indefinite-length encoding to match Aiken
datum = cbor2.CBORTag(121, cbor2.CBORSimpleValue(None))
```

When constructing `PlutusData` directly, test with `aiken check` to verify CBOR round-trips correctly.

### Testing parity

```bash
# Aiken test will catch CBOR mismatches
aiken check
```

---

## 4. Ogmios Returns RawCBOR Datums

When querying UTxOs via Ogmios, inline datums may be returned as raw CBOR hex rather than decoded JSON.

### The symptom

```json
{
  "utxo": "abc123#0",
  "datum": "d87980"
}
```

The `"d87980"` is CBOR hex, not a JSON object.

### Handling both formats

```python
import cbor2
from binascii import unhexlify

def decode_datum(datum_field):
    if isinstance(datum_field, dict):
        # Already decoded JSON datum
        return datum_field
    elif isinstance(datum_field, str):
        # Raw CBOR hex — decode it
        return cbor2.loads(unhexlify(datum_field))
    return None
```

Always handle both formats when reading datums from Ogmios responses to avoid `AttributeError` on unexpected types.

---

## 5. Conway Era & Plutus V3

Vector operates in the **Conway era** with **Plutus V3** support. This means:

- **Aiken version:** Use the latest stable Aiken release (v1.1.x+)
- **Plutus version:** Contracts compile to **Plutus V3**
- **Script type:** Use `"PlutusV3"` when deploying via MCP or SDK

```bash
# Install latest Aiken
aikup install
```

When deploying contracts, always specify `scriptType: "PlutusV3"`.

---

## 6. Testnet Funding

The **[Vector Testnet Faucet](../quickstart/faucet.md)** distributes testnet AP3X directly on Vector. Register for an API key at the [faucet web UI](https://apex-fusion.github.io/vector-faucet/), then request funds programmatically. See the [full faucet guide](../quickstart/faucet.md) for API details and limits (10–50 AP3X per request, 200 AP3X/day).

!!! tip "Alternative method"
    You can also get AP3X from the [Prime Testnet faucet](https://developers.apexfusion.org/documentation/getting-started-with-testnet) and bridge to Vector via the [Reactor Bridge](https://developers.apexfusion.org/documentation/how-to-use-the-reactor-bridge). This was previously the only method but is no longer required.

---

## Summary Checklist

Before deploying to Vector testnet:

- [ ] Using AP3X/DFM terminology in user-facing code
- [ ] PyCardano configured with `Network.MAINNET`
- [ ] Addresses expected to start with `addr1`
- [ ] CBOR encoding tested with `aiken check`
- [ ] Datum parsing handles both JSON and raw CBOR hex formats
- [ ] Koios URL includes trailing slash: `https://v2.koios.vector.testnet.apexfusion.org/`

---

## Next Steps

- [How Vector Works](how-vector-works.md) — UTXO model and AP3X coin overview
- [Smart Contracts for Agents](smart-contracts.md) — deploying contracts on Vector
- [Contract Templates](../contracts/templates.md) — audited, ready-to-deploy contracts
- [Contract Testing Guide](../contracts/testing.md) — testing on Vector
