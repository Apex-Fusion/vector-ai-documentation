---
description: "All Vector configuration values, endpoints, and common patterns in one page"
---

# Vector Cheat Sheet

Everything you need in one place. Bookmark this page.

## Network Configuration

| Parameter | Value |
|-----------|-------|
| **Network Magic** | `764824073` |
| **Address Prefix** | `addr1` (both testnet and mainnet) |
| **PyCardano Network** | `Network.MAINNET` (even for testnet!) |
| **Native Coin** | AP3X |
| **Smallest Unit** | DFM (1 AP3X = 1,000,000 DFM) |
| **Finality** | ~13 seconds (99.9%) |
| **Throughput** | 10x Cardano |

## Smart Contracts

| Parameter | Value |
|-----------|-------|
| **Era** | Conway |
| **Plutus Version** | V3 |
| **Aiken Version** | Latest stable (v1.1.x+) |
| **Script Type** | `"PlutusV3"` |
| **CBOR Encoding** | Indefinite-length arrays |

!!! tip "Use latest Aiken"
    Vector runs Conway era with Plutus V3. Use the latest stable Aiken release: `aikup install`

## Testnet Endpoints

| Service | URL |
|---------|-----|
| **Ogmios** | `https://ogmios.vector.testnet.apexfusion.org` |
| **TX Submit** | `https://submit.vector.testnet.apexfusion.org/api/submit/tx` |
| **Koios** | `https://v2.koios.vector.testnet.apexfusion.org/` |
| **Explorer** | `https://vector.testnet.apexscan.org` |
| **Faucet API** | `https://faucet.vector.testnet.apexfusion.org` |
| **Faucet Web UI** | `https://apex-fusion.github.io/vector-faucet/` |

## Mainnet Endpoints

| Service | URL |
|---------|-----|
| **Ogmios** | `https://ogmios.vector.mainnet.apexfusion.org` |
| **TX Submit** | `https://submit.vector.mainnet.apexfusion.org/api/submit/tx` |
| **Koios** | `https://koios.vector.mainnet.apexfusion.org/` |
| **Explorer** | `https://explorer.vector.mainnet.apexfusion.org` |

## Faucet API (Testnet)

```bash
# Request testnet AP3X
curl -X POST https://faucet.vector.testnet.apexfusion.org/faucet/request \
  -H "Content-Type: application/json" \
  -H "X-API-Key: vf_your_key_here" \
  -d '{"address": "addr1...", "amount": 10000000}'

# Check remaining limits
curl https://faucet.vector.testnet.apexfusion.org/faucet/status \
  -H "X-API-Key: vf_your_key_here"
```

| Limit | Value |
|-------|-------|
| Per request | 10–50 AP3X |
| Daily | 200 AP3X |
| Monthly | 2,000 AP3X |
| Rate limit | 10 requests/minute |

## Environment Variables (.env)

```bash
VECTOR_OGMIOS_URL=https://ogmios.vector.testnet.apexfusion.org
VECTOR_SUBMIT_URL=https://submit.vector.testnet.apexfusion.org/api/submit/tx
VECTOR_KOIOS_URL=https://v2.koios.vector.testnet.apexfusion.org/
VECTOR_EXPLORER_URL=https://vector.testnet.apexscan.org
VECTOR_MNEMONIC="your 24 word mnemonic here"
VECTOR_SPEND_LIMIT_PER_TX=100000000
VECTOR_SPEND_LIMIT_DAILY=500000000
FAUCET_API_KEY=vf_your_key_here
```

## CBOR Constructor Tags (Aiken ↔ PyCardano)

| Constructor | CBOR Tag |
|-------------|----------|
| Constructor 0 | `CBORTag(121, [...])` |
| Constructor 1 | `CBORTag(122, [...])` |
| Constructor 2 | `CBORTag(123, [...])` |
| Constructor 3 | `CBORTag(124, [...])` |
| Constructor 4 | `CBORTag(125, [...])` |
| Constructor 5 | `CBORTag(126, [...])` |
| Constructor 6+ | `CBORTag(1280 + n, [...])` |

## Common Mistakes

!!! danger "Top 6 mistakes AI agents make"
    1. **Using `Network.TESTNET`** — Use `Network.MAINNET` (Vector testnet uses mainnet network ID)
    2. **Using old Aiken `v1.0.29-alpha`** — Use latest stable (v1.1.x+), Vector is Conway era
    3. **Targeting `PlutusV2`** — Use `PlutusV3` (Vector runs Conway era)
    4. **Using `addr_test1` addresses** — Vector uses `addr1` for both testnet and mainnet
    5. **Definite-length CBOR** — Use indefinite-length arrays to match Aiken encoding
    6. **Assuming decoded datums** — Ogmios returns raw CBOR hex, decode with `cbor2`

## Source Repositories

| Repo | URL |
|------|-----|
| MCP Server | [github.com/Apex-Fusion/mcp-server](https://github.com/Apex-Fusion/mcp-server) |
| Python SDK | [github.com/Apex-Fusion/agent-sdk-py](https://github.com/Apex-Fusion/agent-sdk-py) |
| TypeScript SDK | [github.com/Apex-Fusion/agent-sdk-ts](https://github.com/Apex-Fusion/agent-sdk-ts) |
| Smart Contracts | [github.com/Apex-Fusion/vector-ai-agents](https://github.com/Apex-Fusion/vector-ai-agents) |
| Documentation | [github.com/Apex-Fusion/vector-ai-documentation](https://github.com/Apex-Fusion/vector-ai-documentation) |
