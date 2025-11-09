use crate::errors::ErrorCode;
use crate::events::SolUnstaked;
use crate::states::{BackerDeposit, TreasuryPool};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

/// Unstake SOL from treasury pool
/// Also referred to as "request withdrawal" in the new backer-focused terminology
/// Calculates duration-based rewards before withdrawal
/// SOL is withdrawn from Treasury Pool PDA (program-owned account)
#[derive(Accounts)]
pub struct UnstakeSol<'info> {
    #[account(
        mut,
        seeds = [TreasuryPool::PREFIX_SEED],
        bump = treasury_pool.bump
    )]
    pub treasury_pool: Account<'info, TreasuryPool>,
    #[account(
        mut,
        seeds = [BackerDeposit::PREFIX_SEED, lender.key().as_ref()],
        bump = lender_stake.bump
    )]
    pub lender_stake: Account<'info, BackerDeposit>,
    #[account(mut)]
    pub lender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Unstake SOL from treasury pool (request withdrawal with duration-based rewards)
/// Early withdrawal = lower rewards, Long-term = higher rewards
pub fn unstake_sol(ctx: Context<UnstakeSol>, amount: u64) -> Result<()> {
    let treasury_pool = &mut ctx.accounts.treasury_pool;
    let lender_stake = &mut ctx.accounts.lender_stake;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!treasury_pool.emergency_pause, ErrorCode::ProgramPaused);
    require!(lender_stake.is_active, ErrorCode::InactiveStake);
    require!(amount > 0, ErrorCode::InvalidAmount);
    require!(
        amount <= lender_stake.deposited_amount,
        ErrorCode::InsufficientStake
    );
    require!(!lender_stake.is_locked(), ErrorCode::StakeLocked);

    // Calculate duration-based rewards before withdrawal
    let rewards = lender_stake.calculate_rewards_with_duration_bonus(treasury_pool)?;
    let total_withdrawal = amount + rewards;

    // Ensure treasury has enough funds for withdrawal + rewards
    require!(
        total_withdrawal <= treasury_pool.total_staked,
        ErrorCode::InsufficientTreasuryFunds
    );

    // Update backer deposit
    lender_stake.deposited_amount -= amount;
    if rewards > 0 {
        lender_stake.total_claimed += rewards;
        lender_stake.last_claim_time = current_time;
    }

    // If fully withdrawn, deactivate
    if lender_stake.deposited_amount == 0 {
        lender_stake.is_active = false;
    }

    // Update treasury pool
    treasury_pool.total_staked -= total_withdrawal;
    if rewards > 0 {
        treasury_pool.total_rewards_distributed += rewards;
    }

    // Transfer principal + rewards back to backer from Treasury Pool PDA
    // Use PDA seeds for signing
    let treasury_pool_seeds = &[
        TreasuryPool::PREFIX_SEED,
        &[ctx.accounts.treasury_pool.bump],
    ];
    let signer_seeds = &[&treasury_pool_seeds[..]];
    
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.treasury_pool.to_account_info(),
            to: ctx.accounts.lender.to_account_info(),
        },
        signer_seeds,
    );
    system_program::transfer(cpi_context, total_withdrawal)?;

    emit!(SolUnstaked {
        lender: lender_stake.backer,
        amount: total_withdrawal,
        remaining_staked: lender_stake.deposited_amount,
    });

    Ok(())
}
