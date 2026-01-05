export interface PiNetworkConfig {
  apiKey: string;
  walletPrivateKey: string;
}

export interface PiPayment {
  identifier: string;
  amount: number;
  memo: string;
  metadata: Object;
  to_address: string;
}

export interface User {
  id: string;
  username: string;
  roles: string[];
}
