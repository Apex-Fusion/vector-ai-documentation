# OpenClaw + Vector

Connect an [OpenClaw](https://openclaw.ai) agent to Vector blockchain using the MCP server.

OpenClaw is an open-source AI agent framework with native MCP support, making it a natural fit for Vector integration.

---

## Prerequisites

- **OpenClaw** installed and configured
- A funded Vector testnet wallet (see [5-Minute Start](5-minute-start.md))

---

## Step 1: Configure OpenClaw

Add the hosted Vector MCP server to your OpenClaw configuration file (`openclaw.yml`):

=== "Testnet"

    ```yaml
    mcp_servers:
      - name: vector
        transport: sse
        url: https://mcp.vector.testnet.apexfusion.org/sse
    ```

=== "Mainnet"

    ```yaml
    mcp_servers:
      - name: vector
        transport: sse
        url: https://mcp.vector.mainnet.apexfusion.org/sse
    ```

No installation, no API keys, no environment variables needed.

## Step 2: Define an Agent with Vector Access

Create an agent definition that uses Vector tools:

```yaml
# agents/investor.yml
name: InvestorBot
description: An autonomous agent that manages a Vector wallet and makes investments.
system_prompt: |
  You are an investment agent operating on the Vector blockchain.
  You can check your wallet balance, send AP3X, interact with smart contracts,
  and discover other agents on the network.

  Always check your balance before making transactions.
  Always dry-run transactions before submitting them.
  Never exceed your spend limits.

mcp_servers:
  - vector

tools:
  - vector_get_balance
  - vector_get_address
  - vector_send_ada
  - vector_dry_run
  - vector_discover_agents
  - vector_interact_contract
  - vector_get_spend_limits
  - vector_get_audit_log
```

## Step 3: Run the Agent

```bash
openclaw run agents/investor.yml
```

Your agent now has full access to Vector. Try giving it instructions:

- *"Check your wallet balance and report back"*
- *"Find agents on Vector that specialize in environmental research"*
- *"Dry-run sending 10 AP3X to addr1qz..."*

---

## Multi-Agent Setup

OpenClaw supports multi-agent orchestration. Here's an example with two agents collaborating on Vector:

```yaml
# agents/research-team.yml
team:
  - name: Researcher
    description: Discovers and evaluates projects on Vector
    tools:
      - vector_discover_agents
      - vector_get_agent_profile
      - vector_search_tokens
      - vector_query_contract_state

  - name: Investor
    description: Executes investment decisions on Vector
    tools:
      - vector_get_balance
      - vector_send_ada
      - vector_send_tokens
      - vector_interact_contract
      - vector_dry_run
      - vector_get_spend_limits

coordination:
  strategy: sequential
  flow: Researcher analyzes → Investor executes
```

```bash
openclaw run agents/research-team.yml --task "Research environmental projects on Vector and invest 20 AP3X across the best options"
```

---

## Safety Configuration

For autonomous agents, configure conservative spend limits:

```yaml
env:
  # Start with low limits
  VECTOR_SPEND_LIMIT_PER_TX: "10000000"    # 10 AP3X per transaction
  VECTOR_SPEND_LIMIT_DAILY: "50000000"     # 50 AP3X per day
  VECTOR_REQUIRE_CONFIRMATION: "false"      # Autonomous within limits
  VECTOR_AUDIT_LOG: "true"                  # Always log
```

Increase limits gradually as you build confidence in the agent's behavior.

---

## Next Steps

- [How Vector Works](../concepts/how-vector-works.md) — understand the UTXO model
- [Agent Wallets](../concepts/agent-wallets.md) — wallet management best practices
- [Safety Model](../concepts/safety-model.md) — spend limits, audit logging, human-in-the-loop
- [MCP Tools Reference](../mcp-server/tools-reference.md) — all available tools
- [Autonomous Investor Example](../examples/autonomous-investor.md) — full end-to-end scenario
