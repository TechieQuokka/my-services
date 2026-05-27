import { Hono } from 'hono'
import { db } from '../../lib/db'
import { uploadToImageKit, fetchThumbFromUrl } from '../../lib/imagekit'
import { decrypt } from '../../lib/crypto'
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
    thumb_type: body.thumb_type ?? 'upload',
    thumb_url: body.thumb_url ?? null,
    thumb_origin: body.thumb_origin ?? null,
    is_active: 1,
    sort_order: body.sort_order ?? 0,
  })
  return c.json({ ok: true })
})

// 서비스 수정
services.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  await db.services.update(c.env, id, body)
  return c.json({ ok: true })
})

// 노출 토글
services.patch('/:id/toggle', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  await db.services.toggle(c.env, id, body.is_active)
  return c.json({ ok: true })
})

// 서비스 삭제
services.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.services.delete(c.env, id)
  return c.json({ ok: true })
})

// 광고 페이지 HTML 업로드
services.post('/:id/page', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  await db.pages.upsert(c.env, id, body.html_content)
  return c.json({ ok: true })
})

// 이미지 업로드 → ImageKit
services.post('/:id/images', async (c) => {
  const id = Number(c.req.param('id'))
  const formData = await c.req.formData()
  const file = formData.get('file') as File

  // ImageKit API 키 가져오기
  const keyRow = await c.env.my_services_db.prepare(
    "SELECT key_enc, iv FROM api_keys WHERE service='imagekit'"
  ).first<{ key_enc: string; iv: string }>()
  if (!keyRow) return c.json({ ok: false, error: 'ImageKit API 키 없음' }, 400)

  const apiKey = await decrypt(keyRow.key_enc, keyRow.iv, c.env.MASTER_KEY)
  const buffer = await file.arrayBuffer()
  const url = await uploadToImageKit(buffer, file.name, apiKey)

  const { results } = await db.images.list(c.env, id)
  await db.images.create(c.env, id, url, results.length)
  return c.json({ ok: true, url })
})

// 썸네일 설정 (URL에서 Microlink로 추출)
services.post('/:id/thumb', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()

  let thumb_url = body.thumb_url ?? null
  if (body.thumb_type === 'url' && body.thumb_origin) {
    thumb_url = await fetchThumbFromUrl(body.thumb_origin)
  }

  await db.services.update(c.env, id, {
    ...(await db.services.get(c.env, id))!,
    thumb_type: body.thumb_type,
    thumb_url,
    thumb_origin: body.thumb_origin ?? null,
  })
  return c.json({ ok: true, thumb_url })
})

export default services
