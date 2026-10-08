import fs from "fs";
import path from "path";
import type { IStorageProvider, ProviderMetadata, UploadResult } from "../types.ts";
import { logger } from "../../logger.ts";

export class MockStorageProvider implements IStorageProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "LOCAL_PERSISTENT_STORAGE",
    isMock: true,
    version: "1.0.0"
  };

  private uploadDir: string;

  constructor(uploadDir: string = "data/uploads") {
    this.uploadDir = path.resolve(process.cwd(), uploadDir);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(buffer: Buffer, filename: string, mimeType: string, destinationFolder: string = "docs"): Promise<UploadResult> {
    const targetFolder = path.join(this.uploadDir, destinationFolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(targetFolder, safeName);

    fs.writeFileSync(filePath, buffer);
    logger.info("MockStorageProvider: Saved file to disk", {
      filename: safeName,
      bytes: buffer.length,
      mimeType
    });

    const fileKey = `${destinationFolder}/${safeName}`;
    return {
      success: true,
      fileKey,
      fileUrl: `/api/v1/storage/${fileKey}`,
      sizeBytes: buffer.length
    };
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    return `/api/v1/storage/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    const fullPath = path.join(this.uploadDir, fileKey);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info("MockStorageProvider: Deleted file from disk", { fileKey });
      return true;
    }
    return false;
  }
}
