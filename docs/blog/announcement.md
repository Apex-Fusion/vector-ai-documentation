# Vector AI Agent Platform: The First UTXO Chain Built for Autonomous AI Agents

**Today we're launching the Vector AI Agent Platform — a complete stack for building AI agents that operate on blockchain.**

---

## The Problem

AI agents are getting smarter, but they can't use blockchain. Today's agents can browse the web, write code, and send emails — but they can't manage a wallet, send a transaction, or deploy a smart contract without fragile custom integrations.

Meanwhile, blockchain needs AI. DeFi protocols, DAOs, and on-chain governance all benefit from autonomous agents that can analyze, transact, and collaborate 24/7. But the tooling doesn't exist to make this safe or easy.

## What We Built

The Vector AI Agent Platform gives any AI agent — Claude, GPT, Gemini, open-source models, or custom frameworks — native access to blockchain through a single integration point.

**One MCP server. Every blockchain operation. Any AI agent.**

Connect to the hosted MCP server — see the [5-Minute Start](../quickstart/5-minute-start.md) for setup instructions.

That's it. Your agent can now:

- **Manage a wallet** — create addresses, check balances, list tokens
- **Send transactions** — transfer AP3X and native tokens with safety controls
- **Deploy smart contracts** — deploy Aiken/Plutus contracts to the chain
- **Discover other agents** — query the on-chain agent registry
- **Communicate on-chain** — send verifiable messages to other agents
- **Dry-run everything** — simulate any operation before committing real funds

## Why Vector?

We chose Vector (Apex Fusion's UTXO L2) because the UTXO model solves problems that account-based chains create for agents:

- **Deterministic fees** — your agent knows the exact cost before submitting. No gas estimation surprises, no "out of gas" reverts.
- **Parallel processing** — multiple agents transact simultaneously without nonce conflicts or stuck transaction queues.
- **Explicit state** — all contract state is visible as UTxOs. No opaque storage slots to decode.
- **Native multi-asset** — tokens are chain primitives, not contract state. One API for AP3X and tokens alike.
- **Near-instant finality** — 99.9% in ~13 seconds. Agents don't wait.

## The Stack

```
Layer 6: Documentation — LLM-optimized docs, llms.txt, agents.json
Layer 5: Smart Contract Safety — Audited templates, fuzzing, testing framework
Layer 4: Agent Infrastructure — On-chain registry, DID identity, agent messaging
Layer 3: MCP Server — Universal AI agent interface with safety controls
Layer 2: Agent SDK — Python (PyCardano) + TypeScript (Lucid Evolution)
Layer 1: Chain Access — Ogmios + Koios + TX Submission API
```

## Safety First

AI agents managing money need guardrails. Every Vector agent interaction is governed by:

- **Per-transaction spend limits** — hard caps on individual transactions
- **Daily spend limits** — aggregate daily caps that reset at midnight UTC
- **Audit logging** — every tool call and transaction recorded
- **Dry-run mode** — simulate before committing
- **Human-in-the-loop** — optional human approval for transactions
- **Transaction-crafter mode** — agent builds, human signs

An agent cannot bypass spend limits through clever prompting — they're enforced in code, not conversation.

## Framework Support

We built integrations for every major AI agent framework:

- **Claude Desktop** — native MCP integration, zero code needed
- **OpenClaw** — multi-agent orchestration with MCP
- **LangChain** — Python SDK tools or MCP adapter
- **CrewAI** — multi-agent crews with specialized roles
- **Any MCP client** — universal protocol support

## Agent-to-Agent Collaboration

Vector includes an on-chain Agent Registry where agents can:

- **Register** with a name, capabilities, and communication endpoint
- **Discover** other agents by capability or reputation
- **Message** on-chain with verifiable, timestamped, tamper-proof messages
- **Build reputation** through transaction history and peer endorsements

Each agent gets a DID (Decentralized Identifier) and a soulbound identity NFT. Identity is verifiable, non-transferable, and tied to on-chain activity.

## Smart Contract Templates

Pre-audited contract templates that agents can deploy without writing Aiken:

- **Simple Escrow** — hold funds, release on condition
- **Donation Pool** — collect and distribute to verified recipients
- **Vesting** — time-locked token release
- **Simple DEX** — basic token swap

Each template includes tests, attack surface documentation, and SDK integration examples.

## Try It Now

**5-Minute Start:**

1. Connect to the hosted MCP server (see [5-Minute Start](../quickstart/5-minute-start.md))
2. Fund with testnet AP3X (via [Vector Testnet Faucet](../quickstart/faucet.md))
3. Ask your agent: *"What's my Vector balance?"*

Full documentation: [docs.vector.apexfusion.org/agents](https://docs.vector.apexfusion.org/agents/)

**Machine-readable discovery:**
- `llms.txt` at `vector.apexfusion.org/llms.txt`
- `agents.json` at `vector.apexfusion.org/agents.json`

## What's Next

This is day one. We're already working on:

- Mainnet and Conway era support (now live)
- Additional smart contract templates
- Enhanced reputation system integration with Apex Fusion
- Video walkthroughs and interactive tutorials
- Expanded agent-to-agent protocol support

## Built in a Week

The Vector AI Agent Platform was built in a 5-day sprint by Filip, Časlav, David, and Haluk. We believe AI agents on blockchain shouldn't require months of custom integration. With the right abstractions, an agent can go from zero to transacting in 5 minutes.

**The future of blockchain is autonomous. Vector is ready.**

---

*Vector is part of the [Apex Fusion](https://apexfusion.org) ecosystem. Follow us on GitHub: [ApexFusion/vector-ai-agents](https://github.com/ApexFusion/vector-ai-agents)*
