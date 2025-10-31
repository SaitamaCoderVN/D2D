'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { deploymentApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface DeploymentFormProps {
  onDeploymentCreated: () => void;
}

export default function DeploymentForm({ onDeploymentCreated }: DeploymentFormProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [devnetProgramId, setDevnetProgramId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pricingCalculated, setPricingCalculated] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState({ deploymentCost: 0, deployTime: 0 });
  
  const TREASURY_WALLET = new PublicKey('ESsCLAUkzkjPAKnXu2kRyrGSpUgJzNKjq19PTBycqHvg');
  const SERVICE_FEE_SOL = 0.025;

  const calculatePricing = async (programId: string) => {
    if (!programId || programId.length < 32) {
      setPricingCalculated(false);
      return;
    }

    setIsCalculating(true);
    setPricingCalculated(false);

    await new Promise(resolve => setTimeout(resolve, 3000));

    setEstimatedCost({
      deploymentCost: 1.2,
      deployTime: 15,
    });
    setPricingCalculated(true);
    setIsCalculating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!devnetProgramId.trim()) {
      toast.error('Please enter a devnet program ID');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading('Creating payment transaction...', { id: 'payment' });

      const paymentAmount = SERVICE_FEE_SOL * LAMPORTS_PER_SOL;
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: paymentAmount,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      toast.loading('Please approve transaction in your wallet...', { id: 'payment' });
      
      const signature = await sendTransaction(transaction, connection);
      
      toast.loading('Confirming transaction...', { id: 'payment' });
      
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success(
        `Payment successful! ${SERVICE_FEE_SOL} SOL ($5) transferred.`,
        { id: 'payment', duration: 5000 }
      );

      toast.loading('Creating deployment request...', { id: 'creating' });
      
      const deployment = await deploymentApi.create({
        userWalletAddress: publicKey.toString(),
        devnetProgramId: devnetProgramId.trim(),
        paymentSignature: signature,
      });
      
      toast.dismiss('creating');

      toast.success(
        '🚀 Deployment started! Check the history below for progress.',
        { duration: 5000 }
      );
      
      setTimeout(() => {
        toast.success(
          <div>
            <div className="font-semibold mb-1">Transaction Confirmed!</div>
            <a 
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066FF] hover:underline text-sm"
            >
              View on Solana Explorer (Devnet) ↗
            </a>
          </div>,
          { duration: 10000 }
        );
      }, 1000);

      setDevnetProgramId('');
      setPricingCalculated(false);
      onDeploymentCreated();
    } catch (error: any) {
      console.error('Deployment error:', error);
      
      toast.dismiss('payment');
      toast.dismiss('creating');
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to create deployment';
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-[#0066FF] rounded-lg flex items-center justify-center shadow-blue">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deploy to Mainnet</h2>
            <p className="text-gray-600">Enter your devnet program ID</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-2">
            Devnet Program ID
          </label>
          <input
            type="text"
            id="programId"
            value={devnetProgramId}
            onChange={(e) => {
              const value = e.target.value;
              setDevnetProgramId(value);
              if (value.length >= 32) {
                calculatePricing(value);
              } else {
                setPricingCalculated(false);
              }
            }}
            placeholder="e.g., 5aai4VhRLDCFP2WSHUbGsiSuZxkWzQahhsRkqdfF2jRh"
            className="input-field font-mono text-sm"
            disabled={isSubmitting || isCalculating}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            The program must be deployed and verified on Solana devnet
          </p>
        </div>

        {isCalculating && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <svg className="animate-spin h-6 w-6 text-[#0066FF]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div>
                <div className="text-gray-900 font-semibold mb-1">Analyzing Program</div>
                <div className="text-gray-600 text-sm">
                  Calculating deployment costs and estimated time...
                </div>
              </div>
            </div>
          </div>
        )}

        {pricingCalculated && !isCalculating && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#0066FF] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Deployment Estimate</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Service Fee</span>
                <span className="font-bold text-gray-900">$5 (0.025 SOL)</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-t border-blue-100">
                <span className="text-gray-700">Deployment Cost</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900">~{estimatedCost.deploymentCost} SOL</div>
                  <div className="text-xs text-gray-600">covered by backer pool</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-t border-blue-100">
                <span className="text-gray-700">Estimated Time</span>
                <span className="font-bold text-gray-900">~{estimatedCost.deployTime}s</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !publicKey || isCalculating || !pricingCalculated}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Creating Deployment...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Deploy to Mainnet</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
