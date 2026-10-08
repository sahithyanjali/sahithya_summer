import crypto from "crypto";
import type {
  IPaymentProvider,
  ProviderMetadata,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams
} from "../types.ts";
import { logger } from "../../logger.ts";

export class RazorpayPaymentProvider implements IPaymentProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "RAZORPAY_GATEWAY",
    isMock: false,
    version: "1.0.0"
  };

  private keyId: string;
  private keySecret: string;

  constructor(keyId: string, keySecret: string) {
    if (!keyId || !keySecret) {
      throw new Error("RazorpayPaymentProvider requires keyId and keySecret");
    }
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  getPublicKey(): string {
    return this.keyId;
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    const amountInPaise = Math.round(params.amountInRupees * 100);
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: params.currency || "INR",
        receipt: params.receiptId,
        notes: params.notes || {}
      })
    });

    const data = await response.json();
    if (!response.ok) {
      logger.error("Razorpay order creation failed", data);
      throw new Error(data?.error?.description || "Failed to create Razorpay order");
    }

    return {
      success: true,
      orderId: data.id,
      amountInPaise: data.amount,
      currency: data.currency,
      keyId: this.keyId,
      isMock: false
    };
  }

  async verifySignature(params: VerifyPaymentParams): Promise<boolean> {
    try {
      const payload = `${params.orderId}|${params.paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(payload)
        .digest("hex");

      const match = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf-8"),
        Buffer.from(params.signature, "utf-8")
      );

      return match;
    } catch (err) {
      logger.error("Razorpay signature verification exception", err);
      return false;
    }
  }

  async refund(paymentId: string, amountInRupees?: number, reason?: string): Promise<{ success: boolean; refundId: string }> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const body: Record<string, any> = { notes: { reason: reason || "Donor requested refund" } };
    if (amountInRupees) {
      body.amount = Math.round(amountInRupees * 100);
    }

    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      logger.error("Razorpay refund failed", data);
      throw new Error(data?.error?.description || "Failed to process refund");
    }

    return {
      success: true,
      refundId: data.id
    };
  }
}
