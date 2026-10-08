import type { ISmsProvider, ProviderMetadata, SmsResult } from "../types.ts";
import { logger } from "../../logger.ts";

export class TwilioSmsProvider implements ISmsProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "TWILIO_SMS_GATEWAY",
    isMock: false,
    version: "1.0.0"
  };

  private accountSid: string;
  private authToken: string;
  private fromPhone: string;

  constructor(accountSid: string, authToken: string, fromPhone: string) {
    if (!accountSid || !authToken || !fromPhone) {
      throw new Error("TwilioSmsProvider requires accountSid, authToken, and fromPhone.");
    }
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromPhone = fromPhone;
  }

  async sendSms(to: string, message: string, _templateId?: string): Promise<SmsResult> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");
      
      const body = new URLSearchParams({
        To: to,
        From: this.fromPhone,
        Body: message
      });

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
      });

      const data = await res.json();
      if (!res.ok) {
        logger.error("Twilio API Error", data);
        return {
          success: false,
          messageId: "",
          deliveryStatus: "FAILED",
          recipient: to,
          timestamp: new Date().toISOString()
        };
      }

      logger.info("Twilio SMS sent successfully", { sid: data.sid, recipient: to });
      return {
        success: true,
        messageId: data.sid,
        deliveryStatus: "SENT",
        recipient: to,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      logger.error("Twilio send failure", err);
      return {
        success: false,
        messageId: "",
        deliveryStatus: "FAILED",
        recipient: to,
        timestamp: new Date().toISOString()
      };
    }
  }
}
