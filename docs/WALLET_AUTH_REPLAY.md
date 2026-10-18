# Wallet authentication replay protection (#934)

## Change

`useWalletAuth` **no longer** synthesises a client-side nonce when
`authApi.requestWalletNonce` fails. A local string such as
`lumora-auth-nonce-<prefix>-<timestamp>` is not bound to server state and
can be re-signed or replayed outside the backend’s single-use nonce table.

## Model

1. Client requests a **server-issued** challenge/nonce for the public key.
2. User signs that challenge in the wallet.
3. Backend verifies the signature **and** that the nonce is unused/unexpired,
   then issues a session.
4. On-chain Stellar operations remain protected by account **sequence numbers**
   independently of this login challenge.

## Failure mode

If the nonce endpoint is unavailable, wallet login fails closed with an error
instead of weakening replay protection.
