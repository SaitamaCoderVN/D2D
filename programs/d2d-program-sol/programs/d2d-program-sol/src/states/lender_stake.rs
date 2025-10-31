use crate::errors::ErrorCode;
use crate::states::TreasuryPool;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct LenderStake {
    pub lender: Pubkey,       // Lender public key
    pub staked_amount: u64,   // Amount of SOL staked
    pub reward_debt: u64,     // Reward debt for compound calculation
    pub last_claim_time: i64, // Last claim timestamp
    pub total_claimed: u64,   // Total rewards claimed
    pub stake_time: i64,      // When staking started
    pub lock_period: i64,     // Lock period in seconds (0 = flexible)
    pub is_active: bool,      // Is stake active
    pub bump: u8,             // PDA bump
}

impl LenderStake {
    pub const PREFIX_SEED: &'static [u8] = b"lender_stake";

    pub fn is_locked(&self) -> bool {
        if self.lock_period == 0 {
            return false;
        }
        let current_time = Clock::get().unwrap().unix_timestamp;
        current_time < self.stake_time + self.lock_period
    }

    pub fn calculate_rewards(&self, treasury: &TreasuryPool) -> Result<u64> {
        if !self.is_active || treasury.total_staked == 0 {
            return Ok(0);
        }

        let current_time = Clock::get()?.unix_timestamp;
        let time_elapsed = current_time - self.last_claim_time;

        if time_elapsed <= 0 {
            return Ok(0);
        }

        // Prevent overflow by checking maximum time elapsed (1 year)
        if time_elapsed > 365 * 24 * 60 * 60 {
            return Err(ErrorCode::TimeElapsedTooLarge.into());
        }

        // Use u128 for intermediate calculations to prevent overflow
        let staked_amount_u128 = self.staked_amount as u128;
        let apy_u128 = treasury.current_apy as u128;
        let time_elapsed_u128 = time_elapsed as u128;

        // Calculate reward with proper precision handling
        // Formula: (staked_amount * APY * time_elapsed) / (10000 * 86400 * 365)
        // We multiply by 1e18 first for precision, then divide at the end

        let precision_multiplier = 1_000_000_000_000_000_000u128; // 1e18

        // Calculate numerator: staked_amount * APY * time_elapsed * precision_multiplier
        let numerator = staked_amount_u128
            .checked_mul(apy_u128)
            .ok_or(ErrorCode::CalculationOverflow)?
            .checked_mul(time_elapsed_u128)
            .ok_or(ErrorCode::CalculationOverflow)?
            .checked_mul(precision_multiplier)
            .ok_or(ErrorCode::CalculationOverflow)?;

        // Calculate denominator: 10000 * 86400 * 365
        let denominator = 10000u128 * 86400u128 * 365u128;

        // Perform division
        let reward_precise = numerator / denominator;

        // Convert back to u64 (divide by precision_multiplier)
        let reward = (reward_precise / 1_000_000_000_000_000_000u128) as u64;

        Ok(reward)
    }
}
