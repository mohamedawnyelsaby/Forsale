// src/app/page.tsx - Landing Page
'use client';

import { useState } from 'react';
import { piNetwork } from '@/lib/pi-sdk';

export default function LandingPage() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState(null);

  const handlePiLogin = async () => {
    setIsAuthenticating(true);
    try {
      const auth = await piNetwork.authenticate();
      setUser(auth);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Pi authentication failed:', error);
      alert('Please open this app in Pi Browser');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-950">
      {/* Header */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
              π
            </div>
            <span className="text-white font-bold text-xl">PiGlobal</span>
          </div>
          <button
            onClick={handlePiLogin}
            disabled={isAuthenticating}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isAuthenticating ? 'Connecting...' : 'Connect Pi Wallet'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-yellow-400/20 rounded-full border border-yellow-400/30">
            <span className="text-yellow-400 text-sm font-semibold">🚀 Built on Pi Network</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              Global Commerce
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join millions of Pi users worldwide. Buy, sell, and trade with zero fees. 
            The world's first truly decentralized marketplace powered by Pi cryptocurrency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handlePiLogin}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-yellow-500/50"
            >
              Get Started Free
            </button>
            <button className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all border border-white/20">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Users', value: '10M+' },
            { label: 'Transactions', value: '50M+' },
            { label: 'Countries', value: '195' },
            { label: 'Pi Exchanged', value: '1B+' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Why Choose PiGlobal?</h2>
            <p className="text-xl text-gray-400">Everything you need to succeed in the Pi ecosystem</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Instant Transactions',
                description: 'Send and receive Pi instantly. No waiting, no delays.',
              },
              {
                icon: '🔒',
                title: 'Bank-Grade Security',
                description: 'Your assets are protected with military-grade encryption.',
              },
              {
                icon: '🌍',
                title: 'Global Reach',
                description: 'Connect with Pi users in 195+ countries worldwide.',
              },
              {
                icon: '💰',
                title: 'Zero Fees',
                description: 'Keep 100% of your earnings. No hidden charges.',
              },
              {
                icon: '📱',
                title: 'Mobile First',
                description: 'Seamless experience on any device, anywhere.',
              },
              {
                icon: '🎁',
                title: 'Rewards Program',
                description: 'Earn Pi rewards for every transaction and referral.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition-all hover:scale-105"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl p-12 border border-yellow-400/30 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Go Global?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the revolution. Start trading with Pi today.
          </p>
          <button
            onClick={handlePiLogin}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl shadow-yellow-500/50"
          >
            Launch App Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                π
              </div>
              <span className="text-white font-bold">PiGlobal</span>
            </div>
            <p className="text-gray-400 text-sm">
              The world's leading Pi Network marketplace.
            </p>
          </div>
          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Security', 'Roadmap'],
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers', 'Press'],
            },
            {
              title: 'Support',
              links: ['Help Center', 'Contact', 'Status', 'Terms'],
            },
          ].map((column, idx) => (
            <div key={idx}>
              <h4 className="text-white font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
          © 2026 PiGlobal. Built with 💛 for the Pi Network community.
        </div>
      </footer>
    </div>
  );
}
