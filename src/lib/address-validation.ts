const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STELLAR_ADDRESS = /^[GC][A-Z2-7]{55}$/;

export function isStellarAddress(value: unknown): boolean {
  return typeof value === "string" && STELLAR_ADDRESS.test(value.trim());
}

function decodeStellarPayload(address: string): Uint8Array | null {
  let bits = 0;
  let buffer = 0;
  const bytes: number[] = [];

  for (const char of address) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) return null;
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
      buffer &= (1 << bits) - 1;
    }
  }

  return Uint8Array.from(bytes);
}

export function isNonZeroAddress(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const address = value.trim();
  if (!address) return false;
  if (/^0[xX]0+$/.test(address)) return false;
  if (/^0+$/.test(address) && address.length >= 40) return false;

  if (!isStellarAddress(address)) {
    return !(/^[GC]/.test(address) && address.length === 56);
  }

  const payload = decodeStellarPayload(address);
  if (!payload || payload.length < 33) return false;
  return payload.slice(1, 33).some((byte) => byte !== 0);
}
