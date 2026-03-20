# CrewAI + Vector

Build a multi-agent [CrewAI](https://www.crewai.com/) crew that operates on Vector blockchain.

CrewAI excels at orchestrating specialized agents that collaborate on tasks — a natural fit for blockchain operations where you might want separate agents for research, analysis, and execution.

---

## Prerequisites

- **Python 3.11+**
- A funded Vector testnet wallet (see [5-Minute Start](5-minute-start.md))

## Install Dependencies

```bash
# Install CrewAI
pip install crewai apex-fusion-agent-sdk
```

---

## Basic Setup: Single Agent

### Define Vector Tools

```python
import os
import asyncio
from crewai.tools import tool
from vector_agent import VectorAgent

# Initialize via environment variables:
# VECTOR_MNEMONIC, VECTOR_OGMIOS_URL, VECTOR_SUBMIT_URL, VECTOR_KOIOS_URL
# VECTOR_SPEND_LIMIT_PER_TX, VECTOR_SPEND_LIMIT_DAILY
vector = VectorAgent()


@tool
def check_balance() -> str:
    """Check the agent's AP3X and token balance on Vector blockchain."""
    balance = asyncio.run(vector.get_balance())
    ap3x = balance.lovelace / 1_000_000
    return f"Balance: {ap3x} AP3X"


@tool
def send_apex(to: str, amount_ap3x: float) -> str:
    """Send AP3X on Vector. Amount in AP3X (e.g. 5.0)."""
    tx_hash = asyncio.run(vector.send(to=to, ada=amount_ap3x))
    return f"Transaction submitted. Hash: {tx_hash}"


@tool
def dry_run_transaction(to: str, amount_ap3x: float) -> str:
    """Simulate a transaction without submitting it. Returns expected fee."""
    result = asyncio.run(vector.dry_run(to=to, ada=amount_ap3x))
    fee_ap3x = result["fee"] / 1_000_000
    return f"Valid: {result['valid']}, Fee: {fee_ap3x} AP3X"


@tool
def find_agents(capability: str) -> str:
    """Search the Vector Agent Registry for agents with a given capability."""
    agents = asyncio.run(vector.discover_agents(capability=capability))
    if not agents:
        return "No agents found."
    return "\n".join(
        f"- {a['name']}: {a['description']} (reputation: {a['reputation']})"
        for a in agents
    )


@tool
def search_tokens(query: str) -> str:
    """Search for native tokens on Vector by name or keyword."""
    tokens = asyncio.run(vector.search_tokens(query=query))
    if not tokens:
        return "No tokens found."
    return "\n".join(f"- {t['name']} ({t['policy_id']})" for t in tokens)


@tool
def read_contract(script_address: str) -> str:
    """Read the UTxOs and state of a smart contract on Vector."""
    utxos = asyncio.run(vector.get_utxos(script_address))
    lines = []
    for u in utxos:
        lines.append(f"UTxO: {u['value']}, Datum: {u.get('datum', 'none')}")
    return "\n".join(lines) or "No UTxOs at this address."
```

### Create a Crew

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Blockchain Researcher",
    goal="Analyze the Vector blockchain to find investment opportunities",
    backstory="You are an expert at analyzing blockchain data and discovering valuable projects and agents on the Vector network.",
    tools=[check_balance, find_agents, search_tokens, read_contract],
    verbose=True,
)

investor = Agent(
    role="Investment Executor",
    goal="Execute investment decisions safely on Vector",
    backstory="You are a careful investor. You always dry-run transactions before executing them and never exceed spend limits.",
    tools=[check_balance, send_apex, dry_run_transaction],
    verbose=True,
)

research_task = Task(
    description="Research the Vector blockchain: check our balance, find registered agents with environmental capabilities, and search for environmental tokens.",
    expected_output="A summary of our balance, discovered agents, and available tokens.",
    agent=researcher,
)

invest_task = Task(
    description="Based on the research, dry-run a 5 AP3X transaction to the most promising environmental project. Report the dry-run results. Do NOT submit the real transaction yet.",
    expected_output="Dry-run results showing the transaction is valid and the expected fee.",
    agent=investor,
)

crew = Crew(
    agents=[researcher, investor],
    tasks=[research_task, invest_task],
    verbose=True,
)

result = crew.kickoff()
print(result)
```

---

## Advanced: Investment Crew with Safety Controls

A more realistic setup with dedicated roles:

```python
from crewai import Agent, Task, Crew, Process

analyst = Agent(
    role="Vector Chain Analyst",
    goal="Provide detailed analysis of opportunities on Vector",
    backstory="""You analyze the Vector blockchain ecosystem. You check agent
    registries, token markets, and smart contract states to identify opportunities.
    You never make transactions — only research.""",
    tools=[find_agents, search_tokens, read_contract],
)

risk_manager = Agent(
    role="Risk Manager",
    goal="Evaluate risks and enforce investment safety",
    backstory="""You evaluate proposed transactions for risk. You check balances,
    verify spend limits, and dry-run every transaction before approving.
    You reject any transaction that exceeds 10% of the wallet balance.""",
    tools=[check_balance, dry_run_transaction],
)

executor = Agent(
    role="Transaction Executor",
    goal="Execute approved transactions on Vector",
    backstory="""You only execute transactions that have been researched by the
    analyst and approved by the risk manager. You always confirm the dry-run
    succeeded before submitting.""",
    tools=[send_apex, check_balance],
)

crew = Crew(
    agents=[analyst, risk_manager, executor],
    tasks=[
        Task(
            description="Analyze environmental investment opportunities on Vector. Find agents, tokens, and contracts related to environmental impact.",
            expected_output="Ranked list of opportunities with addresses and reasoning.",
            agent=analyst,
        ),
        Task(
            description="Evaluate the top opportunity. Check our balance, verify we have sufficient funds, and dry-run the transaction. Reject if risk is too high.",
            expected_output="Risk assessment with dry-run results. Approve or reject with reasoning.",
            agent=risk_manager,
        ),
        Task(
            description="If approved by the risk manager, execute the transaction. Report the transaction hash.",
            expected_output="Transaction hash or explanation of why execution was skipped.",
            agent=executor,
        ),
    ],
    process=Process.sequential,
    verbose=True,
)

result = crew.kickoff()
```

---

## MCP Server Alternative

Instead of wrapping the Python SDK, you can connect CrewAI to the Vector MCP server directly if your setup supports MCP tool loading:

```python
from crewai import Agent
from crewai_mcp import load_mcp_tools

# Connect to the hosted Vector MCP server
vector_tools = load_mcp_tools(
    transport="sse",
    url="https://mcp.vector.testnet.apexfusion.org/sse",
)

agent = Agent(
    role="Vector Agent",
    goal="Manage a wallet and transact on Vector blockchain",
    tools=vector_tools,
)
```

---

## Next Steps

- [LangChain + Vector](langchain.md) — alternative framework integration
- [Autonomous Investor Example](../examples/autonomous-investor.md) — full end-to-end scenario
- [Safety Model](../concepts/safety-model.md) — spend limits and audit logging
- [MCP Tools Reference](../mcp-server/tools-reference.md) — all available tools
