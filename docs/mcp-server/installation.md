# MCP Server Setup

Connect your AI agent to Vector blockchain via the MCP server.

---

## What is the Vector MCP Server?

The Vector MCP server (`web3-mcp`) is a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes Vector blockchain operations as tools. Any MCP-compatible AI client (Claude Desktop, OpenClaw, LangChain, CrewAI, custom agents) can connect to it and immediately interact with Vector.

The server handles:

- Wallet management (key derivation, address generation)
- Transaction building, signing, and submission
- Chain queries (balances, UTxOs, history, protocol parameters)
- Smart contract deployment and interaction
- Agent registry operations (register, update, transfer, deregister, discover, message)
- Safety controls (spend limits, audit logging, dry-run)

**Transport:** SSE (Server-Sent Events) over HTTP on port 3000.

**Mnemonic handling:** The wallet mnemonic is passed per-call by the MCP client — it is NOT stored in the server environment.

---

## Choose Your Setup

<div class="setup-chooser" markdown>
<div class="section-grid" markdown>
<a href="#quick-setup-connect-to-hosted-server"><strong>&#x26A1; Quick Setup</strong> <span class="section-desc">— Connect to the hosted MCP server in seconds. No installs, no builds, no configuration.</span></a>
<a href="#advanced-setup-install-locally"><strong>&#x1F527; Advanced Setup</strong> <span class="section-desc">— Clone and run your own MCP server locally. Full control over configuration.</span></a>
</div>
</div>

---

## Quick Setup — Connect to Hosted Server

The Vector MCP server is hosted and publicly available — no installation required. Connect your AI client directly.

**Testnet SSE endpoint:** `https://mcp.vector.testnet.apexfusion.org/sse`

No authentication, no API keys, no environment variables needed.

### Claude Code (Terminal)

One command:

```bash
claude mcp add --transport sse vector-mcp https://mcp.vector.testnet.apexfusion.org/sse
```

To make it available across all your projects, add `--scope user`:

```bash
claude mcp add --transport sse vector-mcp https://mcp.vector.testnet.apexfusion.org/sse --scope user
```

That's it — all 18 Vector MCP tools are immediately available in Claude Code.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "vector-mcp": {
      "type": "sse",
      "url": "https://mcp.vector.testnet.apexfusion.org/sse"
    }
  }
}
```

Restart Claude Desktop after saving. See [Claude Desktop + Vector](../quickstart/claude-desktop.md) for a full walkthrough.

### Claude.ai (Web / Mobile)

Go to **Settings → Connectors → Add custom connector**, then enter:

```
https://mcp.vector.testnet.apexfusion.org/sse
```

### Project-Level Setup

For team collaboration, commit a `.mcp.json` file to your project root:

```json
{
  "mcpServers": {
    "vector-mcp": {
      "type": "sse",
      "url": "https://mcp.vector.testnet.apexfusion.org/sse"
    }
  }
}
```

Anyone who opens the project with Claude Code will automatically pick up the Vector MCP server.

### Other MCP Clients

Connect any MCP-compatible client to the SSE endpoint:

```
https://mcp.vector.testnet.apexfusion.org/sse
```

No additional configuration required — the hosted server handles all chain access internally.

---

## Advanced Setup — Install Locally

For full control, install and run the MCP server yourself.

### Requirements

- **Node.js 18+**
- **npm**
- Internet access to reach Vector endpoints

### Clone and Build

```bash
git clone https://github.com/Apex-Fusion/web3-mcp
cd web3-mcp
npm install
npm run build
npm start  # runs on port 3000
```

The server starts and serves SSE over HTTP on **port 3000**.

### Docker

```bash
npm run build && docker build -t vector-mcp . && docker run -p 3000:3000 vector-mcp
```

### Configure Your Client

Once the server is running locally, point your AI client to it:

=== "Claude Desktop"

    Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

    ```json
    {
      "mcpServers": {
        "vector": {
          "command": "node",
          "args": ["/path/to/web3-mcp/build/index.js"],
          "env": {
            "VECTOR_OGMIOS_URL": "https://ogmios.vector.testnet.apexfusion.org",
            "VECTOR_SUBMIT_URL": "https://submit.vector.testnet.apexfusion.org/api/submit/tx",
            "VECTOR_KOIOS_URL": "https://koios.vector.testnet.apexfusion.org/",
            "VECTOR_EXPLORER_URL": "https://vector.testnet.apexscan.org"
          }
        }
      }
    }
    ```

=== "OpenClaw"

    ```yaml
    mcp_servers:
      - name: vector
        command: node /path/to/web3-mcp/build/index.js
        env:
          VECTOR_OGMIOS_URL: "https://ogmios.vector.testnet.apexfusion.org"
          VECTOR_KOIOS_URL: "https://koios.vector.testnet.apexfusion.org/"
    ```

=== "Generic MCP Client"

    Start the server and connect to `http://localhost:3000`.

---

## Configuration

### Environment Variables

All settings are configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP port | `3000` |
| `VECTOR_OGMIOS_URL` | Ogmios HTTP endpoint | `https://ogmios.vector.testnet.apexfusion.org` |
| `VECTOR_SUBMIT_URL` | TX submission endpoint | `https://submit.vector.testnet.apexfusion.org/api/submit/tx` |
| `VECTOR_KOIOS_URL` | Koios REST API endpoint (include trailing slash) | `https://koios.vector.testnet.apexfusion.org/` |
| `VECTOR_EXPLORER_URL` | Block explorer URL | `https://vector.testnet.apexscan.org` |
| `VECTOR_SPEND_LIMIT_PER_TX` | Per-TX spend limit in DFM | `100000000` (100 AP3X) |
| `VECTOR_SPEND_LIMIT_DAILY` | Daily spend limit in DFM | `500000000` (500 AP3X) |
| `VECTOR_AUDIT_LOG_PATH` | Persistent audit log file path | `./vector-audit-log.json` |
| `VECTOR_RATE_LIMIT_PER_MINUTE` | Max tool calls per minute | `60` |

**Note:** `VECTOR_MNEMONIC` is intentionally absent — the mnemonic is passed per-call by the MCP client, not stored in the environment.

**Source repository:** [github.com/Apex-Fusion/web3-mcp](https://github.com/Apex-Fusion/web3-mcp)

### Network Endpoints

=== "Testnet"

    ```bash
    VECTOR_OGMIOS_URL=https://ogmios.vector.testnet.apexfusion.org
    VECTOR_SUBMIT_URL=https://submit.vector.testnet.apexfusion.org/api/submit/tx
    VECTOR_KOIOS_URL=https://koios.vector.testnet.apexfusion.org/
    VECTOR_EXPLORER_URL=https://vector.testnet.apexscan.org
    ```

=== "Mainnet"

    ```bash
    VECTOR_OGMIOS_URL=https://ogmios.vector.mainnet.apexfusion.org
    VECTOR_SUBMIT_URL=https://submit.vector.mainnet.apexfusion.org/api/submit/tx
    VECTOR_KOIOS_URL=https://koios.vector.mainnet.apexfusion.org/
    VECTOR_EXPLORER_URL=https://explorer.vector.mainnet.apexfusion.org
    ```

!!! note "Testnet uses mainnet network ID"
    Vector testnet uses mainnet network ID (networkMagic: 764824073). Wallet addresses start with `addr1`, not `addr_test1`.

---

## Wallet Modes

### Agent-Controlled Mode (Default)

The agent holds the wallet keys and can sign transactions autonomously, within spend limits.

Best for: autonomous agents with defined budgets, testnet experimentation, low-value operations.

### Transaction-Crafter Mode

The agent builds transactions but returns them **unsigned**. A human (or separate signing service) must sign and submit.

Best for: high-value operations, institutional use, any scenario requiring human approval on every transaction.

In this mode, tools like `vector_send_apex` return an unsigned transaction (CBOR hex) instead of submitting.

---

## Spend Limits

Spend limits are enforced at the server level. They cannot be bypassed by the agent.

| Limit | Default | Description |
|-------|---------|-------------|
| Per-transaction | 100 AP3X (100,000,000 DFM) | Max value in a single transaction |
| Daily | 500 AP3X (500,000,000 DFM) | Cumulative max per calendar day (UTC) |

The daily limit resets at midnight UTC. The agent can check current usage via `vector_get_spend_limits`.

---

## Audit Log

When enabled (default), every MCP tool invocation is logged to the audit log path:

```json
{
  "timestamp": "2026-03-16T10:30:00Z",
  "tool": "vector_send_apex",
  "params": {"recipientAddress": "addr1...", "amount": 5},
  "result": "success",
  "tx_hash": "abc123...",
  "fee": 180000,
  "spend_total_daily": 5180000
}
```

Read the JSON file directly, or query it programmatically.

---

## Endpoint Reference

| Service | Testnet | Mainnet |
|---------|---------|---------|
| Ogmios | `https://ogmios.vector.testnet.apexfusion.org` | `https://ogmios.vector.mainnet.apexfusion.org` |
| TX Submit | `https://submit.vector.testnet.apexfusion.org/api/submit/tx` | `https://submit.vector.mainnet.apexfusion.org/api/submit/tx` |
| Koios | `https://koios.vector.testnet.apexfusion.org/` | `https://koios.vector.mainnet.apexfusion.org/` |
| Explorer | `https://vector.testnet.apexscan.org` | `https://explorer.vector.mainnet.apexfusion.org` |

---

## Troubleshooting

### Server won't start

Ensure the build succeeded and the path to `build/index.js` is correct:

```bash
ls /path/to/web3-mcp/build/index.js
```

### Connection errors to Ogmios

Check endpoint availability:

```bash
curl -s https://ogmios.vector.testnet.apexfusion.org/health
```

If the endpoint is down, check the [Apex Fusion status page](https://apexfusion.org) or flag it with the team.

### "Spend limit exceeded"

Check your current limits and usage via the `vector_get_spend_limits` tool. Either increase the limit or wait for the daily reset (midnight UTC).

### Transaction failures

- **"Insufficient funds"** — balance too low for amount + fee + min UTxO
- **"UTxO contention"** — another transaction consumed a needed UTxO; retry
- **"Validation failed"** — smart contract validator returned false; check datum/redeemer

---

## Next Steps

- [MCP Tools Reference](tools-reference.md) — complete tool documentation
- [Safety Model](../concepts/safety-model.md) — detailed safety architecture
- [5-Minute Start](../quickstart/5-minute-start.md) — quick setup guide
