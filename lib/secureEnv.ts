/**
 * Secure environment variable handler
 * Automatically encrypts sensitive credentials
 * 
 * Usage in .env:
 * - Regular variables: REGULAR_VAR=value
 * - Encrypted variables: ENCRYPTED_DATABASE_URL={"iv":"...","encryptedData":"...","authTag":"..."}
 * - Or use encryption utility: npm run encrypt -- "value"
 */

import { deserializeAndDecrypt, encryptAndSerialize } from './encryption';

type EncryptedVar = 'CLIENT_ID' | 'CLIENT_SECRET' | 'DATABASE_URL' | 'DIRECT_URL' | 'NEXTAUTH_SECRET';

const ENCRYPTED_VARS = new Set<EncryptedVar>([
    'CLIENT_ID',
    'CLIENT_SECRET',
    'DATABASE_URL',
    'DIRECT_URL',
    'NEXTAUTH_SECRET',
]);

/**
 * Get environment variable with automatic decryption for sensitive values
 * @param key - Environment variable name
 * @returns Decrypted value if encrypted, or raw value if not
 */
export function getSecureEnv(key: string): string | undefined {
    const rawValue = process.env[key];

    if (!rawValue) {
        return undefined;
    }

    // Check if this is a sensitive variable
    if (ENCRYPTED_VARS.has(key as EncryptedVar)) {
        try {
            // Try to parse as encrypted data
            if (rawValue.startsWith('{')) {
                return deserializeAndDecrypt(rawValue);
            }
        } catch (error) {
            console.warn(`Warning: Failed to decrypt ${key}, using raw value`, error);
            return rawValue;
        }
    }

    return rawValue;
}

/**
 * Encrypt a value for storage in .env
 * @param value - Plain text value to encrypt
 * @returns Encrypted value ready for .env
 */
export function encryptForEnv(value: string): string {
    return encryptAndSerialize(value);
}

/**
 * Get all secure environment variables (for validation)
 */
export function getAllSecureEnv(): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {};
    const requiredVars = [
        'CLIENT_ID',
        'CLIENT_SECRET',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'DATABASE_URL',
        'DIRECT_URL',
    ];

    for (const key of requiredVars) {
        result[key] = getSecureEnv(key);
    }

    return result;
}
