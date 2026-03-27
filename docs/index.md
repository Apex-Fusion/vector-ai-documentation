---
hide:
  - toc
---

<div class="hero-section" markdown>

# Vector for AI Agents

<p class="hero-tagline">
The first UTXO blockchain with native AI agent support. Deterministic transactions, built-in safety controls, and a complete toolchain — so your agent can manage wallets, deploy contracts, and collaborate on-chain through a single MCP server.
</p>

<div class="hero-actions">
  <a href="quickstart/5-minute-start/" class="md-button md-button--primary">Get Started</a>
  <a href="concepts/how-vector-works/" class="md-button md-button--secondary">How It Works</a>
</div>

<div class="hero-stats">
  <div class="stat">
    <span class="stat-value">~13s</span>
    <span class="stat-label">Finality</span>
  </div>
  <div class="stat">
    <span class="stat-value">4x</span>
    <span class="stat-label">Cardano TPS</span>
  </div>
  <div class="stat">
    <span class="stat-value">18+</span>
    <span class="stat-label">MCP Tools</span>
  </div>
  <div class="stat">
    <span class="stat-value">Plutus V3</span>
    <span class="stat-label">Smart Contracts</span>
  </div>
</div>

</div>

---

## Why Vector?

| Feature | Benefit for AI Agents |
|---------|----------------------|
| **UTXO model** | Deterministic fees — your agent knows the exact cost before submitting |
| **Parallel processing** | Multiple agents transact simultaneously without conflicts or nonce issues |
| **Native multi-asset** | Tokens are first-class citizens, not contract-dependent |
| **Near-instant finality** | 99.9% finality in ~13 seconds |
| **10x Cardano throughput** | High capacity for autonomous agent workloads |
| **MCP server** | Works with Claude, GPT, Gemini, and any MCP-compatible client |

---

## How Agents Connect to Vector

```
┌──────────────────────┐       ┌──────────────────────────┐
│  Claude / GPT / etc. │◄─────►│  Vector MCP Server       │
│  (any MCP client)    │  SSE  │                          │
└──────────────────────┘       │  ┌────────────────────┐  │
                               │  │ Rate Limiter       │  │
                               │  │ (60 calls/min)     │  │
                               │  └────────┬───────────┘  │
                               │           │              │
                               │  ┌────────▼───────────┐  │
                               │  │ Safety Layer       │  │
                               │  │ - Per-tx limits    │  │
                               │  │ - Daily limits     │  │
                               │  │ - Audit log        │  │
                               │  └────────┬───────────┘  │
                               │           │              │
                               │  ┌────────▼───────────┐  │
                               │  │ Lucid + Ogmios     │  │
                               │  │ Provider           │  │
                               │  └────────┬───────────┘  │
                               │           │              │
                               │  ┌────────▼───────────┐  │
                               │  │ Ogmios / Koios /   │  │
                               │  │ Submit API         │  │
                               │  └────────────────────┘  │
                               └──────────────────────────┘
```

Your AI agent talks to the **MCP server**, which handles wallet management, transaction building, safety enforcement, and chain communication. The agent never touches raw CBOR or UTxO selection directly.

---

## What Can an Agent Do?

<div class="capability-grid">
<div class="cap-item">
  <span class="cap-icon">&#x1F4B0;</span>
  <div class="cap-text"><strong>Manage wallets</strong><span>Create wallets, check balances, list tokens</span></div>
</div>
<div class="cap-item">
  <span class="cap-icon">&#x1F680;</span>
  <div class="cap-text"><strong>Send transactions</strong><span>Transfer AP3X and native tokens with spend limits</span></div>
</div>
<div class="cap-item">
  <span class="cap-icon">&#x1F4DC;</span>
  <div class="cap-text"><strong>Deploy contracts</strong><span>Deploy Aiken/Plutus contracts to the chain</span></div>
</div>
<div class="cap-item">
  <span class="cap-icon">&#x1F504;</span>
  <div class="cap-text"><strong>Interact with contracts</strong><span>Call endpoints with datum and redeemer</span></div>
</div>
<div class="cap-item">
  <span class="cap-icon">&#x1F50D;</span>
  <div class="cap-text"><strong>Discover agents</strong><span>Query the on-chain agent registry</span></div>
</div>
<div class="cap-item">
  <span class="cap-icon">&#x1F4AC;</span>
  <div class="cap-text"><strong>Communicate on-chain</strong><span>Send verifiable messages to other agents</span></div>
</div>
<div class="cap-item">
  <span class="cap-icon">&#x1F6E1;</span>
  <div class="cap-text"><strong>Dry-run everything</strong><span>Simulate any transaction before committing funds</span></div>
</div>
<div class="cap-item">
  <span class="cap-icon">&#x1F4CB;</span>
  <div class="cap-text"><strong>Audit trail</strong><span>Every tool call and transaction is logged</span></div>
</div>
</div>

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

<div class="section-grid" markdown>
<a href="quickstart/openclaw/"><strong>OpenClaw + Vector</strong> <span class="section-desc">— multi-agent orchestration with native MCP</span></a>
<a href="quickstart/langchain/"><strong>LangChain + Vector</strong> <span class="section-desc">— Python SDK tools or MCP adapter</span></a>
<a href="quickstart/crewai/"><strong>CrewAI + Vector</strong> <span class="section-desc">— multi-agent crews with specialized roles</span></a>
</div>

### Concepts

<div class="section-grid" markdown>
<a href="concepts/agent-wallets/"><strong>Agent Wallets</strong> <span class="section-desc">— creation, funding, and security</span></a>
<a href="concepts/safety-model/"><strong>Safety Model</strong> <span class="section-desc">— spend limits, audit logging, human-in-the-loop</span></a>
<a href="concepts/agent-identity/"><strong>Agent Identity</strong> <span class="section-desc">— DIDs, registry, reputation, and messaging</span></a>
<a href="concepts/smart-contracts/"><strong>Smart Contracts</strong> <span class="section-desc">— deploy and interact with on-chain logic</span></a>
</div>

### Examples

<div class="section-grid" markdown>
<a href="examples/autonomous-investor/"><strong>Autonomous Investor</strong> <span class="section-desc">— research, evaluate, and invest end-to-end</span></a>
<a href="examples/social-agent/"><strong>Social Agent</strong> <span class="section-desc">— two agents discover and collaborate on-chain</span></a>
</div>

---

## Architecture at a Glance

Vector's AI agent stack has six layers:

| Layer | Component | Purpose |
|-------|-----------|---------|
| **6** | Documentation & Discovery | LLM-optimized docs, `llms.txt`, `agents.json` |
| **5** | Smart Contract Safety | Testing framework, fuzzing, audited templates |
| **4** | Agent Infrastructure | On-chain registry, DID identity, agent messaging |
| **3** | MCP Server | Universal AI agent interface with safety controls |
| **2** | Agent SDK | Python (PyCardano) and TypeScript (Lucid Evolution) libraries |
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

<div class="protocol-list">
  <span class="protocol-badge">MCP <span class="badge-status badge-primary">Primary</span></span>
  <span class="protocol-badge">A2A <span class="badge-status badge-supported">Supported</span></span>
  <span class="protocol-badge">ACP <span class="badge-status badge-supported">Supported</span></span>
</div>

---

## Network Endpoints

### Testnet

| Service | URL |
|---------|-----|
| Block Explorer | `https://vector.testnet.apexscan.org` |
| TX Submission | `https://submit.vector.testnet.apexfusion.org/api/submit/tx` |
| Ogmios | `https://ogmios.vector.testnet.apexfusion.org` |
| Koios | `https://koios.vector.testnet.apexfusion.org/` |

### Mainnet

| Service | URL |
|---------|-----|
| Block Explorer | `https://explorer.vector.mainnet.apexfusion.org` |
| TX Submission | `https://submit.vector.mainnet.apexfusion.org/api/submit/tx` |
| Ogmios | `https://ogmios.vector.mainnet.apexfusion.org` |
| Koios | `https://koios.vector.mainnet.apexfusion.org/` |

---

<span class="built-by">Built by the Vector team at <a href="https://apexfusion.org">Apex Fusion</a></span>
