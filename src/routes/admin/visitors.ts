import { Hono } from 'hono'
import type { Env } from '../../types'

const visitors = new Hono<{ Bindings: Env }>()

visitors.get('/', async (c) => {
  const limit = Number(c.req.query('limit') ?? 100)
  const offset = Number(c.req.query('offset') ?? 0)
  const bot = c.req.query('bot')           // 'bot' | 'human' | 'suspect'
  const service_id = c.req.query('service_id')
  const date_from = c.req.query('date_from') // YYYY-MM-DD
  const date_to = c.req.query('date_to')     // YYYY-MM-DD

  const conditions: string[] = []
  const bindings: unknown[] = []

  if (bot === 'bot') { conditions.push("bot_verdict='BOT'") }
  else if (bot === 'human') { conditions.push("bot_verdict='HUMAN'") }
  else if (bot === 'suspect') { conditions.push("bot_verdict='SUSPECT'") }

  if (service_id) { conditions.push('service_id=?'); bindings.push(Number(service_id)) }
  if (date_from) { conditions.push("date(visited_at)>=?"); bindings.push(date_from) }
  if (date_to) { conditions.push("date(visited_at)<=?"); bindings.push(date_to) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  bindings.push(limit, offset)

  const { results } = await c.env.my_services_db
    .prepare(`SELECT * FROM visitors ${where} ORDER BY visited_at DESC LIMIT ? OFFSET ?`)
    .bind(...bindings)
    .all()

  return c.json(results)
})

visitors.get('/stats', async (c) => {
  const stats = await c.env.my_services_db.prepare(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN date(visited_at)=date('now') THEN 1 END) as today,
      COUNT(CASE WHEN bot_verdict='BOT' THEN 1 END) as bots,
      COUNT(CASE WHEN device_type='Desktop' THEN 1 END) as desktop,
      COUNT(CASE WHEN device_type='Mobile' OR device_type='Android Phone' OR device_type='iPhone' THEN 1 END) as mobile
    FROM visitors
  `).first()
  return c.json(stats)
})

export default visitors
