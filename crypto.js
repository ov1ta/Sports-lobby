// AES-GCM encryption for note content
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

async function getKey(secret) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('private-lobby-salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encrypt(text, secret) {
  const key = await getKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, enc.encode(text))
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.byteLength)
  return btoa(String.fromCharCode(...combined))
}

export async function decrypt(ciphertext, secret) {
  try {
    const key = await getKey(secret)
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const dec = new TextDecoder()
    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data)
    return dec.decode(decrypted)
  } catch {
    return ciphertext // fallback for unencrypted legacy content
  }
}
