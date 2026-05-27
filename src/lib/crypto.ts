export async function encrypt(text: string, masterKey: string): Promise<{ enc: string; iv: string }> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(masterKey.padEnd(32, '0').slice(0, 32)),
    'AES-GCM',
    false,
    ['encrypt']
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    new TextEncoder().encode(text)
  )
  return {
    enc: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  }
}

export async function decrypt(enc: string, iv: string, masterKey: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(masterKey.padEnd(32, '0').slice(0, 32)),
    'AES-GCM',
    false,
    ['decrypt']
  )
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) },
    keyMaterial,
    Uint8Array.from(atob(enc), c => c.charCodeAt(0))
  )
  return new TextDecoder().decode(decrypted)
}
