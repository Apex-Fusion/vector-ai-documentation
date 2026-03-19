# API Reference

Vector exposes three primary APIs for chain access. The MCP server and Python SDK abstract over all three — you typically don't need to call them directly.

---

## Ogmios

**Protocol:** HTTP JSON-RPC + WebSocket

**Testnet:** `https://ogmios.vector.testnet.apexfusion.org`
**Mainnet:** `https://ogmios.vector.apexfusion.org`

Ogmios provides low-level chain access:

| Capability | Description |
|-----------|-------------|
| **Chain Sync** | Follow the chain tip, replay history |
| **TX Submission** | Submit signed CBOR transactions |
| **TX Evaluation** | Dry-run transactions without submitting (fee estimation, script validation) |
| **State Queries** | UTxO set, protocol parameters, epoch info, stake distribution |
| **Mempool Monitoring** | Track pending transactions |

### Example: Query UTxOs

```bash
curl -X POST https://ogmios.vector.testnet.apexfusion.org \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "queryLedgerState/utxo",
    "params": {
      "addresses": ["addr1qz..."]
    }
  }'
```

### Example: Query Protocol Parameters

```bash
curl -X POST https://ogmios.vector.testnet.apexfusion.org \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "queryLedgerState/protocolParameters"
  }'
```

**Full reference:** [ogmios.dev/api](https://ogmios.dev/api/)

---

## TX Submit API

**Protocol:** HTTP POST (CBOR body)

**Testnet:** `https://submit.vector.testnet.apexfusion.org/api/submit/tx`
**Mainnet:** `https://submit.vector.apexfusion.org/api/submit/tx`

Submits a signed, serialized transaction to the network.

### Example

```bash
curl -X POST https://submit.vector.testnet.apexfusion.org/api/submit/tx \
  -H "Content-Type: application/cbor" \
  --data-binary @signed-tx.cbor
```

### From Python

```python
import httpx

async def submit_tx(tx_cbor_hex: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://submit.vector.testnet.apexfusion.org/api/submit/tx",
            content=bytes.fromhex(tx_cbor_hex),
            headers={"Content-Type": "application/cbor"},
        )
        return resp.json()
```

### From JavaScript

```javascript
const submitCborToNode = async (cbor) => {
  const resp = await fetch(
    "https://submit.vector.testnet.apexfusion.org/api/submit/tx",
    {
      method: "POST",
      headers: { "Content-Type": "application/cbor" },
      body: cbor,
    }
  );
  return await resp.json();
};
```

---

## Koios

**Protocol:** REST API

**Testnet:** `https://koios.vector.testnet.apexfusion.org/` (note trailing slash)
**Mainnet:** `https://koios.vector.apexfusion.org/`

Koios provides indexed, higher-level queries that Ogmios doesn't cover:

| Endpoint | Description |
|----------|-------------|
| `/api/v1/address_info` | Address balance and stake info |
| `/api/v1/address_txs` | Transaction history for an address |
| `/api/v1/address_utxos` | UTxOs at an address |
| `/api/v1/tx_info` | Transaction details by hash |
| `/api/v1/asset_info` | Native token metadata |
| `/api/v1/tip` | Current chain tip |

### Example: Address UTxOs

```bash
curl -X POST "https://koios.vector.testnet.apexfusion.org/api/v1/address_utxos" \
  -H "Content-Type: application/json" \
  -d '{"_addresses": ["addr1qz..."]}'
```

### Example: Chain Tip

```bash
curl "https://koios.vector.testnet.apexfusion.org/api/v1/tip"
```

**Full reference:** [koios.rest](https://www.koios.rest/)

---

## Block Explorer

**Testnet:** `https://vector.testnet.apexscan.org`
**Mainnet:** `https://vector.apexscan.org`

Web UI for browsing blocks, transactions, addresses, and tokens. Useful for:

- Verifying transactions after submission
- Inspecting UTxOs at contract addresses
- Checking token policies and metadata

Transaction URLs follow the pattern:
```
https://vector.testnet.apexscan.org/transaction/{tx_hash}
```

---

## Hosted Services (Demeter)

[Demeter](https://demeter.run/) provides hosted infrastructure for Vector — no self-hosting required:

| Service | URL Pattern |
|---------|------------|
| Submit API | `https://submitapi-m1.demeter.run/api/submit/tx` |
| Ogmios | via Demeter dashboard |
| DB Sync | via Demeter dashboard |

Requires a Demeter API key. See the [Apex Fusion developer portal](https://developers.apexfusion.org/documentation/l2-vector-demeter) for setup.

---

## Endpoint Summary

| Service | Testnet | Mainnet |
|---------|---------|---------|
| Ogmios | `https://ogmios.vector.testnet.apexfusion.org` | `https://ogmios.vector.apexfusion.org` |
| TX Submit | `https://submit.vector.testnet.apexfusion.org/api/submit/tx` | `https://submit.vector.apexfusion.org/api/submit/tx` |
| Koios | `https://koios.vector.testnet.apexfusion.org/` | `https://koios.vector.apexfusion.org/` |
| Explorer | `https://vector.testnet.apexscan.org` | `https://vector.apexscan.org` |

---

## Next Steps

- [MCP Server Installation](../mcp-server/installation.md) — the MCP server wraps these APIs
- [How Vector Works](../concepts/how-vector-works.md) — UTXO model overview
- [Python SDK](../sdk/python/index.md) — Python abstractions over these APIs
