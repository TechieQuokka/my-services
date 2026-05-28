import { Hono } from 'hono'
import { db } from '../../lib/db'
import { buildSignedTransformUrl } from '../../lib/imagekit'
import { Layout } from '../../views/front/layout'
import { HomePage, ServicesPage, TrackPage, ContactPage } from '../../views/front/pages'
import type { Env } from '../../types'

const front = new Hono<{ Bindings: Env }>()

front.get('/', async (c) => {
  const { results: services } = await db.services.active(c.env)

  // 썸네일 Signed URL 생성 (24시간 유효)
  const servicesWithThumb = await Promise.all(services.map(async (s) => {
    if (s.thumb_url) {
      try {
        const signedUrl = await buildSignedTransformUrl(
          s.thumb_url,
          c.env.IMAGEKIT_URL_ENDPOINT,
          c.env.IMAGEKIT_PRIVATE_KEY,
          { w: 800, h: 600, q: 82 }
        )
        return { ...s, thumb_url: signedUrl }
      } catch (e) {
        console.error(`[ImageKit] Signed URL 생성 실패 — service_id: ${s.id}, path: ${s.thumb_url}`, e)
        return { ...s, thumb_url: null }
      }
    }
    return s
  }))

  const content = [
    HomePage(),
    ServicesPage(servicesWithThumb),
    TrackPage(),
    ContactPage(servicesWithThumb)
  ]

  // 홈은 serviceMode 없이 기존과 동일하게
  return c.html(String(Layout(content)))
})

export default front
