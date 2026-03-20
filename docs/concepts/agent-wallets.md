# Agent Wallets

How AI agents manage wallets on Vector — creation, funding, security, and best practices.

---

## Overview

Every AI agent interacting with Vector needs a **wallet** — a cryptographic identity that holds AP3X and native tokens, signs transactions, and represents the agent on-chain.

Vector uses **HD wallets** (Hierarchical Deterministic) derived from a 15-word mnemonic phrase (15 or 24 words are both accepted). From a single mnemonic, the agent can derive multiple addresses for different purposes.

!!! note "Vector testnet addresses start with addr1"
    Vector testnet uses mainnet network ID (networkMagic: 764824073). All addresses — testnet and mainnet — start with `addr1`, not `addr_test1`.

---

## Wallet Creation

### Via MCP Server

The MCP server does not have an `init` command. Generate a 15-word mnemonic with any standard BIP39 tool and configure it via `VECTOR_MNEMONIC` (passed per-call).

### Via Python SDK

```python
import asyncio
from vector_agent import VectorAgent

async def main():
    async with VectorAgent() as agent:
        # Configured via VECTOR_MNEMONIC env var
        address = await agent.get_address()
        print(f"Agent address: {address}")

asyncio.run(main())
```

### Via TypeScript SDK

```typescript
import { VectorAgent } from '@vector/agent-sdk';

const agent = await VectorAgent.create({
  network: 'testnet',
  walletMnemonic: process.env.VECTOR_MNEMONIC,
  ogmiosUrl: 'wss://ogmios.vector.testnet.apexfusion.org',
  submitUrl: 'https://submit.vector.testnet.apexfusion.org/api/submit/tx',
});

const address = agent.getAddress();
```

---

## Wallet Architecture

```
Mnemonic (15 or 24 words)
  └── Root Key
       └── Account 0
            ├── External Chain (receiving addresses)
            │   ├── Address 0  ← primary agent address (starts with addr1)
            │   ├── Address 1
            │   └── ...
            └── Internal Chain (change addresses)
                ├── Address 0
                └── ...
```

The agent typically uses **Address 0** from the external chain as its primary address. Change from transactions goes to internal chain addresses automatically.

---

## Mnemonic Security

The 15-word mnemonic (or 24-word) is the **master key** to the wallet. Anyone with the mnemonic can spend all funds.

### Do

- Store the mnemonic in a **secrets manager** (AWS Secrets Manager, HashiCorp Vault, etc.)
- Use **environment variables** to pass the mnemonic to the MCP server or SDK
- Encrypt the mnemonic at rest if storing on disk
- Use separate mnemonics for testnet and mainnet agents

### Don't

- Commit the mnemonic to version control
- Store it in plain text config files
- Share it across multiple agents (each agent should have its own wallet)
- Log it anywhere

### Environment Variable Pattern

=== "Testnet"

    ```bash
    export VECTOR_MNEMONIC="your fifteen word mnemonic phrase ..."
    export VECTOR_OGMIOS_URL="https://ogmios.vector.testnet.apexfusion.org"
    export VECTOR_SUBMIT_URL="https://submit.vector.testnet.apexfusion.org/api/submit/tx"
    export VECTOR_KOIOS_URL="https://koios.vector.testnet.apexfusion.org/"
    export VECTOR_EXPLORER_URL="https://vector.testnet.apexscan.org"
    export VECTOR_ACCOUNT_INDEX="0"
    export VECTOR_SPEND_LIMIT_PER_TX="100000000"
    export VECTOR_SPEND_LIMIT_DAILY="500000000"
    ```

=== "Mainnet"

    ```bash
    export VECTOR_MNEMONIC="your mainnet mnemonic phrase ..."
    export VECTOR_OGMIOS_URL="https://ogmios.vector.mainnet.apexfusion.org"
    export VECTOR_SUBMIT_URL="https://submit.vector.mainnet.apexfusion.org/api/submit/tx"
    export VECTOR_KOIOS_URL="https://koios.vector.mainnet.apexfusion.org/"
    export VECTOR_EXPLORER_URL="https://explorer.vector.mainnet.apexfusion.org"
    export VECTOR_ACCOUNT_INDEX="0"
    export VECTOR_SPEND_LIMIT_PER_TX="50000000"
    export VECTOR_SPEND_LIMIT_DAILY="200000000"
    ```

!!! warning "Use separate mnemonics"
    Always use different mnemonics for testnet and mainnet wallets. On mainnet, consider more conservative spend limits.

---

## Funding Agent Wallets

### Testnet

To get testnet AP3X:

1. Get your agent's address: `vector_get_address`
2. Get AP3X from the [Prime Testnet faucet](https://developers.apexfusion.org/documentation/getting-started-with-testnet)
3. Bridge AP3X from Prime to Vector via the [Reactor Bridge](https://developers.apexfusion.org/documentation/how-to-use-the-reactor-bridge)
4. Verify with: `vector_get_balance`

### Mainnet

Transfer AP3X from an existing wallet to the agent's address. Start with a small amount and increase as you build confidence in the agent's behavior.

---

## Wallet Modes

### Agent-Controlled Mode

The agent holds the private keys and can sign transactions autonomously. Safety is enforced through spend limits.

```
Agent receives instruction
  → Builds transaction
  → Checks spend limits ✓
  → Signs with private key
  → Submits to network
  → Logs to audit trail
```

**Use when:** Running autonomous agents with defined budgets, testnet experimentation, low-value operations.

### Transaction-Crafter Mode

The agent builds transactions but cannot sign them. Returns unsigned transactions for human or co-signer approval.

```
Agent receives instruction
  → Builds transaction
  → Returns unsigned TX (CBOR)
  → Human reviews and signs
  → Human submits to network
```

**Use when:** High-value operations, institutional deployments, compliance requirements, or when you want human approval on every transaction.

---

## Spend Limits

Spend limits are the primary safety mechanism for agent-controlled wallets.

| Limit | Description | Default |
|-------|-------------|---------|
| **Per-transaction** | Maximum value in a single transaction | 100 AP3X |
| **Daily** | Cumulative maximum per day (resets midnight UTC) | 500 AP3X |

### How Limits Work

```
Agent wants to send 150 AP3X
  → Per-TX limit: 100 AP3X
  → REJECTED: "Transaction of 150 AP3X exceeds per-transaction limit of 100 AP3X"

Agent wants to send 50 AP3X (daily total already at 460 AP3X)
  → Daily limit: 500 AP3X
  → Daily remaining: 40 AP3X
  → REJECTED: "Transaction of 50 AP3X would exceed daily limit. Remaining: 40 AP3X"
```

Limits are enforced at the MCP server and SDK level — the agent cannot bypass them.

### Configuring Limits

```json
{
  "spendLimits": {
    "perTransaction": 50000000,
    "daily": 200000000
  }
}
```

Or via environment variables:

```bash
VECTOR_SPEND_LIMIT_PER_TX=50000000    # 50 AP3X (in DFM)
VECTOR_SPEND_LIMIT_DAILY=200000000    # 200 AP3X (in DFM)
```

### Recommended Strategy

Start conservative and increase gradually:

| Phase | Per-TX | Daily | Use Case |
|-------|--------|-------|----------|
| Testing | 10 AP3X | 50 AP3X | Initial development and testing |
| Staging | 50 AP3X | 200 AP3X | Validated agent in controlled environment |
| Production | 100 AP3X | 500 AP3X | Trusted agent with proven track record |
| High-value | Custom | Custom | With transaction-crafter mode or multi-sig |

---

## Multi-Agent Wallet Isolation

Each agent should have its own wallet (unique mnemonic). Never share a mnemonic across agents.

```
Agent A: mnemonic_a → wallet_a → address_a
Agent B: mnemonic_b → wallet_b → address_b
Agent C: mnemonic_c → wallet_c → address_c
```

This provides:

- **Isolation** — one compromised agent doesn't affect others
- **Auditability** — clear on-chain trail per agent
- **Independent limits** — each agent has its own spend limits

---

## Balance Management

### Checking Balance

```python
balance = await agent.get_balance()
# balance.lovelace = 50000000 (DFM — AP3X amount in smallest units)
# balance.tokens = {"PolicyId.Token": 100}
ap3x = balance.lovelace / 1_000_000
```

The balance reflects all UTxOs at the agent's addresses.

### Minimum UTxO Value

Every UTxO on Vector must contain a minimum amount of AP3X (currently ~1-2 AP3X depending on the UTxO size). This is a protocol requirement.

When sending tokens, the SDK automatically includes the minimum AP3X required. The agent should maintain enough AP3X to cover:

- Transaction fees (~0.2 AP3X typical)
- Minimum UTxO values for token UTxOs
- A buffer for smart contract interactions (which may require AP3X deposits)

### Low Balance Alerts

Monitor your agent's balance programmatically:

```python
balance = await agent.get_balance()
ap3x = balance.lovelace / 1_000_000

if ap3x < 10:
    # Alert: agent wallet running low
    notify_operator(f"Agent wallet balance low: {ap3x} AP3X")
```

---

## UTxO Management

Unlike account-based chains, your agent's balance is split across multiple UTxOs. This has implications:

### UTxO Fragmentation

After many small transactions, you may end up with many tiny UTxOs. This increases transaction sizes and fees.

**Solution:** Periodically consolidate UTxOs by sending your full balance to yourself.

### UTxO Contention

If two transactions try to spend the same UTxO simultaneously, one will fail. This is rare with single-agent wallets but can happen with high-frequency operations.

**Solution:** The SDK handles UTxO selection automatically and retries on contention. For high-frequency agents, maintain multiple UTxOs.

---

## Next Steps

- [Safety Model](safety-model.md) — full safety architecture
- [How Vector Works](how-vector-works.md) — UTXO model fundamentals
- [5-Minute Start](../quickstart/5-minute-start.md) — get started quickly
