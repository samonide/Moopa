/**
 * Encryption utility for sensitive data (database URLs, API keys, secrets)
 * Uses Node.js built-in crypto module with AES-256-GCM encryption
 * 
 * IMPORTANT: Keep ENCRYPTION_KEY secure. For production:
 * 1. Generate a new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
 * 2. Store in a secure location (AWS Secrets Manager, HashiCorp Vault, etc.)
 * 3. Never commit to version control
 * 4. Use environment variable: ENCRYPTION_KEY
 */

import * as crypto from 'crypto';

// Get encryption key from environment or generate default for development
const getEncryptionKey = (): Buffer => {
    const keyEnv = process.env.ENCRYPTION_KEY;
    if (!keyEnv) {
        // Generate a consistent key from NEXTAUTH_SECRET for development
        // This ensures the same key is used across restarts
        const secret = process.env.NEXTAUTH_SECRET || 'dev-key-insecure';
        return crypto.createHash('sha256').update(secret).digest();
    }
    // Expect hex string format
    return Buffer.from(keyEnv, 'hex');
};

const ENCRYPTION_KEY = getEncryptionKey();
const ALGORITHM = 'aes-256-gcm';

interface EncryptedData {
    iv: string;
    encryptedData: string;
    authTag: string;
}

/**
 * Encrypt sensitive data
 * @param plaintext - The data to encrypt
 * @returns Encrypted data with IV and auth tag as hex strings
 */
export function encryptData(plaintext: string): EncryptedData {
    // Generate random IV
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: authTag.toString('hex'),
    };
}

/**
 * Decrypt sensitive data
 * @param encrypted - The encrypted data object
 * @returns Decrypted plaintext
 */
export function decryptData(encrypted: EncryptedData): string {
    try {
        const iv = Buffer.from(encrypted.iv, 'hex');
        const authTag = Buffer.from(encrypted.authTag, 'hex');
        const encryptedBuffer = Buffer.from(encrypted.encryptedData, 'hex');

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);

        // Decrypt the data
        let decrypted = decipher.update(encryptedBuffer, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Serialize encrypted data to JSON string
 */
export function serializeEncrypted(encrypted: EncryptedData): string {
    return JSON.stringify(encrypted);
}

/**
 * Deserialize encrypted data from JSON string
 */
export function deserializeEncrypted(serialized: string): EncryptedData {
    return JSON.parse(serialized);
}

/**
 * Helper: Encrypt and serialize in one step
 */
export function encryptAndSerialize(plaintext: string): string {
    return serializeEncrypted(encryptData(plaintext));
}

/**
 * Helper: Deserialize and decrypt in one step
 */
export function deserializeAndDecrypt(serialized: string): string {
    return decryptData(deserializeEncrypted(serialized));
}

/**
 * Generate a new encryption key (for setup/rotation)
 * Run: npx ts-node lib/encryption.ts generate-key
 */
if (require.main === module) {
    const command = process.argv[2];
    if (command === 'generate-key') {
        const newKey = crypto.randomBytes(32).toString('hex');
        console.log('New encryption key (store in ENCRYPTION_KEY env var):');
        console.log(newKey);
    }
}
