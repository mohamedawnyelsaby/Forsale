import PiNetwork from "@pi-apps/pi-platform-sdk";

const apiKey = process.env.PI_API_KEY || "";
const walletPrivateKey = process.env.PI_WALLET_PRIVATE_KEY || "";

export const pi = new PiNetwork(apiKey, walletPrivateKey);
