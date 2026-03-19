# Safety Model

How Vector protects against runaway agents, overspending, and unauthorized operations.

---

## Philosophy

AI agents operating on a blockchain can move real money. A bug, hallucination, or prompt injection could drain a wallet in seconds. Vector's safety model is designed around one principle:

**Limit the blast radius of any single failure.**

Every layer — MCP server, SDK, and wallet — enforces safety independently. An agent cannot bypass spend limits through clever prompting because the limits are enforced in code, not in conversation context.

---

## Safety Layers

```
┌─────────────────────────────────────┐
│  Layer 1: Wallet Mode               │
│  Agent-controlled vs. TX-crafter    │
├─────────────────────────────────────┤
│  Layer 2: Spend Limits              │
│  Per-transaction + daily caps       │
├─────────────────────────────────────┤
│  Layer 3: Human Confirmation        │
│  Optional approval before submit    │
├─────────────────────────────────────┤
│  Layer 4: Dry-Run                   │
│  Simulate before committing         │
├─────────────────────────────────────┤
│  Layer 5: Audit Log                 │
│  Every operation recorded           │
├─────────────────────────────────────┤
│  Layer 6: Rate Limiting             │
│  Throttle transaction frequency     │
└─────────────────────────────────────┘
```

---

## Layer 1: Wallet Mode

Choose how much autonomy the agent has:

### Agent-Controlled Mode

The agent holds keys and signs transactions autonomously, subject to spend limits.

```json
{ "walletMode": "agent-controlled" }
```

- Agent can transact within limits without human intervention
- Suitable for testnet, low-value operations, and trusted agents
- All other safety layers still apply

### Transaction-Crafter Mode

The agent builds transactions but returns them unsigned. A human or co-signing service must approve and sign.

```json
{ "walletMode": "transaction-crafter" }
```

- Maximum security — agent cannot spend without human approval
- Suitable for mainnet, high-value operations, institutional use
- The agent's `vector_send_apex` call returns CBOR hex instead of submitting

---

## Layer 2: Spend Limits

Hard caps on how much the agent can spend, enforced at the server level.

### Per-Transaction Limit

Maximum value (in DFM) for a single transaction. Includes AP3X sent to recipients and smart contract deposits, but excludes fees.

```json
{ "spendLimits": { "perTransaction": 100000000 } }
```

Default: **100 AP3X** (100,000,000 DFM)

### Daily Limit

Cumulative maximum for all transactions in a calendar day (UTC). Resets at midnight UTC.

```json
{ "spendLimits": { "daily": 500000000 } }
```

Default: **500 AP3X** (500,000,000 DFM)

### Enforcement

Spend limits are checked **before** the transaction is signed. If a transaction would exceed either limit, the MCP server returns an error:

```json
{
  "error": "SPEND_LIMIT_EXCEEDED",
  "message": "Transaction of 150 AP3X exceeds per-transaction limit of 100 AP3X",
  "limit": "per_transaction",
  "requested": 150000000,
  "allowed": 100000000
}
```

The agent receives this error and can adjust (e.g., send a smaller amount or inform the user).

### Checking Limits at Runtime

The agent can query current limits and usage:

```
Tool: vector_get_spend_limits

Response:
{
  "per_transaction": { "limit": 100000000, "unit": "DFM" },
  "daily": {
    "limit": 500000000,
    "used": 50000000,
    "remaining": 450000000,
    "resets_at": "2026-03-17T00:00:00Z",
    "unit": "DFM"
  }
}
```

### Changing Limits

Limits can be changed via:

- Config file edit + server restart
- Environment variable change + server restart
- `vector_set_spend_limit` tool — **always requires human confirmation**, even if `requireConfirmation` is false

An agent cannot escalate its own spend limits without human approval.

---

## Layer 3: Human Confirmation

When enabled, the MCP server prompts for human approval before submitting any transaction.

```json
{ "requireConfirmation": true }
```

The flow:

1. Agent builds the transaction
2. MCP server shows the transaction details to the human
3. Human approves or rejects
4. If approved, the transaction is signed and submitted

This is the default behavior. Set to `false` for fully autonomous operation within spend limits.

!!! tip "Progressive autonomy"
    Start with `requireConfirmation: true`. As you gain confidence in the agent, switch to `false` with conservative spend limits. Increase limits gradually over time.

---

## Layer 4: Dry-Run

Every transaction type can be simulated before committing real funds.

```
Tool: vector_dry_run
Params: { "outputs": [{"address": "addr1...", "value": {"lovelace": 5000000}}] }

Response:
{
  "valid": true,
  "fee": 180000,
  "inputs": [...],
  "outputs": [...],
  "errors": []
}
```

Dry-run uses Ogmios TX evaluation to check:

- The transaction is structurally valid
- Inputs exist and are spendable
- Script validators pass (for contract interactions)
- Fees are calculated correctly

**No funds are spent during a dry-run.** The transaction is never submitted to the mempool.

### Mandatory First Dry-Run

On first use, the MCP server automatically dry-runs the first transaction and presents results before asking for confirmation. This catches configuration errors early.

---

## Layer 5: Audit Log

Every MCP tool invocation is logged with full context.

### What's Logged

```json
{
  "timestamp": "2026-03-16T10:30:00Z",
  "tool": "vector_send_apex",
  "params": {
    "recipientAddress": "addr1qz...",
    "amount": 5
  },
  "result": "success",
  "tx_hash": "abc123...",
  "fee": 180000,
  "spend_daily_total": 5180000,
  "spend_daily_remaining": 494820000
}
```

Every entry includes:

- **Timestamp** — when the operation occurred
- **Tool** — which MCP tool was called
- **Parameters** — what the agent requested
- **Result** — success or failure (with error details)
- **Transaction details** — hash, fee, spend totals (for transactions)

### Querying the Log

Via MCP tool:

```
Tool: vector_get_audit_log
Params: { "limit": 10, "tool": "vector_send_apex" }
```

Or read the file directly:

```bash
cat ~/.vector/audit.json | python3 -m json.tool
```

### Log Storage

Default location: `~/.vector/audit.json`

Configure a custom path:

```json
{ "auditLogPath": "/var/log/vector-agent/audit.json" }
```

---

## Layer 6: Rate Limiting

Prevent agents from flooding the network with transactions.

| Limit | Default | Description |
|-------|---------|-------------|
| Transactions per minute | 10 | Max TX submissions per minute |
| Tool calls per minute | 60 | Max MCP tool invocations per minute |

Rate limits protect against:

- Infinite loops in agent logic
- Prompt injection attacks that trigger rapid transactions
- Accidental DoS of Vector endpoints

---

## Address Controls

### Allowlist

Restrict the agent to only send to pre-approved addresses:

```json
{
  "addressControls": {
    "allowlist": [
      "addr1qz...",
      "addr1qx..."
    ]
  }
}
```

When an allowlist is set, the agent can **only** send to these addresses. All other destinations are rejected.

### Blocklist

Block specific addresses (e.g., known scam addresses):

```json
{
  "addressControls": {
    "blocklist": [
      "addr1qBAD..."
    ]
  }
}
```

If both allowlist and blocklist are set, the allowlist takes precedence (only allowlisted addresses are permitted).

---

## Threat Model

### What Vector's safety model protects against:

| Threat | Mitigation |
|--------|------------|
| Agent sends too much AP3X in one TX | Per-transaction spend limit |
| Agent slowly drains wallet | Daily spend limit |
| Agent sends to wrong address | Address allowlist/blocklist |
| Agent makes too many transactions | Rate limiting |
| Agent prompt-injected to escalate limits | Limit changes require human confirmation |
| Agent hallucinates transaction parameters | Dry-run catches invalid transactions |
| Undetected misbehavior | Audit log for post-hoc review |
| Agent compromised entirely | Transaction-crafter mode (agent can't sign) |

### What it does NOT protect against:

| Threat | Recommendation |
|--------|---------------|
| Mnemonic leaked | Use secrets management; rotate compromised wallets |
| Compromised host machine | Standard infrastructure security practices |
| Smart contract vulnerabilities | Use audited templates; see [Smart Contracts for Agents](smart-contracts.md) |
| Economic attacks (front-running, MEV) | Contract-level protections; time-lock patterns |

---

## Recommended Configurations

### Development / Testing

```json
{
  "network": "testnet",
  "walletMode": "agent-controlled",
  "spendLimits": {
    "perTransaction": 10000000,
    "daily": 50000000
  },
  "requireConfirmation": false,
  "auditLog": true
}
```

### Staging / Demo

```json
{
  "network": "testnet",
  "walletMode": "agent-controlled",
  "spendLimits": {
    "perTransaction": 100000000,
    "daily": 500000000
  },
  "requireConfirmation": true,
  "auditLog": true
}
```

### Production (Autonomous)

```json
{
  "network": "mainnet",
  "walletMode": "agent-controlled",
  "spendLimits": {
    "perTransaction": 50000000,
    "daily": 200000000
  },
  "requireConfirmation": false,
  "auditLog": true,
  "addressControls": {
    "allowlist": ["addr1...known_safe_addresses"]
  }
}
```

### Production (Human-in-the-Loop)

```json
{
  "network": "mainnet",
  "walletMode": "transaction-crafter",
  "requireConfirmation": true,
  "auditLog": true
}
```

---

## Next Steps

- [Agent Wallets](agent-wallets.md) — wallet creation and management
- [MCP Server Installation](../mcp-server/installation.md) — setup and configuration
- [How Vector Works](how-vector-works.md) — UTXO model fundamentals
