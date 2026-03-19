# Autonomous Investor

A complete example of an AI agent that researches projects on Vector, evaluates opportunities, and invests autonomously within safety limits.

This is the flagship demo scenario: an agent receives *"invest 20% of my funds across environmental projects on Vector"* and executes end-to-end.

---

## Scenario

**Goal:** An autonomous agent that:

1. Checks its wallet balance on Vector
2. Discovers environmental projects and agents on the network
3. Evaluates opportunities based on reputation and contract state
4. Allocates 20% of funds across the best options
5. Dry-runs all transactions before committing
6. Executes the investments
7. Reports a summary of actions taken

All within configured spend limits, with full audit logging.

---

## Architecture

```
┌─────────────────┐
│  Human Operator  │
│  "Invest 20%    │
│   in env projects"│
└────────┬────────┘
         │
┌────────▼────────┐    MCP     ┌──────────────────┐
│  AI Agent       │◄──────────►│  Vector MCP      │
│  (Claude/GPT/   │            │  Server           │
│   LangChain/    │            │                  │
│   CrewAI)       │            │  ┌──────────┐    │
└─────────────────┘            │  │ Safety    │    │
                               │  │ Layer     │    │
                               │  └─────┬────┘    │
                               │        │         │
                               │  ┌─────▼────┐    │
                               │  │ Vector    │    │
                               │  │ Testnet   │    │
                               │  └──────────┘    │
                               └──────────────────┘
```

---

## Implementation: Claude Desktop

The simplest version — just tell Claude what to do.

### Setup

1. Install and configure the Vector MCP server ([guide](../mcp-server/installation.md))
2. Connect Claude Desktop ([guide](../quickstart/claude-desktop.md))
3. Fund the testnet wallet with 100 test AP3X

### Conversation

**You:**
> Invest 20% of my Vector funds across environmental projects. Research what's available, dry-run everything first, and give me a summary when done.

**Claude's execution plan:**

1. **Check balance** → calls `vector_get_balance`
2. **Calculate budget** → 20% of balance
3. **Discover agents** → calls `vector_discover_agents` with capability "environmental"
4. **Evaluate options** → calls `vector_get_agent_profile` for each candidate
5. **Check contract states** → calls `vector_query_contract_state` for relevant contracts
6. **Plan allocation** → divide budget across top opportunities
7. **Dry-run each transaction** → calls `vector_dry_run` for each
8. **Execute** → calls `vector_send_apex` or `vector_interact_contract` for each
9. **Report** → summarize all actions with TX hashes

### Example Output

```
## Investment Summary

**Starting balance:** 100 AP3X
**Investment budget (20%):** 20 AP3X

### Discovered Environmental Projects

1. **EnviroBot** (reputation: 85) — Environmental impact analysis agent
   - Donation pool contract at addr1wz...
   - 15 contributors, 450 AP3X total pooled

2. **GreenDAO** (reputation: 72) — Community environmental governance
   - Vesting contract at addr1wx...
   - Active governance proposals

3. **CarbonTracker** (reputation: 68) — Carbon credit tracking
   - Registry contract at addr1wy...

### Allocation

| Project | Amount | TX Hash | Status |
|---------|--------|---------|--------|
| EnviroBot Donation Pool | 10 AP3X | abc123... | ✓ Confirmed |
| GreenDAO Governance | 6 AP3X | def456... | ✓ Confirmed |
| CarbonTracker Registry | 4 AP3X | ghi789... | ✓ Confirmed |

**Total invested:** 20 AP3X
**Transaction fees:** 0.54 AP3X
**Remaining balance:** 79.46 AP3X

All transactions were dry-run before execution. Full audit log available
via `vector_get_audit_log`.
```

---

## Implementation: Python SDK + LangChain

A programmatic version with structured agent logic.

```python
import asyncio
import os
from langchain.tools import tool
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from vector_agent import VectorAgent

# Initialize via environment variables:
# VECTOR_MNEMONIC, VECTOR_OGMIOS_URL, VECTOR_SUBMIT_URL, VECTOR_KOIOS_URL
# VECTOR_SPEND_LIMIT_PER_TX, VECTOR_SPEND_LIMIT_DAILY
vector = VectorAgent()


@tool
def check_balance() -> str:
    """Check wallet balance on Vector."""
    balance = asyncio.run(vector.get_balance())
    ap3x = balance.lovelace / 1_000_000
    return f"Balance: {ap3x} AP3X"


@tool
def discover_environmental_agents() -> str:
    """Find agents on Vector with environmental capabilities."""
    agents = asyncio.run(vector.discover_agents(capability="environmental"))
    if not agents:
        return "No environmental agents found."
    lines = []
    for a in agents:
        lines.append(
            f"- {a['name']} (ID: {a['agent_id']}, "
            f"reputation: {a['reputation']}): {a['description']}"
        )
    return "\n".join(lines)


@tool
def get_agent_details(agent_id: str) -> str:
    """Get detailed profile of a registered agent."""
    profile = asyncio.run(vector.get_agent_profile(agent_id))
    return (
        f"Name: {profile['name']}\n"
        f"Description: {profile['description']}\n"
        f"Capabilities: {', '.join(profile['capabilities'])}\n"
        f"Reputation: {profile['reputation']}\n"
        f"Transactions: {profile['transaction_count']}"
    )


@tool
def read_contract_state(script_address: str) -> str:
    """Read the state of a smart contract on Vector."""
    utxos = asyncio.run(vector.get_utxos(script_address))
    lines = []
    for u in utxos:
        lines.append(f"UTxO: {u['value']}, Datum: {u.get('datum', 'none')}")
    return "\n".join(lines) or "No UTxOs found."


@tool
def dry_run_send(to: str, amount_ap3x: float) -> str:
    """Dry-run an AP3X transfer. Amount in AP3X."""
    result = asyncio.run(vector.dry_run(to=to, ada=amount_ap3x))
    fee_ap3x = result["fee"] / 1_000_000
    return f"Valid: {result['valid']}, Fee: {fee_ap3x} AP3X"


@tool
def send_apex(to: str, amount_ap3x: float) -> str:
    """Send AP3X to an address. Amount in AP3X."""
    tx_hash = asyncio.run(vector.send(to=to, ada=amount_ap3x))
    return f"Sent. TX hash: {tx_hash}"


@tool
def check_spend_limits() -> str:
    """Check current spend limits and daily usage."""
    limits = asyncio.run(vector.get_spend_limits())
    daily = limits["daily"]
    return (
        f"Per-TX limit: {limits['per_transaction']['limit'] / 1e6} AP3X\n"
        f"Daily limit: {daily['limit'] / 1e6} AP3X\n"
        f"Daily used: {daily['used'] / 1e6} AP3X\n"
        f"Daily remaining: {daily['remaining'] / 1e6} AP3X"
    )


tools = [
    check_balance,
    discover_environmental_agents,
    get_agent_details,
    read_contract_state,
    dry_run_send,
    send_apex,
    check_spend_limits,
]

llm = ChatAnthropic(model="claude-sonnet-4-20250514")

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an autonomous investment agent operating on Vector blockchain.
Vector's native coin is AP3X (not ADA). Addresses start with addr1.

Your investment process:
1. Check your wallet balance
2. Calculate the investment budget (percentage specified by the user)
3. Discover environmental projects and agents
4. Evaluate each by checking reputation and contract state
5. Allocate budget across the top opportunities (prefer higher reputation)
6. Dry-run EVERY transaction before executing
7. Only execute if the dry-run succeeds
8. Provide a detailed summary with TX hashes

Safety rules:
- Always check spend limits before investing
- Never invest more than the user-specified percentage
- Always dry-run before executing
- If any dry-run fails, skip that investment and explain why"""),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({
    "input": "Invest 20% of my funds across environmental projects on Vector."
})

print("\n=== RESULT ===")
print(result["output"])
```

---

## Implementation: CrewAI Multi-Agent

Split responsibilities across specialized agents for more robust execution.

```python
from crewai import Agent, Task, Crew, Process

# Agent definitions use the same tools as above

researcher = Agent(
    role="Environmental Research Analyst",
    goal="Find and evaluate environmental projects on Vector",
    backstory="You specialize in discovering and analyzing blockchain projects focused on environmental impact.",
    tools=[check_balance, discover_environmental_agents, get_agent_details, read_contract_state],
)

risk_assessor = Agent(
    role="Risk Manager",
    goal="Evaluate investment risks and validate transactions",
    backstory="You ensure all investments are safe. You dry-run every transaction and verify spend limits.",
    tools=[check_spend_limits, dry_run_send, check_balance],
)

executor_agent = Agent(
    role="Transaction Executor",
    goal="Execute approved investments on Vector",
    backstory="You execute transactions that have been researched and risk-assessed. You report TX hashes.",
    tools=[send_apex, check_balance],
)

crew = Crew(
    agents=[researcher, risk_assessor, executor_agent],
    tasks=[
        Task(
            description="Research environmental projects on Vector. Check our balance, find environmental agents, evaluate their reputation and contract states. Recommend allocating 20% of our balance.",
            expected_output="Ranked list of environmental projects with recommended allocation amounts.",
            agent=researcher,
        ),
        Task(
            description="Validate the proposed investments. Check spend limits, dry-run each transaction. Approve or reject each with reasoning.",
            expected_output="Approval/rejection for each proposed transaction with dry-run results.",
            agent=risk_assessor,
        ),
        Task(
            description="Execute all approved transactions. Report TX hashes and final balance.",
            expected_output="Summary table with project, amount, TX hash, and status for each investment.",
            agent=executor_agent,
        ),
    ],
    process=Process.sequential,
    verbose=True,
)

result = crew.kickoff()
print(result)
```

---

## Safety Considerations

This example demonstrates several safety patterns:

1. **Budget cap** — only investing a percentage of funds, never the full balance
2. **Dry-run first** — every transaction is simulated before execution
3. **Spend limits** — server-enforced caps prevent overspending even if the agent logic fails
4. **Audit trail** — every operation is logged for post-hoc review
5. **Reputation-based selection** — preferring higher-reputation agents/projects
6. **Multi-agent oversight** (CrewAI version) — separate research, risk, and execution roles

---

## Next Steps

- [Safety Model](../concepts/safety-model.md) — full safety architecture
- [Agent Wallets](../concepts/agent-wallets.md) — wallet management
- [MCP Tools Reference](../mcp-server/tools-reference.md) — all available tools
- [CrewAI + Vector](../quickstart/crewai.md) — multi-agent framework setup
