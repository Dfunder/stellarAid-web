export type StellarAuthSequence = {
  publicKey: string;
  sequenceNumber: string;
};

const rejectedFields = ["nonce", "challenge", "fallback"] as const;

type RejectedField = (typeof rejectedFields)[number];

function findRejectedField(auth: object): RejectedField | undefined {
  for (const key of Object.keys(auth)) {
    const normalized = key.toLowerCase() as RejectedField;
    if (rejectedFields.includes(normalized)) return normalized;
  }
  return rejectedFields.find((field) => field in auth);
}

export function requireSequenceAuth(
  auth: StellarAuthSequence,
): StellarAuthSequence {
  if (auth === null || typeof auth !== "object") {
    throw new Error("A Stellar authentication object is required.");
  }

  const rejectedField = findRejectedField(auth);
  if (rejectedField) {
    throw new Error(
      `Client-supplied ${rejectedField} is not accepted for replay protection.`,
    );
  }
  if (typeof auth.publicKey !== "string" || auth.publicKey.trim().length === 0) {
    throw new Error("A Stellar public key is required.");
  }
  if (
    typeof auth.sequenceNumber !== "string" ||
    !/^\d+$/.test(auth.sequenceNumber)
  ) {
    throw new Error("A current Stellar account sequence number is required.");
  }
  return auth;
}
