import type { IAuthProvider, ProviderMetadata, AuthUserRecord } from "../types.ts";
import { logger } from "../../logger.ts";

export class MockAuthProvider implements IAuthProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "MOCK_AUTH_PROVIDER",
    isMock: true,
    version: "1.0.0"
  };

  private activeVerifications = new Map<string, { phone: string; otp: string; expiresAt: number }>();

  async verifyToken(idToken: string): Promise<AuthUserRecord | null> {
    if (!idToken) return null;
    
    // Support testing admin and volunteer tokens
    if (idToken.includes("admin")) {
      return {
        uid: "ADMIN-001",
        phone: "+919820089602",
        email: "admin@sevasphoorthi.org",
        displayName: "Lead Seva Trustee",
        role: "admin",
        createdAt: new Date().toISOString()
      };
    }

    return {
      uid: "VOL-SIM-001",
      phone: "+919876543210",
      displayName: "Ananya Sharma",
      role: "volunteer",
      createdAt: new Date().toISOString()
    };
  }

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; verificationId: string; message: string }> {
    const verificationId = `mock_verif_${Date.now()}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.activeVerifications.set(verificationId, {
      phone,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    logger.info("MockAuthProvider: Simulated OTP generation", { phone, verificationId });
    return {
      success: true,
      verificationId,
      message: "Verification code generated in sandbox mode."
    };
  }

  async verifyPhoneOtp(verificationId: string, otp: string): Promise<{ success: boolean; user?: AuthUserRecord; token?: string }> {
    const record = this.activeVerifications.get(verificationId);
    if (!record || Date.now() > record.expiresAt) {
      return { success: false };
    }

    if (otp === record.otp) {
      const user: AuthUserRecord = {
        uid: `USR-${record.phone.slice(-6)}`,
        phone: record.phone,
        displayName: "Seva Volunteer",
        role: "volunteer",
        createdAt: new Date().toISOString()
      };
      return {
        success: true,
        user,
        token: `mock_jwt_token_${user.uid}`
      };
    }

    return { success: false };
  }

  async setCustomRole(uid: string, role: string): Promise<boolean> {
    logger.info("MockAuthProvider: Set custom role", { uid, role });
    return true;
  }
}
