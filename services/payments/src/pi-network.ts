// FORSALE PI NETWORK INTEGRATION - COMPLETE
// Copy to: services/payments/src/pi-network.ts

import type { PiNetworkConfig, PiPayment, PiUser, PiNetworkMode } from '@forsale/types';

// ============================================
// CONFIG MANAGER - AUTO-SWITCHES TESTNET/MAINNET
// ============================================

class PiNetworkConfigManager {
  private static instance: PiNetworkConfigManager;
  private config: PiNetworkConfig;

  private constructor() {
    const mode = this.determineNetworkMode();
    this.config = this.buildConfig(mode);
    console.log(`[Pi Network] Running in ${mode.toUpperCase()} mode`);
  }

  static getInstance(): PiNetworkConfigManager {
    if (!PiNetworkConfigManager.instance) {
      PiNetworkConfigManager.instance = new PiNetworkConfigManager();
    }
    return PiNetworkConfigManager.instance;
  }

  private determineNetworkMode(): PiNetworkMode {
    const envMode = process.env['PI_NETWORK_MODE']?.toLowerCase();
    if (envMode === 'mainnet' || envMode === 'testnet') {
      return envMode as PiNetworkMode;
    }
    return process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
  }

  private buildConfig(mode: PiNetworkMode): PiNetworkConfig {
    const isMainnet = mode === 'mainnet';
    return {
      mode,
      apiUrl: isMainnet
        ? 'https://api.minepi.com'
        : 'https://api.testnet.minepi.com',
      apiKey: process.env.PI_API_KEY || '',
    };
  }

  getConfig(): PiNetworkConfig {
    return { ...this.config };
  }
}

// ============================================
// PI NETWORK CLIENT
// ============================================

export class PiNetworkClient {
  private config: PiNetworkConfig;

  constructor() {
    this.config = PiNetworkConfigManager.getInstance().getConfig();
    if (!this.config.apiKey) {
      throw new Error('PI_API_KEY is required');
    }
  }

  async authenticateUser(authToken: string): Promise<PiUser> {
    const response = await fetch(`${this.config.apiUrl}/v2/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Pi authentication failed');
    }

    const data = await response.json();
    return {
      uid: data.uid,
      username: data.username,
    };
  }

  async createPayment(params: {
    amount: number;
    memo: string;
    metadata: Record<string, any>;
    uid: string;
  }): Promise<PiPayment> {
    const response = await fetch(`${this.config.apiUrl}/v2/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment: {
          amount: params.amount,
          memo: params.memo,
          metadata: params.metadata,
          uid: params.uid,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Payment creation failed');
    }

    const data = await response.json();
    return {
      ...data,
      network: this.config.mode,
    };
  }

  async completePayment(paymentId: string, txid: string): Promise<PiPayment> {
    const response = await fetch(
      `${this.config.apiUrl}/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid }),
      }
    );

    if (!response.ok) {
      throw new Error('Payment completion failed');
    }

    return await response.json();
  }

  getNetworkInfo() {
    return {
      mode: this.config.mode,
      apiUrl: this.config.apiUrl,
    };
  }
}

export const piNetworkClient = new PiNetworkClient();
