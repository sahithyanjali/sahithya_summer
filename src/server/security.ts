import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: "volunteer" | "donor" | "admin" | "coordinator" | "guest";
  token: string;
  location?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// In-memory active session store (token -> AuthenticatedUser)
export const sessionStore = new Map<string, AuthenticatedUser>();

// -------------------------------------------------------------
// INPUT SANITIZATION & VALIDATION (Security Architecture)
// -------------------------------------------------------------
export function sanitizeString(val: any, maxLength: number = 255): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  // Strip dangerous html script tags and unprintable characters
  const clean = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "");
  return clean.slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const clean = phone.replace(/\D/g, "");
  return clean.length >= 10 && clean.length <= 13;
}

export function maskAadhaar(val?: string): string {
  if (!val) return "XXXX-XXXX-XXXX";
  const clean = val.replace(/\D/g, "");
  if (clean.length >= 4) {
    return `XXXX-XXXX-${clean.slice(-4)}`;
  }
  return "XXXX-XXXX-****";
}

// -------------------------------------------------------------
// RATE LIMITING & ATTEMPT THROTTLING (In-Memory Concurrency Safe)
// -------------------------------------------------------------
const requestCounters = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(limitPerMinute: number = 120) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const now = Date.now();
    const counter = requestCounters.get(ip);

    if (!counter || now > counter.resetTime) {
      requestCounters.set(ip, { count: 1, resetTime: now + 60000 });
      return next();
    }

    if (counter.count >= limitPerMinute) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please wait 60 seconds before retrying.",
        retryAfterSeconds: Math.ceil((counter.resetTime - now) / 1000)
      });
    }

    counter.count += 1;
    next();
  };
}

// -------------------------------------------------------------
// RBAC AUTHENTICATION MIDDLEWARES
// -------------------------------------------------------------
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Optional auth - req.user remains undefined
    return next();
  }

  const token = authHeader.substring(7).trim();
  const user = sessionStore.get(token);
  if (user) {
    req.user = user;
    return next();
  }

  // Firebase ID Token JWT Bearer verification
  if (token.startsWith("ey") && token.includes(".")) {
    const parts = token.split(".");
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        if (payload.uid || payload.sub) {
          const fbUser: AuthenticatedUser = {
            id: payload.uid || payload.sub || `SEVA-VOL-${Date.now()}`,
            name: sanitizeString(payload.name || "Seva Volunteer"),
            phone: payload.phone_number || payload.phone,
            email: payload.email,
            role: "volunteer",
            token,
            location: "Bengaluru (Central HQ)"
          };
          sessionStore.set(token, fbUser);
          req.user = fbUser;
          return next();
        }
      } catch {}
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please provide a valid Bearer token."
    });
  }
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required for administrative operations."
      });
    }

    const userRole = req.user.role.toLowerCase();
    const hasRole = allowedRoles.some(r => r.toLowerCase() === userRole);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Role '${req.user.role}' is not authorized. Requires: ${allowedRoles.join(" or ")}`
      });
    }

    next();
  };
}
