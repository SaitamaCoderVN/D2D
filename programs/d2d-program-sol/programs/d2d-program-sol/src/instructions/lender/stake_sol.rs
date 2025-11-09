use crate::errors::ErrorCode;
use crate::events::SolStaked;
use crate::states::{BackerDeposit, TreasuryPool};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

/// Stake SOL into treasury pool
/// Also referred to as "create deposit" in the new backer-focused terminology
/// SOL is transferred directly to Treasury Pool PDA (program-owned account)
#[derive(Accounts)]
pub struct StakeSol<'info> {
    #[account(
        mut,
        seeds = [TreasuryPool::PREFIX_SEED],
        bump = treasury_pool.bump
    )]
    pub treasury_pool: Account<'info, TreasuryPool>,
    #[account(
        init_if_needed,
        payer = lender,
        space = 8 + BackerDeposit::INIT_SPACE,
        seeds = [BackerDeposit::PREFIX_SEED, lender.key().as_ref()],
        bump
    )]
    pub lender_stake: Account<'info, BackerDeposit>,
    #[account(mut)]
    pub lender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Stake SOL into treasury pool (create deposit)
/// Returns a deposit receipt tracked in BackerDeposit account
pub fn stake_sol(ctx: Context<StakeSol>, amount: u64, lock_period: i64) -> Result<()> {
    let treasury_pool = &mut ctx.accounts.treasury_pool;
    let lender_stake = &mut ctx.accounts.lender_stake;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!treasury_pool.emergency_pause, ErrorCode::ProgramPaused);
    require!(amount > 0, ErrorCode::InvalidAmount);
    require!(lock_period >= 0, ErrorCode::InvalidLockPeriod);

    // Initialize backer deposit if first time
    if lender_stake.backer == Pubkey::default() {
        lender_stake.backer = ctx.accounts.lender.key();
        lender_stake.deposited_amount = 0;
        lender_stake.reward_debt = 0;
        lender_stake.last_claim_time = current_time;
        lender_stake.total_claimed = 0;
        lender_stake.deposit_time = current_time;
        lender_stake.lock_period = lock_period;
        lender_stake.is_active = true;
        lender_stake.deployments_supported = 0;
        lender_stake.bump = ctx.bumps.lender_stake;
    } else {
        require!(lender_stake.is_active, ErrorCode::InactiveStake);

        // Claim existing rewards before adding new deposit
        let rewards = lender_stake.calculate_rewards(treasury_pool)?;
        if rewards > 0 {
            lender_stake.reward_debt += rewards;
            lender_stake.last_claim_time = current_time;
        }
    }

    // Update deposit amount
    lender_stake.deposited_amount += amount;
    lender_stake.deposit_time = current_time; // Reset deposit time for duration calculation
    lender_stake.lock_period = lock_period;

    // Update treasury pool
    treasury_pool.total_staked += amount;

    // Transfer SOL directly to Treasury Pool PDA (program-owned account)
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.lender.to_account_info(),
            to: ctx.accounts.treasury_pool.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;

    emit!(SolStaked {
        lender: lender_stake.backer,
        amount,
        total_staked: lender_stake.deposited_amount,
        lock_period,
    });

    Ok(())
}
