# MCP Server Security

Detailed security architecture of the Vector MCP server — how spend limits, audit logging, rate limiting, and wallet modes protect against agent failures.

---

## Architecture

```
┌──────────────────────┐      ┌──────────────────────────┐
│  Claude / GPT / etc. │◄────►│  vector-mcp-server       │
│  (any MCP client)    │ SSE  │                          │
└──────────────────────┘      │  ┌────────────────────┐  │
                              │  │ Rate Limiter        │  │
                              │  │ (60 calls/min)      │  │
                              │  └────────┬───────────┘  │
                              │           │               │
                              │  ┌────────▼───────────┐  │
                              │  │ Safety Layer        │  │
                              │  │ - Per-tx limits     │  │
                              │  │ - Daily limits      │  │
                              │  │ - Audit log         │  │
                              │  └────────┬───────────┘  │
                              │           │               │
                              │  ┌────────▼───────────┐  │
                              │  │ Lucid + Ogmios     │  │
                              │  │ Provider            │  │
                              │  └────────┬───────────┘  │
                              │           │               │
                              │  ┌────────▼───────────┐  │
                              │  │ Ogmios / Koios /   │  │
                              │  │ Submit API          │  │
                              │  └────────────────────┘  │
                              └──────────────────────────┘
```

Every tool call passes through three gates: **rate limiter**, **safety layer**, and **audit log** — in that order. An agent cannot bypass any gate through conversation or prompt injection.

---

## Spend Limits

### How They Work

The safety layer runs a pre-flight check **before** signing any transaction:

1. Parse the outgoing value (AP3X in DFM, excluding fees)
2. Compare against the per-transaction limit
3. Compare against the daily cumulative limit (tracked in memory, reset at midnight UTC)
4. If either check fails, return a structured error — the transaction is never signed or submitted

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VECTOR_SPEND_LIMIT_PER_TX` | `100000000` (100 AP3X) | Max DFM in a single transaction |
| `VECTOR_SPEND_LIMIT_DAILY` | `500000000` (500 AP3X) | Max cumulative DFM per day |

### Error Response

When a limit is exceeded, the agent receives:

```json
{
  "error": "SPEND_LIMIT_EXCEEDED",
  "message": "Amount 150000000 DFM exceeds per-transaction limit of 100000000 DFM (100 AP3X)",
  "limit_type": "per_transaction",
  "limit": 100000000,
  "attempted": 150000000
}
```

The agent can use this to inform the user or adjust the amount.

### Changing Limits at Runtime

The `vector_set_spend_limit` tool **always requires human confirmation** — even if `requireConfirmation` is set to `false`. An agent cannot escalate its own limits.

---

## Audit Log

Every MCP tool invocation is logged to a persistent JSON file.

### What Gets Logged

```json
{
  "timestamp": "2026-03-16T10:30:00Z",
  "tool": "vector_send_apex",
  "params": {"recipientAddress": "addr1qz...", "amount": 5},
  "result": "success",
  "tx_hash": "abc123...",
  "fee": 180000,
  "spend_daily_total": 5180000,
  "spend_daily_remaining": 494820000
}
```

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VECTOR_AUDIT_LOG_PATH` | `./vector-audit-log.json` | File path for the audit log |

### Querying

The agent can query its own audit log:

```
Tool: vector_get_audit_log
Params: { "limit": 10, "tool": "vector_send_apex" }
```

Or read the file directly for offline analysis.

---

## Rate Limiting

Prevents agents from flooding the network with requests.

| Variable | Default | Description |
|----------|---------|-------------|
| `VECTOR_RATE_LIMIT_PER_MINUTE` | `60` | Max tool calls per minute |

Rate limiting operates at the MCP tool call level — all tools count toward the same limit. When exceeded, the server returns a `429` error and the agent should wait before retrying.

---

## Wallet Modes

### Agent-Controlled Mode (Default)

The agent holds wallet keys and signs transactions autonomously, within spend limits.

**Flow:**
```
Agent calls vector_send_apex
  → Rate limiter: OK
  → Safety layer: within limits
  → Sign transaction with wallet key
  → Submit to Vector network
  → Log to audit trail
  → Return TX hash to agent
```

### Transaction-Crafter Mode

The agent builds transactions but returns them **unsigned**. A human or external signing service must approve.

**Flow:**
```
Agent calls vector_build_transaction
  → Rate limiter: OK
  → Safety layer: within limits
  → Build unsigned transaction
  → Return CBOR hex to agent
  → Human reviews and signs externally
  → Human submits via vector_submit_tx or CLI
```

Enable by passing `"submitted": false` in `vector_build_transaction`.

---

## Mnemonic Handling

The wallet mnemonic is **passed per-call** by the MCP client — it is NOT stored in the server environment. This means:

- The mnemonic lives in the MCP client configuration (e.g., Claude Desktop's `claude_desktop_config.json`)
- The server never writes it to disk
- Each tool call that needs signing receives the mnemonic as part of the MCP request
- The server derives keys in memory, signs, and discards

This design prevents mnemonic leakage via server logs, environment dumps, or process inspection.

---

## Transport Security

The MCP server uses **SSE (Server-Sent Events) over HTTP** on port 3000. For production:

- Run behind a reverse proxy (nginx, Caddy) with TLS
- Bind to `127.0.0.1` to prevent external access
- Use firewall rules to restrict access to the MCP client only

---

## Threat Model

| Threat | Mitigation |
|--------|------------|
| Agent sends too much in one TX | Per-transaction spend limit |
| Agent slowly drains wallet over time | Daily spend limit (resets midnight UTC) |
| Agent floods network with requests | Rate limiting (60 calls/min default) |
| Prompt injection to escalate limits | `vector_set_spend_limit` always requires human confirmation |
| Agent hallucinates TX parameters | `vector_dry_run` catches invalid transactions before commit |
| Undetected misbehavior | Persistent audit log for post-hoc review |
| Agent compromised entirely | Transaction-crafter mode — agent can't sign |
| Mnemonic stolen from server | Mnemonic passed per-call, never stored on server |
| Man-in-the-middle | TLS via reverse proxy |

---

## Next Steps

- [MCP Server Installation](installation.md) — setup and configuration
- [Safety Model](../concepts/safety-model.md) — conceptual overview of all safety layers
- [Agent Wallets](../concepts/agent-wallets.md) — wallet security best practices
- [MCP Tools Reference](tools-reference.md) — all available tools
