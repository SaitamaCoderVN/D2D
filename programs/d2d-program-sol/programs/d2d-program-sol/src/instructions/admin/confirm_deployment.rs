use crate::errors::ErrorCode;
use crate::events::{DeploymentConfirmed, DeploymentFailed};
use crate::states::{DeployRequest, DeployRequestStatus, TreasuryPool};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ConfirmDeployment<'info> {
    #[account(
        mut,
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
    /// CHECK: Ephemeral key that received deployment funds
    #[account(mut)]
    pub ephemeral_key: UncheckedAccount<'info>,
    /// CHECK: Developer wallet for refund if deployment fails
    #[account(mut)]
    pub developer_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn confirm_deployment_success(
    ctx: Context<ConfirmDeployment>,
    request_id: [u8; 32],
    deployed_program_id: Pubkey,
    recovered_funds: u64,
) -> Result<()> {
    // Get account infos before mutable borrows
    let treasury_pool_info = ctx.accounts.treasury_pool.to_account_info();
    let _treasury_pool_bump = ctx.accounts.treasury_pool.bump;
    
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

    // Verify ephemeral_key matches the one in deploy_request
    if let Some(expected_ephemeral) = deploy_request.ephemeral_key {
        require!(
            ctx.accounts.ephemeral_key.key() == expected_ephemeral,
            ErrorCode::InvalidEphemeralKey
        );
    }

    // Update deploy request
    deploy_request.status = DeployRequestStatus::Active;
    deploy_request.deployed_program_id = Some(deployed_program_id);

    if recovered_funds > 0 {
        treasury_pool.total_staked = treasury_pool
            .total_staked
            .checked_add(recovered_funds)
            .ok_or(ErrorCode::CalculationOverflow)?;
    }

    emit!(DeploymentConfirmed {
        request_id: deploy_request.request_id,
        developer: deploy_request.developer,
        deployed_program_id,
        deployment_cost: deploy_request.deployment_cost,
        recovered_funds,
        confirmed_at: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

pub fn confirm_deployment_failure(
    ctx: Context<ConfirmDeployment>,
    request_id: [u8; 32],
    failure_reason: String,
) -> Result<()> {
    // Get account infos before mutable borrows
    let treasury_pool_info = ctx.accounts.treasury_pool.to_account_info();
    let _treasury_pool_bump = ctx.accounts.treasury_pool.bump;
    
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

    // Refund developer payment from Treasury Pool PDA via direct lamport manipulation
    {
        let developer_wallet_info = ctx.accounts.developer_wallet.to_account_info();
        let mut treasury_lamports = treasury_pool_info.try_borrow_mut_lamports()?;
        let mut developer_lamports = developer_wallet_info.try_borrow_mut_lamports()?;

        require!(**treasury_lamports >= refund_amount, ErrorCode::InsufficientTreasuryFunds);

        **treasury_lamports = (**treasury_lamports)
            .checked_sub(refund_amount)
            .ok_or(ErrorCode::CalculationOverflow)?;
        **developer_lamports = (**developer_lamports)
            .checked_add(refund_amount)
            .ok_or(ErrorCode::CalculationOverflow)?;
    }
 
    // Return deployment cost to treasury
    // Note: We need to add deployment_cost back to treasury
    treasury_pool.total_staked = treasury_pool
        .total_staked
        .checked_add(deploy_request.deployment_cost)
        .ok_or(ErrorCode::CalculationOverflow)?;

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
