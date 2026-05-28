// ── ImageKit 업로드 (Workers fetch 기반, SDK 미사용) ──────────────
export async function uploadToImageKit(
  file: ArrayBuffer,
  fileName: string,
  privateKey: string,
  folder = '/my-services'
): Promise<{ url: string; fileId: string; filePath: string }> {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(file)))

  const form = new FormData()
  form.append('file', `data:application/octet-stream;base64,${base64}`)
  form.append('fileName', fileName)
  form.append('folder', folder)
  form.append('useUniqueFileName', 'true')
  form.append('isPrivateFile', 'false') // Public 저장 + Signed URL로 접근 제어

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(privateKey + ':')}` },
    body: form,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ImageKit upload failed: ${err}`)
  }

  const data = await res.json() as { url: string; fileId: string; filePath: string }
  return { url: data.url, fileId: data.fileId, filePath: data.filePath }
}

// ── Signed URL 생성 (HMAC-SHA1, Workers SubtleCrypto) ────────────
export async function buildSignedUrl(
  filePath: string,
  urlEndpoint: string,
  privateKey: string,
  expiresInSec = 86400 // 기본 24시간
): Promise<string> {
  const expireAt = Math.floor(Date.now() / 1000) + expiresInSec

  // ImageKit Signed URL: {endpoint}{path}?ik-t={expire}&ik-s={signature}
  // signature = HMAC-SHA1( filePath + expireAt, privateKey )
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(privateKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(filePath + expireAt)
  )
  const sigHex = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return `${urlEndpoint}${filePath}?ik-t=${expireAt}&ik-s=${sigHex}`
}

// ── ImageKit 파일 삭제 ───────────────────────────────────────────
export async function deleteFromImageKit(
  fileId: string,
  privateKey: string
): Promise<void> {
  const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${btoa(privateKey + ':')}` },
  })
  if (!res.ok && res.status !== 404) {
    const err = await res.text()
    throw new Error(`ImageKit delete failed: ${err}`)
  }
}

// ── ImageKit URL 변환 (리사이즈/최적화) ─────────────────────────
// filePath 기준으로 변환 (url 저장 후 재조합)
export function imagekitUrl(
  filePath: string,
  urlEndpoint: string,
  opts: { w?: number; h?: number; q?: number } = {}
): string {
  const params: string[] = []
  if (opts.w) params.push(`w-${opts.w}`)
  if (opts.h) params.push(`h-${opts.h}`)
  if (opts.q) params.push(`q-${opts.q}`)
  if (!params.length) return `${urlEndpoint}${filePath}`
  return `${urlEndpoint}/tr:${params.join(',')}${filePath}`
}

// ── Signed + Transform URL (리사이즈 + 서명 동시) ────────────────
export async function buildSignedTransformUrl(
  filePath: string,
  urlEndpoint: string,
  privateKey: string,
  opts: { w?: number; h?: number; q?: number } = {},
  expiresInSec = 86400
): Promise<string> {
  const params: string[] = []
  if (opts.w) params.push(`w-${opts.w}`)
  if (opts.h) params.push(`h-${opts.h}`)
  if (opts.q) params.push(`q-${opts.q}`)
  const tr = params.length ? `/tr:${params.join(',')}` : ''

  const expireAt = Math.floor(Date.now() / 1000) + expiresInSec
  const pathToSign = `${tr}${filePath}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(privateKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(pathToSign + expireAt)
  )
  const sigHex = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return `${urlEndpoint}${pathToSign}?ik-t=${expireAt}&ik-s=${sigHex}`
}
