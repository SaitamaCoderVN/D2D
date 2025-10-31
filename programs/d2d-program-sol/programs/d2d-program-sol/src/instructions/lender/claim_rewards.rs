use crate::errors::ErrorCode;
use crate::events::RewardsClaimed;
use crate::states::{LenderStake, TreasuryPool};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        seeds = [TreasuryPool::PREFIX_SEED],
        bump = treasury_pool.bump
    )]
    pub treasury_pool: Account<'info, TreasuryPool>,
    #[account(
        mut,
        seeds = [LenderStake::PREFIX_SEED, lender.key().as_ref()],
        bump = lender_stake.bump
    )]
    pub lender_stake: Account<'info, LenderStake>,
    #[account(mut)]
    pub lender: Signer<'info>,
    /// CHECK: Treasury wallet address - validated against treasury_pool
    #[account(
        mut,
        constraint = treasury_wallet.key() == treasury_pool.treasury_wallet @ ErrorCode::InvalidTreasuryWallet
    )]
    pub treasury_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    let treasury_pool = &mut ctx.accounts.treasury_pool;
    let lender_stake = &mut ctx.accounts.lender_stake;

    require!(!treasury_pool.emergency_pause, ErrorCode::ProgramPaused);
    require!(lender_stake.is_active, ErrorCode::InactiveStake);

    // Calculate rewards
    let rewards = lender_stake.calculate_rewards(treasury_pool)?;
    require!(rewards > 0, ErrorCode::NoRewardsToClaim);

    // Check if treasury has enough funds
    require!(
        rewards <= treasury_pool.calculate_total_rewards()?,
        ErrorCode::InsufficientTreasuryFunds
    );

    // Update lender stake
    lender_stake.total_claimed += rewards;
    lender_stake.last_claim_time = Clock::get()?.unix_timestamp;

    // Update treasury pool
    treasury_pool.total_rewards_distributed += rewards;

    // Transfer rewards to lender
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.treasury_wallet.to_account_info(),
            to: ctx.accounts.lender.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, rewards)?;

    emit!(RewardsClaimed {
        lender: lender_stake.lender,
        amount: rewards,
        total_claimed: lender_stake.total_claimed,
    });

    Ok(())
}
