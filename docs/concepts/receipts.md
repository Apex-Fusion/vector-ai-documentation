---
description: "What a settlement receipt is on Vector: supplier-signed JSON, Ed25519 signature, and an on-chain hash commitment - plus the step-by-step verification recipe."
---

# Receipts and Verification

Every settled marketplace job leaves a supplier-signed receipt whose hash is committed on-chain by the supplier's own key before payment can move, with acceptance and payout recorded as transactions at a public script address - independently verifiable by anyone holding the receipt.

This page defines the artifact precisely and gives the verification recipe.

## What a receipt is

Three linked artifacts - only one lives on-chain:

| Artifact | Where it lives | What it is |
|----------|----------------|------------|
| **Receipt JSON** | Off-chain (returned to the buyer) | 8 fields describing the job: `prompt_hash`, `response_hash`, `model`, `prompt_tokens`, `completion_tokens`, `wallclock_ms`, `supplier_pkh`, `escrow_ref` |
| **Signature** | Off-chain, attached to the receipt | Ed25519 signature over the canonicalized receipt JSON, made with the **same key that is the supplier's on-chain wallet identity** |
| **On-chain commitment** | Escrow datum, permanent | `sha256(canonical({receipt, signature}))` - 32 bytes written by the supplier-signed **Submit** transaction and enforced by the validator |

Canonicalization is a JCS-style form: sorted keys, NFC strings, no whitespace.

## What lands on-chain, step by step

1. **Post** - the buyer locks payment + both bonds at the escrow script with an `Open` datum that already commits to the request: `prompt_hash` (hash of the full messages array) and `request_spec_hash` (capability, model, output cap).
2. **Claim** - the supplier signs on, before the delivery deadline.
3. **Submit** - the supplier writes `result_receipt_hash` into the datum. The validator enforces the hash's presence and length, and stamps `submitted_at` from the transaction's validity bound. The supplier's verification key is in the witness set - this is what makes the commitment attributable.
4. **Accept** - the buyer's signed transaction spends the escrow: supplier receives payment + supplier bond, buyer recovers the buyer bond. There is a 10-minute acceptance window.
5. **Release** - if the buyer does nothing within the window, the supplier can settle unilaterally.

The durable on-chain record is the **transaction pair**: the Submit tx (supplier attestation: hash, timestamp, witness key) and the settlement tx (payouts; the buyer's witness when settled by Accept).

!!! warning "Store the receipt JSON"
    The chain holds only the 32-byte commitment. The receipt itself is returned to whoever ran the buyer side - the gateway includes it in every response's `x_vector` extension but **does not persist it**. If the JSON is discarded, an external party can later verify only that a commitment exists, and nothing else.

## Verification recipe

Given a `{receipt, signature}` JSON, verify against public infrastructure. (Settled escrows are spent UTxOs - use a chain indexer or explorer for history; the marketplace [indexer](https://mp-indexer.vector.apexfusion.org/) serves decoded escrow states, and anyone can self-host it.)

1. **Walk the lineage.** `receipt.escrow_ref` names the original Open UTxO. Follow the spends: Open → Claim → Submit → settlement, every hop at the escrow script address (`addr1wxqsaczee4upnn50n9dwgw9mkph77yqp0d9p0y5ul9c6jysrv9dl5`).
2. **Decode the Submitted datum** (14-field inline Plutus datum; field 12 is the receipt hash, field 5 the prompt hash).
3. **Recompute the commitment:** `sha256(canonical({receipt, signature}))` must equal datum field 12 and the Submit redeemer payload.
4. **Verify the signature:** take the verification key from the Submit transaction's witness set whose blake2b-224 equals the datum's `supplier_pkh`, and check the Ed25519 signature over `canonical(receipt)`. This chains receipt → supplier key → on-chain identity → the key that moved the escrow.
5. **Verify the content** (requires the payloads): recompute `response_hash` from the response and `prompt_hash` from the request messages; the prompt hash must also match what the buyer committed in the datum *before* the work happened.
6. **Verify the payout:** the settlement transaction pays ≥ payment + supplier bond to the supplier's credential (and returns the buyer bond on the Accept path).

## What verification proves - and what it doesn't

Proves: **integrity** (this exact request produced this exact response), **attribution** (this registered supplier key signed it and moved the escrow), **settlement** (value moved under the committed terms, on-chain, timestamped).

Does not prove:

- **Quality** - hashes attest what was delivered, never whether it was good. Contested work goes to the [Dispute Resolution module](../modules/dispute-resolution.md).
- **Self-reported metrics** - `prompt_tokens`, `completion_tokens`, and `wallclock_ms` are supplier-reported billing metadata, not validated on-chain.
- **Buyer counter-signature** - the receipt is supplier-signed; the buyer's approval is the Accept transaction itself, and on the timeout Release path settlement completes without a buyer signature.
- **Content of discarded receipts** - no JSON, no content verification (see the warning above).

## Where to get receipts

| Source | What you get |
|--------|--------------|
| Gateway responses | `x_vector: {receipt, receipt_signature, escrow_ref}` on every completion - store it |
| Self-hosted buyer app | Full archive: receipt JSON, signature, and the exact request/response bytes |
| [Marketplace indexer](https://mp-indexer.vector.apexfusion.org/) | Decoded escrow states and receipt **hashes** (never the JSON) |
