import { Hono } from 'hono'
import { db } from '../../lib/db'
import type { Env } from '../../types'

const notices = new Hono<{ Bindings: Env }>()

// 공지사항 목록
notices.get('/', async (c) => {
  const { results } = await db.notices.list(c.env)
  return c.json(results)
})

// 공지사항 상세
notices.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const notice = await db.notices.get(c.env, id)
  if (!notice) return c.notFound()
  return c.json(notice)
})

// 공지사항 관리 (Admin)
notices.post('/', async (c) => {
  const body = await c.req.json()
  await db.notices.create(c.env, {
    title: body.title,
    content: body.content,
    is_fixed: body.is_fixed ?? 0
  })
  return c.json({ ok: true })
})

notices.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  await db.notices.update(c.env, id, body)
  return c.json({ ok: true })
})

notices.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.notices.delete(c.env, id)
  return c.json({ ok: true })
})

export default notices
