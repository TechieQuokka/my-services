import { Hono } from 'hono'
import { APP_VERSION } from '../../types'

import type { Env } from '../../types'

const adminIndex = new Hono<{ Bindings: Env }>()

adminIndex.get('/', async (c) => {
  const [visitors, inquiries, services, daily] = await Promise.all([
    c.env.my_services_db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN date(visited_at)=date('now') THEN 1 END) as today, COUNT(CASE WHEN bot_verdict='BOT' THEN 1 END) as bots FROM visitors`).first<{total:number;today:number;bots:number}>(),
    c.env.my_services_db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN is_read=0 THEN 1 END) as unread FROM inquiries`).first<{total:number;unread:number}>(),
    c.env.my_services_db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN is_active=1 THEN 1 END) as active FROM services`).first<{total:number;active:number}>(),
    c.env.my_services_db.prepare(`SELECT date(visited_at) as date, COUNT(*) as count FROM visitors WHERE visited_at >= date('now', '-7 days') GROUP BY date(visited_at) ORDER BY date ASC`).all<{date:string;count:number}>(),
  ])

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Dashboard — My Services Admin</title>
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
    .nav-item svg{flex-shrink:0;opacity:.7;}
    .nav-item.active svg{opacity:1;}
    .nav-bottom{margin-top:auto;}

    .main{margin-left:220px;flex:1;padding:36px 40px;}
    .page-title{font-size:22px;font-weight:600;letter-spacing:-0.5px;margin-bottom:28px;}

    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
    .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 20px;box-shadow:var(--shadow-sm);position:relative;overflow:hidden;}
    .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);}
    .stat-label{font-size:11px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-transform:uppercase;margin-bottom:8px;}
    .stat-value{font-size:30px;font-weight:600;letter-spacing:-1px;}
    .stat-sub{font-size:12px;color:var(--text3);margin-top:4px;}
    .stat-value.green{color:var(--green);}
    .stat-value.red{color:var(--red);}
    .stat-value.yellow{color:var(--yellow);}

    .card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px 24px;box-shadow:var(--shadow-sm);margin-bottom:20px;}
    .card-title{font-size:13px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:18px;}

    .inquiry-row{display:grid;grid-template-columns:100px 1fr 120px 70px;gap:12px;padding:11px 0;border-bottom:1px solid var(--bg2);align-items:center;font-size:13px;}
    .inquiry-row:first-child{border-top:1px solid var(--bg2);}
    .inquiry-date{color:var(--text3);font-size:12px;}
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;}
    .badge-new{background:var(--yellow-bg);color:var(--yellow);}
    .badge-read{background:var(--bg3);color:var(--text3);}
    .view-all{display:inline-flex;align-items:center;gap:4px;margin-top:14px;font-size:13px;color:var(--text3);text-decoration:none;font-weight:500;}
    .view-all:hover{color:var(--text);}
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
      <a href="/admin" class="nav-item active">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Dashboard
      </a>
      <a href="/admin/manage/services" class="nav-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Services
      </a>
      <a href="/admin/manage/notices" class="nav-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
        Notices
      </a>
      <a href="/admin/manage/inquiries" class="nav-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Inquiries
      </a>
      <a href="/admin/manage/visitors" class="nav-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Visitors
      </a>
      <a href="/admin/manage/stats" class="nav-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Stats
      </a>
    </div>
    <div class="nav-section nav-bottom">
      <div class="nav-label">Site</div>
      <a href="/" class="nav-item" target="_blank">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Front Page
      </a>
    </div>
  </nav>

  <main class="main">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;">
      <div class="page-title" style="margin-bottom:0;">Dashboard</div>
      <div style="font-size:12px;color:var(--text3);font-weight:500;background:var(--bg2);padding:4px 10px;border-radius:6px;border:1px solid var(--border);">${APP_VERSION}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Today</div>
        <div class="stat-value yellow">${visitors?.today ?? 0}</div>
        <div class="stat-sub">전체 ${visitors?.total ?? 0}명</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Unread</div>
        <div class="stat-value ${(inquiries?.unread??0)>0?'red':''}">${inquiries?.unread ?? 0}</div>
        <div class="stat-sub">전체 ${inquiries?.total ?? 0}건</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Services</div>
        <div class="stat-value green">${services?.active ?? 0}</div>
        <div class="stat-sub">전체 ${services?.total ?? 0}개</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Bots</div>
        <div class="stat-value red">${visitors?.bots ?? 0}</div>
        <div class="stat-sub">감지된 봇</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Visitors — Last 7 Days</div>
      <canvas id="visitChart" height="60"></canvas>
    </div>

    <div class="card">
      <div class="card-title">Recent Inquiries</div>
      <div id="inquiry-list"><div style="color:var(--text3);font-size:13px;">로딩 중...</div></div>
      <a href="/admin/manage/inquiries" class="view-all">전체 보기 →</a>
    </div>
  </main>

  <script>
    new Chart(document.getElementById('visitChart'),{
      type:'line',
      data:{
        labels:${JSON.stringify(daily.results.map(d=>d.date))},
        datasets:[{
          data:${JSON.stringify(daily.results.map(d=>d.count))},
          borderColor:'#2a6f3a',backgroundColor:'rgba(42,111,58,.08)',
          borderWidth:2,pointRadius:3,tension:0.3,fill:true
        }]
      },
      options:{
        plugins:{legend:{display:false}},
        scales:{
          x:{ticks:{color:'#8a8a84',font:{family:'Mona Sans',size:11}},grid:{color:'rgba(0,0,0,.05)'}},
          y:{ticks:{color:'#8a8a84',font:{family:'Mona Sans',size:11}},grid:{color:'rgba(0,0,0,.05)'},beginAtZero:true}
        }
      }
    })
    fetch('/admin/inquiries?limit=5',{credentials:'include'})
      .then(r=>r.json())
      .then(data=>{
        const el=document.getElementById('inquiry-list')
        if(!data.length){el.innerHTML='<div style="color:var(--text3);font-size:13px;">문의 없음</div>';return;}
        el.innerHTML=data.map(i=>\`
          <div class="inquiry-row">
            <div class="inquiry-date">\${i.created_at.slice(0,10)}</div>
            <div>\${i.name}</div>
            <div style="color:var(--text3);font-size:12px;">\${i.service_title??'—'}</div>
            <div>\${i.is_read?'<span class="badge badge-read">READ</span>':'<span class="badge badge-new">NEW</span>'}</div>
          </div>
        \`).join('')
      })
  </script>
</body>
</html>`)
})

export default adminIndex
