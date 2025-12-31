// src/config/i18n.ts - Multi-Language Configuration
export const languages = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    translations: {
      welcome: 'Welcome to PiGlobal',
      login: 'Connect Pi Wallet',
      balance: 'Balance',
      send: 'Send',
      receive: 'Receive',
      transactions: 'Transactions',
      dashboard: 'Dashboard',
      settings: 'Settings',
    },
  },
  ar: {
    name: 'العربية',
    flag: '🇪🇬',
    translations: {
      welcome: 'مرحباً بك في PiGlobal',
      login: 'ربط محفظة Pi',
      balance: 'الرصيد',
      send: 'إرسال',
      receive: 'استقبال',
      transactions: 'المعاملات',
      dashboard: 'لوحة التحكم',
      settings: 'الإعدادات',
    },
  },
  zh: {
    name: '中文',
    flag: '🇨🇳',
    translations: {
      welcome: '欢迎来到PiGlobal',
      login: '连接Pi钱包',
      balance: '余额',
      send: '发送',
      receive: '接收',
      transactions: '交易',
      dashboard: '仪表板',
      settings: '设置',
    },
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    translations: {
      welcome: 'Bienvenido a PiGlobal',
      login: 'Conectar Monedero Pi',
      balance: 'Saldo',
      send: 'Enviar',
      receive: 'Recibir',
      transactions: 'Transacciones',
      dashboard: 'Panel',
      settings: 'Configuración',
    },
  },
  hi: {
    name: 'हिन्दी',
    flag: '🇮🇳',
    translations: {
      welcome: 'PiGlobal में आपका स्वागत है',
      login: 'Pi वॉलेट कनेक्ट करें',
      balance: 'शेष राशि',
      send: 'भेजें',
      receive: 'प्राप्त करें',
      transactions: 'लेन-देन',
      dashboard: 'डैशबोर्ड',
      settings: 'सेटिंग्स',
    },
  },
  pt: {
    name: 'Português',
    flag: '🇧🇷',
    translations: {
      welcome: 'Bem-vindo ao PiGlobal',
      login: 'Conectar Carteira Pi',
      balance: 'Saldo',
      send: 'Enviar',
      receive: 'Receber',
      transactions: 'Transações',
      dashboard: 'Painel',
      settings: 'Configurações',
    },
  },
};

// src/lib/analytics.ts - Global Analytics Tracking
export class Analytics {
  static track(event: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined') {
      console.log('Analytics:', event, properties);
      // Integrate with your analytics service (Google Analytics, Mixpanel, etc.)
      // window.gtag?.('event', event, properties);
    }
  }

  static pageView(path: string) {
    this.track('page_view', { path });
  }

  static transaction(amount: number, currency: string = 'Pi') {
    this.track('transaction', { amount, currency, timestamp: Date.now() });
  }

  static userSignup(userId: string) {
    this.track('user_signup', { userId, timestamp: Date.now() });
  }
}

// src/lib/api.ts - Global API Client
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.piglobal.app';

export class ApiClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('pi_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getUserProfile(userId: string) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async getTransactions(userId: string, limit = 50) {
    const response = await this.client.get(`/users/${userId}/transactions`, {
      params: { limit },
    });
    return response.data;
  }

  async createTransaction(data: {
    from: string;
    to: string;
    amount: number;
    memo?: string;
  }) {
    const response = await this.client.post('/transactions', data);
    return response.data;
  }

  async getGlobalStats() {
    const response = await this.client.get('/stats/global');
    return response.data;
  }

  async getLeaderboard(limit = 100) {
    const response = await this.client.get('/leaderboard', {
      params: { limit },
    });
    return response.data;
  }
}

export const api = new ApiClient();

// src/store/globalStore.ts - Global State Management with Zustand
import { create } from 'zustand';

interface GlobalState {
  user: any | null;
  balance: number;
  language: string;
  theme: 'light' | 'dark';
  notifications: any[];
  
  setUser: (user: any) => void;
  setBalance: (balance: number) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  user: null,
  balance: 0,
  language: 'en',
  theme: 'dark',
  notifications: [],

  setUser: (user) => set({ user }),
  setBalance: (balance) => set({ balance }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id: Date.now() }],
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

// src/lib/utils.ts - Global Utility Functions
export const formatPiAmount = (amount: number): string => {
  return `${amount.toFixed(2)} π`;
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const shortenAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const generateReferralCode = (username: string): string => {
  return `${username.toLowerCase()}_${Math.random().toString(36).substr(2, 6)}`;
};

export const validatePiAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000;
};

// src/hooks/usePiAuth.ts - Custom Hook for Pi Authentication
import { useState, useEffect } from 'react';
import { piNetwork } from './pi-sdk';
import { useGlobalStore } from '@/store/globalStore';

export const usePiAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setUser, setBalance } = useGlobalStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await piNetwork.authenticate();
      if (auth) {
        setIsAuthenticated(true);
        setUser(auth.user);
        // Load user balance from API
        setBalance(Math.random() * 1000); // Replace with actual API call
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const auth = await piNetwork.authenticate();
      setIsAuthenticated(true);
      setUser(auth.user);
      return auth;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setBalance(0);
  };

  return {
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
};

// .env.local.example - Environment Variables Template
/*
# Pi Network Configuration
NEXT_PUBLIC_PI_APP_ID=your_app_id_here
NEXT_PUBLIC_PI_API_KEY=your_api_key_here

# API Configuration
NEXT_PUBLIC_API_URL=https://api.piglobal.app
NEXT_PUBLIC_CDN_URL=https://cdn.piglobal.app

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_REFERRALS=true

# Environment
NODE_ENV=production
*/
