# MCP Server Setup

Connect your AI agent to Vector blockchain via the MCP server.

---

## What is the Vector MCP Server?

The Vector MCP server is a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes Vector blockchain operations as tools. Any MCP-compatible AI client (Claude Desktop, OpenClaw, LangChain, CrewAI, custom agents) can connect to it and immediately interact with Vector.

The server handles:

- Wallet management (key derivation, address generation)
- Transaction building, signing, and submission
- Chain queries (balances, UTxOs, history, protocol parameters)
- Smart contract deployment and interaction
- Agent registry operations (register, update, transfer, deregister, discover, message)
- Safety controls (spend limits, audit logging, dry-run)

**Transport:** MCP Streamable HTTP over HTTPS, at the `/mcp` endpoint. The deprecated SSE transport (`/sse` + `/messages`) was removed in server v2.0.0.

**Mnemonic handling:** The wallet mnemonic is passed per-call by the MCP client - it is NOT stored in the server environment.

---

## Connect to the Hosted Server

The Vector MCP server is hosted and publicly available - no installation required. Connect your AI client directly.

No authentication, no API keys, no environment variables needed.

### Claude Code (Terminal)

One command:

=== "Mainnet"

    ```bash
    claude mcp add --transport http vector-mcp https://mcp.vector.mainnet.apexfusion.org/mcp
    ```

    To make it available across all your projects, add `--scope user`:

    ```bash
    claude mcp add --transport http vector-mcp https://mcp.vector.mainnet.apexfusion.org/mcp --scope user
    ```

=== "Testnet"

    ```bash
    claude mcp add --transport http vector-mcp https://mcp.vector.testnet.apexfusion.org/mcp
    ```

    To make it available across all your projects, add `--scope user`:

    ```bash
    claude mcp add --transport http vector-mcp https://mcp.vector.testnet.apexfusion.org/mcp --scope user
    ```

That's it - all 24 Vector MCP tools are immediately available in Claude Code.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

=== "Mainnet"

    ```json
    {
      "mcpServers": {
        "vector-mcp": {
          "type": "http",
          "url": "https://mcp.vector.mainnet.apexfusion.org/mcp"
        }
      }
    }
    ```

=== "Testnet"

    ```json
    {
      "mcpServers": {
        "vector-mcp": {
          "type": "http",
          "url": "https://mcp.vector.testnet.apexfusion.org/mcp"
        }
      }
    }
    ```

Restart Claude Desktop after saving. See [Claude Desktop + Vector](../quickstart/claude-desktop.md) for a full walkthrough.

### Claude.ai (Web / Mobile)

Go to **Settings → Connectors → Add custom connector**, then enter:

=== "Mainnet"

    ```
    https://mcp.vector.mainnet.apexfusion.org/mcp
    ```

=== "Testnet"

    ```
    https://mcp.vector.testnet.apexfusion.org/mcp
    ```

### Project-Level Setup

For team collaboration, commit a `.mcp.json` file to your project root:

=== "Mainnet"

    ```json
    {
      "mcpServers": {
        "vector-mcp": {
          "type": "http",
          "url": "https://mcp.vector.mainnet.apexfusion.org/mcp"
        }
      }
    }
    ```

=== "Testnet"

    ```json
    {
      "mcpServers": {
        "vector-mcp": {
          "type": "http",
          "url": "https://mcp.vector.testnet.apexfusion.org/mcp"
        }
      }
    }
    ```

Anyone who opens the project with Claude Code will automatically pick up the Vector MCP server.

### Other MCP Clients

Connect any MCP-compatible client (Streamable HTTP transport) to the `/mcp` endpoint:

=== "Mainnet"

    ```
    https://mcp.vector.mainnet.apexfusion.org/mcp
    ```

=== "Testnet"

    ```
    https://mcp.vector.testnet.apexfusion.org/mcp
    ```

No additional configuration required - the hosted server handles all chain access internally.

!!! warning "Upgrading from the SSE endpoint?"
    Server v2.0.0 removed the legacy `/sse` and `/messages` routes. If your client was configured with `.../sse` and transport `sse`, change it to `.../mcp` with transport `http` (Streamable HTTP) and restart the client. The old URL returns `404`.

**Source repository:** [github.com/Apex-Fusion/mcp-server](https://github.com/Apex-Fusion/mcp-server)

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
| Koios | `https://v2.koios.vector.testnet.apexfusion.org/` | `https://v2.koios.vector.mainnet.apexfusion.org/` |
| Explorer | `https://vector.testnet.apexscan.org` | `https://vector.apexscan.org/en/` |

---

## Troubleshooting

### Connection errors

Check endpoint availability:

```bash
# Hosted MCP server (mainnet shown; use .testnet. for testnet)
curl -s https://mcp.vector.mainnet.apexfusion.org/health
# {"status":"ok","version":"2.0.0"}

# Chain access
curl -s https://ogmios.vector.testnet.apexfusion.org/health
```

If either endpoint is down, check the [Apex Fusion status page](https://apexfusion.org) or flag it with the team.

### "Spend limit exceeded"

Check your current limits and usage via the `vector_get_spend_limits` tool. Either increase the limit or wait for the daily reset (midnight UTC).

### Transaction failures

- **"Insufficient funds"** - balance too low for amount + fee + min UTxO
- **"UTxO contention"** - another transaction consumed a needed UTxO; retry
- **"Validation failed"** - smart contract validator returned false; check datum/redeemer

---

## Next Steps

- [MCP Tools Reference](tools-reference.md) - complete tool documentation
- [Safety Model](../concepts/safety-model.md) - detailed safety architecture
- [5-Minute Start](../quickstart/5-minute-start.md) - quick setup guide
