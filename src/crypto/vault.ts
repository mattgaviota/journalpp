const PBKDF2_ITERATIONS = 200_000
const SENTINEL_VALUE = 'jrnl_ok_v1'
const SALT_KEY = 'jrnl_salt'
const SENTINEL_KEY = 'jrnl_sentinel'

export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...salt))
}

export function getSalt(): string | null {
  return localStorage.getItem(SALT_KEY)
}

export function storeSalt(salt: string): void {
  localStorage.setItem(SALT_KEY, salt)
}

export async function deriveKey(passphrase: string, saltBase64: string): Promise<CryptoKey> {
  const saltBytes = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const ivB64 = btoa(String.fromCharCode(...iv))
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
  return `${ivB64}.${ctB64}`
}

export async function decrypt(stored: string, key: CryptoKey): Promise<string> {
  const [ivB64, ctB64] = stored.split('.')
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0))
  const ciphertext = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0))
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}

export async function writeSentinel(key: CryptoKey): Promise<void> {
  const encrypted = await encrypt(SENTINEL_VALUE, key)
  localStorage.setItem(SENTINEL_KEY, encrypted)
}

/** Returns true if passphrase/key is correct, false if wrong, throws on other errors. */
export async function verifySentinel(key: CryptoKey): Promise<boolean> {
  const stored = localStorage.getItem(SENTINEL_KEY)
  if (!stored) return false
  try {
    const value = await decrypt(stored, key)
    return value === SENTINEL_VALUE
  } catch {
    return false
  }
}

export function isFirstRun(): boolean {
  return localStorage.getItem(SALT_KEY) === null
}

/** Re-encrypt all tool data with a new passphrase. */
export async function reencryptAll(
  oldKey: CryptoKey,
  newPassphrase: string,
): Promise<CryptoKey> {
  const newSalt = await generateSalt()
  const newKey = await deriveKey(newPassphrase, newSalt)

  const toolKeys = Object.keys(localStorage).filter(
    (k) => k.startsWith('jrnl_') && k !== SALT_KEY && k !== SENTINEL_KEY,
  )
  for (const k of toolKeys) {
    const stored = localStorage.getItem(k)
    if (!stored) continue
    try {
      const plain = await decrypt(stored, oldKey)
      const reencrypted = await encrypt(plain, newKey)
      localStorage.setItem(k, reencrypted)
    } catch {
      // skip items that can't be decrypted (shouldn't happen)
    }
  }

  storeSalt(newSalt)
  await writeSentinel(newKey)
  return newKey
}
