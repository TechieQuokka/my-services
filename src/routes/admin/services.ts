import { Hono } from 'hono'
import { db } from '../../lib/db'
import { uploadToImageKit, deleteFromImageKit } from '../../lib/imagekit'
import { parseServiceHtml } from '../../lib/htmlParser'
import type { Env } from '../../types'

const services = new Hono<{ Bindings: Env }>()

// 서비스 목록
services.get('/', async (c) => {
  const { results } = await db.services.list(c.env)
  return c.json(results)
})

// 서비스 등록
services.post('/', async (c) => {
  const body = await c.req.json()
  await db.services.create(c.env, {
    title: body.title,
    category: body.category,
    description: body.description ?? null,
    thumb_type: 'upload',
    thumb_url: body.thumb_url ?? null,
    thumb_origin: null,
    is_active: 1,
    sort_order: body.sort_order ?? 0,
  })
  return c.json({ ok: true })
})

// 서비스 수정
services.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const existing = await db.services.get(c.env, id)
  if (!existing) return c.json({ ok: false, error: 'Not found' }, 404)
  await db.services.update(c.env, id, {
    ...existing,
    title: body.title ?? existing.title,
    category: body.category ?? existing.category,
    description: body.description ?? existing.description,
    sort_order: body.sort_order ?? existing.sort_order,
    thumb_type: existing.thumb_type,
    thumb_url: existing.thumb_url,
    thumb_origin: existing.thumb_origin,
  })
  return c.json({ ok: true })
})

// 노출 토글
services.patch('/:id/toggle', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  await db.services.toggle(c.env, id, body.is_active)
  return c.json({ ok: true })
})

// 서비스 삭제 — db.batch()로 원자적 처리
services.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const existing = await db.services.get(c.env, id)
  if (!existing) return c.json({ ok: false, error: 'Not found' }, 404)

  // ImageKit 썸네일 삭제 (외부 API라 트랜잭션 밖에서 처리)
  if (existing.thumb_origin) {
    try {
      await deleteFromImageKit(existing.thumb_origin, c.env.IMAGEKIT_PRIVATE_KEY)
    } catch (e) {
      console.error('ImageKit thumb delete failed:', e)
    }
  }

  const D = c.env.my_services_db

  // inquiry_messages → inquiries → service_pages → visitors(null) → services
  // 단일 batch로 원자적 처리
  await D.batch([
    D.prepare(
      `DELETE FROM inquiry_messages WHERE inquiry_id IN (SELECT id FROM inquiries WHERE service_id=?)`
    ).bind(id),
    D.prepare('DELETE FROM inquiries WHERE service_id=?').bind(id),
    D.prepare('DELETE FROM service_pages WHERE service_id=?').bind(id),
    D.prepare('UPDATE visitors SET service_id=NULL WHERE service_id=?').bind(id),
    D.prepare('DELETE FROM services WHERE id=?').bind(id),
  ])

  return c.json({ ok: true })
})

// ── 서비스 페이지 HTML 업로드 → 파싱 후 저장 ──────────────────────
services.post('/:id/page', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const html = body.html_content as string

  if (!html?.trim()) return c.json({ ok: false, error: 'HTML이 비어있습니다.' }, 400)

  const parsed = parseServiceHtml(html, id)
  await db.pages.upsert(c.env, id, parsed)
  return c.json({ ok: true })
})

// ── 썸네일 이미지 업로드 → ImageKit ─────────────────────────────
services.post('/:id/thumb', async (c) => {
  const id = Number(c.req.param('id'))

  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  if (!file) return c.json({ ok: false, error: '파일이 없습니다.' }, 400)

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return c.json({ ok: false, error: '이미지 파일만 업로드 가능합니다.' }, 400)
  }

  const existing = await db.services.get(c.env, id)
  if (!existing) return c.json({ ok: false, error: 'Not found' }, 404)

  if (existing.thumb_origin) {
    try {
      await deleteFromImageKit(existing.thumb_origin, c.env.IMAGEKIT_PRIVATE_KEY)
    } catch (e) {
      console.error('ImageKit old thumb delete failed:', e)
    }
  }

  const buffer = await file.arrayBuffer()
  const { url, fileId, filePath } = await uploadToImageKit(
    buffer,
    file.name,
    c.env.IMAGEKIT_PRIVATE_KEY,
    '/my-services/thumbs'
  )

  await db.services.update(c.env, id, {
    ...existing,
    thumb_type: 'upload',
    thumb_url: filePath,
    thumb_origin: fileId,
  })

  return c.json({ ok: true, filePath, fileId, url })
})

// ── Signed URL 발급 (썸네일 프리뷰용) ───────────────────────────
services.get('/:id/thumb-url', async (c) => {
  const id = Number(c.req.param('id'))
  const service = await db.services.get(c.env, id)
  if (!service?.thumb_url) return c.json({ ok: false, error: 'No thumb' }, 404)

  const { buildSignedTransformUrl } = await import('../../lib/imagekit')
  const url = await buildSignedTransformUrl(
    service.thumb_url,
    c.env.IMAGEKIT_URL_ENDPOINT,
    c.env.IMAGEKIT_PRIVATE_KEY,
    { w: 800, h: 600, q: 82 }
  )
  return c.json({ ok: true, url })
})

export default services
