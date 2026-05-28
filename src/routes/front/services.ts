import { Hono } from 'hono'
import { db } from '../../lib/db'
import { Layout } from '../../views/front/layout'
import { InquiryWidget } from '../../views/front/components/inquiry-widget'
import type { Env } from '../../types'

const services = new Hono<{ Bindings: Env }>()

// HTML 특수문자 이스케이프 (XSS 방지)
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

services.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const [service, page] = await Promise.all([
    db.services.get(c.env, id),
    db.pages.get(c.env, id),
  ])

  if (!service || !service.is_active) return c.notFound()

  // ── 페이지 데이터가 있으면 세 버킷 조립, 없으면 기본 콘텐츠 ──
  let bodyContent: string
  let headContent = ''
  let scriptContent = ''

  if (page?.body_content) {
    bodyContent = page.body_content
    headContent = page.head_content ?? ''
    scriptContent = page.script_content ?? ''
  } else {
    // 페이지 미등록 시 기본 안내 콘텐츠
    bodyContent = `
      <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;padding:60px 20px;text-align:center;">
        <div>
          <h1 style="font-family:'Instrument Serif',serif;font-size:36px;letter-spacing:-0.8px;margin-bottom:12px;">${esc(service.title)}</h1>
          <p style="color:var(--text2);font-size:15px;">서비스 페이지를 준비 중입니다.</p>
        </div>
      </div>
    `
  }

  // InquiryWidget 주입 (body 콘텐츠 뒤에 추가)
  const widget = String(InquiryWidget(id))
  const finalBody = bodyContent + widget

  return c.html(
    String(Layout(finalBody, {
      serviceMode: true,
      serviceId: id,
      serviceTitle: service.title,
      headContent,
      scriptContent,
    }))
  )
})

export default services
