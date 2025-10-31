use crate::errors::ErrorCode;
use crate::events::{DeploymentConfirmed, DeploymentFailed};
use crate::states::{DeployRequest, DeployRequestStatus, TreasuryPool};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct ConfirmDeployment<'info> {
    #[account(
        seeds = [TreasuryPool::PREFIX_SEED],
        bump = treasury_pool.bump
    )]
    pub treasury_pool: Account<'info, TreasuryPool>,
    #[account(
        mut,
        seeds = [DeployRequest::PREFIX_SEED, deploy_request.program_hash.as_ref()],
        bump = deploy_request.bump
    )]
    pub deploy_request: Account<'info, DeployRequest>,
    #[account(
        mut,
        constraint = admin.key() == treasury_pool.admin @ ErrorCode::Unauthorized
    )]
    pub admin: Signer<'info>,
    /// CHECK: Treasury wallet address - validated against treasury_pool
    #[account(
        mut,
        constraint = treasury_wallet.key() == treasury_pool.treasury_wallet @ ErrorCode::InvalidTreasuryWallet
    )]
    pub treasury_wallet: UncheckedAccount<'info>,
    /// CHECK: Developer wallet for refund if deployment fails
    #[account(mut)]
    pub developer_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn confirm_deployment_success(
    ctx: Context<ConfirmDeployment>,
    request_id: [u8; 32],
    deployed_program_id: Pubkey,
) -> Result<()> {
    let treasury_pool = &mut ctx.accounts.treasury_pool;
    let deploy_request = &mut ctx.accounts.deploy_request;

    require!(!treasury_pool.emergency_pause, ErrorCode::ProgramPaused);
    require!(
        deploy_request.request_id == request_id,
        ErrorCode::InvalidRequestId
    );
    require!(
        deploy_request.status == DeployRequestStatus::PendingDeployment,
        ErrorCode::InvalidRequestStatus
    );

    // Update deploy request
    deploy_request.status = DeployRequestStatus::Active;
    deploy_request.deployed_program_id = Some(deployed_program_id);

    emit!(DeploymentConfirmed {
        request_id: deploy_request.request_id,
        developer: deploy_request.developer,
        deployed_program_id,
        deployment_cost: deploy_request.deployment_cost,
        confirmed_at: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

pub fn confirm_deployment_failure(
    ctx: Context<ConfirmDeployment>,
    request_id: [u8; 32],
    failure_reason: String,
) -> Result<()> {
    let treasury_pool = &mut ctx.accounts.treasury_pool;
    let deploy_request = &mut ctx.accounts.deploy_request;

    require!(!treasury_pool.emergency_pause, ErrorCode::ProgramPaused);
    require!(
        deploy_request.request_id == request_id,
        ErrorCode::InvalidRequestId
    );
    require!(
        deploy_request.status == DeployRequestStatus::PendingDeployment,
        ErrorCode::InvalidRequestStatus
    );

    // Calculate refund amount
    let total_payment = deploy_request.service_fee + deploy_request.monthly_fee;
    let refund_amount = total_payment; // Full refund for failed deployment

    // Update deploy request
    deploy_request.status = DeployRequestStatus::Failed;

    // Refund developer payment
    let refund_cpi = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.treasury_wallet.to_account_info(),
            to: ctx.accounts.developer_wallet.to_account_info(),
        },
    );
    system_program::transfer(refund_cpi, refund_amount)?;

    // Return deployment cost to treasury
    // Note: We need to add deployment_cost back to treasury
    treasury_pool.total_staked += deploy_request.deployment_cost;

    emit!(DeploymentFailed {
        request_id: deploy_request.request_id,
        developer: deploy_request.developer,
        failure_reason,
        refund_amount,
        deployment_cost_returned: deploy_request.deployment_cost,
        failed_at: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
