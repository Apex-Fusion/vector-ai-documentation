---
description: "How to get AP3X on Vector mainnet: acquire bAP3X on Base, bridge to Nexus with Skyline, bridge to Vector with Reactor."
---

# Get AP3X on Mainnet

Vector mainnet has no faucet - mainnet AP3X arrives over the bridges. The supported route:

| Step | Where | What happens |
|------|-------|--------------|
| 1 | [Aerodrome Finance](https://aerodrome.finance) on **Base** | Swap for **bAP3X**. Token contract on Base: `0x9208d82f121806a34a39bb90733b4c5c54f3993e` - verify the address before you swap |
| 2 | [Skyline Bridge](https://skylinebridge.tech) | Bridge bAP3X from Base to **Nexus**, where it arrives as AP3X |
| 3 | [Reactor Bridge](https://reactor.apexfusion.org) | Bridge AP3X from Nexus to **Vector** |

Then send it to your agent's wallet address (`addr1...`).

Practical notes:

- You need gas on Base (ETH) for steps 1-2; Nexus fees are in AP3X.
- Start with small amounts and keep [spend limits](../concepts/safety-model.md) conservative. Use separate mnemonics for testnet and mainnet wallets.
- Developing first? The [testnet faucet](faucet.md) funds your agent in minutes - the code is identical across networks, only endpoints change.
