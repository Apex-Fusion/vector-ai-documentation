# LangChain + Vector

Integrate Vector blockchain into a [LangChain](https://python.langchain.com/) agent using the Python SDK or MCP server.

---

## Option A: Python SDK (Direct Integration)

Use the Vector Python SDK as a LangChain tool for direct, programmatic access.

### Install Dependencies

```bash
pip install langchain langchain-anthropic

# Install Vector Agent SDK from source
git clone https://github.com/Apex-Fusion/agent-sdk-py
cd agent-sdk-py && pip install -e . && cd ..
```

### Create Vector Tools for LangChain

```python
import os
import asyncio
from langchain.tools import tool
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from vector_agent import VectorAgent

# Initialize the Vector agent via environment variables:
# VECTOR_MNEMONIC, VECTOR_OGMIOS_URL, VECTOR_SUBMIT_URL, VECTOR_KOIOS_URL
# VECTOR_SPEND_LIMIT_PER_TX, VECTOR_SPEND_LIMIT_DAILY
vector = VectorAgent()


@tool
def get_vector_balance() -> str:
    """Get the agent's AP3X and token balance on Vector blockchain."""
    balance = asyncio.run(vector.get_balance())
    ap3x = balance.lovelace / 1_000_000
    tokens = balance.tokens
    result = f"Balance: {ap3x} AP3X"
    for token, amount in tokens.items():
        result += f"\n  {token}: {amount}"
    return result


@tool
def get_vector_address() -> str:
    """Get the agent's Vector wallet receiving address."""
    return asyncio.run(vector.get_address())


@tool
def send_apex(to: str, amount_ap3x: float) -> str:
    """Send AP3X to an address on Vector. Amount is in AP3X."""
    tx_hash = asyncio.run(vector.send(to=to, ada=amount_ap3x))
    return f"Sent {amount_ap3x} AP3X. TX hash: {tx_hash}"


@tool
def dry_run_send(to: str, amount_ap3x: float) -> str:
    """Simulate sending AP3X without actually submitting. Returns fee estimate."""
    result = asyncio.run(vector.dry_run(to=to, ada=amount_ap3x))
    fee_ap3x = result["fee"] / 1_000_000
    return f"Dry run: valid={result['valid']}, fee={fee_ap3x} AP3X"


@tool
def discover_agents(capability: str) -> str:
    """Search for agents on the Vector Agent Registry by capability."""
    agents = asyncio.run(vector.discover_agents(capability=capability))
    if not agents:
        return "No agents found with that capability."
    lines = []
    for a in agents:
        lines.append(f"- {a['name']} ({a['agent_id']}): {a['description']}")
    return "\n".join(lines)
```

### Build the LangChain Agent

```python
tools = [get_vector_balance, get_vector_address, send_apex, dry_run_send, discover_agents]

llm = ChatAnthropic(model="claude-sonnet-4-20250514")

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an AI agent with access to the Vector blockchain.
You can check balances, send AP3X, and discover other agents.
Always dry-run transactions before sending. Never exceed spend limits."""),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run the agent
result = executor.invoke({
    "input": "Check my balance, then dry-run sending 5 AP3X to addr1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwqkc6k7j"
})
print(result["output"])
```

---

## Option B: MCP Server (via LangChain MCP Adapter)

Use the Vector MCP server with LangChain's MCP tool adapter for zero-code tool integration.

### Install Dependencies

```bash
# First clone and build web3-mcp: https://github.com/Apex-Fusion/web3-mcp
pip install langchain langchain-anthropic langchain-mcp
```

### Connect LangChain to the MCP Server

```python
import os
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_mcp import MCPToolkit

# Connect to the Vector MCP server (running on port 3000)
toolkit = MCPToolkit(
    command="node",
    args=["/path/to/web3-mcp/build/index.js"],
    env={
        "VECTOR_OGMIOS_URL": os.environ["VECTOR_OGMIOS_URL"],
        "VECTOR_KOIOS_URL": os.environ["VECTOR_KOIOS_URL"],
    },
)

# All Vector MCP tools are automatically available
tools = toolkit.get_tools()

llm = ChatAnthropic(model="claude-sonnet-4-20250514")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an AI agent with full access to Vector blockchain via MCP tools."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({"input": "What's my Vector balance?"})
```

This approach automatically exposes all 20+ Vector MCP tools to LangChain without writing individual tool wrappers.

---

## LangChain + Vector Patterns

### Retrieval-Augmented Blockchain Agent

Combine LangChain's RAG capabilities with Vector chain data:

```python
@tool
def get_contract_state(script_address: str) -> str:
    """Read the current state of a smart contract on Vector."""
    utxos = asyncio.run(vector.get_utxos(script_address))
    lines = []
    for u in utxos:
        lines.append(f"UTxO {u['tx_hash']}#{u['tx_index']}: {u['value']}")
        if u.get("datum"):
            lines.append(f"  Datum: {u['datum']}")
    return "\n".join(lines) or "No UTxOs at this address."
```

### Chain-of-Thought Investment Agent

```python
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a careful investment agent on Vector.
For any investment decision, follow these steps:
1. Check your current balance
2. Research available agents and tokens
3. Dry-run the transaction
4. Only proceed if the dry-run succeeds and the amount is within limits
5. Log your reasoning for each decision"""),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])
```

---

## Next Steps

- [CrewAI + Vector](crewai.md) — multi-agent setup with CrewAI
- [Agent Wallets](../concepts/agent-wallets.md) — wallet management for agents
- [MCP Tools Reference](../mcp-server/tools-reference.md) — full tool documentation
- [Autonomous Investor Example](../examples/autonomous-investor.md) — complete scenario
