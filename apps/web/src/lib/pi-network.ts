import PiNetwork from "@pi-apps/pi-platform-sdk";
export const pi = new (PiNetwork as any)(
  process.env.PI_API_KEY || "",
  process.env.PI_WALLET_PRIVATE_KEY || ""
);
