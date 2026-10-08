import type {
  IPaymentProvider,
  ProviderMetadata,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams
} from "../types.ts";
import { logger } from "../../logger.ts";

export class MockPaymentProvider implements IPaymentProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "MOCK_PAYMENT_GATEWAY",
    isMock: true,
    version: "1.0.0"
  };

  private keyId: string = "rzp_test_sevasphoorthi_mock_key";

  getPublicKey(): string {
    return this.keyId;
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    const orderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const amountInPaise = Math.round(params.amountInRupees * 100);

    logger.info("MockPaymentProvider: Simulated Order Created", {
      orderId,
      amountInRupees: params.amountInRupees,
      receiptId: params.receiptId
    });

    return {
      success: true,
      orderId,
      amountInPaise,
      currency: params.currency || "INR",
      keyId: this.keyId,
      isMock: true
    };
  }

  async verifySignature(params: VerifyPaymentParams): Promise<boolean> {
    // In mock mode, any signature matching or formatted signature is accepted for automated verification
    const isValid = Boolean(params.orderId && params.paymentId);
    logger.info("MockPaymentProvider: Simulated signature verification", {
      orderId: params.orderId,
      paymentId: params.paymentId,
      isValid
    });
    return isValid;
  }

  async refund(paymentId: string, amountInRupees?: number, reason?: string): Promise<{ success: boolean; refundId: string }> {
    const refundId = `rfnd_mock_${Date.now()}`;
    logger.info("MockPaymentProvider: Simulated refund processed", {
      paymentId,
      amountInRupees,
      refundId,
      reason
    });
    return {
      success: true,
      refundId
    };
  }
}
