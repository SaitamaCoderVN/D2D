# D2D Platform - Use Case Diagram

## 🎯 Overview

This document describes all use cases in the D2D (Developer-to-Developer) Platform, which enables developers to deploy Solana programs funded by a community lending pool.

---

## 📊 Use Case Diagram

```mermaid
graph TB
    subgraph "D2D Platform - Use Case Diagram"
        subgraph Actors
            Admin[👤 Admin<br/>Platform Administrator]
            Developer[👨‍💻 Developer<br/>Program Deployer]
            Backer[🧑‍💰 Backer/Lender<br/>Liquidity Provider]
            Backend[⚙️ Backend System<br/>Automated Service]
        end
        
        subgraph "Treasury Management"
            UC1[Initialize Treasury Pool]
            UC2[Update APY Rate]
            UC3[Emergency Pause/Unpause]
        end
        
        subgraph "Backer Operations"
            UC4[Deposit SOL<br/>stake_sol]
            UC5[Withdraw SOL<br/>unstake_sol]
            UC6[Claim Rewards]
        end
        
        subgraph "Developer Operations"
            UC7[Request Deployment Funds]
            UC8[Pay Monthly Subscription]
        end
        
        subgraph "Admin Operations"
            UC9[Confirm Deployment Success]
            UC10[Confirm Deployment Failure]
            UC11[Suspend Expired Programs]
            UC12[Close Program & Refund]
        end
        
        subgraph "Backend Operations"
            UC13[Execute Program Deployment]
            UC14[Monitor Subscription Status]
        end
        
        %% Admin connections
        Admin --> UC1
        Admin --> UC2
        Admin --> UC3
        Admin --> UC9
        Admin --> UC10
        Admin --> UC11
        Admin --> UC12
        
        %% Backer connections
        Backer --> UC4
        Backer --> UC5
        Backer --> UC6
        
        %% Developer connections
        Developer --> UC7
        Developer --> UC8
        
        %% Backend connections
        Backend --> UC13
        Backend --> UC14
        
        %% Use case relationships
        UC7 -.->|includes| UC13
        UC13 -.->|triggers| UC9
        UC13 -.->|on error| UC10
        UC12 -.->|returns funds to| UC4
        UC14 -.->|checks| UC11
        UC8 -.->|extends| UC7
    end
    
    style Admin fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style Developer fill:#4dabf7,stroke:#1971c2,color:#fff
    style Backer fill:#51cf66,stroke:#2f9e44,color:#fff
    style Backend fill:#ffd43b,stroke:#fab005,color:#000
```

---

## 🔄 Use Case Flow Diagram

```mermaid
graph LR
    A[Developer: Request Deployment] -->|triggers| B[Backend: Execute Deployment]
    B -->|on success| C[Admin: Confirm Success]
    B -->|on failure| D[Admin: Confirm Failure]
    C -->|returns excess funds| E[Treasury Pool PDA]
    D -->|refunds to developer| F[Developer Wallet]
    
    G[Backer: Deposit SOL] -->|increases| E
    H[Developer: Pay Fees] -->|transfers to| E
    
    E -->|funds deployment| B
    E -->|distributes rewards| I[Backer: Withdraw SOL]
    
    J[Backend: Monitor Status] -->|triggers| K[Admin: Suspend Expired]
    K -->|recovers rent| L[Admin: Close Program]
    L -->|returns lamports| E
    
    style E fill:#ffd43b,stroke:#fab005
    style B fill:#845ef7,stroke:#5f3dc4,color:#fff
```

---

## 👥 Actors

| Actor | Role | Description |
|-------|------|-------------|
| **Admin** 👤 | Platform Administrator | Manages treasury pool, confirms deployments, handles expired programs |
| **Developer** 👨‍💻 | Program Deployer | Deploys Solana programs, pays fees and subscriptions |
| **Backer/Lender** 🧑‍💰 | Liquidity Provider | Stakes SOL into pool, earns APY rewards |
| **Backend System** ⚙️ | Automated Service | Executes deployments, monitors subscriptions |

---

## 📋 Use Case Specifications

### 1️⃣ Admin Use Cases

#### UC1: Initialize Treasury Pool
- **Actor**: Admin
- **Instruction**: `initialize(initial_apy, treasury_wallet)`
- **Description**: Initialize the D2D program and create the Treasury Pool PDA with initial APY rate
- **Preconditions**: Program not yet initialized
- **Postconditions**: Treasury Pool PDA created, system ready for operation
- **Flow**:
  1. Admin calls initialize with initial APY (e.g., 1000 = 10%)
  2. System creates Treasury Pool PDA
  3. System emits `TreasuryInitialized` event

#### UC2: Update APY Rate
- **Actor**: Admin
- **Instruction**: `update_apy(new_apy)`
- **Description**: Update the APY rate for backer rewards
- **Preconditions**: Treasury Pool initialized
- **Postconditions**: New APY applied to future rewards
- **Flow**:
  1. Admin calls update_apy with new rate
  2. System validates admin signature
  3. System updates treasury_pool.current_apy
  4. System emits `ApyUpdated` event

#### UC3: Emergency Pause/Unpause
- **Actor**: Admin
- **Instruction**: `emergency_pause(pause: bool)`
- **Description**: Pause or unpause all system operations in case of emergency
- **Preconditions**: Treasury Pool initialized
- **Postconditions**: System paused/unpaused
- **Flow**:
  1. Admin calls emergency_pause with true/false
  2. System sets treasury_pool.emergency_pause flag
  3. All operations check this flag before executing

#### UC9: Confirm Deployment Success
- **Actor**: Admin (triggered by Backend)
- **Instruction**: `confirm_deployment_success(request_id, deployed_program_id)`
- **Description**: Confirm successful deployment and return excess funds to Treasury Pool
- **Preconditions**: Deployment request in PendingDeployment status
- **Postconditions**: Request status = Active, excess funds returned
- **Flow**:
  1. Backend deploys program successfully
  2. Admin calls confirm_deployment_success
  3. System updates deploy_request.status = Active
  4. System transfers remaining SOL from ephemeral key to Treasury Pool
  5. System emits `DeploymentConfirmed` event

#### UC10: Confirm Deployment Failure
- **Actor**: Admin (triggered by Backend)
- **Instruction**: `confirm_deployment_failure(request_id, failure_reason)`
- **Description**: Handle deployment failure and refund developer
- **Preconditions**: Deployment request in PendingDeployment status
- **Postconditions**: Request status = Failed, funds refunded
- **Flow**:
  1. Backend deployment fails
  2. Admin calls confirm_deployment_failure
  3. System updates deploy_request.status = Failed
  4. System returns deployment_cost to developer
  5. System emits `DeploymentFailed` event

#### UC11: Suspend Expired Programs
- **Actor**: Admin (triggered by Backend monitoring)
- **Instruction**: `suspend_expired_programs()`
- **Description**: Automatically suspend programs with expired subscriptions
- **Preconditions**: Deploy requests with subscription_paid_until < current_time
- **Postconditions**: Expired programs suspended
- **Flow**:
  1. Backend monitors subscription status
  2. Admin calls suspend_expired_programs
  3. System updates deploy_request.status = Suspended
  4. System emits `ProgramSuspended` event

#### UC12: Close Program & Refund
- **Actor**: Admin
- **Instruction**: `close_program_and_refund(request_id, recovered_lamports)`
- **Description**: Close a deployed program and return recovered rent to Treasury Pool
- **Preconditions**: Deploy request in Active status
- **Postconditions**: Request closed, lamports returned to pool
- **Flow**:
  1. Admin closes program on Solana
  2. Admin calls close_program_and_refund with recovered lamports
  3. System updates deploy_request.status = Closed
  4. System transfers recovered lamports to Treasury Pool
  5. System increases treasury_pool.total_staked
  6. System emits `ProgramClosed` event

---

### 2️⃣ Developer Use Cases

#### UC7: Request Deployment Funds
- **Actor**: Developer
- **Instruction**: `request_deployment_funds(program_hash, service_fee, monthly_fee, initial_months, deployment_cost)`
- **Description**: Developer pays fees and requests SOL from pool to deploy program
- **Preconditions**: 
  - Treasury Pool has sufficient funds
  - Developer has SOL for fees
- **Postconditions**: 
  - Deploy request created
  - Ephemeral key funded with deployment_cost
- **Flow**:
  1. Developer calls request_deployment_funds
  2. System validates treasury_pool.total_staked >= deployment_cost
  3. System transfers (service_fee + monthly_fee * initial_months) from developer to Treasury Pool PDA
  4. System transfers deployment_cost from Treasury Pool to ephemeral key
  5. System creates deploy_request with status = PendingDeployment
  6. System emits `DeploymentFundsRequested` event
  7. Backend executes deployment using ephemeral key

#### UC8: Pay Monthly Subscription
- **Actor**: Developer
- **Instruction**: `pay_subscription(request_id, months)`
- **Description**: Extend subscription for an active deployed program
- **Preconditions**: Deploy request exists and not suspended
- **Postconditions**: Subscription extended
- **Flow**:
  1. Developer calls pay_subscription
  2. System calculates payment = monthly_fee * months
  3. System transfers payment from developer to Treasury Pool
  4. System extends deploy_request.subscription_paid_until
  5. System emits `SubscriptionPaid` event

---

### 3️⃣ Backer Use Cases

#### UC4: Deposit SOL (Stake)
- **Actor**: Backer/Lender
- **Instruction**: `stake_sol(amount, lock_period)`
- **Description**: Backer deposits SOL into Treasury Pool to earn APY rewards
- **Preconditions**: System not paused
- **Postconditions**: 
  - SOL deposited
  - Backer deposit record created
- **Flow**:
  1. Backer calls stake_sol with amount and lock_period
  2. System transfers SOL from backer to Treasury Pool PDA
  3. System creates/updates BackerDeposit (lender_stake) account
  4. System updates treasury_pool.total_staked
  5. System emits `StakeDeposited` event

#### UC5: Withdraw SOL (Unstake)
- **Actor**: Backer/Lender
- **Instruction**: `unstake_sol(amount)`
- **Description**: Backer withdraws SOL plus rewards from Treasury Pool
- **Preconditions**: 
  - Backer has deposited SOL
  - Lock period expired (if applicable)
- **Postconditions**: SOL + rewards transferred to backer
- **Flow**:
  1. Backer calls unstake_sol
  2. System calculates rewards with duration bonus
  3. System validates treasury_pool.total_staked >= (amount + rewards)
  4. System transfers (amount + rewards) from Treasury Pool to backer
  5. System updates treasury_pool.total_staked
  6. System updates BackerDeposit record
  7. System emits `StakeWithdrawn` event

#### UC6: Claim Rewards
- **Actor**: Backer/Lender
- **Instruction**: `claim_rewards()`
- **Description**: Backer claims accumulated rewards without withdrawing principal
- **Preconditions**: Backer has deposited SOL and rewards > 0
- **Postconditions**: Rewards transferred, principal remains staked
- **Flow**:
  1. Backer calls claim_rewards
  2. System calculates accumulated rewards
  3. System transfers rewards from Treasury Pool to backer
  4. System updates treasury_pool.total_rewards_distributed
  5. System emits `RewardsClaimed` event

---

### 4️⃣ Backend Use Cases

#### UC13: Execute Program Deployment
- **Actor**: Backend System
- **Triggered by**: UC7 (Request Deployment Funds)
- **Description**: Backend executes actual program deployment using Web3.js
- **Preconditions**: 
  - Deploy request created
  - Ephemeral key funded
- **Postconditions**: 
  - Program deployed on Solana
  - Admin confirms success/failure
- **Flow**:
  1. Backend receives DeploymentFundsRequested event
  2. Backend loads ephemeral keypair
  3. Backend deploys program using `@solana/web3.js`
  4. Backend transfers program authority to D2D admin
  5. Backend calls confirm_deployment_success or confirm_deployment_failure

#### UC14: Monitor Subscription Status
- **Actor**: Backend System
- **Description**: Periodic monitoring of subscription expiration
- **Preconditions**: Active deploy requests exist
- **Postconditions**: Expired programs suspended
- **Flow**:
  1. Backend runs periodic check (e.g., daily)
  2. Backend queries all active deploy requests
  3. Backend identifies requests with subscription_paid_until < current_time
  4. Backend triggers UC11 (Suspend Expired Programs)
  5. Backend notifies developers via email/notification

---

## 🔗 Use Case Relationships

| Relationship | From | To | Type |
|--------------|------|-----|------|
| Triggers | UC7: Request Deployment Funds | UC13: Execute Deployment | Include |
| Triggers | UC13: Execute Deployment | UC9: Confirm Success | Conditional |
| Triggers | UC13: Execute Deployment | UC10: Confirm Failure | Conditional |
| Returns funds | UC12: Close Program | UC4: Deposit (Pool) | Include |
| Monitors | UC14: Monitor Status | UC11: Suspend Expired | Trigger |
| Extends | UC8: Pay Subscription | UC7: Request Deployment | Extend |

---

## 🔐 Access Control Matrix

| Use Case | Admin | Developer | Backer | Backend |
|----------|-------|-----------|--------|---------|
| Initialize Treasury Pool | ✅ | ❌ | ❌ | ❌ |
| Update APY | ✅ | ❌ | ❌ | ❌ |
| Emergency Pause | ✅ | ❌ | ❌ | ❌ |
| Deposit SOL | ❌ | ❌ | ✅ | ❌ |
| Withdraw SOL | ❌ | ❌ | ✅ | ❌ |
| Claim Rewards | ❌ | ❌ | ✅ | ❌ |
| Request Deployment | ❌ | ✅ | ❌ | ❌ |
| Pay Subscription | ❌ | ✅ | ❌ | ❌ |
| Confirm Deployment | ✅ | ❌ | ❌ | 🔶 (triggers) |
| Suspend Expired | ✅ | ❌ | ❌ | 🔶 (triggers) |
| Close Program | ✅ | ❌ | ❌ | ❌ |
| Execute Deployment | ❌ | ❌ | ❌ | ✅ |
| Monitor Status | ❌ | ❌ | ❌ | ✅ |

**Legend**: ✅ Direct access | ❌ No access | 🔶 Indirect trigger

---

## 📈 Success Metrics

| Use Case | Success Criteria | KPI |
|----------|------------------|-----|
| Request Deployment Funds | Funds transferred, request created | # of deployment requests |
| Execute Deployment | Program deployed, authority transferred | Deployment success rate (%) |
| Deposit SOL | SOL staked, rewards calculated | Total Value Locked (TVL) |
| Withdraw SOL | Rewards paid accurately | APY distributed (%) |
| Close Program | Rent recovered to pool | Recovered lamports (SOL) |

---

## 🔄 State Transitions

### Deploy Request Status

```mermaid
stateDiagram-v2
    [*] --> PendingDeployment: request_deployment_funds()
    PendingDeployment --> Active: confirm_deployment_success()
    PendingDeployment --> Failed: confirm_deployment_failure()
    Active --> Suspended: suspend_expired_programs()
    Active --> Closed: close_program_and_refund()
    Suspended --> Active: pay_subscription()
    Closed --> [*]
    Failed --> [*]
```

---

## 📝 Notes

- **Treasury Pool PDA**: Program-derived account that holds all SOL
- **Ephemeral Key**: Temporary keypair generated per deployment for signing
- **APY Rewards**: Calculated based on deposit duration and pool performance
- **Subscription Model**: Monthly recurring payments to keep programs active
- **Authority Transfer**: Deployed programs are owned by D2D admin for management

---

## 🚀 Future Use Cases (Planned)

- [ ] **UC15**: Multi-signature approval for large deployments
- [ ] **UC16**: Governance voting for APY changes
- [ ] **UC17**: NFT-based deposit receipts
- [ ] **UC18**: Auto-renewal subscription with developer wallet
- [ ] **UC19**: Backer rewards dashboard
- [ ] **UC20**: Program analytics and usage tracking

---

**Generated**: 2025-11-07  
**Program ID**: `Hn6enqRbfjQywqVbkNNFe6rauWjQLvea8Fyh6fZZPpA8`  
**Network**: Solana Devnet

