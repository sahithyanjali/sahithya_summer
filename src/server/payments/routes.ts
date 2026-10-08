import { Router, type Response } from "express";
import { requireRole, sanitizeString, type AuthenticatedRequest } from "../security.ts";
import { paymentService } from "./paymentService.ts";
import { paymentGateway } from "./gatewayAdapter.ts";
import { db } from "../database.ts";

export const paymentRouter = Router();

/**
 * GET /api/v1/payments/config
 * Exposes non-sensitive payment gateway public key and supported methods.
 * NEVER exposes private secrets or API keys.
 */
paymentRouter.get("/config", (_req, res: Response) => {
  res.json({
    success: true,
    keyId: paymentGateway.getPublicKey(),
    currency: "INR",
    gatewayName: paymentGateway.gatewayName,
    merchantName: "Seva Sphoorthi Trust",
    websiteUrl: "https://sevasphoorthi.com",
    supportEmail: "contact@sevasphoorthi.com",
    upiVpa: "sevasphoorthi@sbi",
    taxExemptionSection: "Section 80G",
    supportedMethods: ["UPI", "CARD", "NETBANKING", "WALLET"]
  });
});

/**
 * POST /api/v1/payments/create-order
 * Creates a server-authorized payment order with the gateway.
 * Enforces idempotency, amount constraints, and sanitized metadata.
 */
paymentRouter.post("/create-order", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      amount, 
      purpose, 
      donorName, 
      email, 
      phone, 
      pan, 
      programId, 
      planId, 
      idempotencyKey 
    } = req.body;

    const result = await paymentService.createOrder(
      {
        amount: Number(amount),
        purpose,
        donorName,
        email,
        phone,
        pan,
        programId,
        planId,
        idempotencyKey
      },
      req.user?.id
    );

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || "Failed to initialize payment order."
    });
  }
});

/**
 * GET /api/v1/payments/orders/:orderId
 * Fetches order status from database without exposing private internal details.
 */
paymentRouter.get("/orders/:orderId", (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const payment = db.findPaymentByOrderId(orderId);

  if (!payment) {
    return res.status(404).json({
      success: false,
      error: "Order not found."
    });
  }

  res.json({
    success: true,
    orderId: payment.orderId,
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    purpose: payment.purpose,
    createdAt: payment.createdAt
  });
});

/**
 * POST /api/v1/payments/verify
 * Cryptographically verifies payment signature using HMAC-SHA256.
 * Transitions state to SUCCESS, creates official 80G tax receipt, and records audit trail.
 */
paymentRouter.post("/verify", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const result = await paymentService.verifyPayment({
      orderId,
      paymentId,
      signature
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: "FAILED",
      error: err.message || "Payment verification failed."
    });
  }
});

/**
 * POST /api/v1/payments/webhook
 * Receives asynchronous gateway events (order.paid, payment.failed, refund.processed).
 * Verifies X-Razorpay-Signature with webhook secret to prevent spoofing.
 */
paymentRouter.post("/webhook", async (req: any, res: Response) => {
  try {
    const signature = (req.headers["x-razorpay-signature"] as string) || "";
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await paymentService.processWebhook(rawBody, signature);

    if (!result.success) {
      return res.status(400).json({ status: "rejected", error: result.error });
    }

    res.json({ status: "acknowledged", handledEvent: result.handledEvent });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

/**
 * GET /api/v1/payments/:id/receipt
 * Retrieves official digital tax exemption receipt (Section 80G compliant)
 */
paymentRouter.get("/:id/receipt", (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const receipt = paymentService.getReceipt(id);

  if (!receipt) {
    return res.status(404).json({
      success: false,
      error: "Verified donation receipt not found or payment is not completed."
    });
  }

  res.json({
    success: true,
    receipt
  });
});

/**
 * GET /api/v1/payments/history
 * Returns payment history filtered by user, email, or status.
 */
paymentRouter.get("/history", (req: AuthenticatedRequest, res: Response) => {
  const { status, email, userId } = req.query;

  let list = db.getPaymentsList();

  // If user is authenticated and not admin, restrict to their own payments
  const currentUser = req.user;
  const isAdmin = currentUser && currentUser.role === "admin";

  if (!isAdmin && currentUser) {
    list = list.filter(p => p.userId === currentUser.id || (p.donorEmail && p.donorEmail.toLowerCase() === currentUser.email?.toLowerCase()));
  } else if (!isAdmin && !currentUser) {
    // If guest query with specific email
    if (email) {
      list = list.filter(p => p.donorEmail && p.donorEmail.toLowerCase() === String(email).toLowerCase());
    } else {
      // Guests cannot query entire ledger
      list = [];
    }
  }

  if (status) {
    list = list.filter(p => p.status === status);
  }
  if (userId && isAdmin) {
    list = list.filter(p => p.userId === userId);
  }

  // Sort latest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    count: list.length,
    payments: list
  });
});

/**
 * POST /api/v1/payments/refund
 * Admin-authorized refund endpoint.
 * Initiates gateway refund and records audit trail.
 */
paymentRouter.post("/refund", requireRole(["admin"]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId, amount, reason } = req.body;
    const cleanPaymentId = sanitizeString(paymentId, 100);
    const cleanReason = sanitizeString(reason || "Donor requested cancellation", 200);

    const payment = db.findPaymentById(cleanPaymentId);
    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment not found." });
    }

    if (payment.status !== "SUCCESS") {
      return res.status(400).json({ success: false, error: "Only successful payments can be refunded." });
    }

    if (payment.refundStatus === "PROCESSED") {
      return res.status(400).json({ success: false, error: "Payment has already been refunded." });
    }

    const refundAmount = amount ? Number(amount) : payment.amount;
    if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > payment.amount) {
      return res.status(400).json({ success: false, error: "Invalid refund amount." });
    }

    // Call Gateway Refund
    const gatewayResult = await paymentGateway.refund({
      paymentId: payment.gatewayTransactionId || payment.paymentId,
      amountInRupees: refundAmount,
      reason: cleanReason
    });

    // Update Payment State
    payment.refundStatus = "PROCESSED";
    payment.updatedAt = new Date().toISOString();
    db.savePayment(payment);

    // Record in Refunds Ledger
    const refundRecord = {
      refundId: gatewayResult.refundId,
      paymentId: payment.paymentId,
      amount: refundAmount,
      currency: "INR",
      reason: cleanReason,
      status: gatewayResult.status.toUpperCase(),
      processedBy: req.user?.id || "admin",
      createdAt: new Date().toISOString()
    };
    db.saveRefund(refundRecord as any);

    // Audit Log
    db.logAudit(
      "PAYMENT_REFUND_PROCESSED",
      payment.paymentId,
      req.user?.id || "admin",
      `Refunded ₹${refundAmount} for Payment ${payment.paymentId}. Reason: ${cleanReason}. Refund ID: ${gatewayResult.refundId}`,
      "PaymentRecord",
      payment.paymentId
    );

    res.json({
      success: true,
      refund: refundRecord
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || "Failed to process refund."
    });
  }
});
