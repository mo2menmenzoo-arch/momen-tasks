import { createHash, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

export class CryptoUtil {
  private static getKey(): Buffer {
    const keyHex = process.env.ENCRYPTION_KEY || "";
    if (keyHex.length === 64) {
      return Buffer.from(keyHex, "hex");
    }
    const salt = "momen-salt";
    return scryptSync(keyHex || "default-key", salt, KEY_LENGTH);
  }

  static encrypt(plaintext: string): string {
    if (!plaintext) return plaintext;
    const key = this.getKey();
    const iv = randomBytes(IV_LENGTH);
    const salt = randomBytes(SALT_LENGTH);
    const derivedKey = scryptSync(
      key.toString("hex"),
      salt.toString("hex"),
      KEY_LENGTH,
    );

    const { createCipheriv } = require("crypto");
    const cipher = createCipheriv(ALGORITHM, derivedKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
  }

  static decrypt(ciphertext: string): string {
    if (!ciphertext) return ciphertext;
    try {
      const data = Buffer.from(ciphertext, "base64");
      const salt = data.slice(0, SALT_LENGTH);
      const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const tag = data.slice(
        SALT_LENGTH + IV_LENGTH,
        SALT_LENGTH + IV_LENGTH + 16,
      );
      const encrypted = data.slice(SALT_LENGTH + IV_LENGTH + 16);

      const derivedKey = scryptSync(
        this.getKey().toString("hex"),
        salt.toString("hex"),
        KEY_LENGTH,
      );
      const { createDecipheriv } = require("crypto");
      const decipher = createDecipheriv(ALGORITHM, derivedKey, iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    } catch {
      return ciphertext;
    }
  }

  static hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString("hex");
  }
}
