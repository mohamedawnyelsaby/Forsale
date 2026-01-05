// @ts-ignore
let piInstance: any = null;

export const getPi = () => {
  if (!piInstance) {
    try {
      const PiNetwork = require("@pi-apps/pi-platform-sdk").default || require("@pi-apps/pi-platform-sdk");
      piInstance = new PiNetwork(
        process.env.PI_API_KEY || "",
        process.env.PI_WALLET_PRIVATE_KEY || ""
      );
    } catch (e) {
      console.error("SDK Load Error", e);
    }
  }
  return piInstance;
};

export const pi = {
  getIncompletePayment: () => getPi()?.getIncompletePayment(),
  completePayment: (id: string, txid: string) => getPi()?.completePayment(id, txid)
};
