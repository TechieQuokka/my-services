export async function uploadToImageKit(
  file: ArrayBuffer,
  fileName: string,
  apiKey: string
): Promise<string> {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(file)))
  const form = new FormData()
  form.append('file', `data:application/octet-stream;base64,${base64}`)
  form.append('fileName', fileName)
  form.append('folder', '/my-services')

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(apiKey + ':')}` },
    body: form
  })
  if (!res.ok) throw new Error('ImageKit upload failed')
  const data = await res.json() as { url: string }
  return data.url
}

export async function fetchThumbFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    const data = await res.json() as { status: string; data: { image?: { url: string } } }
    if (data.status === 'success' && data.data.image?.url) return data.data.image.url
    return null
  } catch {
    return null
  }
}

export function imagekitUrl(url: string, opts: { w?: number; h?: number; q?: number } = {}): string {
  const params = []
  if (opts.w) params.push(`w-${opts.w}`)
  if (opts.h) params.push(`h-${opts.h}`)
  if (opts.q) params.push(`q-${opts.q}`)
  if (!params.length) return url
  return url.replace('/my-services/', `/tr:${params.join(',')}/my-services/`)
}
