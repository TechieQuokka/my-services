import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { db } from '../../lib/db'
import { verifyToken } from '../../middleware/auth'
import type { Env } from '../../types'

const notices = new Hono<{ Bindings: Env }>()

// ── 어드민 쿠키 검증 헬퍼 (verifyToken 재사용, 중복 제거) ─────────
async function isAdmin(c: any): Promise<boolean> {
  const token = getCookie(c, 'admin_token')
  if (!token) return false
  return verifyToken(token, c.env.ADMIN_PASSWORD)
}

// ── 공개 읽기 ─────────────────────────────────────────────────────

notices.get('/', async (c) => {
  const { results } = await db.notices.list(c.env)
  return c.json(results)
})

notices.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const notice = await db.notices.get(c.env, id)
  if (!notice) return c.notFound()
  return c.json(notice)
})

// ── 쓰기 (어드민 전용) ────────────────────────────────────────────

notices.post('/', async (c) => {
  if (!(await isAdmin(c))) return c.json({ ok: false, error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  if (!body.title?.trim() || !body.content?.trim())
    return c.json({ ok: false, error: '제목과 내용을 입력해주세요.' }, 400)

  await db.notices.create(c.env, {
    title: body.title.trim(),
    content: body.content.trim(),
    is_fixed: body.is_fixed ?? 0,
  })
  return c.json({ ok: true })
})

notices.put('/:id', async (c) => {
  if (!(await isAdmin(c))) return c.json({ ok: false, error: 'Unauthorized' }, 401)

  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  await db.notices.update(c.env, id, body)
  return c.json({ ok: true })
})

notices.delete('/:id', async (c) => {
  if (!(await isAdmin(c))) return c.json({ ok: false, error: 'Unauthorized' }, 401)

  const id = Number(c.req.param('id'))
  await db.notices.delete(c.env, id)
  return c.json({ ok: true })
})

export default notices
