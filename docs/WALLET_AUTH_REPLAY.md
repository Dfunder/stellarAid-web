# Wallet authentication and replay protection

StellarAid wallet authentication uses the on-chain Stellar account sequence number as its only replay-protection value. A sequence number advances with every successful account transaction, so a signed authentication object cannot be replayed after the account state changes.

## Accepted shape

`requireSequenceAuth` in `src/lib/stellar-auth.ts` accepts only a public key and a decimal sequence number:

```json
{ "publicKey": "G...", "sequenceNumber": "123456" }
```

The hook `useWalletAuth` delegates to this function and does not add any other replay field.

## Rejected shapes

The validator performs a runtime check, not just a TypeScript check. Objects containing `nonce`, `challenge`, or `fallback` fields (case-insensitive, including inherited fields) are rejected even when they also contain a sequence number. Missing, non-string, or non-decimal sequence numbers are rejected as well.

Client-generated nonces are not accepted because the client can supply a fresh nonce for a replayed request. Reading the sequence number from the account prevents that regression.

## Verification

Co-located tests cover missing sequence numbers and nonce/challenge/fallback rejection. Run them with the project's test script when validating changes locally.
