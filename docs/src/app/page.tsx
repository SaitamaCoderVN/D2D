'use client';

import { useState } from 'react';
import Link from 'next/link';
import Countdown from '@/components/Countdown';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Successfully registered for early access!');
    setEmail('');
    setIsSubmitting(false);
  };

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
                <h1 className="text-xl font-bold text-gray-900">D2D</h1>
                <p className="text-xs text-gray-500">Decentralized Deployment</p>
              </div>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-900 font-semibold">Home</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition">Docs</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container-main py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-blue-50 rounded-full mb-6">
            <span className="text-sm font-semibold text-[#0066FF]">🚀 Launching Soon</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Deploy Solana Programs
            <br />
            <span className="text-[#0066FF]">For Just $5</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            The first decentralized platform that lets developers deploy to mainnet
            <br />
            without upfront costs. Backed by a community-powered treasury.
          </p>

          {/* Countdown */}
          <div className="mb-12">
            <p className="text-lg font-semibold text-gray-700 mb-6">Launching In</p>
            <Countdown />
          </div>

          {/* Early Access Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex space-x-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="input-field flex-1"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary whitespace-nowrap"
              >
                {isSubmitting ? 'Registering...' : 'Get Early Access'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Join 1,000+ developers waiting for launch
            </p>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="section-header">How It Works</h2>
            <p className="section-subtitle">Three simple steps to deploy your program</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                desc: 'Connect your Solana wallet and provide your devnet program ID',
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Pay $5 Service Fee',
                desc: 'Only pay 0.025 SOL (~$5). We cover the 1.2 SOL deployment cost',
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Deploy Instantly',
                desc: 'We automatically dump, deploy, and verify your program on mainnet',
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                ),
              },
            ].map((feature, idx) => (
              <div key={idx} className="card text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-[#0066FF] mx-auto mb-4">
                  {feature.icon}
                </div>
                <div className="text-sm font-bold text-[#0066FF] mb-2">STEP {feature.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backer Benefits */}
      <section className="py-20">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="section-header">Earn as a Backer</h2>
            <p className="section-subtitle">Stake SOL, support developers, and earn passive income</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">10-15% APY</h3>
                    <p className="text-gray-600">Earn consistent returns from developer service fees</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#0066FF]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">LP Token Rewards</h3>
                    <p className="text-gray-600">Farm yield based on early deposit. First backers get highest multipliers</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Community Governed</h3>
                    <p className="text-gray-600">Vote on platform parameters with your LP tokens</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-[#0066FF]">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Example Return</p>
                  <p className="text-3xl font-bold text-[#0066FF] mb-1">0.0034 SOL</p>
                  <p className="text-sm text-gray-600">Per program deployed (with 5 SOL stake)</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">LP Token Mechanism</h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  <span className="font-semibold text-gray-900">Early Bird Bonus:</span> Deposit before launch and earn up to 3x LP tokens
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Yield Farming:</span> Stake LP tokens to earn additional rewards from protocol fees
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Governance Rights:</span> Vote on treasury allocation and platform upgrades
                </p>
                <p className="pt-4 border-t">
                  <span className="font-semibold text-gray-900">Formula:</span>
                  <code className="block mt-2 p-3 bg-gray-50 rounded text-sm">
                    LP Tokens = SOL × Multiplier × Time Factor
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0066FF] text-white py-20">
        <div className="container-main">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$5', label: 'Service Fee' },
              { value: '~15s', label: 'Deploy Time' },
              { value: '10-15%', label: 'Backer APY' },
              { value: '97%', label: 'Cost Savings' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-main">
          <div className="card text-center max-w-2xl mx-auto border-2 border-[#0066FF]">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Deploy?</h2>
            <p className="text-gray-600 mb-6">
              Be among the first to deploy on mainnet without breaking the bank
            </p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex space-x-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="input-field flex-1"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary whitespace-nowrap"
                >
                  Get Notified
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container-main">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 D2D. Built on Solana.
            </div>
            <div className="flex space-x-6">
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm">Documentation</Link>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Twitter</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

