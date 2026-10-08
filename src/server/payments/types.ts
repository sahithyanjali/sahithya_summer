export interface GatewayOrderResult {
  orderId: string;
  amount: number;
  currency: 'INR';
  keyId: string;
  status: string;
  gatewayName: 'RAZORPAY' | 'CASHFREE' | 'OFFLINE_RECORD';
  rawResponse?: any;
}

export interface GatewayPaymentDetails {
  paymentId: string;
  orderId: string;
  status: 'captured' | 'failed' | 'authorized' | 'refunded';
  amount: number;
  currency: string;
  method?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email?: string;
  contact?: string;
  fee?: number;
  tax?: number;
  errorCode?: string;
  errorDescription?: string;
  createdAt: number;
}

export interface GatewayRefundResult {
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'processed' | 'pending' | 'failed';
  notes?: Record<string, string>;
  createdAt: number;
}

export interface IPaymentGateway {
  readonly gatewayName: 'RAZORPAY' | 'CASHFREE' | 'OFFLINE_RECORD';
  getPublicKey(): string;
  createOrder(params: {
    amountInRupees: number;
    receiptId: string;
    notes?: Record<string, string>;
  }): Promise<GatewayOrderResult>;
  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  fetchPayment(paymentId: string): Promise<GatewayPaymentDetails>;
  refund(params: {
    paymentId: string;
    amountInRupees?: number;
    reason?: string;
  }): Promise<GatewayRefundResult>;
}
