interface Window {
  Pi: {
    init: (config: { version: string; sandbox: boolean }) => void;
    authenticate: (
      scopes: string[],
      onIncompletePaymentFound: (payment: any) => void
    ) => Promise<{ user: { uid: string; username: string }; accessToken: string }>;
    createPayment: (
      paymentData: { amount: number; memo: string; metadata: object },
      callbacks: {
        onReadyForServerApproval: (paymentId: string) => void;
        onReadyForServerCompletion: (paymentId: string, txid: string) => void;
        onCancel: (paymentId: string) => void;
        onError: (error: Error, paymentId?: string) => void;
      }
    ) => void;
  };
}
