use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Program is currently paused")]
    ProgramPaused,
    #[msg("Insufficient deposit amount")]
    InsufficientDeposit,
    #[msg("Maximum concurrent sessions exceeded")]
    MaxConcurrentSessionsExceeded,
    #[msg("Invalid session status for this operation")]
    InvalidSessionStatus,
    #[msg("Maximum retry attempts exceeded")]
    MaxRetriesExceeded,
    #[msg("Session has not expired yet")]
    SessionNotExpired,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid lock period")]
    InvalidLockPeriod,
    #[msg("Inactive stake")]
    InactiveStake,
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Stake is locked")]
    StakeLocked,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("Insufficient treasury funds")]
    InsufficientTreasuryFunds,
    #[msg("Invalid request ID")]
    InvalidRequestId,
    #[msg("Invalid request status")]
    InvalidRequestStatus,
    #[msg("Invalid treasury wallet")]
    InvalidTreasuryWallet,
    #[msg("Calculation overflow")]
    CalculationOverflow,
    #[msg("Time elapsed too large")]
    TimeElapsedTooLarge,
}
