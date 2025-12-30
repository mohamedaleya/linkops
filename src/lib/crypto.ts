/**
 * LinkOps End-to-End Encryption Library
 *
 * Zero-knowledge encryption using native WebCrypto API.
 * All cryptographic operations happen client-side - the server
 * never sees plaintext URLs or encryption keys.
 *
 * Algorithms:
 * - Key Derivation: PBKDF2-SHA256 (600,000 iterations)
 * - Encryption: AES-256-GCM
 * - Key Wrapping: AES-KW (RFC 3394)
 */

// ============================================================================
// Types
// ============================================================================

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded
}

export interface WrappedKeyData {
  wrappedKey: string; // Base64 encoded
  salt: string; // Base64 encoded
  iv: string; // Base64 encoded
}

export interface EncryptionSetupResult {
  wrappedDek: WrappedKeyData;
  recoveryPhrase: string[];
  recoveryWrappedDek: WrappedKeyData;
}

// ============================================================================
// Constants
// ============================================================================

const PBKDF2_ITERATIONS = 600000; // OWASP recommended for SHA-256
const SALT_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const KEY_LENGTH = 256; // AES-256

// BIP39-inspired wordlist (simplified - in production use full BIP39)
const WORDLIST = [
  'abandon',
  'ability',
  'able',
  'about',
  'above',
  'absent',
  'absorb',
  'abstract',
  'absurd',
  'abuse',
  'access',
  'accident',
  'account',
  'accuse',
  'achieve',
  'acid',
  'acoustic',
  'acquire',
  'across',
  'act',
  'action',
  'actor',
  'actress',
  'actual',
  'adapt',
  'add',
  'addict',
  'address',
  'adjust',
  'admit',
  'adult',
  'advance',
  'advice',
  'aerobic',
  'affair',
  'afford',
  'afraid',
  'again',
  'age',
  'agent',
  'agree',
  'ahead',
  'aim',
  'air',
  'airport',
  'aisle',
  'alarm',
  'album',
  'alcohol',
  'alert',
  'alien',
  'all',
  'alley',
  'allow',
  'almost',
  'alone',
  'alpha',
  'already',
  'also',
  'alter',
  'always',
  'amateur',
  'amazing',
  'among',
  'amount',
  'amused',
  'analyst',
  'anchor',
  'ancient',
  'anger',
  'angle',
  'angry',
  'animal',
  'ankle',
  'announce',
  'annual',
  'another',
  'answer',
  'antenna',
  'antique',
  'anxiety',
  'any',
  'apart',
  'apology',
  'appear',
  'apple',
  'approve',
  'april',
  'arch',
  'arctic',
  'area',
  'arena',
  'argue',
  'arm',
  'armed',
  'armor',
  'army',
  'around',
  'arrange',
  'arrest',
  'arrive',
  'arrow',
  'art',
  'artefact',
  'artist',
  'artwork',
  'ask',
  'aspect',
  'assault',
  'asset',
  'assist',
  'assume',
  'asthma',
  'athlete',
  'atom',
  'attack',
  'attend',
  'attitude',
  'attract',
  'auction',
  'audit',
  'august',
  'aunt',
  'author',
  'auto',
  'autumn',
  'average',
  'avocado',
  'avoid',
  'awake',
  'aware',
  'away',
  'awesome',
  'awful',
  'awkward',
  'axis',
  'baby',
  'bachelor',
  'bacon',
  'badge',
  'bag',
  'balance',
  'balcony',
  'ball',
  'bamboo',
  'banana',
  'banner',
  'bar',
  'barely',
  'bargain',
  'barrel',
  'base',
  'basic',
  'basket',
  'battle',
  'beach',
  'bean',
  'beauty',
  'because',
  'become',
  'beef',
  'before',
  'begin',
  'behave',
  'behind',
  'believe',
  'below',
  'belt',
  'bench',
  'benefit',
  'best',
  'betray',
  'better',
  'between',
  'beyond',
  'bicycle',
  'bid',
  'bike',
  'bind',
  'biology',
  'bird',
  'birth',
  'bitter',
  'black',
  'blade',
  'blame',
  'blanket',
  'blast',
  'bleak',
  'bless',
  'blind',
  'blood',
  'blossom',
  'blouse',
  'blue',
  'blur',
  'blush',
  'board',
  'boat',
  'body',
  'boil',
  'bomb',
  'bone',
  'bonus',
  'book',
  'boost',
  'border',
  'boring',
  'borrow',
  'boss',
  'bottom',
  'bounce',
  'box',
  'boy',
  'bracket',
  'brain',
  'brand',
  'brass',
  'brave',
  'bread',
  'breeze',
  'brick',
  'bridge',
  'brief',
  'bright',
  'bring',
  'brisk',
  'broccoli',
  'broken',
  'bronze',
  'broom',
  'brother',
  'brown',
  'brush',
  'bubble',
  'buddy',
  'budget',
  'buffalo',
  'build',
  'bulb',
  'bulk',
  'bullet',
  'bundle',
  'bunker',
  'burden',
  'burger',
  'burst',
  'bus',
  'business',
  'busy',
  'butter',
  'buyer',
  'buzz',
  'cabbage',
  'cabin',
  'cable',
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

/**
 * Generate cryptographically secure random bytes
 */
function getRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Encode string to Uint8Array
 */
function encodeText(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/**
 * Decode Uint8Array to string
 */
function decodeText(bytes: ArrayBuffer): string {
  return new TextDecoder().decode(bytes);
}

// ============================================================================
// Key Derivation
// ============================================================================

/**
 * Derive an AES-256 key from a password using PBKDF2
 *
 * @param password - User's password
 * @param salt - Unique salt (32 bytes recommended)
 * @param usage - Key usage: 'wrap' for KEK, 'encrypt' for direct encryption
 * @returns Derived CryptoKey
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  usage: 'wrapKey' | 'encrypt' = 'wrapKey'
): Promise<CryptoKey> {
  // Import password as raw key material
  const passwordBytes = encodeText(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes.buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive the actual key
  const keyUsages: KeyUsage[] =
    usage === 'wrapKey' ? ['wrapKey', 'unwrapKey'] : ['encrypt', 'decrypt'];

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: usage === 'wrapKey' ? 'AES-KW' : 'AES-GCM', length: KEY_LENGTH },
    false, // Not extractable
    keyUsages
  );
}

/**
 * Generate a new salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return getRandomBytes(SALT_LENGTH);
}

// ============================================================================
// Data Encryption Key (DEK) Management
// ============================================================================

/**
 * Generate a new random Data Encryption Key
 */
export async function generateDEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // Extractable (needed for wrapping)
    ['encrypt', 'decrypt']
  );
}

/**
 * Wrap (encrypt) a DEK using a Key Encryption Key (KEK)
 *
 * @param dek - Data Encryption Key to wrap
 * @param kek - Key Encryption Key (derived from password)
 * @returns Wrapped key as ArrayBuffer
 */
export async function wrapKey(
  dek: CryptoKey,
  kek: CryptoKey
): Promise<ArrayBuffer> {
  return crypto.subtle.wrapKey('raw', dek, kek, 'AES-KW');
}

/**
 * Unwrap (decrypt) a DEK using a Key Encryption Key
 *
 * @param wrappedKey - Wrapped key bytes
 * @param kek - Key Encryption Key (derived from password)
 * @returns Unwrapped DEK
 */
export async function unwrapKey(
  wrappedKey: ArrayBuffer,
  kek: CryptoKey
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    'raw',
    wrappedKey,
    kek,
    'AES-KW',
    { name: 'AES-GCM', length: KEY_LENGTH },
    false, // Not extractable after unwrap
    ['encrypt', 'decrypt']
  );
}

// ============================================================================
// URL Encryption/Decryption
// ============================================================================

/**
 * Encrypt a URL using AES-256-GCM
 *
 * @param url - Plaintext URL to encrypt
 * @param dek - Data Encryption Key
 * @returns Encrypted data with IV
 */
export async function encryptUrl(
  url: string,
  dek: CryptoKey
): Promise<EncryptedData> {
  const iv = getRandomBytes(IV_LENGTH);
  const plaintext = encodeText(url);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    dek,
    plaintext.buffer as ArrayBuffer
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
  };
}

/**
 * Decrypt a URL using AES-256-GCM
 *
 * @param data - Encrypted data with IV
 * @param dek - Data Encryption Key
 * @returns Decrypted plaintext URL
 */
export async function decryptUrl(
  data: EncryptedData,
  dek: CryptoKey
): Promise<string> {
  const ciphertext = base64ToArrayBuffer(data.ciphertext);
  const iv = base64ToArrayBuffer(data.iv);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    dek,
    ciphertext
  );

  return decodeText(plaintext);
}

// ============================================================================
// Recovery System
// ============================================================================

/**
 * Generate a 12-word recovery phrase
 */
export function generateRecoveryPhrase(): string[] {
  const words: string[] = [];
  const randomBytes = getRandomBytes(16); // 128 bits of entropy

  // Convert bytes to word indices
  for (let i = 0; i < 12; i++) {
    // Use 11 bits per word (2048 words in BIP39, we have 256)
    const byte1 = randomBytes[Math.floor((i * 11) / 8)];
    const byte2 = randomBytes[Math.floor((i * 11) / 8) + 1] || 0;
    const shift = (i * 11) % 8;
    const index = ((byte1 << 8) | byte2) >> (16 - 11 - shift);
    words.push(WORDLIST[index % WORDLIST.length]);
  }

  return words;
}

/**
 * Derive a key from a recovery phrase
 *
 * @param phrase - 12-word recovery phrase
 * @param salt - Salt for key derivation
 * @returns Recovery KEK
 */
export async function deriveKeyFromRecoveryPhrase(
  phrase: string[],
  salt: Uint8Array
): Promise<CryptoKey> {
  const phraseString = phrase.join(' ');
  return deriveKeyFromPassword(phraseString, salt, 'wrapKey');
}

// ============================================================================
// High-Level Setup Functions
// ============================================================================

/**
 * Initialize encryption for a new user
 *
 * @param password - User's password
 * @returns Setup result with wrapped keys and recovery phrase
 */
export async function setupEncryption(
  password: string
): Promise<EncryptionSetupResult> {
  // Generate DEK
  const dek = await generateDEK();

  // Wrap DEK with password-derived key
  const passwordSalt = generateSalt();
  const kek = await deriveKeyFromPassword(password, passwordSalt, 'wrapKey');
  const wrappedDek = await wrapKey(dek, kek);

  // Generate recovery phrase and wrap DEK with it
  const recoveryPhrase = generateRecoveryPhrase();
  const recoverySalt = generateSalt();
  const recoveryKek = await deriveKeyFromRecoveryPhrase(
    recoveryPhrase,
    recoverySalt
  );
  const recoveryWrappedDek = await wrapKey(dek, recoveryKek);

  return {
    wrappedDek: {
      wrappedKey: arrayBufferToBase64(wrappedDek),
      salt: arrayBufferToBase64(passwordSalt.buffer as ArrayBuffer),
      iv: '', // AES-KW doesn't use IV
    },
    recoveryPhrase,
    recoveryWrappedDek: {
      wrappedKey: arrayBufferToBase64(recoveryWrappedDek),
      salt: arrayBufferToBase64(recoverySalt.buffer as ArrayBuffer),
      iv: '',
    },
  };
}

/**
 * Unlock encryption by deriving KEK and unwrapping DEK
 *
 * @param password - User's password
 * @param wrappedKeyData - Wrapped DEK data from server
 * @returns Unwrapped DEK ready for use
 */
export async function unlockEncryption(
  password: string,
  wrappedKeyData: WrappedKeyData
): Promise<CryptoKey> {
  const salt = base64ToArrayBuffer(wrappedKeyData.salt);
  const wrappedKey = base64ToArrayBuffer(wrappedKeyData.wrappedKey);

  const kek = await deriveKeyFromPassword(
    password,
    new Uint8Array(salt),
    'wrapKey'
  );
  return unwrapKey(wrappedKey, kek);
}

/**
 * Recover encryption using recovery phrase
 *
 * @param phrase - 12-word recovery phrase
 * @param wrappedKeyData - Recovery wrapped DEK data
 * @returns Unwrapped DEK
 */
export async function recoverWithPhrase(
  phrase: string[],
  wrappedKeyData: WrappedKeyData
): Promise<CryptoKey> {
  const salt = base64ToArrayBuffer(wrappedKeyData.salt);
  const wrappedKey = base64ToArrayBuffer(wrappedKeyData.wrappedKey);

  const recoveryKek = await deriveKeyFromRecoveryPhrase(
    phrase,
    new Uint8Array(salt)
  );
  return unwrapKey(wrappedKey, recoveryKek);
}

/**
 * Re-wrap DEK with a new password (for password changes)
 *
 * @param dek - Current DEK (must be unlocked first)
 * @param newPassword - New password
 * @returns New wrapped DEK data
 */
export async function rewrapWithNewPassword(
  dek: CryptoKey,
  newPassword: string
): Promise<WrappedKeyData> {
  const newSalt = generateSalt();
  const newKek = await deriveKeyFromPassword(newPassword, newSalt, 'wrapKey');
  const newWrappedDek = await wrapKey(dek, newKek);

  return {
    wrappedKey: arrayBufferToBase64(newWrappedDek),
    salt: arrayBufferToBase64(newSalt.buffer as ArrayBuffer),
    iv: '',
  };
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate a recovery phrase
 */
export function validateRecoveryPhrase(phrase: string[]): boolean {
  if (phrase.length !== 12) return false;
  return phrase.every((word) => WORDLIST.includes(word.toLowerCase()));
}

/**
 * Check if WebCrypto API is available
 */
export function isEncryptionSupported(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}
