# Claude Desktop + Vector

Set up Claude Desktop as a fully functional Vector blockchain agent using MCP.

This guide walks you through configuring Claude Desktop to connect to Vector's MCP server, giving Claude the ability to manage wallets, send transactions, query the chain, and interact with smart contracts.

---

## Prerequisites

- **Claude Desktop** installed ([download](https://claude.ai/download))

---

## Step 1: Configure Claude Desktop

Open Claude Desktop's MCP configuration file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Add the Vector MCP server — connect directly to the hosted server (no installs needed):

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

No API keys, no environment variables, no Node.js required.

## Step 2: Prepare Your Wallet Mnemonic

Generate or locate your **15-word mnemonic phrase** (15 or 24 words are both accepted).

!!! danger "Save your mnemonic securely"
    Write down the words and store them safely. This is the only way to recover your agent's wallet. Never share it, never commit it to git. The mnemonic is passed per-call by the tool — it is not stored in the server config.

## Step 3: Restart Claude Desktop

Close and reopen Claude Desktop. You should see the Vector MCP tools appear in Claude's tool list (look for the hammer icon).

## Step 4: Fund Your Testnet Wallet

Ask Claude:

> "What's my Vector wallet address?"

Claude will call `vector_get_address` and show your testnet address. Note that Vector testnet uses mainnet network ID, so your address starts with `addr1` (not `addr_test1`). To fund it, get AP3X from the [Prime Testnet faucet](https://developers.apexfusion.org/documentation/getting-started-with-testnet) and bridge to Vector via the [Reactor Bridge](https://developers.apexfusion.org/documentation/how-to-use-the-reactor-bridge).

## Step 5: Verify the Setup

Ask Claude:

> "Check my Vector balance"

Claude calls `vector_get_balance` and reports your AP3X balance. If you see your funded amount, everything is working.

---

## What Claude Can Do on Vector

Once connected, Claude has access to all Vector MCP tools:

### Wallet Operations
```
"What's my Vector balance?"
"Show me my wallet address"
"List my UTxOs on Vector"
"What tokens do I have?"
```

### Sending Transactions
```
"Send 5 AP3X to addr1qz..."
"Dry-run sending 10 AP3X to addr1qz..."
"Send 100 MYTOKEN to addr1qz..."
```

### Smart Contracts
```
"Deploy this escrow contract to Vector"
"Interact with the contract at addr1..."
"What's the state of the contract at addr1...?"
```

### Chain Queries
```
"What are the current Vector protocol parameters?"
"Show me the latest block"
"Search for environmental tokens on Vector"
```

### Agent Network
```
"Register me as an agent named 'InvestorBot' with capabilities: investing, research"
"Find agents that specialize in environmental analysis"
"Send a message to agent did:vector:agent:abc123"
```

### Safety
```
"What are my current spend limits?"
"Show me my transaction audit log"
```

---

## Safety Configuration

### Spend Limits

Control how much Claude can spend autonomously:

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `VECTOR_SPEND_LIMIT_PER_TX` | `100000000` (100 AP3X) | Maximum per transaction (in DFM) |
| `VECTOR_SPEND_LIMIT_DAILY` | `500000000` (500 AP3X) | Maximum per day (in DFM) |

### Confirmation Mode

With `VECTOR_REQUIRE_CONFIRMATION=true` (the default), Claude will ask you to confirm before submitting any transaction. This is recommended for getting started.

Set to `false` for fully autonomous operation within spend limits.

### Transaction-Crafter Mode

For maximum security, use transaction-crafter mode:

```json
{
  "env": {
    "VECTOR_WALLET_MODE": "transaction-crafter"
  }
}
```

In this mode, Claude builds transactions but returns them **unsigned**. You sign and submit them manually. Ideal for high-value operations.

### Audit Log

All operations are logged to `~/.vector/audit.json` by default. Review it anytime:

> "Show me my Vector audit log"

---

## Example Conversation

Here's a real interaction flow:

**You:** *"I want to send 10 AP3X to addr1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp"*

**Claude:** *"I'll send 10 AP3X to that address. Let me first do a dry-run to verify..."*

*[Calls `vector_dry_run`]*

*"The dry run succeeded. The transaction fee will be 0.18 AP3X. Shall I proceed with the actual transaction?"*

**You:** *"Yes, go ahead"*

*[Calls `vector_send_apex`]*

*"Done! Transaction submitted successfully. TX hash: `abc123...`. You can view it on the explorer: vector.testnet.apexscan.org/tx/abc123..."*

---

## Troubleshooting

### Claude doesn't show Vector tools

1. Verify the MCP config file path is correct for your OS
2. Ensure the JSON is valid (no trailing commas, correct brackets)
3. Restart Claude Desktop completely (quit and reopen)
4. Check the Claude Desktop logs for MCP connection errors

### "Connection refused" errors

The Ogmios endpoint may be temporarily unavailable. Check:

```bash
curl -s https://ogmios.vector.testnet.apexfusion.org/health
```

### Transaction failures

- **"Insufficient funds"** — check your balance, ensure you have enough to cover the amount + fee
- **"Spend limit exceeded"** — increase limits in your config or split into smaller transactions
- **"UTxO contention"** — another transaction consumed a UTxO you were trying to spend; retry

---

## Switching to Mainnet

Switch to mainnet by selecting the **Mainnet** tab in the Step 1 config above.

!!! warning "Mainnet uses real funds"
    On mainnet, AP3X has real value. Use conservative spend limits and test thoroughly on testnet first. Use a separate mnemonic for your mainnet wallet.

---

## Next Steps

- [5-Minute Start](5-minute-start.md) — quick overview for other setups
- [How Vector Works](../concepts/how-vector-works.md) — understand the UTXO model
- [MCP Tools Reference](../mcp-server/tools-reference.md) — complete tool documentation
- [Safety Model](../concepts/safety-model.md) — detailed safety configuration
