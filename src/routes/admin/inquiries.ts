import { Hono } from 'hono'
import { db } from '../../lib/db'
import { decrypt } from '../../lib/crypto'
import type { Env } from '../../types'

const inquiries = new Hono<{ Bindings: Env }>()

// 문의 목록
inquiries.get('/', async (c) => {
  const limit = Number(c.req.query('limit') ?? 50)
  const offset = Number(c.req.query('offset') ?? 0)
  const { results } = await db.inquiries.list(c.env, limit, offset)
  return c.json(results)
})

// 문의 상세 (연락처 복호화)
inquiries.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const inquiry = await db.inquiries.get(c.env, id)
  if (!inquiry) return c.json({ error: 'Not found' }, 404)

  // 연락처 복호화
  const { enc, iv } = JSON.parse(inquiry.contact)
  const contact = await decrypt(enc, iv, c.env.MASTER_KEY)

  return c.json({ ...inquiry, contact })
})

// 읽음 처리
inquiries.patch('/:id/read', async (c) => {
  const id = Number(c.req.param('id'))
  await db.inquiries.markRead(c.env, id)
  return c.json({ ok: true })
})

// 상태 변경
inquiries.patch('/:id/status', async (c) => {
  const id = Number(c.req.param('id'))
  const { status } = await c.req.json()
  await db.inquiries.updateStatus(c.env, id, status)
  return c.json({ ok: true })
})

// 삭제 처리
inquiries.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.inquiries.delete(c.env, id)
  return c.json({ ok: true })
})

// 메시지 목록 가져오기
inquiries.get('/:id/messages', async (c) => {
  const id = Number(c.req.param('id'))
  const { results } = await db.inquiries.getMessages(c.env, id)
  return c.json(results)
})

export default inquiries
