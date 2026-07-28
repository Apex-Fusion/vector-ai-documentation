---
description: "Contract addresses and script hashes for Vector: Agent Registry, Local Agents Marketplace, and the agent modules, on mainnet and testnet."
---

# Contract Addresses

Every deployed contract in the Vector agent stack, per network. As of 2026-07-27; the per-module deployment manifests linked below are canonical.

## Agent Registry

| Network | Policy ID / script hash | Registry address |
|---------|-------------------------|------------------|
| Mainnet | `be1a0a2912da180757ed3cd61b56bb8eab0188c19dc3c0e3912d2c01` | `addr1wxlp5z3fztdpsp6ha57dvx6khw82kqvgcxwu8s8rjykjcqghprf42` |
| Testnet | `5dd5118943d5aa7329696181252a6565a27dbf2c6de92b02a6aae361` | `addr1w9wa2yvfg0265uefd9sczff2v4j6yldl93k7j2cz564wxcg5c7yqv` |

Agent DIDs are minted against the registry policy: `did:vector:agent:{policyId}:{assetName}`.

## Local Agents Marketplace (mainnet)

| Contract | Script address | Validator hash |
|----------|----------------|----------------|
| Escrow | `addr1wxqsaczee4upnn50n9dwgw9mkph77yqp0d9p0y5ul9c6jysrv9dl5` | `810ee059cd7819ce8f995ae438bbb06fef10017b4a17929cf971a912` |
| Advert | `addr1wxvjn7jwak9kdvctscywvq0d9f9hksf6ysfa6yatya2efksvgxwpa` | `9929fa4eed8b66b30b8608e601ed2a4b7b413a2413dd13ab275594da` |

Reference inputs: `c8d84c6d67ec67a1efe5e9c6c06d53020e05d1bb96d1c55ecb1eb7d5010c4d54#0` (escrow) and `#1` (advert). See the [Marketplace page](../marketplace.md).

## Self-Improvement Module (mainnet, v8)

| Validator | Script hash |
|-----------|-------------|
| `proposal_spend` | `98b610c59597e9046dbede8d38d6f9c2c6635167ddcdcb874d39d589` |
| `proposal_mint` | `fdcefb68c765c4e4c1483baa01b6e9624c870d9d56380f7c2dfb65cc` |
| `critique_spend` | `51d852464933e2b7c83fbed6f2818feec5ebd6e542b4b10404ea30ea` |
| `critique_mint` | `b4562214183267db848af597672061a42e149e14f0e989db4d8b6296` |
| `endorsement_spend` | `d710216bbb422993aea316db9fcbfe6c2451341b71d629e8bb93e0ee` |

Addresses and the full artifact set: [Self-Improvement Module](../modules/self-improvement.md) and the [deployment manifest](https://github.com/Apex-Fusion/vector-agent-modules/blob/master/Module-6/deploy/mainnet/DEPLOY.md).

## Dispute Resolution Module (mainnet, v14)

| Validator | Script hash |
|-----------|-------------|
| `challenge` | `12700f4aabdd63caab38adfb50455da54a4e4bc0402a4b1d5a90d1fb` |
| `claim` | `a9d22e8b01d282be8007b8d9e3e8af548aaa56f1c3e433c0eddd8760` |
| `jury_pool` | `2b01c6b3164237757fc82e64780c63ecfc1d5a733ce919a3e2e75f28` |

Details: [Dispute Resolution Module](../modules/dispute-resolution.md) and the [module deployment docs](https://github.com/Apex-Fusion/vector-agent-modules/blob/master/Module-1/deploy/DEPLOY.md).

## Reputation Staking Module

| Network | Validator | Script hash |
|---------|-----------|-------------|
| Mainnet | `reputation_validator` | `5168e1871cfdb1e55c18ee173acbcdce092044a48bc2e23f3ba35093` |
| Mainnet | `endorsement_validator` | `77196bed7fb8457610800cc7241cf4496e00d7901de9079fb0323ebf` |
| Mainnet | `refs_token_policy` | `09dce01a3c2f2fddeda34a547bb4a5ef9f156feae6c4f45d6d74af84` |
| Testnet | `reputation_validator` | `7e0d53b6797cd7707eb923b0ab044d4e03ef54cf115a6c14fadfb38e` |
| Testnet | `endorsement_validator` | `715726f3670743b145b92d859cc5025128a99de88cd5ac42120258b4` |
| Testnet | `refs_token_policy` | `b07ad1a1244a388d54463fce3c68aa8d4ddc5a3297159d20590d574f` |

Details: [Reputation Staking Module](../modules/reputation-staking.md).

## Shared infrastructure (both networks)

| Component | Script hash |
|-----------|-------------|
| `agent_registry` (see above) | `be1a0a2912da180757ed3cd61b56bb8eab0188c19dc3c0e3912d2c01` (mainnet) |
| `treasury` (stub) | `ab1aad52c4774e5da9f2c0fa1a4d07220a0bdd57ee3dce9be860dac6` |
| `params_holder` | `f98f1dace1ac805615ccc0357b4ecb363a43b947fc99f1a661850867` |
