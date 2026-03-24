# Vector Testnet Faucet

Get testnet AP3X tokens sent directly to your Vector wallet — no bridging required. Designed for AI agents that need programmatic access to testnet funds.

---

## Overview

| | |
|---|---|
| **Web UI** | [apex-fusion.github.io/vector-faucet](https://apex-fusion.github.io/vector-faucet/) |
| **API Base** | `https://faucet.vector.testnet.apexfusion.org` |
| **Source** | [github.com/Apex-Fusion/vector-faucet](https://github.com/Apex-Fusion/vector-faucet) |

---

## Step 1: Register and Get an API Key

Registration is a one-time process done by the human operator through the web UI.

1. Visit the [Vector Faucet](https://apex-fusion.github.io/vector-faucet/)
2. **Register** with your email and a password (CAPTCHA-protected)
3. **Verify your email** by clicking the link sent to your inbox
4. **Log in** to generate your API key (prefixed `vf_`)
5. **Copy and store** the API key — it is shown only once

!!! warning "API Key Security"
    Treat your faucet API key like a password. Never commit it to version control or expose it in client-side code. Store it in a secrets manager or environment variable.

Set it as an environment variable for your agent:

```bash
export VECTOR_FAUCET_API_KEY="vf_your_key_here"
```

If you need a new key, use the **Rotate Key** option in the web UI. This invalidates the previous key.

---

## Step 2: Request Testnet Funds

Once you have an API key, request funds programmatically.

### Authentication

Include your API key in every request using either header format:

| Header | Format |
|--------|--------|
| `X-API-Key` | `vf_your_key_here` |
| `Authorization` | `Bearer vf_your_key_here` |

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/faucet/request` | POST | Request testnet AP3X |
| `/faucet/status` | GET | Check remaining daily/monthly limits |

### Request Funds

```bash
curl -X POST https://faucet.vector.testnet.apexfusion.org/faucet/request \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $VECTOR_FAUCET_API_KEY" \
  -d '{
    "address": "addr1q...",
    "amount": 10000000
  }'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | Vector testnet address (starts with `addr1`) |
| `amount` | integer | Yes | Amount in lovelace (1 AP3X = 1,000,000 lovelace) |

**Response:**

```json
{
  "tx_hash": "abc123...",
  "explorer_url": "https://vector.testnet.apexscan.org/en/transaction/abc123...",
  "remaining_daily": 150000000,
  "remaining_monthly": 1500000000
}
```

### Check Status

```bash
curl https://faucet.vector.testnet.apexfusion.org/faucet/status \
  -H "X-API-Key: $VECTOR_FAUCET_API_KEY"
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

---

## Limits

| Limit | Amount |
|-------|--------|
| Per request | 10 – 50 AP3X |
| Daily per account | 200 AP3X |
| Monthly per account | 2,000 AP3X |
| API rate limit | 10 requests/minute per IP |

!!! note "Units"
    All API amounts are in **lovelace** (also called DFM). 1 AP3X = 1,000,000 lovelace. To request 10 AP3X, set `amount` to `10000000`.

---

## SDK Examples

=== "Python"

    ```python
    import httpx
    import os

    FAUCET_URL = "https://faucet.vector.testnet.apexfusion.org"
    API_KEY = os.environ["VECTOR_FAUCET_API_KEY"]

    async def request_testnet_funds(address: str, amount_lovelace: int = 10_000_000):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{FAUCET_URL}/faucet/request",
                headers={"X-API-Key": API_KEY},
                json={"address": address, "amount": amount_lovelace},
            )
            response.raise_for_status()
            data = response.json()
            print(f"TX: {data['tx_hash']}")
            print(f"Explorer: {data['explorer_url']}")
            print(f"Daily remaining: {data['remaining_daily'] / 1_000_000} AP3X")
            return data
    ```

=== "TypeScript"

    ```typescript
    const FAUCET_URL = "https://faucet.vector.testnet.apexfusion.org";
    const API_KEY = process.env.VECTOR_FAUCET_API_KEY!;

    async function requestTestnetFunds(address: string, amount: number = 10_000_000) {
      const response = await fetch(`${FAUCET_URL}/faucet/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({ address, amount }),
      });
      const data = await response.json();
      console.log(`TX: ${data.tx_hash}`);
      console.log(`Explorer: ${data.explorer_url}`);
      console.log(`Daily remaining: ${data.remaining_daily / 1_000_000} AP3X`);
      return data;
    }
    ```

=== "curl"

    ```bash
    # Request 10 AP3X
    curl -X POST https://faucet.vector.testnet.apexfusion.org/faucet/request \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $VECTOR_FAUCET_API_KEY" \
      -d '{"address": "addr1q...", "amount": 10000000}'

    # Check remaining limits
    curl https://faucet.vector.testnet.apexfusion.org/faucet/status \
      -H "X-API-Key: $VECTOR_FAUCET_API_KEY"
    ```

---

## Alternative: Prime Faucet + Reactor Bridge

!!! info "Legacy method"
    Before the Vector Testnet Faucet existed, the only way to get testnet AP3X on Vector was through Prime. This still works as an alternative — useful if the faucet is temporarily unavailable or you need larger amounts.

1. Get AP3X from the [Prime Testnet faucet](https://developers.apexfusion.org/documentation/getting-started-with-testnet)
2. Bridge AP3X from Prime to Vector via the [Reactor Bridge](https://developers.apexfusion.org/documentation/how-to-use-the-reactor-bridge)
3. Wait for funds to arrive on Vector (usually a few minutes)

---

## What's Next?

- [5-Minute Start](5-minute-start.md) — get an agent talking to Vector in under 5 minutes
- [Agent Wallets](../concepts/agent-wallets.md) — wallet creation, funding, and security
- [Safety Model](../concepts/safety-model.md) — spend limits and audit logging
