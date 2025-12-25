#!/usr/bin/env node

/**
 * Encryption CLI tool for Moopa
 * Usage: npm run encrypt -- "your-secret-value"
 * Or: ts-node scripts/encrypt-env.ts "your-secret-value"
 */

import { encryptAndSerialize } from '../lib/encryption';
import { randomBytes } from 'crypto';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Moopa Encryption Tool');
    console.log('====================\n');
    console.log('Usage:');
    console.log('  1. npm run encrypt -- "your-secret-value"');
    console.log('  2. npm run generate-key (for new encryption key)\n');
    console.log('Commands:');
    console.log('  encrypt "value"  - Encrypt a value for .env');
    console.log('  generate-key     - Generate a new ENCRYPTION_KEY\n');
    console.log('Example .env setup:');
    console.log('  ENCRYPTION_KEY=abc123def456... (set once, never share)');
    console.log('  ENCRYPTED_DATABASE_URL={"iv":"...","encryptedData":"...","authTag":"..."}');
    process.exit(1);
}

const command = args[0];

if (command === 'generate-key') {
    const newKey = randomBytes(32).toString('hex');
    console.log('\n✓ New encryption key generated:');
    console.log('\n' + newKey);
    console.log('\nAdd this to your .env as ENCRYPTION_KEY=<above-key>');
    console.log('⚠️  KEEP THIS KEY SAFE - it controls all encrypted data!\n');
    process.exit(0);
}

if (command === 'encrypt' && args[1]) {
    const value = args[1];
    const encrypted = encryptAndSerialize(value);
    console.log('\n✓ Encrypted value:');
    console.log('\n' + encrypted);
    console.log('\nAdd to .env as: ENCRYPTED_<VARIABLE_NAME>=' + encrypted + '\n');
    process.exit(0);
}

// Assume first argument is value to encrypt
const value = args[0];
const encrypted = encryptAndSerialize(value);
console.log('\n✓ Encrypted value:');
console.log('\n' + encrypted);
console.log('\nAdd to .env as: ENCRYPTED_<VARIABLE_NAME>=' + encrypted + '\n');
