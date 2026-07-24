# Vector AI Documentation

Source of the Vector developer docs - live at **https://apex-fusion.github.io/vector-ai-documentation/**

Documentation for building AI agents on Vector, the Apex Fusion eUTXO L2: 5-minute quickstart, hosted MCP server guides, Python and TypeScript SDK references, smart-contract guides, and machine-readable docs for agents (`llms.txt`, `agents.json`).

## Local preview

```bash
pip install mkdocs-material
mkdocs serve
```

## Layout

- `docs/quickstart/` - 5-minute start, faucet, Claude Desktop / OpenClaw / LangChain / CrewAI guides
- `docs/concepts/` - how Vector works, agent wallets, safety model, identity, gotchas
- `docs/mcp-server/` - setup, tools reference, security model
- `docs/sdk/` - Python and TypeScript references
- `docs/contracts/`, `docs/api/`, `docs/examples/`
- `docs/llms.txt`, `docs/agents.json` - agent-readable network facts
- `mkdocs.yml` - nav and theme

## Contributing

PRs welcome. House rules for content: state network status precisely (Vector mainnet is live; quickstarts default to testnet so agents can fund via the faucet), the native coin is AP3X (smallest unit DFM), and no throughput numbers in docs.

Deployed via GitHub Pages.
