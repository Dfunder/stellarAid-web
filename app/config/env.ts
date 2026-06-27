'use client';

/**
 * Environment configuration with type safety and validation
 */

interface EnvConfig {
  apiBaseUrl: string;
  stellarNetwork: 'testnet' | 'mainnet';
  campaignContractId: string;
  donationContractId: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// List of required environment variables
const requiredEnvVars = [
  { key: 'NEXT_PUBLIC_API_BASE_URL', name: 'API Base URL' },
  { key: 'NEXT_PUBLIC_STELLAR_NETWORK', name: 'Stellar Network' },
  { key: 'NEXT_PUBLIC_CAMPAIGN_CONTRACT_ID', name: 'Campaign Contract ID' },
  { key: 'NEXT_PUBLIC_DONATION_CONTRACT_ID', name: 'Donation Contract ID' },
];

// Validate environment variables on app startup
const validateEnv = (): void => {
  const missingVars: string[] = [];

  requiredEnvVars.forEach(({ key, name }) => {
    if (!process.env[key]) {
      missingVars.push(name);
    }
  });

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'Refer to .env.example for the complete list of required variables.'
    );
  } else {
    console.log('✅ All environment variables loaded successfully');
  }
};

// Fallback defaults for development
const getEnvValue = (key: string, fallback: string): string => {
  return process.env[key] || fallback;
};

// Create and export the environment configuration
const env: EnvConfig = {
  apiBaseUrl: getEnvValue('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:3000/api'),
  stellarNetwork: getEnvValue('NEXT_PUBLIC_STELLAR_NETWORK', 'testnet') as 'testnet' | 'mainnet',
  campaignContractId: getEnvValue('NEXT_PUBLIC_CAMPAIGN_CONTRACT_ID', ''),
  donationContractId: getEnvValue('NEXT_PUBLIC_DONATION_CONTRACT_ID', ''),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Run validation immediately when the module is imported
validateEnv();

export default env;