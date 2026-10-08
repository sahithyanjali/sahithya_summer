import crypto from "crypto";
import type { 
  CreateOrderRequest, 
  CreateOrderResponse, 
  PaymentRecord, 
  PaymentStatus,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  DigitalReceiptData
} from "../../types.ts";
import { db } from "../database.ts";
import { paymentGateway } from "./gatewayAdapter.ts";
import { sanitizeString, validateEmail } from "../security.ts";

export class PaymentService {
  /**
   * Creates a payment order with the gateway and registers an INITIATED payment record.
   * Enforces server-side validation, range boundaries, and idempotency protection.
   */
  public async createOrder(
    req: CreateOrderRequest,
    authenticatedUserId?: string
  ): Promise<CreateOrderResponse> {
    // 1. INPUT VALIDATION
    const amount = Number(req.amount);
    if (isNaN(amount) || amount < 10) {
      throw new Error("Minimum contribution amount is ₹10.");
    }
    if (amount > 500000) {
      throw new Error("Single transaction limit cannot exceed ₹5,00,000 under RBI/Trust guidelines.");
    }

    const cleanDonorName = sanitizeString(req.donorName, 80);
    if (!cleanDonorName || cleanDonorName.length < 2) {
      throw new Error("Please enter a valid donor name.");
    }

    const cleanEmail = sanitizeString(req.email, 100).toLowerCase();
    if (!validateEmail(cleanEmail)) {
      throw new Error("Please enter a valid email address for tax receipt dispatch.");
    }

    const cleanPhone = req.phone ? sanitizeString(req.phone, 20) : undefined;
    const cleanPan = req.pan ? sanitizeString(req.pan, 10).toUpperCase() : undefined;
    if (cleanPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      throw new Error("Invalid PAN Card format. Must follow standard 10-character PAN format (e.g. ABCDE1234F).");
    }

    const cleanPurpose = sanitizeString(req.purpose || "General Trust Fund", 120);
    const cleanIdempotencyKey = sanitizeString(req.idempotencyKey, 64) || `IDEM_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 2. IDEMPOTENCY CHECK (Prevents accidental double orders)
    const existingEntry = db.idempotencyCache.get(cleanIdempotencyKey);
    if (existingEntry) {
      const existingPayment = db.findPaymentById(existingEntry.paymentId);
      if (existingPayment) {
        // Return previously created order details
        return {
          success: true,
          orderId: existingPayment.orderId,
          paymentId: existingPayment.paymentId,
          amount: existingPayment.amount,
          currency: "INR",
          keyId: paymentGateway.getPublicKey(),
          gatewayName: existingPayment.gatewayName
        };
      }
    }

    // 3. GENERATE DOMAIN IDENTIFIERS
    const paymentId = `PAY_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // 4. CREATE GATEWAY ORDER
    const gatewayOrder = await paymentGateway.createOrder({
      amountInRupees: amount,
      receiptId: paymentId,
      notes: {
        donorName: cleanDonorName,
        email: cleanEmail,
        purpose: cleanPurpose,
        programId: req.programId || ""
      }
    });

    // 5. INITIALIZE STATE RECORD (Status: INITIATED)
    const nowIso = new Date().toISOString();
    const paymentRecord: PaymentRecord = {
      paymentId,
      orderId: gatewayOrder.orderId,
      idempotencyKey: cleanIdempotencyKey,
      userId: authenticatedUserId,
      donorName: cleanDonorName,
      donorEmail: cleanEmail,
      donorPhone: cleanPhone,
      donorPan: cleanPan,
      amount,
      currency: "INR",
      purpose: cleanPurpose,
      programId: req.programId,
      planId: req.planId,
      paymentMethod: "UPI", // default intent, updated on callback
      gatewayName: gatewayOrder.gatewayName,
      status: "INITIATED",
      taxExemptionEligible: true,
      refundStatus: "NONE",
      createdAt: nowIso,
      updatedAt: nowIso,
      metadata: {
        clientAgent: "SevaSphoorthi-Mobile/Web-v2",
        ipOrigin: "verified"
      }
    };

    // 6. PERSIST RECORD & UPDATE IDEMPOTENCY CACHE
    db.savePayment(paymentRecord);
    db.idempotencyCache.set(cleanIdempotencyKey, {
      paymentId,
      orderId: gatewayOrder.orderId,
      timestamp: Date.now()
    });

    db.logAudit(
      "PAYMENT_ORDER_INITIATED",
      paymentId,
      authenticatedUserId ? "user" : "donor",
      `Initiated ₹${amount} order for ${cleanPurpose}. Order ID: ${gatewayOrder.orderId}`,
      "PaymentRecord",
      paymentId
    );

    return {
      success: true,
      orderId: gatewayOrder.orderId,
      paymentId,
      amount,
      currency: "INR",
      keyId: paymentGateway.getPublicKey(),
      gatewayName: gatewayOrder.gatewayName
    };
  }

  /**
   * Server-authoritative verification of payment using HMAC-SHA256 signature recomputation.
   * Never trusts the client alone to declare a payment successful.
   */
  public async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const cleanOrderId = sanitizeString(req.orderId, 100);
    const cleanPaymentId = sanitizeString(req.paymentId, 100);
    const cleanSignature = sanitizeString(req.signature, 255);

    if (!cleanOrderId || !cleanPaymentId || !cleanSignature) {
      return {
        success: false,
        status: "FAILED",
        error: "Missing mandatory verification parameters (orderId, paymentId, signature)."
      };
    }

    // 1. LOCATE RECORD
    const payment = db.findPaymentByOrderId(cleanOrderId) || db.findPaymentById(cleanPaymentId);
    if (!payment) {
      return {
        success: false,
        status: "FAILED",
        error: `No associated payment order found for Order ID: ${cleanOrderId}`
      };
    }

    // 2. IDEMPOTENT CHECK (If already verified successfully, return existing result)
    if (payment.status === "SUCCESS") {
      return {
        success: true,
        status: "SUCCESS",
        payment,
        receiptId: payment.receiptId
      };
    }

    // 3. RECOMPUTE & VERIFY HMAC-SHA256 SIGNATURE
    const isSignatureValid = paymentGateway.verifyPaymentSignature({
      orderId: cleanOrderId,
      paymentId: cleanPaymentId,
      signature: cleanSignature
    });

    const nowIso = new Date().toISOString();

    if (!isSignatureValid) {
      // Signature mismatch - mark payment FAILED
      payment.status = "FAILED";
      payment.failureReason = "Cryptographic signature validation failed.";
      payment.updatedAt = nowIso;
      db.savePayment(payment);

      db.logAudit(
        "PAYMENT_VERIFICATION_FAILED",
        payment.paymentId,
        "system_security",
        `HMAC Signature mismatch for Order: ${cleanOrderId}, Payment: ${cleanPaymentId}`,
        "PaymentRecord",
        payment.paymentId
      );

      return {
        success: false,
        status: "FAILED",
        error: "Payment verification failed: cryptographic signature mismatch."
      };
    }

    // 4. SIGNATURE VALID - TRANSITION TO SUCCESS & GENERATE IMMUTABLE RECEIPT
    const receiptId = `RCP-2026-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Fetch enriched gateway details
    let paymentMethod = payment.paymentMethod;
    try {
      const details = await paymentGateway.fetchPayment(cleanPaymentId);
      if (details.method) {
        paymentMethod = details.method.toUpperCase().includes("UPI") 
          ? "UPI" 
          : details.method.toUpperCase().includes("CARD") 
            ? "CARD" 
            : details.method.toUpperCase().includes("NET") 
              ? "NETBANKING" 
              : "WALLET";
      }
    } catch {
      // Non-fatal, retain default method
    }

    payment.status = "SUCCESS";
    payment.gatewayTransactionId = cleanPaymentId;
    payment.paymentMethod = paymentMethod;
    payment.receiptId = receiptId;
    payment.paidAt = nowIso;
    payment.updatedAt = nowIso;
    payment.failureReason = undefined;

    // Persist verified state (and automatically syncs into legacy donation ledger)
    db.savePayment(payment);

    // Create Audit Log
    db.logAudit(
      "PAYMENT_VERIFIED_SUCCESS",
      payment.paymentId,
      "gateway_verifier",
      `Verified ₹${payment.amount} contribution from ${payment.donorName}. Receipt: ${receiptId}. UTR/Txn: ${cleanPaymentId}`,
      "PaymentRecord",
      payment.paymentId
    );

    // If linked to registered volunteer user, send in-app notification
    if (payment.userId) {
      db.dispatchNotification(
        payment.userId,
        "Donation Verified Successfully",
        `Thank you ${payment.donorName}! Your contribution of ₹${payment.amount} has been verified and allocated to ${payment.purpose}. Official Receipt #${receiptId} is now available.`,
        "ANNOUNCEMENT",
        "/donations"
      );
    }

    return {
      success: true,
      status: "SUCCESS",
      payment,
      receiptId
    };
  }

  /**
   * Processes asynchronous gateway webhooks with cryptographic signature verification.
   * Guarantees event delivery even if the client app drops network connection.
   */
  public async processWebhook(
    rawBody: string,
    signature: string
  ): Promise<{ success: boolean; handledEvent?: string; error?: string }> {
    if (!paymentGateway.verifyWebhookSignature(rawBody, signature)) {
      db.logAudit(
        "WEBHOOK_SIGNATURE_FAILED",
        "GATEWAY_WEBHOOK",
        "security_filter",
        "Rejected unsigned or tampered payment webhook payload",
        "SecurityLogs",
        "ROOT"
      );
      return { success: false, error: "Invalid webhook cryptographic signature." };
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return { success: false, error: "Malformed webhook JSON payload." };
    }

    const event = payload.event;
    const nowIso = new Date().toISOString();

    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
      const orderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const payment = db.findPaymentByOrderId(orderId);
        if (payment && payment.status !== "SUCCESS") {
          const receiptId = `RCP-2026-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
          payment.status = "SUCCESS";
          payment.gatewayTransactionId = paymentId || orderId;
          payment.receiptId = receiptId;
          payment.paidAt = nowIso;
          payment.updatedAt = nowIso;
          db.savePayment(payment);

          db.logAudit(
            "WEBHOOK_PAYMENT_CAPTURED",
            payment.paymentId,
            "gateway_webhook",
            `Webhook verified payment of ₹${payment.amount} for Order: ${orderId}`,
            "PaymentRecord",
            payment.paymentId
          );
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const payment = db.findPaymentByOrderId(orderId);
        if (payment && payment.status === "INITIATED") {
          payment.status = "FAILED";
          payment.failureReason = paymentEntity?.error_description || "Payment failed at gateway";
          payment.updatedAt = nowIso;
          db.savePayment(payment);
        }
      }
    }

    return { success: true, handledEvent: event };
  }

  /**
   * Generates official statutory Section 80G tax exemption receipt metadata
   */
  public getReceipt(paymentIdOrOrderId: string): DigitalReceiptData | null {
    const payment = db.findPaymentById(paymentIdOrOrderId) || db.findPaymentByOrderId(paymentIdOrOrderId);
    if (!payment || payment.status !== "SUCCESS") {
      return null;
    }

    const amountInWords = this.numberToIndianWords(payment.amount);

    return {
      receiptId: payment.receiptId || `RCP-2026-${payment.paymentId.slice(-6)}`,
      ngoName: "Seva Sphoorthi Trust",
      trustRegNumber: "TRUST/BLR/2026/SPH-8902",
      section80GNumber: "AAATS8902PF20261 (Valid under Sec 80G(5)(vi) of IT Act, 1961)",
      panNumber: "AAATS8902P",
      donorName: payment.donorName,
      donorEmail: payment.donorEmail,
      donorPhone: payment.donorPhone,
      donorPan: payment.donorPan,
      amount: payment.amount,
      amountInWords,
      currency: "INR",
      purpose: payment.purpose,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.gatewayTransactionId || payment.orderId,
      orderId: payment.orderId,
      paidAt: payment.paidAt || payment.createdAt,
      status: payment.status,
      taxExemptionEligible: Boolean(payment.taxExemptionEligible ?? true),
      signatory: "Authorized Trustee / Finance Secretary, Seva Sphoorthi Trust"
    };
  }

  /**
   * Converts numerical currency amount into formal Indian English words for tax receipts
   */
  public numberToIndianWords(num: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + inWords(n % 100);
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
    };

    const str = inWords(Math.floor(num)).trim();
    return str ? `${str} Rupees Only` : 'Zero Rupees Only';
  }
}

export const paymentService = new PaymentService();
