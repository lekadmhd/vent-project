import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor() {
    const keyHex = process.env.CRYPTO_KEY ?? '';
    let key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'CRYPTO_KEY must be a 64-char hex string (32 bytes) for AES-256-GCM',
        );
      }
      console.warn(
        '[CryptoService] CRYPTO_KEY missing/invalid - using DEVELOPMENT key. Set CRYPTO_KEY for production.',
      );
      key = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex');
    }
    this.key = key;
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join('.');
  }

  decrypt(cipherText: string): string {
    const [ivB64, tagB64, dataB64] = cipherText.split('.');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(dataB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}
