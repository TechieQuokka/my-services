import { Hono } from 'hono'
import { db } from '../../lib/db'
import { InquiryWidget } from '../../views/front/components/inquiry-widget'
import type { Env } from '../../types'

const services = new Hono<{ Bindings: Env }>()

services.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const [service, page] = await Promise.all([
    db.services.get(c.env, id),
    db.pages.get(c.env, id),
  ])

  if (!service || !service.is_active) return c.notFound()

  const baseHtml = page?.html_content ?? `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${service.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>
    :root{--bg:#e8e8e3;--text:#1c1c1a;--text2:#5a5a54;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:var(--bg);color:var(--text);font-family:'Mona Sans',-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;}
    .empty{text-align:center;padding:60px 20px;}
    h1{font-size:32px;font-weight:600;letter-spacing:-1px;margin-bottom:10px;}
    p{color:var(--text2);font-size:15px;}
  </style>
</head>
<body>
  <div class="empty">
    <h1>${service.title}</h1>
    <p>서비스 페이지를 준비 중입니다.</p>
  </div>
</body>
</html>`

  const widget = InquiryWidget(id)
  const injected = baseHtml.replace('</body>', `${widget}</body>`)
  return c.html(injected)
})

export default services
