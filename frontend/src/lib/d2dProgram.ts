import { AnchorProvider, BN, Idl, BorshInstructionCoder } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import rawIdl from '@/idl/d2d_program_sol.json';

const idlCandidate = rawIdl as { default?: Idl } | Idl;

const resolvedIdl = ('default' in idlCandidate ? idlCandidate.default : idlCandidate) as Idl;

if (!(resolvedIdl as any).__logged) {
  console.debug('[D2D] Loaded IDL keys:', Object.keys(resolvedIdl));
  (resolvedIdl as any).__logged = true;
}

if (!resolvedIdl.accounts || resolvedIdl.accounts.length === 0) {
  console.error('[D2D] Loaded IDL has no accounts section. Ensure full IDL JSON is copied.');
}

export const D2D_PROGRAM_ID = new PublicKey((resolvedIdl as any).address);
export const TREASURY_POOL_SEED = Buffer.from('treasury_pool');
export const LENDER_STAKE_SEED = Buffer.from('lender_stake');

const instructionCoder = new BorshInstructionCoder(resolvedIdl);

export type AnchorWallet = {
  publicKey: PublicKey;
  signTransaction: NonNullable<WalletContextState['signTransaction']>;
  signAllTransactions: NonNullable<WalletContextState['signAllTransactions']>;
  sendTransaction: NonNullable<WalletContextState['sendTransaction']>;
};

export const getAnchorProvider = (
  connection: Connection,
  wallet: WalletContextState,
): AnchorProvider => {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions || !wallet.sendTransaction) {
    throw new Error('Wallet does not support required signing methods');
  }

  return new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
      sendTransaction: wallet.sendTransaction,
    } as AnchorWallet,
    { commitment: 'confirmed' },
  );
};

export const getTreasuryPoolPda = (): PublicKey => {
  const [treasuryPool] = PublicKey.findProgramAddressSync([TREASURY_POOL_SEED], D2D_PROGRAM_ID);
  return treasuryPool;
};

export const getBackerDepositPda = (backer: PublicKey): PublicKey => {
  const [deposit] = PublicKey.findProgramAddressSync([
    LENDER_STAKE_SEED,
    backer.toBuffer(),
  ], D2D_PROGRAM_ID);
  return deposit;
};

export const createStakeSolInstruction = (
  amountLamports: number,
  lockPeriod: number,
  lender: PublicKey,
): TransactionInstruction => {
  const data = instructionCoder.encode('stake_sol', {
    amount: new BN(amountLamports),
    lockPeriod: new BN(lockPeriod),
  });

  return new TransactionInstruction({
    programId: D2D_PROGRAM_ID,
    keys: [
      { pubkey: getTreasuryPoolPda(), isWritable: true, isSigner: false },
      { pubkey: getBackerDepositPda(lender), isWritable: true, isSigner: false },
      { pubkey: lender, isWritable: true, isSigner: true },
      { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
    ],
    data,
  });
};

export const createClaimRewardsInstruction = (lender: PublicKey): TransactionInstruction => {
  const data = instructionCoder.encode('claim_rewards', {});

  return new TransactionInstruction({
    programId: D2D_PROGRAM_ID,
    keys: [
      { pubkey: getTreasuryPoolPda(), isWritable: true, isSigner: false },
      { pubkey: getBackerDepositPda(lender), isWritable: true, isSigner: false },
      { pubkey: lender, isWritable: true, isSigner: true },
      { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
    ],
    data,
  });
};

export const prepareTransaction = async (
  connection: Connection,
  payer: PublicKey,
  instruction: TransactionInstruction,
): Promise<Transaction> => {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  const tx = new Transaction({ feePayer: payer, blockhash, lastValidBlockHeight });
  tx.add(instruction);
  return tx;
};

export const toBN = (amount: number): BN => {
  return new BN(Math.floor(amount));
};
