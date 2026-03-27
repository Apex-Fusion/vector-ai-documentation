---
description: "Vector blockchain API endpoints: Ogmios, TX Submit, Koios, and Faucet. Testnet and mainnet URLs."
---

# API Reference

Vector exposes chain-access APIs and a testnet faucet API. The MCP server and Python SDK abstract over the chain APIs — you typically don't need to call them directly. The faucet API is called directly to fund testnet wallets.

---

## Ogmios

**Protocol:** HTTP JSON-RPC + WebSocket

**Testnet:** `https://ogmios.vector.testnet.apexfusion.org`
**Mainnet:** `https://ogmios.vector.mainnet.apexfusion.org`

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
**Mainnet:** `https://submit.vector.mainnet.apexfusion.org/api/submit/tx`

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
**Mainnet:** `https://koios.vector.mainnet.apexfusion.org/`

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
**Mainnet:** `https://explorer.vector.mainnet.apexfusion.org`

Web UI for browsing blocks, transactions, addresses, and tokens. Useful for:

- Verifying transactions after submission
- Inspecting UTxOs at contract addresses
- Checking token policies and metadata

Transaction URLs follow the pattern:
```
https://vector.testnet.apexscan.org/transaction/{tx_hash}
```

---

## Testnet Faucet API

**Protocol:** REST API (JSON)

**Base URL:** `https://faucet.vector.testnet.apexfusion.org`
**Web UI:** [apex-fusion.github.io/vector-faucet](https://apex-fusion.github.io/vector-faucet/)

Distributes testnet AP3X tokens directly on Vector. Requires an API key obtained by [registering on the web UI](../quickstart/faucet.md#step-1-register-and-get-an-api-key).

**Authentication:** Include your API key via `X-API-Key: vf_...` or `Authorization: Bearer vf_...` header.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/faucet/request` | POST | API Key | Request testnet AP3X |
| `/faucet/status` | GET | API Key | Check daily/monthly limits |
| `/auth/register` | POST | CAPTCHA | Register a new account |
| `/auth/verify` | POST | None | Verify email address |
| `/auth/login` | POST | None | Login and get API key |
| `/auth/rotate-key` | POST | API Key | Rotate API key (invalidates old) |
| `/health` | GET | None | Health check |

### Example: Request Funds

```bash
curl -X POST https://faucet.vector.testnet.apexfusion.org/faucet/request \
  -H "Content-Type: application/json" \
  -H "X-API-Key: vf_your_key_here" \
  -d '{
    "address": "addr1q...",
    "amount": 10000000
  }'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | Vector testnet address (starts with `addr1`) |
| `amount` | integer | Yes | Amount in lovelace (1 AP3X = 1,000,000 lovelace). Range: 10,000,000 – 50,000,000 |

**Response:**

```json
{
  "tx_hash": "abc123...",
  "explorer_url": "https://vector.testnet.apexscan.org/en/transaction/abc123...",
  "remaining_daily": 150000000,
  "remaining_monthly": 1500000000
}
```

### Example: Check Status

```bash
curl https://faucet.vector.testnet.apexfusion.org/faucet/status \
  -H "X-API-Key: vf_your_key_here"
```

**Response:**

```json
{
  "daily_used": 50000000,
  "daily_limit": 200000000,
  "daily_remaining": 150000000,
  "monthly_used": 500000000,
  "monthly_limit": 2000000000,
  "monthly_remaining": 1500000000
}
```

### Rate Limits

| Limit | Amount |
|-------|--------|
| Per request | 10 – 50 AP3X |
| Daily per account | 200 AP3X |
| Monthly per account | 2,000 AP3X |
| API rate limit | 10 requests/minute per IP |

**Full guide:** [Testnet Faucet](../quickstart/faucet.md) — registration walkthrough, SDK examples, and alternative funding methods.

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
| Ogmios | `https://ogmios.vector.testnet.apexfusion.org` | `https://ogmios.vector.mainnet.apexfusion.org` |
| TX Submit | `https://submit.vector.testnet.apexfusion.org/api/submit/tx` | `https://submit.vector.mainnet.apexfusion.org/api/submit/tx` |
| Koios | `https://koios.vector.testnet.apexfusion.org/` | `https://koios.vector.mainnet.apexfusion.org/` |
| Explorer | `https://vector.testnet.apexscan.org` | `https://explorer.vector.mainnet.apexfusion.org` |
| Faucet API | `https://faucet.vector.testnet.apexfusion.org` | — |

---

## Next Steps

- [MCP Server Installation](../mcp-server/installation.md) — the MCP server wraps these APIs
- [How Vector Works](../concepts/how-vector-works.md) — UTXO model overview
- [Python SDK](../sdk/python/index.md) — Python abstractions over these APIs
