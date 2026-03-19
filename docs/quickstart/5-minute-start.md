# 5-Minute Start

Get an AI agent talking to Vector blockchain in under 5 minutes.

---

## Prerequisites

- An **MCP-compatible AI client** (Claude Code, Claude Desktop, or any MCP client)

That's it — no installs needed. The Vector MCP server is hosted publicly.

---

## Step 1: Connect to the MCP Server

The Vector MCP server is hosted and publicly available — no installation, no API keys, no configuration.

=== "Claude Code (Terminal)"

    One command:

    === "Testnet"

        ```bash
        claude mcp add --transport sse vector-mcp https://mcp.vector.testnet.apexfusion.org/sse
        ```

        To make it available across all your projects, add `--scope user`:

        ```bash
        claude mcp add --transport sse vector-mcp https://mcp.vector.testnet.apexfusion.org/sse --scope user
        ```

    === "Mainnet"

        ```bash
        claude mcp add --transport sse vector-mcp https://mcp.vector.mainnet.apexfusion.org/sse
        ```

        To make it available across all your projects, add `--scope user`:

        ```bash
        claude mcp add --transport sse vector-mcp https://mcp.vector.mainnet.apexfusion.org/sse --scope user
        ```

=== "Claude Desktop"

    Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

    === "Testnet"

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

    === "Mainnet"

        ```json
        {
          "mcpServers": {
            "vector-mcp": {
              "type": "sse",
              "url": "https://mcp.vector.mainnet.apexfusion.org/sse"
            }
          }
        }
        ```

    Restart Claude Desktop after saving.

=== "Claude.ai (Web / Mobile)"

    Go to **Settings → Connectors → Add custom connector**, then enter:

    === "Testnet"

        ```
        https://mcp.vector.testnet.apexfusion.org/sse
        ```

    === "Mainnet"

        ```
        https://mcp.vector.mainnet.apexfusion.org/sse
        ```

=== "Other MCP Clients"

    Connect to the SSE endpoint:

    === "Testnet"

        ```
        https://mcp.vector.testnet.apexfusion.org/sse
        ```

    === "Mainnet"

        ```
        https://mcp.vector.mainnet.apexfusion.org/sse
        ```

All 18 Vector MCP tools are immediately available. For local installation instead, see the [MCP Server Setup Guide](../mcp-server/installation.md#advanced-setup-install-locally).

!!! warning "Secure your mnemonic"
    Your mnemonic (15 words, or 24 words — both accepted) controls your agent's wallet. Store it securely. Never commit it to version control. The mnemonic is passed per-call by the MCP client, not stored in the server environment.

## Step 3: Fund Your Agent (Testnet)

There is no direct Vector testnet faucet. To get testnet AP3X:

1. Get AP3X from the **Prime Testnet faucet** at [Apex Fusion Faucet](https://developers.apexfusion.org/documentation/getting-started-with-testnet)
2. **Bridge** AP3X from Prime to Vector via the [Reactor Bridge](https://developers.apexfusion.org/documentation/how-to-use-the-reactor-bridge)
3. Wait for funds to arrive on Vector (usually a few minutes)

Ask your agent for its address:

> "What's my Vector wallet address?"

The agent will call `vector_get_address` and return your testnet address (it starts with `addr1` — Vector testnet uses mainnet network ID). Bridge testnet AP3X to this address.

## Step 4: Start Using Vector

Your agent now has access to these tools:

| Tool | What it does |
|------|-------------|
| `vector_get_balance` | Check wallet balance |
| `vector_get_address` | Get receiving address |
| `vector_get_utxos` | List unspent outputs |
| `vector_send_apex` | Send AP3X (with spend limits) |
| `vector_send_tokens` | Send native tokens |
| `vector_dry_run` | Simulate a transaction |
| `vector_get_transaction_history` | View recent transactions |

Try asking your agent:

- *"What's my Vector balance?"*
- *"Send 5 AP3X to addr1qz..."*
- *"Show me my recent transactions on Vector"*
- *"Dry-run sending 10 AP3X to addr1qz..."*

---

## Configuration Reference

Key environment variables for the MCP server:

| Variable | Description |
|----------|-------------|
| `VECTOR_OGMIOS_URL` | Ogmios HTTP endpoint |
| `VECTOR_SUBMIT_URL` | Transaction submission endpoint |
| `VECTOR_KOIOS_URL` | Koios REST API endpoint (include trailing slash) |
| `VECTOR_EXPLORER_URL` | Block explorer URL |
| `VECTOR_SPEND_LIMIT_PER_TX` | Max DFM per transaction |
| `VECTOR_SPEND_LIMIT_DAILY` | Max DFM per day |

---

## Using the Python SDK Directly

If you prefer programmatic access without MCP:

```bash
git clone https://github.com/Apex-Fusion/agent-sdk-py
cd agent-sdk-py
pip install -e .
```

```python
import asyncio
from vector_agent import VectorAgent

async def main():
    agent = VectorAgent(
        ogmios_url="https://ogmios.vector.testnet.apexfusion.org",
        submit_url="https://submit.vector.testnet.apexfusion.org/api/submit/tx",
        mnemonic="your fifteen word mnemonic phrase here ...",
    )

    # Check balance
    balance = await agent.get_balance()
    print(f"Balance: {balance.lovelace / 1_000_000} AP3X")

    # Get address
    address = await agent.get_address()
    print(f"Address: {address}")

    # Send AP3X
    result = await agent.send(to="addr1qz...", ada=5.0)
    print(f"Sent! TX: {result.tx_hash}")

asyncio.run(main())
```

You can also use environment variables instead of passing params directly:

```bash
export VECTOR_MNEMONIC="your fifteen word mnemonic phrase here ..."
export VECTOR_OGMIOS_URL="https://ogmios.vector.testnet.apexfusion.org"
export VECTOR_SUBMIT_URL="https://submit.vector.testnet.apexfusion.org/api/submit/tx"
export VECTOR_KOIOS_URL="https://koios.vector.testnet.apexfusion.org/"
```

---

## Switching to Mainnet

The guides above use **testnet** endpoints. When you're ready for mainnet, replace the endpoint URLs:

| Variable | Testnet | Mainnet |
|----------|---------|---------|
| `VECTOR_OGMIOS_URL` | `https://ogmios.vector.testnet.apexfusion.org` | `https://ogmios.vector.mainnet.apexfusion.org` |
| `VECTOR_SUBMIT_URL` | `https://submit.vector.testnet.apexfusion.org/api/submit/tx` | `https://submit.vector.mainnet.apexfusion.org/api/submit/tx` |
| `VECTOR_KOIOS_URL` | `https://koios.vector.testnet.apexfusion.org/` | `https://koios.vector.mainnet.apexfusion.org/` |
| `VECTOR_EXPLORER_URL` | `https://vector.testnet.apexscan.org` | `https://explorer.vector.mainnet.apexfusion.org` |

!!! warning "Mainnet uses real funds"
    On mainnet, AP3X has real value. Start with small amounts, use conservative spend limits, and test thoroughly on testnet first. Use separate mnemonics for testnet and mainnet wallets.

The code and configuration are identical — only the endpoint URLs change.

---

## What's Next?

- [Claude Desktop + Vector](claude-desktop.md) — detailed Claude Desktop setup
- [How Vector Works](../concepts/how-vector-works.md) — understand the UTXO model
- [MCP Tools Reference](../mcp-server/tools-reference.md) — full tool documentation
- [Safety Model](../concepts/safety-model.md) — spend limits and audit logging
