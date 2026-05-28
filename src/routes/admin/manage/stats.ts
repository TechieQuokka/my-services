import { Hono } from 'hono'
import { html } from 'hono/html'
import { adminLayout, pageHeader } from '../../../views/admin/layout'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const db = c.env.my_services_db

  const [summary, daily, devices, browsers, byService, inquiryStats] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN date(visited_at)=date('now') THEN 1 END) as today, COUNT(CASE WHEN date(visited_at)>=date('now','-7 days') THEN 1 END) as week, COUNT(CASE WHEN date(visited_at)>=date('now','-30 days') THEN 1 END) as month, COUNT(CASE WHEN bot_verdict='BOT' THEN 1 END) as bots, COUNT(CASE WHEN bot_verdict='HUMAN' THEN 1 END) as humans FROM visitors`).first<Record<string, number>>(),
    db.prepare(`SELECT date(visited_at) as date, COUNT(*) as count FROM visitors WHERE visited_at >= date('now', '-30 days') GROUP BY date(visited_at) ORDER BY date ASC`).all<{ date: string; count: number }>(),
    db.prepare(`SELECT device_type, COUNT(*) as count FROM visitors WHERE device_type IS NOT NULL GROUP BY device_type ORDER BY count DESC`).all<{ device_type: string; count: number }>(),
    db.prepare(`SELECT SUBSTR(browser,1,INSTR(browser||' ',' ')-1) as name, COUNT(*) as count FROM visitors WHERE browser IS NOT NULL GROUP BY name ORDER BY count DESC LIMIT 6`).all<{ name: string; count: number }>(),
    db.prepare(`SELECT s.title, COUNT(v.id) as visits FROM services s LEFT JOIN visitors v ON v.service_id=s.id GROUP BY s.id ORDER BY visits DESC`).all<{ title: string; visits: number }>(),
    db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN status='resolved' THEN 1 END) as resolved, COUNT(CASE WHEN is_read=0 THEN 1 END) as unread FROM inquiries`).first<Record<string, number>>(),
  ])

  const maxVisits = Math.max(...byService.results.map(x => x.visits), 1)

  const byServiceHtml = byService.results.length === 0
    ? `<div style="color:var(--text3);font-size:13px;">데이터 없음</div>`
    : byService.results.map(s => {
        const pct = Math.round((s.visits / maxVisits) * 100)
        return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="font-size:12px;color:var(--text2);width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0;">${s.title}</div>
          <div style="flex:1;background:var(--bg2);border-radius:2px;height:5px;"><div style="height:5px;border-radius:2px;background:var(--green);width:${pct}%"></div></div>
          <div style="font-size:12px;color:var(--text3);width:28px;text-align:right;flex-shrink:0;">${s.visits}</div>
        </div>`
      }).join('')

  const body = `
    ${pageHeader('Stats')}

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card"><div class="stat-label">Today</div><div class="stat-value yellow">${summary?.today ?? 0}</div></div>
      <div class="stat-card"><div class="stat-label">This Week</div><div class="stat-value">${summary?.week ?? 0}</div></div>
      <div class="stat-card"><div class="stat-label">This Month</div><div class="stat-value">${summary?.month ?? 0}</div></div>
      <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">${summary?.total ?? 0}</div></div>
      <div class="stat-card"><div class="stat-label">Humans</div><div class="stat-value green">${summary?.humans ?? 0}</div></div>
      <div class="stat-card"><div class="stat-label">Bots</div><div class="stat-value red">${summary?.bots ?? 0}</div></div>
      <div class="stat-card"><div class="stat-label">Inquiries</div><div class="stat-value">${inquiryStats?.total ?? 0}</div></div>
      <div class="stat-card"><div class="stat-label">Unread</div><div class="stat-value ${(inquiryStats?.unread ?? 0) > 0 ? 'red' : ''}">${inquiryStats?.unread ?? 0}</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
      <div class="card" style="grid-column:1/-1;">
        <div class="card-title">Daily Visitors — Last 30 Days</div>
        <canvas id="dailyChart" height="55"></canvas>
      </div>
      <div class="card">
        <div class="card-title">Device Type</div>
        <canvas id="deviceChart" height="160"></canvas>
      </div>
      <div class="card">
        <div class="card-title">Browser</div>
        <canvas id="browserChart" height="160"></canvas>
      </div>
      <div class="card" style="grid-column:1/-1;">
        <div class="card-title">Visits by Service</div>
        ${byServiceHtml}
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      const PALETTE=['#2a6f3a','#4a3a9a','#9a2a2a','#7a6200','#1a5a8a','#6a3a1a']
      const TICK={color:'#8a8a84',font:{family:'Mona Sans',size:11}}
      const GRID={color:'rgba(0,0,0,.05)'}

      new Chart(document.getElementById('dailyChart'),{
        type:'line',
        data:{labels:${JSON.stringify(daily.results.map(d => d.date))},datasets:[{data:${JSON.stringify(daily.results.map(d => d.count))},borderColor:'#2a6f3a',backgroundColor:'rgba(42,111,58,.07)',borderWidth:2,pointRadius:2,tension:0.3,fill:true}]},
        options:{plugins:{legend:{display:false}},scales:{x:{ticks:TICK,grid:GRID},y:{ticks:TICK,grid:GRID,beginAtZero:true}}}
      })
      new Chart(document.getElementById('deviceChart'),{
        type:'doughnut',
        data:{labels:${JSON.stringify(devices.results.map(d => d.device_type))},datasets:[{data:${JSON.stringify(devices.results.map(d => d.count))},backgroundColor:PALETTE}]},
        options:{plugins:{legend:{labels:{color:'#5a5a54',font:{family:'Mona Sans',size:11}}}},cutout:'60%'}
      })
      new Chart(document.getElementById('browserChart'),{
        type:'doughnut',
        data:{labels:${JSON.stringify(browsers.results.map(b => b.name))},datasets:[{data:${JSON.stringify(browsers.results.map(b => b.count))},backgroundColor:PALETTE}]},
        options:{plugins:{legend:{labels:{color:'#5a5a54',font:{family:'Mona Sans',size:11}}}},cutout:'60%'}
      })
    </script>
  `

  return c.html(adminLayout('stats', 'Stats', body))
})

export default app
