import { CryptoUtil } from './crypto.util';

describe('CryptoUtil', () => {
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
  });

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  describe('encrypt / decrypt', () => {
    it('should encrypt and decrypt a string', () => {
      const original = 'sensitive-data-123';
      const encrypted = CryptoUtil.encrypt(original);
      expect(encrypted).not.toBe(original);
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/); // base64
      const decrypted = CryptoUtil.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    it('should produce different ciphertexts for the same input (random IV)', () => {
      const input = 'same-value';
      const a = CryptoUtil.encrypt(input);
      const b = CryptoUtil.encrypt(input);
      expect(a).not.toBe(b);
    });

    it('should handle empty strings', () => {
      expect(CryptoUtil.encrypt('')).toBe('');
      expect(CryptoUtil.decrypt('')).toBe('');
    });

    it('should return input for invalid ciphertext (decrypt fails gracefully)', () => {
      const result = CryptoUtil.decrypt('not-valid-base64!!');
      expect(result).toBe('not-valid-base64!!');
    });

    it('should handle long strings', () => {
      const long = 'a'.repeat(10000);
      const encrypted = CryptoUtil.encrypt(long);
      const decrypted = CryptoUtil.decrypt(encrypted);
      expect(decrypted).toBe(long);
    });
  });

  describe('hashToken', () => {
    it('should return a sha256 hex string', () => {
      const hash = CryptoUtil.hashToken('my-token');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should be deterministic', () => {
      const a = CryptoUtil.hashToken('same-token');
      const b = CryptoUtil.hashToken('same-token');
      expect(a).toBe(b);
    });

    it('should produce different hashes for different inputs', () => {
      const a = CryptoUtil.hashToken('token-a');
      const b = CryptoUtil.hashToken('token-b');
      expect(a).not.toBe(b);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a hex string of the requested length', () => {
      const token = CryptoUtil.generateSecureToken(16);
      expect(token).toMatch(/^[a-f0-9]+$/);
      expect(token.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should default to 32 bytes (64 hex chars)', () => {
      const token = CryptoUtil.generateSecureToken();
      expect(token.length).toBe(64);
    });

    it('should generate unique tokens', () => {
      const a = CryptoUtil.generateSecureToken();
      const b = CryptoUtil.generateSecureToken();
      expect(a).not.toBe(b);
    });
  });
});
