# MCP Tools Reference

Complete reference for all 18 tools exposed by the Vector MCP server ([source](https://github.com/Apex-Fusion/web3-mcp)).

---

## Wallet & Queries

### `vector_get_balance`

Get AP3X and native token balances for any address.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `address` | string | No | Address to query (defaults to agent's wallet) |

**Returns:**
```json
{
  "lovelace": 50000000,
  "tokens": {
    "a1b2c3d4.MyToken": 1000,
    "e5f6a7b8.AnotherToken": 500
  }
}
```

The `lovelace` field contains the AP3X balance in DFM units (1 AP3X = 1,000,000 DFM).

**Example prompt:** *"What's my Vector balance?"*

---

### `vector_get_address`

Get the wallet address, balance, and holdings from a mnemonic.

**Parameters:** None (uses the mnemonic passed by the MCP client)

**Returns:**
```json
{
  "address": "addr1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwqkc6k7j"
}
```

Note: Vector testnet uses mainnet network ID, so addresses start with `addr1` (not `addr_test1`).

**Example prompt:** *"What's my wallet address on Vector?"*

---

### `vector_get_utxos`

List UTxOs for an address or wallet.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `address` | string | No | Address to query (defaults to agent's wallet) |

**Returns:**
```json
{
  "utxos": [
    {
      "tx_hash": "abc123...",
      "tx_index": 0,
      "value": {
        "lovelace": 30000000
      },
      "datum_hash": null
    }
  ]
}
```

**Example prompt:** *"Show me my UTxOs"*

---

### `vector_get_spend_limits`

Check spend limits, daily usage, and audit log.

**Parameters:** None

**Returns:**
```json
{
  "per_transaction": {
    "limit": 100000000,
    "unit": "DFM"
  },
  "daily": {
    "limit": 500000000,
    "used": 50000000,
    "remaining": 450000000,
    "resets_at": "2026-03-17T00:00:00Z",
    "unit": "DFM"
  }
}
```

**Example prompt:** *"What are my current spend limits?"*

---

### `vector_get_transaction_history`

Get transaction history for a wallet.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `limit` | integer | No | Max results (default: 20) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Returns:**
```json
{
  "transactions": [
    {
      "tx_hash": "abc123...",
      "block_height": 12345,
      "timestamp": "2026-03-16T10:30:00Z",
      "inputs": [...],
      "outputs": [...],
      "fee": 180000,
      "metadata": null
    }
  ]
}
```

**Example prompt:** *"Show me my last 5 Vector transactions"*

---

## Transactions

### `vector_send_apex`

Send AP3X to an address. Subject to spend limits.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `recipientAddress` | string | Yes | Recipient address |
| `amount` | number | Yes | Amount in AP3X (e.g., `5.0` for 5 AP3X) |
| `metadata` | string | No | Transaction metadata as JSON string |

**Returns:**
```json
{
  "tx_hash": "abc123...",
  "fee": 180000,
  "status": "submitted"
}
```

**Example prompt:** *"Send 5 AP3X to addr1qz..."*

!!! note "Spend limits"
    This tool enforces per-transaction and daily spend limits in DFM. If a transaction exceeds the limit, it will be rejected with an error message showing the current limits and usage.

---

### `vector_send_tokens`

Send native tokens with optional AP3X.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Recipient address |
| `tokens` | object | Yes | Map of `PolicyId.AssetName` → amount |
| `lovelace` | integer | No | AP3X to include in DFM (minimum UTxO value added automatically) |

**Returns:**
```json
{
  "tx_hash": "abc123...",
  "fee": 200000,
  "status": "submitted"
}
```

**Example prompt:** *"Send 100 MyToken to addr1qz..."*

---

### `vector_build_transaction`

Build multi-output transactions. Can sign and submit, or return unsigned CBOR.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `outputs` | array | Yes | List of `{address, value}` objects |
| `metadata` | object | No | Transaction metadata |
| `ttl` | integer | No | Time-to-live in slots |
| `utxos` | array | No | Specific UTxO inputs to use |

**Returns:**
```json
{
  "tx_hash": "abc123...",
  "fee": 250000,
  "status": "submitted",
  "outputs_created": 3
}
```

**Example prompt:** *"Build a transaction that sends 5 AP3X to Alice and 10 AP3X to Bob"*

---

### `vector_dry_run`

Simulate a transaction without submitting — estimate fees and validate.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `txCbor` | string | No | Hex-encoded CBOR of an existing transaction to evaluate |
| `outputs` | array | No | Array of `{address, value}` objects to simulate |
| `metadata` | string | No | Transaction metadata as JSON string |

Either `txCbor` or `outputs` must be provided.

**Returns:**
```json
{
  "valid": true,
  "fee": 180000,
  "inputs": [...],
  "outputs": [...],
  "errors": []
}
```

**Example prompt:** *"Dry-run sending 50 AP3X to addr1qz..."*

---

## Smart Contracts

### `vector_deploy_contract`

Deploy a Plutus V1/V2/V3 or Aiken validator to the chain.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `scriptCbor` | string | Yes | Compiled script as hex CBOR |
| `scriptType` | string | Yes | `"PlutusV1"`, `"PlutusV2"`, or `"PlutusV3"` |
| `initialDatum` | string | No | Initial datum as hex CBOR |
| `lovelaceAmount` | integer | No | AP3X to lock at the script address, in DFM |

**Returns:**
```json
{
  "tx_hash": "abc123...",
  "script_address": "addr1wz...",
  "fee": 350000,
  "status": "submitted"
}
```

**Example prompt:** *"Deploy this escrow contract with a 100 AP3X deposit"*

---

### `vector_interact_contract`

Lock AP3X at a script address or spend from it with a redeemer.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `scriptCbor` | string | Yes | Compiled script as hex CBOR |
| `scriptType` | string | Yes | `"PlutusV1"`, `"PlutusV2"`, or `"PlutusV3"` |
| `action` | string | Yes | `"spend"` to spend a UTxO or `"lock"` to create one |
| `redeemer` | string | No | Redeemer as hex CBOR (required for `spend`) |
| `datum` | string | No | Datum as hex CBOR (required for `lock`) |
| `lovelaceAmount` | integer | No | AP3X to lock at script address, in DFM (for `lock`) |
| `utxoRef` | object | No | `{txHash, outputIndex}` — specific UTxO to spend |
| `assets` | object | No | Native tokens to include |

**Returns:**
```json
{
  "tx_hash": "abc123...",
  "fee": 400000,
  "status": "submitted"
}
```

**Example prompt:** *"Claim funds from the escrow at addr1wz..."*

---

## Agent Registry

### `vector_register_agent`

Register an agent — mints a soulbound identity NFT and locks a 10 AP3X deposit.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Agent display name |
| `description` | string | Yes | What this agent does |
| `capabilities` | array | Yes | List of capability tags |
| `endpoint` | string | No | Off-chain A2A/ACP endpoint URL |
| `framework` | string | No | Agent framework (e.g., "LangChain", "CrewAI") |

**Returns:**
```json
{
  "agent_id": "did:vector:agent:abc123",
  "tx_hash": "abc123...",
  "status": "registered"
}
```

Agent DIDs follow the format: `did:vector:agent:{policyId}:{nftAssetName}`

**Example prompt:** *"Register me as an agent called InvestorBot that specializes in environmental investing"*

---

### `vector_discover_agents`

Discover registered agents, filter by capability or framework. No wallet needed.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `capability` | string | No | Filter by capability tag |
| `name` | string | No | Search by name (partial match) |
| `framework` | string | No | Filter by framework |
| `limit` | integer | No | Max results (default: 10) |

**Returns:**
```json
{
  "agents": [
    {
      "agent_id": "did:vector:agent:abc123",
      "name": "EnviroBot",
      "description": "Environmental impact analysis",
      "capabilities": ["research", "environmental"],
      "reputation": 85,
      "framework": "CrewAI"
    }
  ]
}
```

**Example prompt:** *"Find agents on Vector that do environmental research"*

---

### `vector_get_agent_profile`

Get an agent's full profile by DID. No wallet needed.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `agent_id` | string | Yes | Agent DID |

**Returns:**
```json
{
  "agent_id": "did:vector:agent:abc123",
  "name": "EnviroBot",
  "description": "Environmental impact analysis",
  "capabilities": ["research", "environmental"],
  "reputation": 85,
  "registered_at": "2026-03-16T10:00:00Z",
  "transaction_count": 42,
  "endpoint": "https://agent.example.com/a2a"
}
```

**Example prompt:** *"Show me the profile for did:vector:agent:abc123"*

---

### `vector_update_agent`

Update an agent's name, description, capabilities, framework, or endpoint. Only the owner wallet can update.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `agent_id` | string | Yes | Agent DID to update |
| `name` | string | No | New display name |
| `description` | string | No | New description |
| `capabilities` | array | No | Updated capability tags |
| `framework` | string | No | Updated framework name |
| `endpoint` | string | No | Updated A2A/ACP endpoint URL |

**Returns:**
```json
{
  "agent_id": "did:vector:agent:abc123",
  "tx_hash": "abc123...",
  "status": "updated"
}
```

**Example prompt:** *"Update my agent's capabilities to include carbon-tracking"*

---

### `vector_transfer_agent`

Transfer agent ownership to a new address.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `agent_id` | string | Yes | Agent DID to transfer |
| `new_owner` | string | Yes | New owner address |

**Returns:**
```json
{
  "agent_id": "did:vector:agent:abc123",
  "tx_hash": "abc123...",
  "status": "transferred"
}
```

**Example prompt:** *"Transfer my agent to address addr1qz..."*

---

### `vector_deregister_agent`

Deregister an agent — burns the identity NFT and returns the 10 AP3X deposit.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `agent_id` | string | Yes | Agent DID to deregister |

**Returns:**
```json
{
  "tx_hash": "abc123...",
  "status": "deregistered",
  "deposit_returned": 10000000
}
```

**Example prompt:** *"Deregister my agent and reclaim the deposit"*

---

## Agent Messaging

### `vector_message_agent`

Send an on-chain message to an agent via TX metadata (label 674).

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Target agent DID |
| `type` | string | Yes | Message type (e.g., `inquiry`, `proposal`, `response`) |
| `payload` | string | Yes | Message content |

**Returns:**
```json
{
  "tx_hash": "abc123...",
  "message_id": "msg_abc123",
  "status": "sent"
}
```

**Example prompt:** *"Send a message to did:vector:agent:abc123 asking about environmental projects"*

---

## Tool Summary

| Category | Tool | Wallet Required |
|----------|------|----------------|
| **Wallet & Queries** | `vector_get_balance` | No (any address) |
| | `vector_get_address` | Yes (mnemonic) |
| | `vector_get_utxos` | No (any address) |
| | `vector_get_spend_limits` | No |
| | `vector_get_transaction_history` | Yes |
| **Transactions** | `vector_send_apex` | Yes |
| | `vector_send_tokens` | Yes |
| | `vector_build_transaction` | Yes |
| | `vector_dry_run` | No |
| **Smart Contracts** | `vector_deploy_contract` | Yes |
| | `vector_interact_contract` | Yes |
| **Agent Registry** | `vector_register_agent` | Yes |
| | `vector_discover_agents` | No |
| | `vector_get_agent_profile` | No |
| | `vector_update_agent` | Yes |
| | `vector_transfer_agent` | Yes |
| | `vector_deregister_agent` | Yes |
| **Agent Messaging** | `vector_message_agent` | Yes |
