// PATH: scripts/modules/pi/pi.client.js

import { PiEnv } from "./pi.env.js";

export const PiClient = {
  isAvailable() {
    return typeof window.Pi !== "undefined";
  },

  async login() {
    if (!this.isAvailable()) {
      throw new Error("Pi SDK not available");
    }

    const scopes = ["payments", "username"];
    const auth = await window.Pi.authenticate(scopes);
    return auth;
  },

  network() {
    return PiEnv.network; // testnet | mainnet
  }
};
