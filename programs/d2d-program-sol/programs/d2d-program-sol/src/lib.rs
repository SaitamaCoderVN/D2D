use anchor_lang::prelude::*;

// Module declarations
pub mod errors;
pub mod events;
pub mod instructions;
pub mod states;

// Re-export commonly used types
pub use events::*;
use instructions::*;
pub use states::*;

declare_id!("Hn6enqRbfjQywqVbkNNFe6rauWjQLvea8Fyh6fZZPpA8");

#[program]
pub mod d2d_program_sol {
    use super::*;

    /// Initialize the D2D program and treasury pool
    pub fn initialize(
        ctx: Context<Initialize>,
        initial_apy: u64,
        treasury_wallet: Pubkey,
    ) -> Result<()> {
        instructions::initialize(ctx, initial_apy, treasury_wallet)
    }

    /// Lender stake SOL into treasury pool
    /// Kept for backward compatibility (use create_deposit for new code)
    pub fn stake_sol(ctx: Context<StakeSol>, amount: u64, lock_period: i64) -> Result<()> {
        instructions::stake_sol(ctx, amount, lock_period)
    }

    /// Lender unstake SOL from treasury pool
    /// Kept for backward compatibility (use request_withdraw for new code)
    pub fn unstake_sol(ctx: Context<UnstakeSol>, amount: u64) -> Result<()> {
        instructions::unstake_sol(ctx, amount)
    }

    /// Lender claim accumulated rewards
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        instructions::claim_rewards(ctx)
    }

    /// Request deployment funds from treasury pool
    /// Backend will use these funds to deploy via pure Web3.js
    pub fn request_deployment_funds(
        ctx: Context<RequestDeploymentFunds>,
        program_hash: [u8; 32],
        service_fee: u64,
        monthly_fee: u64,
        initial_months: u32,
        deployment_cost: u64,
    ) -> Result<()> {
        instructions::request_deployment_funds(ctx, program_hash, service_fee, monthly_fee, initial_months, deployment_cost)
    }

    /// [DEPRECATED] Deploy program with both developer and admin signatures
    /// Use request_deployment_funds + confirm_deployment_success instead
    pub fn deploy_program(
        ctx: Context<DeployProgram>,
        program_hash: [u8; 32],
        service_fee: u64,
        monthly_fee: u64,
        initial_months: u32,
        deployment_cost: u64,
    ) -> Result<()> {
        instructions::deploy_program(ctx, program_hash, service_fee, monthly_fee, initial_months, deployment_cost)
    }

    /// Developer pay monthly subscription
    pub fn pay_subscription(
        ctx: Context<PaySubscription>,
        request_id: [u8; 32],
        months: u32,
    ) -> Result<()> {
        instructions::pay_subscription(ctx, request_id, months)
    }

    /// Admin update APY
    pub fn update_apy(ctx: Context<UpdateApy>, new_apy: u64) -> Result<()> {
        instructions::update_apy(ctx, new_apy)
    }

    /// Admin suspend expired programs
    pub fn suspend_expired_programs(ctx: Context<SuspendExpiredPrograms>) -> Result<()> {
        instructions::suspend_expired_programs(ctx)
    }

    /// Emergency pause/unpause
    pub fn emergency_pause(ctx: Context<EmergencyPause>, pause: bool) -> Result<()> {
        instructions::emergency_pause(ctx, pause)
    }

    /// Admin confirm deployment success
    pub fn confirm_deployment_success(
        ctx: Context<ConfirmDeployment>,
        request_id: [u8; 32],
        deployed_program_id: Pubkey,
        recovered_funds: u64,
    ) -> Result<()> {
        instructions::confirm_deployment_success(ctx, request_id, deployed_program_id, recovered_funds)
    }

    /// Admin confirm deployment failure
    pub fn confirm_deployment_failure(
        ctx: Context<ConfirmDeployment>,
        request_id: [u8; 32],
        failure_reason: String,
    ) -> Result<()> {
        instructions::confirm_deployment_failure(ctx, request_id, failure_reason)
    }

    /// Admin close program and refund recovered lamports to pool
    pub fn close_program_and_refund(
        ctx: Context<CloseProgramAndRefund>,
        request_id: [u8; 32],
        recovered_lamports: u64,
    ) -> Result<()> {
        instructions::close_program_and_refund(ctx, request_id, recovered_lamports)
    }

    /// Admin fund temporary wallet for deployment
    /// Only backend admin can call this to transfer deployment funds
    pub fn fund_temporary_wallet(
        ctx: Context<FundTemporaryWallet>,
        request_id: [u8; 32],
        amount: u64,
    ) -> Result<()> {
        instructions::fund_temporary_wallet(ctx, request_id, amount)
    }
}
