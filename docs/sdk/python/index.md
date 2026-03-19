# Python SDK Reference

Complete API reference for `vector-agent-sdk` — the Python SDK for Vector blockchain.

**Source:** [github.com/Apex-Fusion/agent-sdk-py](https://github.com/Apex-Fusion/agent-sdk-py)

---

## Installation

```bash
git clone https://github.com/Apex-Fusion/agent-sdk-py
cd agent-sdk-py
pip install -e .
```

Requires **Python 3.11+**.

### Dependencies

- `pycardano >= 0.12.0` — Cardano transaction building
- `httpx >= 0.27.0` — async HTTP client
- `pydantic >= 2.0.0` — data models
- `mcp >= 1.0.0` — MCP client support
- `python-dotenv >= 1.0.0` — environment variable loading

---

## Two Modes of Operation

The SDK provides two agent classes:

| Class | Mode | When to use |
|-------|------|-------------|
| `VectorAgent` | Standalone | Direct chain access via PyCardano + Ogmios. Full control. |
| `VectorAgentMCP` | MCP client | Connects to the TypeScript MCP server. Simpler setup. |

---

## VectorAgent (Standalone)

### Constructor

```python
from vector_agent import VectorAgent

agent = VectorAgent(
    ogmios_url="https://ogmios.vector.testnet.apexfusion.org",
    submit_url="https://submit.vector.testnet.apexfusion.org/api/submit/tx",
    koios_url="https://koios.vector.testnet.apexfusion.org/",
    mnemonic="word1 word2 word3 ...",           # 15 or 24 words
    # OR: skey_path="/path/to/payment.skey",    # alternative to mnemonic
    account_index=0,                             # HD wallet account index
    spend_limit_per_tx=100_000_000,              # 100 AP3X in DFM
    spend_limit_daily=500_000_000,               # 500 AP3X in DFM
    explorer_url="https://vector.testnet.apexscan.org",
)
```

All parameters fall back to environment variables if not provided:

| Parameter | Environment Variable | Default |
|-----------|---------------------|---------|
| `ogmios_url` | `VECTOR_OGMIOS_URL` | *required* |
| `submit_url` | `VECTOR_SUBMIT_URL` | *required* |
| `koios_url` | `VECTOR_KOIOS_URL` | `https://koios.vector.testnet.apexfusion.org` |
| `mnemonic` | `VECTOR_MNEMONIC` | — |
| `skey_path` | `VECTOR_SKEY_PATH` | — |
| `account_index` | `VECTOR_ACCOUNT_INDEX` | `0` |
| `spend_limit_per_tx` | `VECTOR_SPEND_LIMIT_PER_TX` | `100000000` |
| `spend_limit_daily` | `VECTOR_SPEND_LIMIT_DAILY` | `500000000` |
| `explorer_url` | `VECTOR_EXPLORER_URL` | `https://vector.testnet.apexscan.org` |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `agent.address` | `str` | The agent's payment address (`addr1...`) |
| `agent.context` | `VectorChainContext` | Underlying PyCardano chain context |
| `agent.safety` | `SafetyLayer` | Safety layer instance |

---

## Query Methods

### `get_address()`

```python
address = await agent.get_address()
# "addr1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3..."
```

Returns the agent's payment address. Equivalent to `agent.address`.

### `get_balance(address=None)`

```python
balance = await agent.get_balance()

balance.lovelace    # int — AP3X amount in DFM (e.g. 50000000)
balance.ada         # str — human-readable (e.g. "50.000000")
balance.address     # str — the queried address
balance.tokens      # list[TokenBalance] — native tokens
```

Returns a `VectorBalance` object. Pass an `address` to query any address; defaults to the agent's own wallet.

**`TokenBalance` fields:** `policy_id`, `asset_name`, `quantity`

### `get_utxos(address=None)`

```python
utxos = await agent.get_utxos()
# Returns list of PyCardano UTxO objects
```

### `get_protocol_parameters()`

```python
params = await agent.get_protocol_parameters()
# Returns raw dict from Ogmios
```

### `get_spend_limits()`

```python
status = await agent.get_spend_limits()

status.per_transaction_limit  # int — DFM
status.daily_limit            # int — DFM
status.daily_spent            # int — DFM
status.daily_remaining        # int — DFM
status.reset_time             # str — ISO 8601 UTC
```

Returns a `SpendStatus` object.

---

## Transaction Methods

### `send(to, ada=0, lovelace=0, metadata=None)`

```python
result = await agent.send(to="addr1qz...", ada=5.0)
# OR: result = await agent.send(to="addr1qz...", lovelace=5_000_000)

result.tx_hash          # str
result.sender           # str
result.recipient        # str
result.amount_lovelace  # int
result.explorer_url     # str
```

Send AP3X to an address. Specify **either** `ada` (float) or `lovelace` (int), not both. Respects spend limits.

Optional `metadata` is a dict attached to the transaction (e.g., `{674: {"msg": ["hello"]}}` for on-chain messages).

Returns a `TxResult` object.

### `send_tokens(to, policy_id, asset_name, quantity, ada=2.0)`

```python
result = await agent.send_tokens(
    to="addr1qz...",
    policy_id="a1b2c3d4e5f6...",
    asset_name="MyToken",
    quantity=100,
    ada=2.0,  # companion AP3X (default 2.0 for min UTxO)
)

result.tx_hash        # str
result.policy_id      # str
result.asset_name     # str
result.token_quantity  # int
```

Returns a `TokenTxResult` object.

---

## Data Types

All data types are Pydantic models.

| Type | Fields |
|------|--------|
| `VectorBalance` | `address`, `ada`, `lovelace`, `tokens` |
| `TokenBalance` | `policy_id`, `asset_name`, `quantity` |
| `TxResult` | `tx_hash`, `sender`, `recipient`, `amount_lovelace`, `explorer_url` |
| `TokenTxResult` | extends `TxResult` + `policy_id`, `asset_name`, `token_quantity` |
| `SpendStatus` | `per_transaction_limit`, `daily_limit`, `daily_spent`, `daily_remaining`, `reset_time` |
| `AuditEntry` | `timestamp`, `tx_hash`, `amount_lovelace`, `recipient`, `action` |
| `DryRunResult` | `valid`, `fee_lovelace`, `fee_ada`, `execution_units`, `error` |
| `BuildTxResult` | `tx_cbor`, `tx_hash`, `fee_lovelace`, `fee_ada`, `submitted`, `explorer_url` |
| `DeployContractResult` | extends `TxResult` + `script_address`, `script_hash`, `script_type` |
| `InteractContractResult` | extends `TxResult` + `script_address`, `action` |

---

## Exceptions

```python
from vector_agent import (
    VectorError,              # base exception
    WalletError,              # wallet configuration issues
    InvalidAddressError,      # invalid recipient address
    InsufficientFundsError,   # not enough AP3X/tokens
    SpendLimitExceededError,  # spend limit violation
    TransactionError,         # TX build or submit failure
)
```

### SpendLimitExceededError

Raised when a transaction exceeds per-TX or daily limits:

```python
try:
    await agent.send(to="addr1...", ada=200.0)
except SpendLimitExceededError as e:
    print(e)  # "Amount ... exceeds per-transaction limit of ..."
```

---

## VectorAgentMCP (MCP Client)

An alternative that connects to the TypeScript MCP server instead of talking to Ogmios directly.

```python
from vector_agent import VectorAgentMCP

agent = VectorAgentMCP(mcp_url="http://localhost:3000")
```

This mode is useful when the MCP server is already running and you want to reuse its configuration and safety layer.

---

## Examples

### Check balance and send

```python
from vector_agent import VectorAgent

agent = VectorAgent(
    ogmios_url="https://ogmios.vector.testnet.apexfusion.org",
    submit_url="https://submit.vector.testnet.apexfusion.org/api/submit/tx",
    mnemonic="your fifteen word mnemonic phrase here ...",
)

balance = await agent.get_balance()
print(f"Balance: {balance.ada} AP3X")

if balance.lovelace > 10_000_000:
    tx = await agent.send(to="addr1qz...", ada=5.0)
    print(f"Sent! TX: {tx.explorer_url}")
```

### Environment variable configuration

=== "Testnet"

    ```bash
    export VECTOR_OGMIOS_URL=https://ogmios.vector.testnet.apexfusion.org
    export VECTOR_SUBMIT_URL=https://submit.vector.testnet.apexfusion.org/api/submit/tx
    export VECTOR_KOIOS_URL=https://koios.vector.testnet.apexfusion.org/
    export VECTOR_EXPLORER_URL=https://vector.testnet.apexscan.org
    export VECTOR_MNEMONIC="word1 word2 word3 ..."
    export VECTOR_SPEND_LIMIT_PER_TX=50000000
    export VECTOR_SPEND_LIMIT_DAILY=200000000
    ```

=== "Mainnet"

    ```bash
    export VECTOR_OGMIOS_URL=https://ogmios.vector.mainnet.apexfusion.org
    export VECTOR_SUBMIT_URL=https://submit.vector.mainnet.apexfusion.org/api/submit/tx
    export VECTOR_KOIOS_URL=https://koios.vector.mainnet.apexfusion.org/
    export VECTOR_EXPLORER_URL=https://vector.mainnet.apexscan.org
    export VECTOR_MNEMONIC="word1 word2 word3 ..."
    export VECTOR_SPEND_LIMIT_PER_TX=50000000
    export VECTOR_SPEND_LIMIT_DAILY=200000000
    ```

```python
# No constructor args needed — everything from env
agent = VectorAgent()
```

---

## Project Structure

```
agent-sdk-py/
├── src/vector_agent/
│   ├── __init__.py          # exports VectorAgent, VectorAgentMCP, types
│   ├── agent.py             # VectorAgent (standalone mode)
│   ├── agent_mcp.py         # VectorAgentMCP (MCP client mode)
│   ├── exceptions.py        # custom exceptions
│   ├── safety.py            # SafetyLayer (spend limits + audit)
│   ├── types.py             # Pydantic data models
│   ├── chain/
│   │   ├── context.py       # VectorChainContext (PyCardano context)
│   │   ├── ogmios.py        # OgmiosClient
│   │   └── submit.py        # SubmitClient
│   └── wallet/
│       ├── hd.py            # HDWallet (mnemonic-based)
│       └── skey.py          # SkeyWallet (signing key file)
├── examples/
│   ├── balance_check.py
│   ├── mcp_client_example.py
│   └── send_ada.py
├── tests/
│   ├── test_chain_context.py
│   ├── test_safety.py
│   └── test_wallet.py
└── pyproject.toml
```

---

## Next Steps

- [5-Minute Start](../../quickstart/5-minute-start.md) — get running quickly
- [MCP Server Installation](../../mcp-server/installation.md) — alternative: use MCP mode
- [MCP Tools Reference](../../mcp-server/tools-reference.md) — all available operations
- [Agent Wallets](../../concepts/agent-wallets.md) — wallet security best practices
