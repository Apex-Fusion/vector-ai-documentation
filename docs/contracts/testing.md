---
description: "Testing Aiken smart contracts on Vector. Unit tests, exploit tests, fuzz tests, CBOR encoding gotchas."
---

# Contract Testing Guide

How to test Aiken smart contracts on Vector, including Vector-specific gotchas.

---

## AP3X Native Coin in Aiken Tests

Vector's native coin is AP3X (not ADA). In Aiken tests, you construct values using the standard library — the function name is still `lovelace_of` but it operates on AP3X:

```aiken
use aiken/assets

test escrow_claim_succeeds() {
  // Lock 10 AP3X = 10,000,000 DFM
  let locked_value = assets.from_lovelace(10_000_000)

  // Verify the AP3X amount
  let ap3x_in_dfm = assets.lovelace_of(locked_value)
  ap3x_in_dfm == 10_000_000
}
```

**Rule:** In Aiken, `lovelace_of` and `from_lovelace` operate on DFM (1 AP3X = 1,000,000 DFM). The naming is inherited from Cardano tooling but the values are AP3X.

---

## Network ID Gotcha

Vector testnet uses **mainnet network ID** (networkMagic: 764824073). When constructing test addresses in Aiken or PyCardano:

- Use mainnet-format addresses (starting with `addr1`)
- In PyCardano: use `Network.MAINNET`

```aiken
// Test addresses must use mainnet format on Vector testnet
// addr1... not addr_test1...
let beneficiary_addr = #"60aabbccdd..."  // payment key hash, no network prefix in Aiken
```

When testing end-to-end with PyCardano:

```python
from pycardano import Network, Address, PaymentVerificationKey

# Must use MAINNET for Vector testnet
address = Address(payment_part=vk.hash(), network=Network.MAINNET)
# This gives you an addr1... address, which is correct for Vector
```

---

## Test Organization

Structure your test suite into these categories for clear coverage:

### 1. Behavioral Tests (Happy Path)

Verify that the contract does what it's supposed to do:

```aiken
test escrow_beneficiary_can_claim_before_deadline() {
  // Setup: lock funds with deadline in the future
  // Action: beneficiary claims with Claim redeemer
  // Assert: validator returns True
}

test donation_pool_owner_can_distribute() {
  // Setup: pool with contributions
  // Action: owner distributes to approved recipient
  // Assert: validator returns True
}
```

### 2. Exploit Tests (Sad Path)

Verify that unauthorized actions are rejected:

```aiken
test escrow_non_beneficiary_cannot_claim() {
  // Setup: escrow with known beneficiary
  // Action: different address tries to claim
  // Assert: validator returns False (expect_false)
}

test escrow_depositor_cannot_reclaim_before_deadline() {
  // Setup: deadline in the future
  // Action: depositor tries Reclaim redeemer
  // Assert: validator returns False
}
```

### 3. Property Tests

Verify invariants that must always hold:

```aiken
test vesting_never_releases_more_than_locked(
  elapsed_slots via fuzz.int_between(0, 10_000_000)
) {
  // Property: released amount <= total_amount at any slot
  let vested = calculate_vested(elapsed_slots, vest_start, vest_end, total_amount)
  vested <= total_amount
}
```

### 4. Fuzz Tests

Use Aiken's built-in fuzzing for property-based testing:

```aiken
test escrow_deadline_always_enforced(
  current_slot via fuzz.int_between(0, 10_000_000),
  deadline via fuzz.int_between(0, 10_000_000)
) {
  let can_reclaim = current_slot > deadline
  let can_claim = current_slot <= deadline

  // At any slot, exactly one action should be valid
  can_reclaim != can_claim
}
```

### 5. Integration Tests

Test the full transaction flow using PyCardano + Vector testnet:

```python
import pytest
from pycardano import Network, BlockFrostChainContext

@pytest.mark.integration
async def test_escrow_full_flow(vector_context):
    """Full escrow: deploy → lock → claim."""
    # 1. Deploy
    script_address = await deploy_escrow(vector_context, ...)

    # 2. Lock funds
    tx_lock = await lock_funds(vector_context, script_address, 10_000_000)
    await wait_for_confirmation(vector_context, tx_lock)

    # 3. Claim
    tx_claim = await claim_funds(vector_context, script_address, ...)
    await wait_for_confirmation(vector_context, tx_claim)

    # 4. Assert: script address now empty
    utxos = await vector_context.utxos(script_address)
    assert len(utxos) == 0
```

---

## Running Tests

### Unit Tests (Aiken)

```bash
# Run all tests
aiken check

# Run with verbose output
aiken check --verbose

# Run a specific test file
aiken check --match "escrow"
```

### Expected output

```
    Compiling vector_escrow 1.0.0 (...)
    Testing ...

✓ escrow/escrow_claim_succeeds [1.2ms]
✓ escrow/escrow_reclaim_after_deadline [0.8ms]
✗ escrow/escrow_non_beneficiary_cannot_claim [0.6ms]

Summary
  2 tests, 0 failures
  1 test (expected failure), 0 unexpected passes
```

### Integration Tests (Python)

```bash
# Requires a funded testnet wallet
export VECTOR_MNEMONIC="your fifteen word mnemonic here ..."
export VECTOR_KOIOS_URL="https://v2.koios.vector.testnet.apexfusion.org/"

pytest tests/integration/ -v -m integration
```

---

## Key Pitfalls

### 1. Wrong DFM amount in tests

```aiken
// WRONG: 10 ADA on Cardano, but this is AP3X — name it correctly
let ada_amount = 10_000_000  // confusing variable name

// CORRECT
let ap3x_in_dfm = 10_000_000  // 10 AP3X
```

### 2. Using addr_test1 in PyCardano integration tests

```python
# WRONG: generates addr_test1 address, invalid on Vector
addr = Address(payment_part=vk.hash(), network=Network.TESTNET)

# CORRECT: generates addr1 address
addr = Address(payment_part=vk.hash(), network=Network.MAINNET)
```

### 3. Not handling RawCBOR datums from Ogmios

Ogmios may return datums as raw CBOR hex. Always handle both:

```python
def parse_datum(raw):
    if isinstance(raw, str):
        import cbor2
        from binascii import unhexlify
        return cbor2.loads(unhexlify(raw))
    return raw
```

### 4. CBOR encoding mismatch

If your Aiken validator fails with a valid-looking transaction, check CBOR encoding. PyCardano and Aiken must agree on definite vs. indefinite-length arrays. Use `aiken check` and compare against your PyCardano-encoded datums.

### 5. Missing trailing slash on Koios URL

```python
# WRONG: will cause 301 redirect and potential errors
koios_url = "https://v2.koios.vector.testnet.apexfusion.org"

# CORRECT
koios_url = "https://v2.koios.vector.testnet.apexfusion.org/"
```

---

## Test Coverage Checklist

For each contract template:

- [ ] Happy path: each valid action succeeds
- [ ] Exploit path: each unauthorized action is rejected
- [ ] Boundary conditions: deadline at exact slot, exact amounts
- [ ] Fuzz: amounts and slots across full range
- [ ] Integration: full transaction lifecycle on testnet

---

## Next Steps

- [Contract Templates](templates.md) — audited templates to test against
- [Vector Gotchas](../concepts/vector-gotchas.md) — AP3X, network ID, CBOR parity
- [How Vector Works](../concepts/how-vector-works.md) — UTXO model fundamentals
