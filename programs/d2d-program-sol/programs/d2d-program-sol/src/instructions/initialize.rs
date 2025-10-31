use crate::events::TreasuryInitialized;
use crate::states::TreasuryPool;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + TreasuryPool::INIT_SPACE,
        seeds = [TreasuryPool::PREFIX_SEED],
        bump
    )]
    pub treasury_pool: Account<'info, TreasuryPool>,
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: Treasury wallet address
    pub treasury_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize(
    ctx: Context<Initialize>,
    initial_apy: u64,
    treasury_wallet: Pubkey,
) -> Result<()> {
    let treasury_pool = &mut ctx.accounts.treasury_pool;
    let current_time = Clock::get()?.unix_timestamp;

    treasury_pool.total_staked = 0;
    treasury_pool.total_rewards_distributed = 0;
    treasury_pool.total_fees_collected = 0;
    treasury_pool.current_apy = initial_apy;
    treasury_pool.last_distribution_time = current_time;
    treasury_pool.emergency_pause = false;
    treasury_pool.admin = ctx.accounts.admin.key();
    treasury_pool.treasury_wallet = treasury_wallet;
    treasury_pool.bump = ctx.bumps.treasury_pool;

    emit!(TreasuryInitialized {
        admin: treasury_pool.admin,
        treasury_wallet,
        initial_apy,
    });

    Ok(())
}
