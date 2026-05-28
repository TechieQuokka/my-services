import { Hono } from 'hono'
import { db } from '../../lib/db'
import { decrypt, encrypt } from '../../lib/crypto'
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

// 삭제
inquiries.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.inquiries.delete(c.env, id)
  return c.json({ ok: true })
})

// 메시지 목록 (복호화)
inquiries.get('/:id/messages', async (c) => {
  const id = Number(c.req.param('id'))
  const { results: raw } = await db.inquiries.getMessages(c.env, id)
  const messages = await Promise.all(raw.map(async (m) => {
    try {
      const { enc, iv } = JSON.parse(m.content)
      m.content = await decrypt(enc, iv, c.env.MASTER_KEY)
    } catch { m.content = '(복호화 실패)' }
    return m
  }))
  return c.json(messages)
})

// ── 어드민 댓글 등록 (sender_role 서버에서 'admin' 강제) ──────────
// /admin/* 미들웨어로 이미 인증된 요청만 도달
inquiries.post('/:id/messages', async (c) => {
  const id = Number(c.req.param('id'))
  const { content } = await c.req.json()

  if (!content?.trim())
    return c.json({ ok: false, error: '내용을 입력해주세요.' }, 400)

  const inquiry = await db.inquiries.get(c.env, id)
  if (!inquiry) return c.json({ ok: false, error: 'Not found' }, 404)

  const contentEnc = await encrypt(content.trim(), c.env.MASTER_KEY)

  // sender_role은 서버에서 강제로 'admin' 고정
  await db.inquiries.createMessage(c.env, {
    inquiry_id: id,
    sender_role: 'admin',
    content: JSON.stringify(contentEnc),
    sender_ip: null,
    sender_token: null,
  })

  // 읽음 처리도 같이
  await db.inquiries.markRead(c.env, id)

  return c.json({ ok: true })
})

export default inquiries
