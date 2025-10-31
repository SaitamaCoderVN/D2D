use crate::errors::ErrorCode;
use crate::events::SolUnstaked;
use crate::states::{LenderStake, TreasuryPool};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct UnstakeSol<'info> {
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

pub fn unstake_sol(ctx: Context<UnstakeSol>, amount: u64) -> Result<()> {
    let treasury_pool = &mut ctx.accounts.treasury_pool;
    let lender_stake = &mut ctx.accounts.lender_stake;

    require!(!treasury_pool.emergency_pause, ErrorCode::ProgramPaused);
    require!(lender_stake.is_active, ErrorCode::InactiveStake);
    require!(amount > 0, ErrorCode::InvalidAmount);
    require!(
        amount <= lender_stake.staked_amount,
        ErrorCode::InsufficientStake
    );
    require!(!lender_stake.is_locked(), ErrorCode::StakeLocked);

    // Claim rewards before unstaking
    let rewards = lender_stake.calculate_rewards(treasury_pool)?;
    if rewards > 0 {
        lender_stake.reward_debt += rewards;
        lender_stake.last_claim_time = Clock::get()?.unix_timestamp;
    }

    // Update stake amount
    lender_stake.staked_amount -= amount;

    // If fully unstaked, deactivate
    if lender_stake.staked_amount == 0 {
        lender_stake.is_active = false;
    }

    // Update treasury pool
    treasury_pool.total_staked -= amount;

    // Transfer SOL back to lender
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.treasury_wallet.to_account_info(),
            to: ctx.accounts.lender.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;

    emit!(SolUnstaked {
        lender: lender_stake.lender,
        amount,
        remaining_staked: lender_stake.staked_amount,
    });

    Ok(())
}
