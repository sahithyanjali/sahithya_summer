import type { ISmsProvider, ProviderMetadata, SmsResult } from "../types.ts";
import { logger } from "../../logger.ts";

export class MockSmsProvider implements ISmsProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "MOCK_SMS_PROVIDER",
    isMock: true,
    version: "1.0.0"
  };

  async sendSms(to: string, message: string, templateId?: string): Promise<SmsResult> {
    const messageId = `sim_sms_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    logger.info("MockSmsProvider: Simulated SMS dispatch", {
      recipient: to,
      messageId,
      templateId,
      characterLength: message.length
    });

    return {
      success: true,
      messageId,
      deliveryStatus: "SIMULATED_MOCK",
      recipient: to,
      timestamp: new Date().toISOString()
    };
  }
}
