import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import type { Env } from '../types'

// 쿠키 서명 검증
async function verifyToken(token: string, password: string): Promise<boolean> {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return false

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      Uint8Array.from(atob(sig), c => c.charCodeAt(0)),
      new TextEncoder().encode(payload)
    )
    if (!valid) return false

    // 만료 확인 (24시간)
    const { exp } = JSON.parse(atob(payload))
    return Date.now() < exp
  } catch {
    return false
  }
}

export async function createToken(password: string): Promise<string> {
  const payload = btoa(JSON.stringify({ exp: Date.now() + 24 * 60 * 60 * 1000 }))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`
}

export const adminAuth = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  // 로그인 페이지는 통과
  if (c.req.path === '/admin/login') {
    await next()
    return
  }

  const token = getCookie(c, 'admin_token')
  if (!token || !(await verifyToken(token, c.env.ADMIN_PASSWORD))) {
    return c.redirect('/admin/login')
  }

  await next()
})
