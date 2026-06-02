'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader,
  ExternalLink,
  Copy,
} from 'lucide-react';

interface CampaignDeployFormProps {
  formData: Record<string, unknown>;
  onBack: () => void;
  onSuccess: (campaignId: string) => void;
}

interface DeployState {
  status: 'idle' | 'signing' | 'deploying' | 'success' | 'error';
  message?: string;
  campaignId?: string;
  txHash?: string;
  error?: string;
}

const CONTRACT_PARAMETERS = {
  ESTIMATED_STORAGE_FEE: 0.5,
  ESTIMATED_OPERATION_FEE: 0.1,
  TOTAL_ESTIMATED_FEE: 0.6,
};

export const CampaignDeployForm: React.FC<CampaignDeployFormProps> = ({
  formData,
  onBack,
  onSuccess,
}) => {
  const [deployState, setDeployState] = useState<DeployState>({
    status: 'idle',
  });
  const [copied, setCopied] = useState(false);

  const campaignTitle = (formData.title as string) || 'Campaign';
  const goalAmount = (formData.goalAmount as number) || 0;
  const network = (formData.network as string) || 'Mainnet';
  const acceptedAssets = (formData.acceptedAssets as string[]) || [];
  const duration = (formData.campaignDuration as number) || 0;

  const handleDeploy = async () => {
    try {
      setDeployState({
        status: 'signing',
        message: 'Waiting for wallet signature...',
      });

      // Simulate wallet signing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setDeployState({
        status: 'deploying',
        message: 'Deploying campaign to Stellar blockchain...',
      });

      // Simulate deployment delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mock successful deployment
      const mockCampaignId = `campaign_${Date.now()}`;
      const mockTxHash = `aca${Math.random().toString(16).slice(2, 64)}`;

      setDeployState({
        status: 'success',
        message: 'Campaign deployed successfully!',
        campaignId: mockCampaignId,
        txHash: mockTxHash,
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        onSuccess(mockCampaignId);
      }, 3000);
    } catch (err) {
      setDeployState({
        status: 'error',
        error:
          err instanceof Error ? err.message : 'Failed to deploy campaign',
      });
    }
  };

  const handleRetry = () => {
    setDeployState({ status: 'idle' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show success screen
  if (deployState.status === 'success') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campaign Deployed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your campaign has been secured on the Stellar blockchain.
          </p>

          {/* Success Details */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200 text-left space-y-4 max-w-lg mx-auto mb-6">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">Campaign ID</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 text-left">
                  {deployState.campaignId}
                </code>
                <button
                  onClick={() => copyToClipboard(deployState.campaignId || '')}
                  className="p-2 hover:bg-green-100 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">
                Transaction Hash
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 text-left truncate">
                  {deployState.txHash}
                </code>
                <button
                  onClick={() => copyToClipboard(deployState.txHash || '')}
                  className="p-2 hover:bg-green-100 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">Network</p>
              <p className="text-sm font-medium text-gray-900">{network}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Redirecting to campaign page in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  // Show error screen
  if (deployState.status === 'error') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">
                Deployment Failed
              </h3>
              <p className="text-sm text-red-800 mb-4">{deployState.error}</p>
              <details className="text-xs text-red-700">
                <summary className="cursor-pointer font-medium">
                  Technical Details
                </summary>
                <p className="mt-2 p-2 bg-red-100 rounded font-mono">
                  {deployState.error}
                </p>
              </details>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Troubleshooting:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Ensure you have sufficient balance for the network fee</li>
              <li>Check your wallet connection and try again</li>
              <li>Make sure you're on the correct blockchain network</li>
              <li>Try a different wallet if available</li>
            </ul>
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show deploying/signing screen
  if (deployState.status === 'signing' || deployState.status === 'deploying') {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {deployState.status === 'signing'
              ? 'Waiting for Signature'
              : 'Deploying Campaign'}
          </h2>
          <p className="text-gray-600">
            {deployState.status === 'signing'
              ? 'Please sign the transaction in your wallet'
              : 'Your campaign is being deployed to the Stellar blockchain...'}
          </p>

          {/* Progress indicators */}
          <div className="mt-8 max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                ✓
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Validation</p>
                <p className="text-xs text-gray-500">Campaign data verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                  deployState.status === 'signing'
                    ? 'bg-blue-600 text-white animate-pulse'
                    : deployState.status === 'deploying'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {deployState.status === 'deploying' ? '✓' : '2'}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {deployState.status === 'signing' ? 'Wallet Signing' : 'Signed'}
                </p>
                <p className="text-xs text-gray-500">
                  {deployState.status === 'signing'
                    ? 'Awaiting signature...'
                    : 'Transaction signed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                  deployState.status === 'deploying'
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {deployState.status === 'deploying' ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  '3'
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  Blockchain Deployment
                </p>
                <p className="text-xs text-gray-500">
                  Securing on Stellar...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show idle/initial state
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Deploy Campaign
        </h2>
        <p className="text-gray-600">
          Review the deployment parameters and sign with your wallet to deploy
          your campaign on the Stellar blockchain.
        </p>
      </div>

      {/* Deployment Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* Campaign Details */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Campaign Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Campaign Name</p>
              <p className="font-medium text-gray-900">{campaignTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Funding Goal</p>
              <p className="font-medium text-gray-900">
                {goalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Campaign Duration</p>
              <p className="font-medium text-gray-900">{duration} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Accepted Assets</p>
              <p className="font-medium text-gray-900">
                {acceptedAssets.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Parameters */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Smart Contract Parameters
          </h3>
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Network</p>
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {network}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Contract Type</p>
              <p className="text-sm font-medium text-gray-900">
                Crowdfunding Campaign
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Soroban Runtime</p>
              <p className="text-sm font-medium text-gray-900">Enabled</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Verification</p>
              <p className="text-sm font-medium text-gray-900">
                Admin-approved after submission
              </p>
            </div>
          </div>
        </div>

        {/* Network Fees */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Estimated Network Fees</h3>
          <div className="space-y-2 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Operation Fee</p>
              <p className="text-sm font-medium text-gray-900">
                {CONTRACT_PARAMETERS.ESTIMATED_OPERATION_FEE} XLM
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Storage Fee (estimated)</p>
              <p className="text-sm font-medium text-gray-900">
                {CONTRACT_PARAMETERS.ESTIMATED_STORAGE_FEE} XLM
              </p>
            </div>
            <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-900">Total Estimated</p>
              <p className="text-lg font-bold text-blue-600">
                {CONTRACT_PARAMETERS.TOTAL_ESTIMATED_FEE} XLM
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            💡 Fees may vary slightly based on network conditions. You'll see
            the exact amount before signing.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>⚠️ Important:</strong> Once deployed, campaign details
            cannot be modified. Please verify all information before proceeding.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 pt-6 border-t">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2"
          disabled={deployState.status !== 'idle'}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={handleDeploy}
          disabled={deployState.status !== 'idle'}
          className={`flex items-center gap-2 ${
            deployState.status === 'idle'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          {deployState.status === 'idle' && (
            <>
              🚀 Deploy Campaign
            </>
          )}
          {(deployState.status === 'signing' ||
            deployState.status === 'deploying') && (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Deploying...
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
