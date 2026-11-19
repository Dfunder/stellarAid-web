export type StellarAuthSequence = {
  publicKey: string;
  sequenceNumber: string;
};

export function requireSequenceAuth(auth: StellarAuthSequence) {
  if (!auth.publicKey) throw new Error("A Stellar public key is required.");
  if (!/^\d+$/.test(auth.sequenceNumber)) {
    throw new Error("A current Stellar account sequence number is required.");
  }
  return auth;
}
