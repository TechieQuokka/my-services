import { Hono } from 'hono'
import { html } from 'hono/html'
import { APP_VERSION } from '../../../types'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const db = c.env.my_services_db

  const [summary, daily, devices, browsers, byService, inquiryStats] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN date(visited_at)=date('now') THEN 1 END) as today, COUNT(CASE WHEN date(visited_at)>=date('now','-7 days') THEN 1 END) as week, COUNT(CASE WHEN date(visited_at)>=date('now','-30 days') THEN 1 END) as month, COUNT(CASE WHEN bot_verdict='BOT' THEN 1 END) as bots, COUNT(CASE WHEN bot_verdict='HUMAN' THEN 1 END) as humans FROM visitors`).first<Record<string,number>>(),
    db.prepare(`SELECT date(visited_at) as date, COUNT(*) as count FROM visitors WHERE visited_at >= date('now', '-30 days') GROUP BY date(visited_at) ORDER BY date ASC`).all<{date:string;count:number}>(),
    db.prepare(`SELECT device_type, COUNT(*) as count FROM visitors WHERE device_type IS NOT NULL GROUP BY device_type ORDER BY count DESC`).all<{device_type:string;count:number}>(),
    db.prepare(`SELECT SUBSTR(browser,1,INSTR(browser||' ',' ')-1) as name, COUNT(*) as count FROM visitors WHERE browser IS NOT NULL GROUP BY name ORDER BY count DESC LIMIT 6`).all<{name:string;count:number}>(),
    db.prepare(`SELECT s.title, COUNT(v.id) as visits FROM services s LEFT JOIN visitors v ON v.service_id=s.id GROUP BY s.id ORDER BY visits DESC`).all<{title:string;visits:number}>(),
    db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN status='resolved' THEN 1 END) as resolved, COUNT(CASE WHEN is_read=0 THEN 1 END) as unread FROM inquiries`).first<Record<string,number>>(),
  ])

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Stats — My Services Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root{--bg:#e8e8e3;--bg2:#d4d4ce;--bg3:#c8c8c2;--surface:#f0efea;--surface2:#e2e1dc;--border:#b8b8b2;--border2:#a0a09a;--text:#1c1c1a;--text2:#5a5a54;--text3:#8a8a84;--green:#2a6f3a;--green-bg:#d4ead8;--purple:#4a3a9a;--purple-bg:#dcd8f0;--red:#9a2a2a;--red-bg:#f0d4d4;--yellow:#7a6200;--yellow-bg:#f5edc0;--shadow-sm:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.08);--shadow-md:0 4px 12px rgba(0,0,0,.10),0 2px 4px rgba(0,0,0,.08);}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:var(--bg);color:var(--text);font-family:'Mona Sans',-apple-system,sans-serif;display:flex;min-height:100vh;}
    .sidebar{width:220px;flex-shrink:0;position:fixed;height:100vh;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:24px 0;z-index:10;}
    .sidebar-logo{padding:0 20px 20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border);margin-bottom:16px;}
    .logo-icon{width:28px;height:28px;background:linear-gradient(145deg,#d0cfc9,#b8b8b0);border-radius:7px;border:1px solid var(--border2);box-shadow:var(--shadow-sm),inset 0 1px 0 rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:13px;}
    .logo-text{font-size:14px;font-weight:600;letter-spacing:-0.3px;}
    .logo-text span{color:var(--text3);font-weight:400;}
    .nav-section{padding:0 12px;margin-bottom:4px;}
    .nav-label{font-size:10px;font-weight:600;letter-spacing:0.8px;color:var(--text3);text-transform:uppercase;padding:8px 8px 6px;}
    .nav-item{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:13px;font-weight:500;color:var(--text2);text-decoration:none;border-radius:8px;transition:background .15s,color .15s;margin-bottom:2px;}
    .nav-item:hover{background:var(--surface2);color:var(--text);}
    .nav-item.active{background:var(--surface);color:var(--text);box-shadow:var(--shadow-sm);}
    .nav-bottom{margin-top:auto;}
    .main{margin-left:220px;flex:1;padding:36px 40px;}
    .page-title{font-size:22px;font-weight:600;letter-spacing:-0.5px;margin-bottom:24px;}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
    .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px 18px;box-shadow:var(--shadow-sm);position:relative;overflow:hidden;}
    .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);}
    .stat-label{font-size:10px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-transform:uppercase;margin-bottom:6px;}
    .stat-value{font-size:26px;font-weight:600;letter-spacing:-1px;}
    .stat-value.green{color:var(--green);}
    .stat-value.red{color:var(--red);}
    .stat-value.yellow{color:var(--yellow);}
    .charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
    .chart-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px 22px;box-shadow:var(--shadow-sm);}
    .chart-card.full{grid-column:1/-1;}
    .chart-title{font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;}
    .bar-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
    .bar-label{font-size:12px;color:var(--text2);width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0;}
    .bar-track{flex:1;background:var(--bg2);border-radius:2px;height:5px;}
    .bar-fill{height:5px;border-radius:2px;background:var(--green);}
    .bar-count{font-size:12px;color:var(--text3);width:28px;text-align:right;flex-shrink:0;}
  </style>
</head>
<body>
  <nav class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⬡</div>
      <span class="logo-text">My<span>Services</span></span>
    </div>
    <div class="nav-section">
      <div class="nav-label">Menu</div>
      <a href="/admin" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</a>
      <a href="/admin/manage/services" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>Services</a>
      <a href="/admin/manage/notices" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>Notices</a>
      <a href="/admin/manage/inquiries" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Inquiries</a>
      <a href="/admin/manage/visitors" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Visitors</a>
      <a href="/admin/manage/stats" class="nav-item active"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Stats</a>
    </div>
    <div class="nav-section nav-bottom">
      <div class="nav-label">Site</div>
      <a href="/" class="nav-item" target="_blank"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Front Page</a>
    </div>
  </nav>

  <main class="main">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <div class="page-title" style="margin-bottom:0;">Stats</div>
      <div style="font-size:12px;color:var(--text3);">${APP_VERSION}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Today</div><div class="stat-value yellow">${summary?.today??0}</div></div>
      <div class="stat-card"><div class="stat-label">This Week</div><div class="stat-value">${summary?.week??0}</div></div>
      <div class="stat-card"><div class="stat-label">This Month</div><div class="stat-value">${summary?.month??0}</div></div>
      <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">${summary?.total??0}</div></div>
      <div class="stat-card"><div class="stat-label">Humans</div><div class="stat-value green">${summary?.humans??0}</div></div>
      <div class="stat-card"><div class="stat-label">Bots</div><div class="stat-value red">${summary?.bots??0}</div></div>
      <div class="stat-card"><div class="stat-label">Inquiries</div><div class="stat-value">${inquiryStats?.total??0}</div></div>
      <div class="stat-card"><div class="stat-label">Unread</div><div class="stat-value ${(inquiryStats?.unread??0)>0?'red':''}">${inquiryStats?.unread??0}</div></div>
    </div>

    <div class="charts-grid">
      <div class="chart-card full">
        <div class="chart-title">Daily Visitors — Last 30 Days</div>
        <canvas id="dailyChart" height="55"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">Device Type</div>
        <canvas id="deviceChart" height="160"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">Browser</div>
        <canvas id="browserChart" height="160"></canvas>
      </div>
      <div class="chart-card full">
        <div class="chart-title">Visits by Service</div>
        ${byService.results.length===0
          ? html`<div style="color:var(--text3);font-size:13px;">데이터 없음</div>`
          : byService.results.map(s => {
              const max = Math.max(...byService.results.map(x=>x.visits),1)
              const pct = Math.round((s.visits/max)*100)
              return html`<div class="bar-row">
                <div class="bar-label">${s.title}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                <div class="bar-count">${s.visits}</div>
              </div>`
            })
        }
      </div>
    </div>
  </main>

  <script>
    const PALETTE=['#2a6f3a','#4a3a9a','#9a2a2a','#7a6200','#1a5a8a','#6a3a1a']
    const TICK={color:'#8a8a84',font:{family:'Mona Sans',size:11}}
    const GRID={color:'rgba(0,0,0,.05)'}

    new Chart(document.getElementById('dailyChart'),{
      type:'line',
      data:{labels:${JSON.stringify(daily.results.map(d=>d.date))},datasets:[{data:${JSON.stringify(daily.results.map(d=>d.count))},borderColor:'#2a6f3a',backgroundColor:'rgba(42,111,58,.07)',borderWidth:2,pointRadius:2,tension:0.3,fill:true}]},
      options:{plugins:{legend:{display:false}},scales:{x:{ticks:TICK,grid:GRID},y:{ticks:TICK,grid:GRID,beginAtZero:true}}}
    })
    new Chart(document.getElementById('deviceChart'),{
      type:'doughnut',
      data:{labels:${JSON.stringify(devices.results.map(d=>d.device_type))},datasets:[{data:${JSON.stringify(devices.results.map(d=>d.count))},backgroundColor:PALETTE}]},
      options:{plugins:{legend:{labels:{color:'#5a5a54',font:{family:'Mona Sans',size:11}}}},cutout:'60%'}
    })
    new Chart(document.getElementById('browserChart'),{
      type:'doughnut',
      data:{labels:${JSON.stringify(browsers.results.map(b=>b.name))},datasets:[{data:${JSON.stringify(browsers.results.map(b=>b.count))},backgroundColor:PALETTE}]},
      options:{plugins:{legend:{labels:{color:'#5a5a54',font:{family:'Mona Sans',size:11}}}},cutout:'60%'}
    })
  </script>
</body>
</html>`)
})

export default app
