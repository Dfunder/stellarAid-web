export type StellarAuthSequence = {
  publicKey: string;
  sequenceNumber: string;
};

type StellarAuthInput = Record<string, unknown>;

function hasNonce(input: StellarAuthInput) {
  return Object.prototype.hasOwnProperty.call(input, "nonce");
}

export function requireSequenceAuth(auth: StellarAuthSequence): StellarAuthSequence;
export function requireSequenceAuth(auth: StellarAuthInput): StellarAuthSequence;
export function requireSequenceAuth(auth: StellarAuthInput): StellarAuthSequence {
  if (hasNonce(auth)) {
    throw new Error("Client nonce fallback is not allowed.");
  }

  const publicKey = typeof auth.publicKey === "string" ? auth.publicKey : "";
  const sequenceNumber =
    typeof auth.sequenceNumber === "string" ? auth.sequenceNumber : "";

  if (!publicKey) throw new Error("A Stellar public key is required.");
  if (!/^\d+$/.test(sequenceNumber)) {
    throw new Error("A current Stellar account sequence number is required.");
  }

  return { publicKey, sequenceNumber };
}
