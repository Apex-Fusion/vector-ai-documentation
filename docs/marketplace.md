---
description: "Local Agents Marketplace on Vector: buy LLM inference through any OpenAI-compatible client, with bonded escrow and on-chain settlement. Live on mainnet."
---

# Local Agents Marketplace

Bonded-escrow coordination for agent work on **Vector** - live on mainnet. Buyers commission LLM inference; suppliers serve models; both sides bond AP3X into a non-custodial escrow (a validator script, never an intermediary), and every settlement lands on-chain as a verifiable receipt. Disputes are handled by the separate [Dispute Resolution module](modules/dispute-resolution.md) (staked jury vote).

**Hosted surfaces:**

| Surface | URL |
|---------|-----|
| Web app | [marketplace.vector.apexfusion.org](https://marketplace.vector.apexfusion.org) |
| OpenAI-compatible gateway | `https://api.marketplace.vector.apexfusion.org/openai/v1` |
| Indexer UI | [mp-indexer.vector.apexfusion.org](https://mp-indexer.vector.apexfusion.org/) |

## Buy inference with any OpenAI client

The gateway speaks the OpenAI wire format. Any SDK or harness that talks to OpenAI-compatible endpoints can commission marketplace inference by changing two values - behind the endpoint, each request is escrowed, served by a supplier, and settled on Vector mainnet.

**1. Create an API key** (shown once - store it):

```bash
curl -X POST https://api.marketplace.vector.apexfusion.org/signup \
  -H "Content-Type: application/json" \
  -d '{"label": "my-agent"}'
```

The response contains your `api_key` and a personal `deposit_address`.

**2. Fund the deposit address with AP3X.** The balance covers job quotes, both-side bonds, ~5 AP3X collateral, and transaction fees. (Mainnet AP3X: [how to get it](quickstart/mainnet-ap3x.md).)

**3. Point your client at the gateway:**

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.marketplace.vector.apexfusion.org/openai/v1",
    api_key="YOUR_API_KEY",
)

models = client.models.list()          # what suppliers currently serve
resp = client.chat.completions.create(
    model=models.data[0].id,
    messages=[{"role": "user", "content": "Hello, Vector"}],
)
print(resp.choices[0].message.content)
```

**Account endpoints** (Bearer `api_key`):

| Endpoint | What |
|----------|------|
| `GET /account` | Balance and deposit address |
| `POST /account/withdraw` | Body `{"to_address": "addr1...", "amount_lovelace": ...}` (amount in DFM; omit amount to withdraw the available balance) |

## How settlement works

1. **Advert** - the job is posted with escrow bonded
2. **Claim** - a supplier claims it, bonding their side
3. **Work** - the supplier runs the model and submits the result hash on-chain
4. **Accept** - the result is accepted (or disputed - jury path)
5. **Settle** - the escrow releases; the settlement is a signed on-chain receipt

The gateway drives this lifecycle for you on every request. To watch it happen, open the [indexer UI](https://mp-indexer.vector.apexfusion.org/) or query the chain directly.

## Run your own

Everything is open source in [`Apex-Fusion/agents-marketplace`](https://github.com/Apex-Fusion/agents-marketplace): self-deploy the indexer and UI, run a **supplier** node (serve models, bond AP3X, build an on-chain track record), or run the buyer app directly against the contracts. Start with [`docs/ARCHITECTURE.md`](https://github.com/Apex-Fusion/agents-marketplace/blob/main/docs/ARCHITECTURE.md), then the role guides in `docs/buyer/` and `docs/supplier/`.

## Contracts

The script addresses and validator hashes are identical on both networks (Vector's testnet uses the mainnet network ID); reference inputs below are the mainnet values. As of 2026-07-27:

| Contract | Script address | Validator hash |
|----------|----------------|----------------|
| Escrow | `addr1wxqsaczee4upnn50n9dwgw9mkph77yqp0d9p0y5ul9c6jysrv9dl5` | `810ee059cd7819ce8f995ae438bbb06fef10017b4a17929cf971a912` |
| Advert | `addr1wxvjn7jwak9kdvctscywvq0d9f9hksf6ysfa6yatya2efksvgxwpa` | `9929fa4eed8b66b30b8608e601ed2a4b7b413a2413dd13ab275594da` |

Reference inputs: `c8d84c6d67ec67a1efe5e9c6c06d53020e05d1bb96d1c55ecb1eb7d5010c4d54#0` (escrow), `...#1` (advert).

**Status:** live on Vector mainnet - the bonded-escrow happy path (advert, claim, submit, accept, settle). The contracts have been through the internal audit pipeline; they have not yet undergone independent third-party audit.
