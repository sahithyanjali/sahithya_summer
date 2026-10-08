/**
 * Production-Safe Structured Logger
 * 
 * Guarantees that sensitive data (passwords, tokens, OTPs, Aadhaar numbers, 
 * payment secrets, API keys) are redacted from server logs.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "otp",
  "secret",
  "key",
  "apikey",
  "api_key",
  "gemini_api_key",
  "razorpay_key_secret",
  "twilio_auth_token",
  "private_key",
  "aadhaar",
  "credit_card",
  "cvv",
  "cookie"
]);

function redactValue(key: string, val: any): any {
  if (val === null || val === undefined) return val;
  const lowerKey = key.toLowerCase();
  
  for (const s of SENSITIVE_KEYS) {
    if (lowerKey.includes(s)) {
      if (typeof val === "string" && val.length > 8) {
        return `${val.substring(0, 3)}***REDACTED***`;
      }
      return "[REDACTED]";
    }
  }

  if (typeof val === "object" && !Array.isArray(val)) {
    return redactObject(val);
  }
  if (Array.isArray(val)) {
    return val.map((item, idx) => redactValue(String(idx), item));
  }
  return val;
}

export function redactObject(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== "object") return obj;
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    cleaned[k] = redactValue(k, v);
  }
  return cleaned;
}

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "AUDIT";

export class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const safeMeta = meta ? redactObject(meta) : undefined;
    
    const entry: Record<string, any> = {
      timestamp,
      level,
      message,
      ...(safeMeta ? { meta: safeMeta } : {})
    };

    if (this.isProduction) {
      // In production, emit single-line JSON log for Cloud Logging / Stackdriver
      console.log(JSON.stringify(entry));
    } else {
      const metaStr = safeMeta ? ` | ${JSON.stringify(safeMeta)}` : "";
      console.log(`[${timestamp}] [${level}] ${message}${metaStr}`);
    }
  }

  public debug(message: string, meta?: Record<string, any>) {
    if (!this.isProduction) {
      this.log("DEBUG", message, meta);
    }
  }

  public info(message: string, meta?: Record<string, any>) {
    this.log("INFO", message, meta);
  }

  public warn(message: string, meta?: Record<string, any>) {
    this.log("WARN", message, meta);
  }

  public error(message: string, err?: any, meta?: Record<string, any>) {
    const errorDetails = err instanceof Error 
      ? { errorMessage: err.message, name: err.name }
      : { rawError: String(err) };
    
    this.log("ERROR", message, { ...errorDetails, ...meta });
  }

  public audit(action: string, actor: string, details: Record<string, any>) {
    this.log("AUDIT", `Audit: ${action} by ${actor}`, {
      action,
      actor,
      ...details
    });
  }
}

export const logger = new Logger();
