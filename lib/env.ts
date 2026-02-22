/**
 * src/lib/env.ts
 *
 * Type-safe environment variable validation for STELLARAID-WEB.
 * Uses @creit-tech/stellar-wallets-kit conventions.
 *
 * Usage:
 *   import { env, getStellarConfig, getWalletConfig } from '@/lib/env';
 */

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

type EnvSchema = {
  // ── Public ─────────────────────────────────────────────────────────────
  // API
  NEXT_PUBLIC_API_URL: string;

  // Stellar core
  NEXT_PUBLIC_STELLAR_NETWORK: 'testnet' | 'mainnet' | 'futurenet';
  NEXT_PUBLIC_STELLAR_HORIZON_URL: string;
  NEXT_PUBLIC_SOROBAN_RPC_URL: string;
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: string;

  // WalletConnect
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;
  NEXT_PUBLIC_WALLET_APP_NAME: string;
  NEXT_PUBLIC_WALLET_APP_DESCRIPTION: string;
  NEXT_PUBLIC_WALLET_APP_URL: string;
  NEXT_PUBLIC_WALLET_APP_ICON: string;

  // Freighter
  NEXT_PUBLIC_FREIGHTER_SHOW_WHEN_MISSING: string;

  // Albedo
  NEXT_PUBLIC_ALBEDO_CALLBACK_URL: string;

  // LOBSTR
  NEXT_PUBLIC_LOBSTR_ENABLED: string;

  // Rabet
  NEXT_PUBLIC_RABET_NETWORK: string;

  // xBull
  NEXT_PUBLIC_XBULL_ENABLED: string;

  // Hana
  NEXT_PUBLIC_HANA_ENABLED: string;

  // Default wallet
  NEXT_PUBLIC_DEFAULT_WALLET: string;

  // Third-party
  NEXT_PUBLIC_ANCHOR_URL: string;
  NEXT_PUBLIC_STELLAR_EXPERT_URL: string;
  NEXT_PUBLIC_COINGECKO_API_KEY: string;
  NEXT_PUBLIC_SENTRY_DSN: string;
  NEXT_PUBLIC_GA_MEASUREMENT_ID: string;

  // ── Server-only ────────────────────────────────────────────────────────
  AUTH_SECRET: string;
  DATABASE_URL: string;
  STELLAR_ADMIN_SECRET_KEY: string;
  REDIS_URL: string;
};

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

interface Rule {
  description: string;
  required: boolean;
  validate?: (value: string) => string | null;
}

const RULES: Record<keyof EnvSchema, Rule> = {
  // API
  NEXT_PUBLIC_API_URL: {
    description: 'Backend API base URL',
    required: true,
    validate: (v) => (isUrl(v) ? null : 'Must be a valid http/https URL'),
  },

  // Stellar core
  NEXT_PUBLIC_STELLAR_NETWORK: {
    description: 'Stellar network (testnet | mainnet | futurenet)',
    required: true,
    validate: (v) =>
      ['testnet', 'mainnet', 'futurenet'].includes(v)
        ? null
        : 'Must be one of: testnet | mainnet | futurenet',
  },
  NEXT_PUBLIC_STELLAR_HORIZON_URL: {
    description: 'Stellar Horizon server URL',
    required: true,
    validate: (v) => (isUrl(v) ? null : 'Must be a valid URL'),
  },
  NEXT_PUBLIC_SOROBAN_RPC_URL: {
    description: 'Soroban RPC endpoint URL',
    required: true,
    validate: (v) => (isUrl(v) ? null : 'Must be a valid URL'),
  },
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: {
    description: 'Stellar network passphrase',
    required: true,
  },

  // WalletConnect
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: {
    description: 'WalletConnect Cloud project ID — required for mobile wallet support',
    required: false,
  },
  NEXT_PUBLIC_WALLET_APP_NAME: {
    description: 'App name shown in wallet connection modals',
    required: true,
  },
  NEXT_PUBLIC_WALLET_APP_DESCRIPTION: {
    description: 'App description shown in WalletConnect modals',
    required: false,
  },
  NEXT_PUBLIC_WALLET_APP_URL: {
    description: 'App URL shown in WalletConnect modals',
    required: true,
    validate: (v) => (isUrl(v) ? null : 'Must be a valid URL'),
  },
  NEXT_PUBLIC_WALLET_APP_ICON: {
    description: 'App icon URL shown in WalletConnect modals',
    required: false,
    validate: (v) => (!v || isUrl(v) ? null : 'Must be a valid URL or empty'),
  },

  // Freighter
  NEXT_PUBLIC_FREIGHTER_SHOW_WHEN_MISSING: {
    description: 'Show Freighter option even when extension is not installed',
    required: false,
    validate: (v) =>
      !v || ['true', 'false'].includes(v) ? null : 'Must be "true" or "false"',
  },

  // Albedo
  NEXT_PUBLIC_ALBEDO_CALLBACK_URL: {
    description: 'Albedo OAuth callback URL (must be registered in Albedo dashboard)',
    required: false,
    validate: (v) => (!v || isUrl(v) ? null : 'Must be a valid URL or empty'),
  },

  // LOBSTR
  NEXT_PUBLIC_LOBSTR_ENABLED: {
    description: 'Include LOBSTR as a wallet option',
    required: false,
    validate: (v) =>
      !v || ['true', 'false'].includes(v) ? null : 'Must be "true" or "false"',
  },

  // Rabet
  NEXT_PUBLIC_RABET_NETWORK: {
    description: 'Network for Rabet wallet (TESTNET | MAINNET)',
    required: false,
    validate: (v) =>
      !v || ['TESTNET', 'MAINNET'].includes(v)
        ? null
        : 'Must be "TESTNET" or "MAINNET"',
  },

  // xBull
  NEXT_PUBLIC_XBULL_ENABLED: {
    description: 'Include xBull as a wallet option',
    required: false,
    validate: (v) =>
      !v || ['true', 'false'].includes(v) ? null : 'Must be "true" or "false"',
  },

  // Hana
  NEXT_PUBLIC_HANA_ENABLED: {
    description: 'Include Hana Wallet as a wallet option',
    required: false,
    validate: (v) =>
      !v || ['true', 'false'].includes(v) ? null : 'Must be "true" or "false"',
  },

  // Default wallet
  NEXT_PUBLIC_DEFAULT_WALLET: {
    description: 'Default wallet highlighted in modal',
    required: false,
    validate: (v) => {
      const valid = ['freighter', 'albedo', 'walletconnect', 'lobstr', 'rabet', 'xbull', 'hana'];
      return !v || valid.includes(v)
        ? null
        : `Must be one of: ${valid.join(' | ')}`;
    },
  },

  // Third-party
  NEXT_PUBLIC_ANCHOR_URL: { description: 'SEP-6/24 anchor endpoint', required: false },
  NEXT_PUBLIC_STELLAR_EXPERT_URL: { description: 'StellarExpert explorer base URL', required: false },
  NEXT_PUBLIC_COINGECKO_API_KEY: { description: 'CoinGecko API key', required: false },
  NEXT_PUBLIC_SENTRY_DSN: { description: 'Sentry DSN', required: false },
  NEXT_PUBLIC_GA_MEASUREMENT_ID: { description: 'Google Analytics measurement ID', required: false },

  // Server-only
  AUTH_SECRET: {
    description: 'JWT / session signing secret (min 32 chars)',
    required: true,
    validate: (v) => (v.length >= 32 ? null : 'Must be at least 32 characters'),
  },
  DATABASE_URL: {
    description: 'PostgreSQL connection string',
    required: true,
    validate: (v) =>
      v.startsWith('postgresql://') || v.startsWith('postgres://')
        ? null
        : 'Must be a valid PostgreSQL connection string',
  },
  STELLAR_ADMIN_SECRET_KEY: {
    description: 'Server-side Stellar signing key (starts with S)',
    required: false,
    validate: (v) =>
      !v || /^S[A-Z2-7]{55}$/.test(v)
        ? null
        : 'Must be a valid Stellar secret key (56 chars, starts with S)',
  },
  REDIS_URL: { description: 'Redis connection URL', required: false },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isServer(): boolean {
  return typeof window === 'undefined';
}

function bool(v: string | undefined, fallback = false): boolean {
  if (!v) return fallback;
  return v.toLowerCase() === 'true';
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type ValidationResult = { valid: boolean; errors: string[]; warnings: string[] };

export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, rule] of Object.entries(RULES) as [keyof EnvSchema, Rule][]) {
    const isPublic = key.startsWith('NEXT_PUBLIC_');
    if (!isPublic && !isServer()) continue;

    const value = process.env[key] ?? '';

    if (!value) {
      if (rule.required) {
        errors.push(`❌ Missing required variable: ${key}\n   → ${rule.description}`);
      } else {
        warnings.push(`⚠️  Optional variable not set: ${key} — ${rule.description}`);
      }
      continue;
    }

    if (rule.validate) {
      const err = rule.validate(value);
      if (err) errors.push(`❌ Invalid ${key}: ${err}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/** Call at build / server boot time — throws with clear message if invalid. */
export function assertEnv(): void {
  const { valid, errors, warnings } = validateEnv();

  if (warnings.length) {
    console.warn('[env] Optional variables not configured:');
    warnings.forEach((w) => console.warn('  ', w));
  }

  if (!valid) {
    throw new Error(
      [
        '[env] ❌ Build failed — required environment variables are missing or invalid:',
        ...errors.map((e) => `  ${e}`),
        '',
        'Tip: Copy .env.example to .env.local and fill in the required values.',
      ].join('\n'),
    );
  }
}

// ---------------------------------------------------------------------------
// Typed accessor
// ---------------------------------------------------------------------------

export const env = new Proxy({} as EnvSchema, {
  get(_t, prop: string) {
    const value = process.env[prop];
    if (value === undefined) {
      const rule = RULES[prop as keyof EnvSchema];
      if (rule?.required) {
        throw new Error(`[env] Required env var "${prop}" is not set.`);
      }
      return '';
    }
    return value;
  },
}) as Readonly<EnvSchema>;

// ---------------------------------------------------------------------------
// Convenience config helpers
// ---------------------------------------------------------------------------

export type StellarConfig = {
  network: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
  networkPassphrase: string;
};

/** Returns typed Stellar network config from env. */
export function getStellarConfig(): StellarConfig {
  return {
    network: env.NEXT_PUBLIC_STELLAR_NETWORK,
    horizonUrl: env.NEXT_PUBLIC_STELLAR_HORIZON_URL,
    sorobanRpcUrl: env.NEXT_PUBLIC_SOROBAN_RPC_URL,
    networkPassphrase: env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  };
}

export type WalletConfig = {
  walletConnectProjectId: string;
  appName: string;
  appDescription: string;
  appUrl: string;
  appIcon: string;
  defaultWallet: string;
  freighterShowWhenMissing: boolean;
  albedoCallbackUrl: string;
  lobstrEnabled: boolean;
  raberNetwork: string;
  xbullEnabled: boolean;
  hanaEnabled: boolean;
};

/**
 * Returns all wallet-related config ready to pass into StellarWalletsKit.
 *
 * @example
 *   import { StellarWalletsKit, WalletNetwork } from '@creit-tech/stellar-wallets-kit';
 *   import { getWalletConfig, getStellarConfig } from '@/lib/env';
 *
 *   const { network } = getStellarConfig();
 *   const wallet = getWalletConfig();
 *
 *   const kit = new StellarWalletsKit({
 *     network: network === 'mainnet' ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
 *     selectedWalletId: wallet.defaultWallet,
 *     modules: [ ... ],
 *   });
 *
 *   // WalletConnect module config:
 *   // { projectId: wallet.walletConnectProjectId, name: wallet.appName, ... }
 */
export function getWalletConfig(): WalletConfig {
  return {
    walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    appName: env.NEXT_PUBLIC_WALLET_APP_NAME,
    appDescription: env.NEXT_PUBLIC_WALLET_APP_DESCRIPTION,
    appUrl: env.NEXT_PUBLIC_WALLET_APP_URL,
    appIcon: env.NEXT_PUBLIC_WALLET_APP_ICON,
    defaultWallet: env.NEXT_PUBLIC_DEFAULT_WALLET || 'freighter',
    freighterShowWhenMissing: bool(env.NEXT_PUBLIC_FREIGHTER_SHOW_WHEN_MISSING, true),
    albedoCallbackUrl: env.NEXT_PUBLIC_ALBEDO_CALLBACK_URL,
    lobstrEnabled: bool(env.NEXT_PUBLIC_LOBSTR_ENABLED, true),
    raberNetwork: env.NEXT_PUBLIC_RABET_NETWORK || 'TESTNET',
    xbullEnabled: bool(env.NEXT_PUBLIC_XBULL_ENABLED, true),
    hanaEnabled: bool(env.NEXT_PUBLIC_HANA_ENABLED, false),
  };
}