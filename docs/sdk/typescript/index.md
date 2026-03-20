# TypeScript SDK Reference

Complete API reference for `@apexfusion/agent-sdk` — the TypeScript SDK for Vector blockchain.

**Source:** [github.com/Apex-Fusion/agent-sdk-ts](https://github.com/Apex-Fusion/agent-sdk-ts) | **npm:** [@apexfusion/agent-sdk](https://www.npmjs.com/package/@apexfusion/agent-sdk)

---

## Installation

```bash
npm install @apexfusion/agent-sdk
```

Requires **Node.js 18+**. Supports both ESM and CommonJS.

### Dependencies

- `@lucid-evolution/lucid >= 0.4.29` — Cardano transaction building
- `@noble/hashes >= 1.7.1` — cryptographic hashing
- `cross-fetch >= 4.0.0` — universal fetch
- `zod >= 3.24.1` — schema validation

---

## Quick Start

```typescript
import { VectorAgent } from '@apexfusion/agent-sdk';

const agent = new VectorAgent({
  mnemonic: 'your fifteen word mnemonic phrase here ...',
});

const address = await agent.getAddress();
const balance = await agent.getBalance();
const tx = await agent.send({ to: 'addr1...', ada: 5 });

await agent.close();
```

---

## Configuration

```typescript
const agent = new VectorAgent({
  ogmiosUrl: 'https://ogmios.vector.testnet.apexfusion.org',
  submitUrl: 'https://submit.vector.testnet.apexfusion.org/api/submit/tx',
  koiosUrl: 'https://koios.vector.testnet.apexfusion.org/',
  explorerUrl: 'https://vector.testnet.apexscan.org',
  mnemonic: process.env.VECTOR_MNEMONIC,
  accountIndex: 0,
  spendLimitPerTx: 100_000_000,   // 100 AP3X in DFM
  spendLimitDaily: 500_000_000,   // 500 AP3X in DFM
});
```

All parameters fall back to environment variables if not provided:

| Parameter | Environment Variable | Default |
|-----------|---------------------|---------|
| `ogmiosUrl` | `VECTOR_OGMIOS_URL` | *required* |
| `submitUrl` | `VECTOR_SUBMIT_URL` | *required* |
| `koiosUrl` | `VECTOR_KOIOS_URL` | `https://koios.vector.testnet.apexfusion.org` |
| `mnemonic` | `VECTOR_MNEMONIC` | — |
| `skeyPath` | `VECTOR_SKEY_PATH` | — |
| `accountIndex` | `VECTOR_ACCOUNT_INDEX` | `0` |
| `spendLimitPerTx` | `VECTOR_SPEND_LIMIT_PER_TX` | `100000000` |
| `spendLimitDaily` | `VECTOR_SPEND_LIMIT_DAILY` | `500000000` |
| `explorerUrl` | `VECTOR_EXPLORER_URL` | `https://vector.testnet.apexscan.org` |

### Environment Variable Configuration

=== "Testnet"

    ```bash
    export VECTOR_OGMIOS_URL=https://ogmios.vector.testnet.apexfusion.org
    export VECTOR_SUBMIT_URL=https://submit.vector.testnet.apexfusion.org/api/submit/tx
    export VECTOR_KOIOS_URL=https://koios.vector.testnet.apexfusion.org/
    export VECTOR_EXPLORER_URL=https://vector.testnet.apexscan.org
    export VECTOR_MNEMONIC="word1 word2 word3 ..."
    ```

=== "Mainnet"

    ```bash
    export VECTOR_OGMIOS_URL=https://ogmios.vector.mainnet.apexfusion.org
    export VECTOR_SUBMIT_URL=https://submit.vector.mainnet.apexfusion.org/api/submit/tx
    export VECTOR_KOIOS_URL=https://koios.vector.mainnet.apexfusion.org/
    export VECTOR_EXPLORER_URL=https://explorer.vector.mainnet.apexfusion.org
    export VECTOR_MNEMONIC="word1 word2 word3 ..."
    ```

```typescript
// No constructor args needed — everything from env
const agent = new VectorAgent();
```

---

## Query Methods

### `getAddress()`

```typescript
const address = await agent.getAddress();
// "addr1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3..."
```

### `getBalance(address?)`

```typescript
const balance = await agent.getBalance();

balance.lovelace   // bigint — AP3X amount in DFM
balance.ada        // string — human-readable (e.g. "50.000000")
balance.address    // string — the queried address
balance.tokens     // TokenBalance[] — native tokens
```

Pass an `address` to query any address; defaults to the agent's own wallet.

### `getUtxos(address?)`

```typescript
const utxos = await agent.getUtxos();
```

### `getProtocolParameters()`

```typescript
const params = await agent.getProtocolParameters();
```

### `getSpendLimits()`

```typescript
const status = await agent.getSpendLimits();

status.perTransactionLimit  // number — DFM
status.dailyLimit           // number — DFM
status.dailySpent           // number — DFM
status.dailyRemaining       // number — DFM
status.resetTime            // string — ISO 8601 UTC
```

---

## Transaction Methods

### `send({ to, ada?, lovelace?, metadata? })`

```typescript
const result = await agent.send({ to: 'addr1qz...', ada: 5 });
// OR: await agent.send({ to: 'addr1qz...', lovelace: 5_000_000n });

result.txHash        // string
result.sender        // string
result.recipient     // string
result.amountLovelace // bigint
result.explorerUrl   // string
```

Specify **either** `ada` (number) or `lovelace` (bigint), not both. Respects spend limits.

### `sendTokens({ to, policyId, assetName, quantity, ada? })`

```typescript
const result = await agent.sendTokens({
  to: 'addr1qz...',
  policyId: 'a1b2c3d4e5f6...',
  assetName: 'MyToken',
  quantity: 100,
  ada: 2,  // companion AP3X (default 2 for min UTxO)
});

result.txHash        // string
result.policyId      // string
result.assetName     // string
result.tokenQuantity // number
```

### `dryRun({ to, ada?, lovelace? })`

```typescript
const dry = await agent.dryRun({ to: 'addr1qz...', ada: 5 });

dry.valid           // boolean
dry.feeLovelace     // bigint
dry.feeAda          // string
dry.executionUnits  // object
dry.error           // string | null
```

### `buildTransaction({ outputs, metadata?, submit? })`

```typescript
const built = await agent.buildTransaction({
  outputs: [{ to: 'addr1...', lovelace: 5_000_000n }],
  metadata: { 674: { msg: ['hello'] } },
  submit: true,
});

built.txCbor       // string
built.txHash       // string
built.feeLovelace  // bigint
built.submitted    // boolean
built.explorerUrl  // string
```

### `getTransactionHistory({ address?, limit?, offset? })`

```typescript
const history = await agent.getTransactionHistory({ limit: 10 });
```

---

## Smart Contract Methods

### `deployContract({ scriptCbor, scriptType?, initialDatum?, lovelace? })`

```typescript
const deploy = await agent.deployContract({
  scriptCbor: '59010100...',
  scriptType: 'PlutusV3',
  initialDatum: '{"constructor": 0, "fields": []}',
  lovelace: 2_000_000n,
});

deploy.txHash        // string
deploy.scriptAddress // string
deploy.scriptHash    // string
deploy.scriptType    // string
```

### `interactContract({ scriptCbor, scriptType?, action?, redeemer?, datum?, lovelace?, utxoRef? })`

```typescript
const interact = await agent.interactContract({
  scriptCbor: '59010100...',
  action: 'spend',
  redeemer: '{"constructor": 0, "fields": []}',
  lovelace: 5_000_000n,
});

interact.txHash        // string
interact.scriptAddress // string
interact.action        // string
```

---

## Agent Registry Methods

### `registerAgent({ name, description, capabilities, framework, endpoint })`

```typescript
const reg = await agent.registerAgent({
  name: 'my-agent',
  description: 'Autonomous investor agent',
  capabilities: ['trading', 'analysis'],
  framework: 'langchain',
  endpoint: 'https://my-agent.example.com',
});
```

### `discoverAgents({ capability?, framework?, limit? })`

```typescript
const agents = await agent.discoverAgents({ capability: 'trading' });
```

### `getAgentProfile(agentId)`

```typescript
const profile = await agent.getAgentProfile('agent-id-here');
```

### `updateAgent(agentId, { name?, description?, capabilities?, framework?, endpoint? })`

```typescript
await agent.updateAgent('agent-id', { description: 'Updated description' });
```

### `deregisterAgent(agentId)`

```typescript
await agent.deregisterAgent('agent-id');
```

### `transferAgent(agentId, newOwnerAddress)`

```typescript
await agent.transferAgent('agent-id', 'addr1qz...');
```

### `messageAgent(agentId, { type, payload })`

```typescript
await agent.messageAgent('agent-id', {
  type: 'request',
  payload: { action: 'analyze', target: 'AP3X/USD' },
});
```

---

## Advanced Usage

Sub-modules are exported for direct access:

```typescript
import {
  OgmiosProvider,
  SafetyLayer,
  HDWallet,
  SkeyWallet,
  AgentRegistry,
} from '@apexfusion/agent-sdk';
```

---

## Next Steps

- [5-Minute Start](../../quickstart/5-minute-start.md) — get running quickly
- [Python SDK Reference](../python/index.md) — Python alternative
- [MCP Server Setup](../../mcp-server/installation.md) — use MCP mode instead
- [MCP Tools Reference](../../mcp-server/tools-reference.md) — all available operations
- [Agent Wallets](../../concepts/agent-wallets.md) — wallet security best practices
