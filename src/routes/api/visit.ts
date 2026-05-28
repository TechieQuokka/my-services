import { Hono } from 'hono'
import { db } from '../../lib/db'
import type { Env } from '../../types'

const visit = new Hono<{ Bindings: Env }>()

visit.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const public_ip = c.req.header('CF-Connecting-IP') ?? body.public_ip ?? null

    // 같은 날 같은 session_id면 page_url/visited_at만 업데이트 (중복 집계 방지)
    const today = new Date().toISOString().slice(0, 10)
    const existing = await c.env.my_services_db
      .prepare(`SELECT id FROM visitors WHERE session_id=? AND date(visited_at)=?`)
      .bind(body.session_id, today)
      .first<{ id: number }>()

    if (existing) {
      await c.env.my_services_db
        .prepare(`UPDATE visitors SET visited_at=?, page_url=?, visit_count=visit_count+1 WHERE id=?`)
        .bind(new Date().toISOString(), body.page_url ?? null, existing.id)
        .run()
      return c.json({ ok: true, deduplicated: true })
    }

    await db.visitors.create(c.env, {
      session_id: body.session_id ?? crypto.randomUUID(),
      visited_at: body.visited_at ?? new Date().toISOString(),
      page_url: body.page_url ?? null,
      service_id: body.service_id ?? null,
      public_ip,
      local_ip: body.local_ip ?? null,
      referrer: body.referrer ?? null,
      device_type: body.device_type ?? null,
      os: body.os ?? null,
      browser: body.browser ?? null,
      screen: body.screen ?? null,
      dpr: body.dpr ?? null,
      touch_pts: body.touch_pts ?? null,
      cpu_cores: body.cpu_cores ?? null,
      ram_gb: body.ram_gb ?? null,
      language: body.language ?? null,
      timezone: body.timezone ?? null,
      user_agent: body.user_agent ?? null,
      bot_score: body.bot_score ?? null,
      bot_verdict: body.bot_verdict ?? null,
      flag_webdriver: body.flag_webdriver ?? 0,
      flag_headless: body.flag_headless ?? 0,
      flag_no_plugins: body.flag_no_plugins ?? 0,
      flag_no_langs: body.flag_no_langs ?? 0,
      flag_no_chrome: body.flag_no_chrome ?? 0,
      flag_in_iframe: body.flag_in_iframe ?? 0,
    })
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false }, 500)
  }
})

export default visit
