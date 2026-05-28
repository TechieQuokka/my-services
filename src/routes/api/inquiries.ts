import { Hono } from 'hono'
import { db } from '../../lib/db'
import { encrypt, decrypt, hashPassword, verifyPassword } from '../../lib/crypto'
import { rateLimit } from '../../lib/ratelimit'
import type { Env } from '../../types'

const inquiries = new Hono<{ Bindings: Env }>()

// 문의 등록
inquiries.post('/', async (c) => {
  try {
    const body = await c.req.json()
    let { name, contact, password, content, service_id, visitor_id, owner_token } = body
    const ip = c.req.header('cf-connecting-ip') || '0.0.0.0'

    name = name?.trim(); contact = contact?.trim(); content = content?.trim(); password = password?.trim()

    if (!name || !contact || !content || !service_id || !password)
      return c.json({ ok: false, error: '모든 필수 항목을 입력해주세요.' }, 400)

    // 150개 도달 시 50개 자동 삭제
    try {
      const countRes = await db.inquiries.count(c.env)
      if (countRes && countRes.count >= 150) await db.inquiries.purgeOldest(c.env, 50)
    } catch (e) {}

    const contactEnc = await encrypt(contact, c.env.MASTER_KEY)
    const contentEnc = await encrypt(content, c.env.MASTER_KEY)

    const passwordHash = await hashPassword(password)

    const result = await db.inquiries.create(c.env, {
      service_id,
      visitor_id: visitor_id ?? null,
      name,
      contact: JSON.stringify(contactEnc),
      password: passwordHash,
      content: JSON.stringify(contentEnc),
      owner_token,
      owner_ip: ip,
    })

    return c.json({ ok: true, id: result.meta.last_row_id })
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500)
  }
})

// 문의 게시판 리스트
inquiries.get('/board', async (c) => {
  const { results: notices } = await c.env.my_services_db.prepare(
    'SELECT id, title, created_at, 1 as is_notice, is_fixed FROM notices ORDER BY is_fixed DESC, created_at DESC'
  ).all<any>()

  const { results: inquiriesList } = await c.env.my_services_db.prepare(`
    SELECT i.id, i.service_id, i.name, i.created_at, i.status, s.title as service_title,
    (SELECT COUNT(*) FROM inquiry_messages WHERE inquiry_id=i.id AND sender_role='admin') as admin_reply_count
    FROM inquiries i
    LEFT JOIN services s ON i.service_id=s.id
    ORDER BY i.created_at DESC LIMIT 50
  `).all<any>()

  const final = [
    ...notices.map((n: any) => ({
      id: n.id, service_title: 'Notice', name: 'Admin',
      snippet: n.title, status: 'resolved',
      created_at: n.created_at, is_notice: 1, is_fixed: n.is_fixed
    })),
    ...inquiriesList.map((i: any) => ({
      id: i.id, service_title: i.service_title,
      name: i.name.length > 2
        ? i.name[0] + '*'.repeat(i.name.length - 2) + i.name[i.name.length - 1]
        : i.name[0] + '*',
      snippet: `비밀글입니다.${i.admin_reply_count > 0 ? ' (답변)' : ''}`,
      status: i.status, created_at: i.created_at, is_notice: 0
    }))
  ]

  return c.json(final)
})

// 문의 상세 (소유권 확인 + 복호화) — Rate Limit 적용
inquiries.post('/track/detail', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '0.0.0.0'

  // Rate Limit: IP당 5분 내 10회
  const { limited } = await rateLimit(c.env, `rl:track:${ip}`, 10, 60 * 5)
  if (limited) return c.json({ ok: false, error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }, 429)

  const { id, name, password } = await c.req.json()

  const inquiry = await db.inquiries.get(c.env, id)

  if (!inquiry || inquiry.name !== name)
    return c.json({ ok: false, error: '인증 실패' }, 401)

  const passwordMatch = await verifyPassword(password, inquiry.password ?? '')
  if (!passwordMatch)
    return c.json({ ok: false, error: '인증 실패' }, 401)

  const { enc, iv } = JSON.parse(inquiry.content)
  const content = await decrypt(enc, iv, c.env.MASTER_KEY)

  const { results: rawMsgs } = await db.inquiries.getMessages(c.env, id)
  const messages = await Promise.all(rawMsgs.map(async (m) => {
    const { enc, iv } = JSON.parse(m.content)
    const decContent = await decrypt(enc, iv, c.env.MASTER_KEY)

    let role_display = m.sender_role
    if (m.sender_role === 'user') {
      const isOwner = m.sender_token === inquiry.owner_token || m.sender_ip === inquiry.owner_ip
      role_display = isOwner ? 'owner' : 'guest'
    }

    return { ...m, content: decContent, role_display }
  }))

  const { contact: _c, password: _p, owner_token: _ot, owner_ip: _oi, ...safeInquiry } = inquiry as any

  return c.json({ ok: true, data: { ...safeInquiry, content }, messages })
})

// 일반 사용자 댓글 등록 (sender_role 강제 'user') — Rate Limit 적용
inquiries.post('/:id/messages', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '0.0.0.0'

  // Rate Limit: IP당 1분 내 10회
  const { limited } = await rateLimit(c.env, `rl:msg:${ip}`, 10, 60)
  if (limited) return c.json({ ok: false, error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }, 429)

  const id = Number(c.req.param('id'))
  const { content, name, password, sender_token } = await c.req.json()

  const inquiry = await db.inquiries.get(c.env, id)
  if (!inquiry || inquiry.name !== name)
    return c.json({ ok: false, error: '인증 실패' }, 401)

  const passwordMatch = await verifyPassword(password, inquiry.password ?? '')
  if (!passwordMatch)
    return c.json({ ok: false, error: '인증 실패' }, 401)

  if (!content?.trim())
    return c.json({ ok: false, error: '내용을 입력해주세요.' }, 400)

  const contentEnc = await encrypt(content.trim(), c.env.MASTER_KEY)

  await db.inquiries.createMessage(c.env, {
    inquiry_id: id,
    sender_role: 'user',
    content: JSON.stringify(contentEnc),
    sender_ip: ip,
    sender_token: sender_token ?? null,
  })

  return c.json({ ok: true })
})

export default inquiries
