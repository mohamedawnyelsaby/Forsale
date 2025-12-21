// PATH: scripts/core/env/env.config.js

import { ENVIRONMENTS } from "./env.constants.js";

export const ENV_CONFIG = {
  [ENVIRONMENTS.DEV]: {
    apiBaseUrl: "http://localhost:8080",
    frontendBaseUrl: "http://localhost:3000",
    piNetwork: "testnet",
    features: {
      payments: false,
      marketplace: true
    }
  },

  [ENVIRONMENTS.TESTNET]: {
    apiBaseUrl: "https://forsale-testnet.up.railway.app",
    frontendBaseUrl: "https://pi-forsale.vercel.app",
    piNetwork: "testnet",
    features: {
      payments: true,
      marketplace: true
    }
  },

  [ENVIRONMENTS.MAINNET]: {
    apiBaseUrl: "https://forsale-production.up.railway.app",
    frontendBaseUrl: "https://pi-forsale.vercel.app",
    piNetwork: "mainnet",
    features: {
      payments: true,
      marketplace: true
    }
  }
};
