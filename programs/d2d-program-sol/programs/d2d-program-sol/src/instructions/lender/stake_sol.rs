use crate::errors::ErrorCode;
use crate::events::SolStaked;
use crate::states::{LenderStake, TreasuryPool};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct StakeSol<'info> {
    #[account(
        seeds = [TreasuryPool::PREFIX_SEED],
        bump = treasury_pool.bump
    )]
    pub treasury_pool: Account<'info, TreasuryPool>,
    #[account(
        init_if_needed,
        payer = lender,
        space = 8 + LenderStake::INIT_SPACE,
        seeds = [LenderStake::PREFIX_SEED, lender.key().as_ref()],
        bump
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

pub fn stake_sol(ctx: Context<StakeSol>, amount: u64, lock_period: i64) -> Result<()> {
    let treasury_pool = &mut ctx.accounts.treasury_pool;
    let lender_stake = &mut ctx.accounts.lender_stake;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!treasury_pool.emergency_pause, ErrorCode::ProgramPaused);
    require!(amount > 0, ErrorCode::InvalidAmount);
    require!(lock_period >= 0, ErrorCode::InvalidLockPeriod);

    // Initialize lender stake if first time
    if lender_stake.lender == Pubkey::default() {
        lender_stake.lender = ctx.accounts.lender.key();
        lender_stake.staked_amount = 0;
        lender_stake.reward_debt = 0;
        lender_stake.last_claim_time = current_time;
        lender_stake.total_claimed = 0;
        lender_stake.stake_time = current_time;
        lender_stake.lock_period = lock_period;
        lender_stake.is_active = true;
        lender_stake.bump = ctx.bumps.lender_stake;
    } else {
        require!(lender_stake.is_active, ErrorCode::InactiveStake);

        // Claim existing rewards before adding new stake
        let rewards = lender_stake.calculate_rewards(treasury_pool)?;
        if rewards > 0 {
            lender_stake.reward_debt += rewards;
            lender_stake.last_claim_time = current_time;
        }
    }

    // Update stake amount
    lender_stake.staked_amount += amount;
    lender_stake.stake_time = current_time;
    lender_stake.lock_period = lock_period;

    // Update treasury pool
    treasury_pool.total_staked += amount;

    // Transfer SOL to treasury
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.lender.to_account_info(),
            to: ctx.accounts.treasury_wallet.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;

    emit!(SolStaked {
        lender: lender_stake.lender,
        amount,
        total_staked: lender_stake.staked_amount,
        lock_period,
    });

    Ok(())
}
