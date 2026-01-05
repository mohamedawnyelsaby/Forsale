'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [piUser, setPiUser] = useState<any>(null);
  const [piBalance, setPiBalance] = useState('0');

  useEffect(() => {
    // Initialize Pi SDK
    initPiSDK();
    createStars();
    
    // Scroll animations
    const handleScroll = () => {
      revealOnScroll();
      handleHeaderScroll();
    };
    window.addEventListener('scroll', handleScroll);
    
    // Animate counters
    document.querySelectorAll('.stat-value[data-count]').forEach(animateCounter);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initPiSDK = async () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      try {
        await (window as any).Pi.init({ version: "2.0", sandbox: true });
      } catch (error) {
        console.log('Pi SDK init failed', error);
      }
    }
  };

  const connectPiWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      try {
        const auth = await (window as any).Pi.authenticate(['username', 'payments'], null);
        setPiUser(auth.user);
        const balance = Math.floor(Math.random() * 10000) + 1000;
        setPiBalance(balance.toLocaleString());
        alert(`✅ Wallet Connected!\n\nWelcome, ${auth.user.username}!\nBalance: π ${balance.toLocaleString()}`);
      } catch (error) {
        alert('❌ Connection Failed');
      }
    }
  };

  const createStars = () => {
    const bg = document.querySelector('.animated-bg');
    if (!bg) return;
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      bg.appendChild(star);
    }
  };

  const animateCounter = (element: Element) => {
    const target = parseInt(element.getAttribute('data-count') || '0');
    if (!target) return;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  };

  const revealOnScroll = () => {
    const reveals = document.querySelectorAll('.scroll-reveal');
    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementTop < windowHeight - 100) {
        element.classList.add('revealed');
      }
    });
  };

  const handleHeaderScroll = () => {
    const header = document.getElementById('header');
    if (header) {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar?.classList.toggle('active');
    overlay?.classList.toggle('active');
  };

  return (
    <>
      <style jsx global>{`
        /* كل الـ CSS من index.html */
        :root {
          --primary: #10B981;
          --primary-dark: #059669;
          --secondary: #FBBF24;
          --bg-primary: #0a0e1a;
          --bg-secondary: #1a1f2e;
          --card-bg: rgba(255, 255, 255, 0.05);
          --text-primary: #FFFFFF;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
          color: var(--text-primary);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          transition: all 0.3s;
        }

        .header.scrolled {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
        }

        .logo-icon {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          animation: logoGlow 3s infinite;
        }

        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }

        .logo-text {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pi-balance {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
          border: 2px solid var(--secondary);
          padding: 0.75rem 1rem;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .pi-balance:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
        }

        .pi-icon {
          width: 24px;
          height: 24px;
          background: var(--secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #000;
          font-size: 0.8rem;
        }

        .hero {
          padding-top: 180px;
          padding-bottom: 4rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2rem, 7vw, 4rem);
          font-weight: 900;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 1s ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          animation: fadeInUp 1s ease 0.2s both;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 1s ease 0.4s both;
        }

        .hero-button {
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.3s;
        }

        .hero-button-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
        }

        .hero-button-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.5);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 3rem 0;
          max-width: 1400px;
          padding: 0 2rem;
        }

        .stat-card {
          background: var(--card-bg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2);
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s;
        }

        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="animated-bg"></div>

      <header className="header" id="header">
        <div className="header-content">
          <div className="logo" onClick={() => router.push('/')}>
            <div className="logo-icon">🚀</div>
            <div className="logo-text">Forsale</div>
          </div>

          <div className="pi-balance" onClick={connectPiWallet}>
            <div className="pi-icon">π</div>
            <span>{piBalance}</span>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            The Future of<br/>Decentralized Commerce
          </h1>
          <p className="hero-subtitle">
            Buy and sell with confidence using Pi cryptocurrency
          </p>
          <div className="hero-buttons">
            <button className="hero-button hero-button-primary" onClick={() => router.push('/products')}>
              🔍 Explore Products
            </button>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="stats scroll-reveal">
          <div className="stat-card" onClick={() => router.push('/products')}>
            <div className="stat-icon">📦</div>
            <div className="stat-value" data-count="2567890">0</div>
            <div className="stat-label">Products Listed</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value" data-count="500000">0</div>
            <div className="stat-label">Active Sellers</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div className="stat-value" data-count="1000000">0</div>
            <div className="stat-label">Happy Users</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">π 50M+</div>
            <div className="stat-label">Trading Volume</div>
          </div>
        </div>
      </div>
    </>
  );
}
