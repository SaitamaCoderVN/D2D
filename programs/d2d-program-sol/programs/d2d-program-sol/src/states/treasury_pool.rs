use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TreasuryPool {
    pub total_staked: u64,              // Total SOL staked by all lenders
    pub total_rewards_distributed: u64, // Total rewards distributed
    pub total_fees_collected: u64,      // Total fees from developers
    pub current_apy: u64,               // Current APY in basis points (100 = 1%)
    pub last_distribution_time: i64,    // Last distribution timestamp
    pub emergency_pause: bool,          // Emergency pause flag
    pub admin: Pubkey,                  // Admin public key
    pub treasury_wallet: Pubkey,        // Treasury wallet address
    pub bump: u8,                       // PDA bump
}

impl TreasuryPool {
    pub const PREFIX_SEED: &'static [u8] = b"treasury_pool";

    pub fn calculate_total_rewards(&self) -> Result<u64> {
        // Use checked arithmetic to prevent overflow
        self.total_fees_collected
            .checked_sub(self.total_rewards_distributed)
            .ok_or_else(|| ErrorCode::CalculationOverflow.into())
    }

    pub fn update_apy(&mut self, new_apy: u64) -> Result<()> {
        // Validate APY range (0-10000 basis points = 0-100%)
        require!(new_apy <= 10000, ErrorCode::InvalidAmount);
        self.current_apy = new_apy;
        Ok(())
    }

    pub fn distribute_fees(&mut self, fees: u64) -> Result<()> {
        // Use checked arithmetic to prevent overflow
        self.total_fees_collected = self
            .total_fees_collected
            .checked_add(fees)
            .ok_or_else(|| ErrorCode::CalculationOverflow)?;
        Ok(())
    }
}
