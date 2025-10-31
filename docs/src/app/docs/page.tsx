'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: '📖' },
    { id: 'how-it-works', title: 'How It Works', icon: '⚙️' },
    { id: 'deployment', title: 'Program Deployment', icon: '🚀' },
    { id: 'dump-process', title: 'Dump Process', icon: '📦' },
    { id: 'backer-profits', title: 'Backer Profits', icon: '💰' },
    { id: 'lp-tokens', title: 'LP Token Mechanism', icon: '🎯' },
    { id: 'calculations', title: 'Profit Calculations', icon: '🧮' },
    { id: 'faq', title: 'FAQ', icon: '❓' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="header-sticky">
        <div className="container-main">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0066FF] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">D2D Docs</h1>
                <p className="text-xs text-gray-500">Complete Documentation</p>
              </div>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">Home</Link>
              <Link href="/docs" className="text-gray-900 font-semibold">Docs</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container-main py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-3">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-[#0066FF] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-9">
            <div className="prose max-w-none">
              {/* Introduction */}
              {activeSection === 'introduction' && (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">Introduction to D2D</h1>
                  <p className="text-lg text-gray-600 mb-6">
                    D2D (Decentralized Deployment) is a revolutionary platform that enables Solana developers
                    to deploy programs to mainnet for just $5, backed by a community-powered treasury.
                  </p>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-[#0066FF] font-bold mr-2">•</span>
                        <span><strong>Low Cost:</strong> Deploy for just $5 instead of paying ~1.2 SOL rent</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#0066FF] font-bold mr-2">•</span>
                        <span><strong>Fast:</strong> Automated deployment in ~15 seconds</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#0066FF] font-bold mr-2">•</span>
                        <span><strong>Decentralized:</strong> Backed by community treasury, not centralized entity</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#0066FF] font-bold mr-2">•</span>
                        <span><strong>Earn as Backer:</strong> Stake SOL and earn 10-15% APY from service fees</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-[#0066FF] p-6 rounded">
                    <p className="font-semibold text-gray-900 mb-2">Why D2D?</p>
                    <p className="text-gray-600">
                      Traditional Solana deployment requires ~5 SOL for rent-exempt storage. D2D democratizes
                      access by pooling resources from backers who earn passive income from your $5 service fee.
                    </p>
                  </div>
                </div>
              )}

              {/* How It Works */}
              {activeSection === 'how-it-works' && (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h1>
                  
                  <div className="space-y-8">
                    <div className="card">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-[#0066FF]">1</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Developer Submits Program</h3>
                          <p className="text-gray-600 mb-4">
                            Developer connects wallet and provides their devnet program ID. They pay a $5 service fee (0.025 SOL).
                          </p>
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
{`// Example API call
const response = await fetch('/api/deploy', {
  method: 'POST',
  body: JSON.stringify({
    devnetProgramId: '5aai4VhRLDCFP2WSHUbGsiSuZxkWzQahhsRkqdfF2jRh',
    userWallet: publicKey.toString(),
    paymentSignature: signature
  })
});`}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-[#0066FF]">2</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">System Dumps Program</h3>
                          <p className="text-gray-600 mb-4">
                            Our backend automatically fetches the compiled .so file from devnet using Solana CLI.
                          </p>
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
{`# Command executed by backend
solana program dump \\
  <PROGRAM_ID> \\
  program.so \\
  --url devnet`}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-[#0066FF]">3</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Deploy to Mainnet</h3>
                          <p className="text-gray-600 mb-4">
                            Using treasury funds, we deploy the program to mainnet with a generated keypair.
                          </p>
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
{`# Deployment command
solana program deploy \\
  program.so \\
  --keypair treasury-keypair.json \\
  --url mainnet-beta`}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-green-600">✓</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Program Live!</h3>
                          <p className="text-gray-600">
                            Developer receives mainnet program ID and transaction signature. Program is immediately usable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deployment */}
              {activeSection === 'deployment' && (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">Program Deployment</h1>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Prerequisites</h2>
                  <div className="card mb-8">
                    <ul className="space-y-2 text-gray-600">
                      <li>✅ Solana wallet (Phantom, Solflare, etc.)</li>
                      <li>✅ Program deployed on devnet</li>
                      <li>✅ 0.025 SOL for service fee</li>
                      <li>✅ Program ID from devnet</li>
                    </ul>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Step-by-Step Guide</h2>
                  
                  <div className="space-y-6">
                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Step 1: Connect Wallet</h3>
                      <p className="text-gray-600 mb-3">Navigate to the D2D platform and connect your Solana wallet.</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <code className="text-sm">https://d2d.solana.com/deploy</code>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Step 2: Enter Program ID</h3>
                      <p className="text-gray-600 mb-3">Paste your devnet program ID in the input field.</p>
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`Example: 5aai4VhRLDCFP2WSHUbGsiSuZxkWzQahhsRkqdfF2jRh`}
                      </pre>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Step 3: Review Costs</h3>
                      <p className="text-gray-600 mb-3">System calculates program size and shows pricing:</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Service Fee</div>
                          <div className="text-2xl font-bold text-[#0066FF]">0.025 SOL</div>
                          <div className="text-xs text-gray-500">≈ $5</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Rent Covered</div>
                          <div className="text-2xl font-bold text-green-600">1.2 SOL</div>
                          <div className="text-xs text-gray-500">By treasury</div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Step 4: Confirm & Pay</h3>
                      <p className="text-gray-600">Approve the 0.025 SOL transaction. Deployment begins automatically.</p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Step 5: Track Progress</h3>
                      <p className="text-gray-600 mb-3">Monitor deployment status in real-time:</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600">⏳</span>
                          </div>
                          <span className="text-gray-600">Pending (0s)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                            <span className="text-[#0066FF]">📦</span>
                          </div>
                          <span className="text-gray-600">Dumping Program (3s)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                            <span className="text-[#0066FF]">🚀</span>
                          </div>
                          <span className="text-gray-600">Deploying (7s)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                            <span className="text-green-600">✅</span>
                          </div>
                          <span className="text-gray-600">Success (15s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dump Process */}
              {activeSection === 'dump-process' && (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">Program Dump Process</h1>
                  
                  <p className="text-lg text-gray-600 mb-8">
                    Understanding how we extract your compiled program from devnet.
                  </p>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Program Dumping?</h2>
                    <p className="text-gray-600 mb-4">
                      Program dumping extracts the compiled binary (.so file) of a deployed program from the blockchain.
                      This is necessary because we need the actual bytecode to redeploy it to mainnet.
                    </p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Details</h2>
                  
                  <div className="card mb-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">Command Used</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`solana program dump \\
  <PROGRAM_ID> \\
  output.so \\
  --url https://api.devnet.solana.com`}
                    </pre>
                  </div>

                  <div className="card mb-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">Process Flow</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-[#0066FF]">1</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Query Program Account</p>
                          <p className="text-gray-600 text-sm">Fetch program account data from devnet RPC</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-[#0066FF]">2</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Extract Executable Data</p>
                          <p className="text-gray-600 text-sm">Read program data from BPF loader accounts</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-[#0066FF]">3</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Write to File</p>
                          <p className="text-gray-600 text-sm">Save compiled binary as .so file</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-green-600">✓</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Verify Integrity</p>
                          <p className="text-gray-600 text-sm">Check file hash matches on-chain data</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">File Size Calculation</h3>
                    <p className="text-gray-600 mb-4">
                      The dumped .so file size determines storage rent:
                    </p>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
{`Program Size:     86,184 bytes (~86 KB)
Storage Required: 2 × 86,184 + 45 = 172,414 bytes

$ solana rent 172414
Rent-exempt min: 1.19759992 SOL ≈ 1.2 SOL`}
                    </pre>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                    <p className="font-semibold text-gray-900 mb-2">⚠️ Important Note</p>
                    <p className="text-gray-600">
                      The dumped program must match exactly what's on devnet. We verify checksums to ensure integrity
                      before deploying to mainnet.
                    </p>
                  </div>
                </div>
              )}

              {/* Backer Profits */}
              {activeSection === 'backer-profits' && (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">Backer Profit Model</h1>
                  
                  <p className="text-lg text-gray-600 mb-8">
                    Learn how backers earn passive income by staking SOL to support program deployments.
                  </p>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Revenue Model</h2>
                    <p className="text-gray-600 mb-4">
                      Every program deployment generates $5 in revenue. This revenue is distributed to backers
                      proportionally based on their stake in the pool.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">Developer Pays</div>
                        <div className="text-3xl font-bold text-[#0066FF]">$5</div>
                        <div className="text-xs text-gray-500">Per deployment</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">Backers Earn</div>
                        <div className="text-3xl font-bold text-green-600">100%</div>
                        <div className="text-xs text-gray-500">Of service fees</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">Target APY</div>
                        <div className="text-3xl font-bold text-purple-600">10-15%</div>
                        <div className="text-xs text-gray-500">Annual return</div>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Example: Earning Calculation</h2>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Scenario:</p>
                        <ul className="space-y-1 text-gray-600 text-sm">
                          <li>• You stake: <strong>5 SOL</strong></li>
                          <li>• Total pool: <strong>37 SOL</strong></li>
                          <li>• Your share: <strong>13.51%</strong></li>
                          <li>• Programs deployed: <strong>1</strong></li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="font-semibold text-gray-900 mb-2">Your Earnings:</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Revenue from deployment:</span>
                            <span className="font-semibold">$5.00</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Your share (13.51%):</span>
                            <span className="font-semibold">$0.676</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-2">
                            <span className="text-gray-600">In SOL ($200/SOL):</span>
                            <span className="font-bold text-green-600">0.0034 SOL</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">If 100 programs deploy per month:</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Monthly earnings:</span>
                            <span className="font-semibold">0.338 SOL ≈ $67.6</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Annual earnings:</span>
                            <span className="font-semibold">4.056 SOL ≈ $811.2</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-2">
                            <span className="text-gray-600">APY on 5 SOL stake:</span>
                            <span className="font-bold text-[#0066FF]">81.12%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Claim Rewards</h2>
                    <p className="text-gray-600 mb-4">
                      Rewards are calculated in real-time and can be claimed anytime. After claiming, your reward counter resets
                      and starts accumulating again from the next deployment.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Reward Formula:</p>
                      <code className="text-sm">
                        rewards = (newPrograms × $5 × userShare) / solPrice
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* LP Tokens */}
              {activeSection === 'lp-tokens' && (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">LP Token Mechanism</h1>
                  
                  <p className="text-lg text-gray-600 mb-8">
                    Earn LP tokens by staking early and unlock additional yield farming opportunities.
                  </p>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">What are LP Tokens?</h2>
                    <p className="text-gray-600 mb-4">
                      LP (Liquidity Provider) tokens represent your share in the D2D treasury. They are governance
                      tokens that can be staked for additional rewards and used to vote on platform parameters.
                    </p>
                  </div>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Earning LP Tokens</h2>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-[#0066FF]">
                        <h3 className="font-bold text-lg text-gray-900 mb-3">Formula</h3>
                        <pre className="bg-white/80 p-4 rounded text-sm overflow-x-auto">
{`LP Tokens = SOL Amount × Time Multiplier × Early Bird Bonus

Where:
- Time Multiplier: Days staked / 365
- Early Bird Bonus: 1x to 3x (higher for earlier deposits)
- Governance Weight: LP Tokens determine voting power`}
                        </pre>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50">
                          <div className="text-center">
                            <div className="text-3xl mb-2">🥇</div>
                            <div className="font-bold text-lg text-gray-900 mb-1">Week 1</div>
                            <div className="text-2xl font-bold text-orange-600 mb-1">3x</div>
                            <div className="text-sm text-gray-600">Bonus Multiplier</div>
                          </div>
                        </div>
                        <div className="card bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="text-center">
                            <div className="text-3xl mb-2">🥈</div>
                            <div className="font-bold text-lg text-gray-900 mb-1">Week 2-4</div>
                            <div className="text-2xl font-bold text-gray-600 mb-1">2x</div>
                            <div className="text-sm text-gray-600">Bonus Multiplier</div>
                          </div>
                        </div>
                        <div className="card bg-gradient-to-br from-amber-50 to-yellow-50">
                          <div className="text-center">
                            <div className="text-3xl mb-2">🥉</div>
                            <div className="font-bold text-lg text-gray-900 mb-1">After Month 1</div>
                            <div className="text-2xl font-bold text-amber-600 mb-1">1x</div>
                            <div className="text-sm text-gray-600">Standard Rate</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Yield Farming</h2>
                    <p className="text-gray-600 mb-4">
                      Stake your LP tokens to earn additional rewards from:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600">💰</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Protocol Fees</p>
                          <p className="text-gray-600 text-sm">Earn a share of all deployment service fees</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600">🎁</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">LP Token Emissions</p>
                          <p className="text-gray-600 text-sm">Earn new LP tokens as staking rewards</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-[#0066FF]">🗳️</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Governance Rights</p>
                          <p className="text-gray-600 text-sm">Vote on platform parameters and treasury allocation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-[#0066FF] p-6 rounded">
                    <p className="font-semibold text-gray-900 mb-2">💡 Pro Tip</p>
                    <p className="text-gray-600">
                      Deposit early to maximize your LP token multiplier. First week depositors get 3x tokens,
                      significantly increasing both yield farming rewards and governance voting power.
                    </p>
                  </div>
                </div>
              )}

              {/* Calculations */}
              {activeSection === 'calculations' && (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">Profit Calculations</h1>
                  
                  <p className="text-lg text-gray-600 mb-8">
                    Detailed mathematical formulas for calculating backer profits and APY.
                  </p>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Formula</h2>
                    <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
{`// User's share of the pool
userShare = userStake / totalPool

// New programs since last claim
newPrograms = currentPrograms - programsAtLastClaim

// Revenue from new programs (USD)
revenue = newPrograms × $5

// User's portion of revenue (USD)
userRevenue = revenue × userShare

// Convert to SOL
userRewards = userRevenue / solPrice`}
                    </pre>
                  </div>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">APY Calculation</h2>
                    <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
{`// Monthly profit generated by platform
monthlyRevenue = programsPerMonth × $5

// Annual revenue
annualRevenue = monthlyRevenue × 12

// Pool value in USD
poolValueUSD = totalPoolSOL × solPrice

// Annual Percentage Yield
APY = (annualRevenue / poolValueUSD) × 100`}
                    </pre>
                  </div>

                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Real Example</h2>
                    <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                      <div>
                        <p className="font-semibold text-gray-900 mb-3">Given:</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded border">
                            <div className="text-sm text-gray-600">Your Stake</div>
                            <div className="text-2xl font-bold text-[#0066FF]">5 SOL</div>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <div className="text-sm text-gray-600">Total Pool</div>
                            <div className="text-2xl font-bold text-[#0066FF]">37 SOL</div>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <div className="text-sm text-gray-600">SOL Price</div>
                            <div className="text-2xl font-bold text-[#0066FF]">$200</div>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <div className="text-sm text-gray-600">Programs</div>
                            <div className="text-2xl font-bold text-[#0066FF]">13/month</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 mb-3">Calculation:</p>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex justify-between py-2 border-b">
                            <span>userShare</span>
                            <span className="font-bold">= 5 / 37 = 0.1351 (13.51%)</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span>monthlyRevenue</span>
                            <span className="font-bold">= 13 × $5 = $65</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span>userMonthlyRevenue</span>
                            <span className="font-bold">= $65 × 0.1351 = $8.78</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span>userMonthlySOL</span>
                            <span className="font-bold">= $8.78 / $200 = 0.0439 SOL</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span>annualRevenue</span>
                            <span className="font-bold">= $8.78 × 12 = $105.36</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span>annualSOL</span>
                            <span className="font-bold">= 0.0439 × 12 = 0.527 SOL</span>
                          </div>
                          <div className="flex justify-between py-2 bg-green-50 px-2 rounded">
                            <span>APY</span>
                            <span className="font-bold text-green-600">= (0.527 / 5) × 100 = 10.54%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-[#0066FF]">
                        <p className="font-semibold text-gray-900 mb-2">Result:</p>
                        <div className="space-y-1">
                          <p className="text-gray-600">• Monthly earnings: <strong>0.0439 SOL ≈ $8.78</strong></p>
                          <p className="text-gray-600">• Annual earnings: <strong>0.527 SOL ≈ $105.36</strong></p>
                          <p className="text-gray-600">• APY: <strong className="text-green-600">10.54%</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Per-Deployment Calculation</h2>
                    <p className="text-gray-600 mb-4">
                      How much you earn from each individual program deployment:
                    </p>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
{`rewardPerDeployment = ($5 × userShare) / solPrice

Example:
= ($5 × 0.1351) / $200
= $0.676 / $200
= 0.00338 SOL per deployment`}
                    </pre>
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeSection === 'faq' && (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
                  
                  <div className="space-y-6">
                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        How is this different from traditional deployment?
                      </h3>
                      <p className="text-gray-600">
                        Traditional deployment requires you to pay ~1.2 SOL upfront for rent-exempt storage.
                        D2D allows you to deploy for just $5 (0.025 SOL) by pooling resources from backers
                        who earn passive income from your service fee.
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        Is my program safe?
                      </h3>
                      <p className="text-gray-600">
                        Yes! We verify checksums to ensure the program deployed to mainnet matches exactly
                        what's on devnet. The deployment process is automated and audited. Your program
                        bytecode is never modified.
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        Can I withdraw my staked SOL?
                      </h3>
                      <p className="text-gray-600">
                        Yes, with a 7-day cooldown period. This ensures treasury stability and prevents
                        sudden liquidity issues. You can claim accumulated rewards anytime without affecting
                        your stake.
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        What happens to my LP tokens?
                      </h3>
                      <p className="text-gray-600">
                        LP tokens are non-transferable but can be staked for additional yield farming rewards.
                        They represent your governance rights and accumulated benefits in the protocol.
                        When you unstake SOL, LP tokens are burned proportionally.
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        How long does deployment take?
                      </h3>
                      <p className="text-gray-600">
                        Average deployment time is ~15 seconds:
                        <br />• Dumping program: 3s
                        <br />• Deploying to mainnet: 7s
                        <br />• Verification: 5s
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        What's the minimum stake for backers?
                      </h3>
                      <p className="text-gray-600">
                        Minimum stake is 0.1 SOL. However, we recommend staking at least 1 SOL to earn
                        meaningful rewards. Early depositors (first week) receive 3x LP token multiplier.
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        Is there a deployment limit?
                      </h3>
                      <p className="text-gray-600">
                        No per-user limit. You can deploy as many programs as needed. Each deployment
                        is independent and processed in order of submission.
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        What happens if deployment fails?
                      </h3>
                      <p className="text-gray-600">
                        If deployment fails for any reason, your $5 service fee is automatically refunded.
                        Common failure reasons include invalid program ID or insufficient treasury funds
                        (which triggers an automatic refund queue).
                      </p>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        How is APY calculated?
                      </h3>
                      <p className="text-gray-600">
                        APY is dynamic and based on deployment volume:
                        <code className="block mt-2 p-3 bg-gray-50 rounded text-sm">
                          APY = ((programs × $5 × 12) / (totalPool × solPrice)) × 100
                        </code>
                        Current target: 10-15% APY
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="container-main">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 D2D. Built on Solana.
            </div>
            <div className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">Home</Link>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Twitter</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Discord</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

