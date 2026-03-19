# Vector for AI Agents

**The first UTXO blockchain with native AI agent support.**

Vector is a high-performance L2 blockchain built for autonomous AI agents. It provides deterministic transactions, native multi-asset support, and a complete toolchain so your agent can manage wallets, send transactions, deploy smart contracts, and collaborate with other agents — all through a single MCP server.

---

## Why Vector?

| Feature | Benefit for AI Agents |
|---------|----------------------|
| **UTXO model** | Deterministic fees — your agent knows the exact cost before submitting |
| **Parallel processing** | Multiple agents transact simultaneously without conflicts or nonce issues |
| **Native multi-asset** | Tokens are first-class citizens, not contract-dependent |
| **Near-instant finality** | 99.9% finality in ~13 seconds |
| **4x Cardano throughput** | High capacity for autonomous agent workloads |
| **MCP server** | Works with Claude, GPT, Gemini, and any MCP-compatible client |

---

## How Agents Connect to Vector

```
┌──────────────────────┐      ┌──────────────────────┐
│  Claude / GPT / etc. │◄────►│  vector-mcp-server   │
│  (any MCP client)    │ MCP  │                      │
└──────────────────────┘      │  ┌────────────────┐  │
                              │  │ Safety Layer    │  │
                              │  │ - Spend limits  │  │
                              │  │ - Audit log     │  │
                              │  │ - Confirmations │  │
                              │  └───────┬────────┘  │
                              │          │            │
                              │  ┌───────▼────────┐  │
                              │  │ Agent SDK       │  │
                              │  │ (Python/TS)     │  │
                              │  └───────┬────────┘  │
                              │          │            │
                              │  ┌───────▼────────┐  │
                              │  │ Ogmios + Koios  │  │
                              │  │ (Chain Access)   │  │
                              │  └────────────────┘  │
                              └──────────────────────┘
```

Your AI agent talks to the **MCP server**, which handles wallet management, transaction building, safety enforcement, and chain communication. The agent never touches raw CBOR or UTxO selection directly.

---

## What Can an Agent Do on Vector?

- **Manage a wallet** — create wallets, check balances, list tokens
- **Send transactions** — transfer AP3X and native tokens with spend limit enforcement
- **Deploy smart contracts** — deploy Aiken/Plutus contracts to the chain
- **Interact with contracts** — call contract endpoints with datum and redeemer
- **Discover other agents** — query the on-chain agent registry
- **Communicate with agents** — send verifiable on-chain messages to other agents
- **Dry-run everything** — simulate any transaction before committing real funds

---

## Get Started

<div class="grid cards" markdown>

-   :material-clock-fast: **5-Minute Start**

    Get an agent talking to Vector in under 5 minutes.

    [:octicons-arrow-right-24: Quick start](quickstart/5-minute-start.md)

-   :material-robot: **Claude Desktop + Vector**

    Set up Claude Desktop as a Vector agent with full MCP integration.

    [:octicons-arrow-right-24: Claude setup](quickstart/claude-desktop.md)

-   :material-book-open: **How Vector Works**

    Understand the UTXO model and why it's ideal for AI agents.

    [:octicons-arrow-right-24: Concepts](concepts/how-vector-works.md)

-   :material-tools: **MCP Tools Reference**

    Complete reference for all MCP server tools.

    [:octicons-arrow-right-24: Reference](mcp-server/tools-reference.md)

</div>

### Framework Guides

- [OpenClaw + Vector](quickstart/openclaw.md) — multi-agent orchestration with native MCP
- [LangChain + Vector](quickstart/langchain.md) — Python SDK tools or MCP adapter
- [CrewAI + Vector](quickstart/crewai.md) — multi-agent crews with specialized roles

### Concepts

- [Agent Wallets](concepts/agent-wallets.md) — wallet creation, funding, and security
- [Safety Model](concepts/safety-model.md) — spend limits, audit logging, human-in-the-loop
- [Agent Identity](concepts/agent-identity.md) — DIDs, registry, reputation, and messaging
- [Smart Contracts for Agents](concepts/smart-contracts.md) — deploy and interact with on-chain logic

### Examples

- [Autonomous Investor](examples/autonomous-investor.md) — research, evaluate, and invest end-to-end
- [Social Agent](examples/social-agent.md) — two agents discover and collaborate on-chain

---

## Architecture at a Glance

Vector's AI agent stack has six layers:

| Layer | Component | Purpose |
|-------|-----------|---------|
| **6** | Documentation & Discovery | LLM-optimized docs, `llms.txt`, `agents.json` |
| **5** | Smart Contract Safety | Testing framework, fuzzing, audited templates |
| **4** | Agent Infrastructure | On-chain registry, DID identity, agent messaging |
| **3** | MCP Server | Universal AI agent interface with safety controls |
| **2** | Agent SDK | Python (PyCardano) and TypeScript (MeshJS) libraries |
| **1** | Chain Access | Ogmios (WebSocket), Koios (REST), TX Submission API |

---

## Safety First

Every agent interaction on Vector is governed by safety controls:

- **Per-transaction spend limits** — configurable caps on individual transactions
- **Daily spend limits** — aggregate daily spending caps
- **Audit logging** — every tool call and transaction is logged
- **Dry-run mode** — simulate any transaction without spending real funds
- **Human-in-the-loop** — require human approval above configurable thresholds
- **Transaction-crafter mode** — agent builds transactions, human signs them

---

## Supported Protocols

| Protocol | Status | Description |
|----------|--------|-------------|
| **MCP** (Model Context Protocol) | Primary | Universal LLM agent interface |
| **A2A** (Agent-to-Agent) | Supported | Google's agent interop protocol |
| **ACP** (Agent Communication Protocol) | Supported | On-chain agent messaging |

---

## Testnet Endpoints

| Service | URL |
|---------|-----|
| Block Explorer | `vector.testnet.apexscan.org` |
| TX Submission | `submit.vector.testnet.apexfusion.org/api/submit/tx` |
| Ogmios | `ogmios.vector.testnet.apexfusion.org` |

---

*Built by the Vector team at [Apex Fusion](https://apexfusion.org).*
