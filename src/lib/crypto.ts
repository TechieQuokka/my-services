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

// ── 비밀번호 해싱 (PBKDF2 + SHA-256, 100,000 iterations) ─────────
// salt는 랜덤 16바이트, 결과는 "pbkdf2:salt_hex:hash_hex" 형식으로 저장
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, hash: 'SHA-256', iterations: 100_000 },
    keyMaterial,
    256
  )
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `pbkdf2:${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split(':')
    if (parts.length !== 3 || parts[0] !== 'pbkdf2') return false

    const salt = Uint8Array.from(parts[1].match(/.{2}/g)!.map(h => parseInt(h, 16)))
    const expectedHash = parts[2]

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, hash: 'SHA-256', iterations: 100_000 },
      keyMaterial,
      256
    )
    const actualHash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')

    // 타이밍 공격 방지: 길이가 같을 때만 비교
    if (actualHash.length !== expectedHash.length) return false
    let diff = 0
    for (let i = 0; i < actualHash.length; i++) {
      diff |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i)
    }
    return diff === 0
  } catch {
    return false
  }
}
