import { Hono } from 'hono'
import type { Env } from '../../types'

const stats = new Hono<{ Bindings: Env }>()

stats.get('/', async (c) => {
  const db = c.env.my_services_db

  const [visitors, inquiries, services, daily] = await Promise.all([
    db.prepare(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN date(visited_at)=date('now') THEN 1 END) as today,
        COUNT(CASE WHEN bot_verdict='BOT' THEN 1 END) as bots
      FROM visitors
    `).first(),
    db.prepare(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_read=0 THEN 1 END) as unread
      FROM inquiries
    `).first(),
    db.prepare(`
      SELECT COUNT(*) as total, COUNT(CASE WHEN is_active=1 THEN 1 END) as active
      FROM services
    `).first(),
    db.prepare(`
      SELECT date(visited_at) as date, COUNT(*) as count
      FROM visitors
      WHERE visited_at >= date('now', '-7 days')
      GROUP BY date(visited_at)
      ORDER BY date ASC
    `).all(),
  ])

  return c.json({ visitors, inquiries, services, daily: daily.results })
})

export default stats
