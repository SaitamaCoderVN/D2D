use crate::errors::ErrorCode;
use crate::states::TreasuryPool;
use anchor_lang::prelude::*;

/// Backer's deposit position in the pool
/// Renamed from LenderStake for better clarity
#[account]
#[derive(InitSpace)]
pub struct BackerDeposit {
    pub backer: Pubkey,          // Backer public key
    pub deposited_amount: u64,   // Amount of SOL deposited
    pub reward_debt: u64,        // Reward debt for compound calculation
    pub last_claim_time: i64,    // Last claim timestamp
    pub total_claimed: u64,      // Total rewards claimed
    pub deposit_time: i64,       // When deposit was made
    pub lock_period: i64,        // Lock period in seconds (0 = flexible)
    pub is_active: bool,         // Is deposit active
    pub deployments_supported: u32, // Number of deployments this deposit helped fund
    pub bump: u8,                // PDA bump
}

/// Legacy alias for backward compatibility
pub type LenderStake = BackerDeposit;

impl BackerDeposit {
    pub const PREFIX_SEED: &'static [u8] = b"lender_stake"; // Keep same seed for backward compatibility

    pub fn is_locked(&self) -> bool {
        if self.lock_period == 0 {
            return false;
        }
        let current_time = Clock::get().unwrap().unix_timestamp;
        current_time < self.deposit_time + self.lock_period
    }

    /// Calculate duration-based rewards
    /// Early withdrawal = lower reward multiplier
    /// Long-term backers = higher yield multiplier
    pub fn calculate_rewards_with_duration_bonus(&self, treasury: &TreasuryPool) -> Result<u64> {
        if !self.is_active || treasury.total_staked == 0 {
            return Ok(0);
        }

        let current_time = Clock::get()?.unix_timestamp;
        let time_elapsed = current_time - self.last_claim_time;
        let total_duration = current_time - self.deposit_time;

        if time_elapsed <= 0 {
            return Ok(0);
        }

        // Prevent overflow by checking maximum time elapsed (1 year)
        if time_elapsed > 365 * 24 * 60 * 60 {
            return Err(ErrorCode::TimeElapsedTooLarge.into());
        }

        // Base reward calculation
        let base_reward = self.calculate_base_reward(treasury, time_elapsed)?;

        // Duration bonus multiplier (in basis points, 10000 = 1x):
        // < 7 days: 0.5x (5000)
        // 7-30 days: 1.0x (10000)
        // 30-90 days: 1.5x (15000)
        // 90-180 days: 2.0x (20000)
        // > 180 days: 3.0x (30000)
        let duration_multiplier = if total_duration < 7 * 86400 {
            5000u64 // 0.5x
        } else if total_duration < 30 * 86400 {
            10000u64 // 1.0x
        } else if total_duration < 90 * 86400 {
            15000u64 // 1.5x
        } else if total_duration < 180 * 86400 {
            20000u64 // 2.0x
        } else {
            30000u64 // 3.0x
        };

        // Deployment support bonus: +10% per deployment (capped at 50%)
        let deployment_bonus = (self.deployments_supported as u64).min(5) * 1000; // Max +5000 (50%)

        // Total multiplier
        let total_multiplier = duration_multiplier + deployment_bonus;

        // Apply multiplier
        let final_reward = (base_reward as u128)
            .checked_mul(total_multiplier as u128)
            .ok_or(ErrorCode::CalculationOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::CalculationOverflow)? as u64;

        Ok(final_reward)
    }

    /// Calculate base reward (APY-based)
    fn calculate_base_reward(&self, treasury: &TreasuryPool, time_elapsed: i64) -> Result<u64> {
        // Use u128 for intermediate calculations to prevent overflow
        let deposited_amount_u128 = self.deposited_amount as u128;
        let apy_u128 = treasury.current_apy as u128;
        let time_elapsed_u128 = time_elapsed as u128;

        // Calculate reward with proper precision handling
        // Formula: (deposited_amount * APY * time_elapsed) / (10000 * 86400 * 365)
        let precision_multiplier = 1_000_000_000_000_000_000u128; // 1e18

        let numerator = deposited_amount_u128
            .checked_mul(apy_u128)
            .ok_or(ErrorCode::CalculationOverflow)?
            .checked_mul(time_elapsed_u128)
            .ok_or(ErrorCode::CalculationOverflow)?
            .checked_mul(precision_multiplier)
            .ok_or(ErrorCode::CalculationOverflow)?;

        let denominator = 10000u128 * 86400u128 * 365u128;
        let reward_precise = numerator / denominator;
        let reward = (reward_precise / 1_000_000_000_000_000_000u128) as u64;

        Ok(reward)
    }

    /// Legacy method for backward compatibility
    pub fn calculate_rewards(&self, treasury: &TreasuryPool) -> Result<u64> {
        self.calculate_rewards_with_duration_bonus(treasury)
    }
}
