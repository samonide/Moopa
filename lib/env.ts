/**
 * Environment variable validation
 * This ensures all required environment variables are present and valid
 * 
 * Sensitive variables (CLIENT_ID, CLIENT_SECRET, DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET)
 * can be stored encrypted in .env using the encryption utility.
 * 
 * See lib/encryption.ts and lib/secureEnv.ts for encryption setup.
 */

import { getSecureEnv } from './secureEnv';

const requiredEnvVars = [
    "CLIENT_ID",
    "CLIENT_SECRET",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "DATABASE_URL",
    "DIRECT_URL",
] as const;

const optionalEnvVars = [
    "REDIS_URL",
    "DISQUS_SHORTNAME",
    "ADMIN_USERNAME",
    "GRAPHQL_ENDPOINT",
    "ENCRYPTION_KEY",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];
type OptionalEnvVar = (typeof optionalEnvVars)[number];
type EnvVar = RequiredEnvVar | OptionalEnvVar;

export function validateEnv(): void {
    const missing: string[] = [];

    for (const envVar of requiredEnvVars) {
        // Use secure getEnv to handle encrypted values
        const value = getSecureEnv(envVar);
        if (!value) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missing
                .map((v) => `  - ${v}`)
                .join("\n")}\n\nPlease check your .env file. Some variables may be encrypted.`
        );
    }
}

export function getEnv(key: RequiredEnvVar): string;
export function getEnv(key: OptionalEnvVar): string | undefined;
export function getEnv(key: EnvVar): string | undefined {
    return getSecureEnv(key);
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
    validateEnv();
}
