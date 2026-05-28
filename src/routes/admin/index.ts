import { Hono } from 'hono'
import { APP_VERSION } from '../../types'
import { adminLayout, pageHeader } from '../../views/admin/layout'
import type { Env } from '../../types'

const adminIndex = new Hono<{ Bindings: Env }>()

adminIndex.get('/', async (c) => {
  const [visitors, inquiries, services, daily] = await Promise.all([
    c.env.my_services_db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN date(visited_at)=date('now') THEN 1 END) as today, COUNT(CASE WHEN bot_verdict='BOT' THEN 1 END) as bots FROM visitors`).first<{ total: number; today: number; bots: number }>(),
    c.env.my_services_db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN is_read=0 THEN 1 END) as unread FROM inquiries`).first<{ total: number; unread: number }>(),
    c.env.my_services_db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN is_active=1 THEN 1 END) as active FROM services`).first<{ total: number; active: number }>(),
    c.env.my_services_db.prepare(`SELECT date(visited_at) as date, COUNT(*) as count FROM visitors WHERE visited_at >= date('now', '-7 days') GROUP BY date(visited_at) ORDER BY date ASC`).all<{ date: string; count: number }>(),
  ])

  const body = `
    ${pageHeader('Dashboard')}

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Today</div>
        <div class="stat-value yellow">${visitors?.today ?? 0}</div>
        <div class="stat-sub">전체 ${visitors?.total ?? 0}명</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Unread</div>
        <div class="stat-value ${(inquiries?.unread ?? 0) > 0 ? 'red' : ''}">${inquiries?.unread ?? 0}</div>
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
      <a href="/admin/manage/inquiries" style="display:inline-flex;align-items:center;gap:4px;margin-top:14px;font-size:13px;color:var(--text3);text-decoration:none;font-weight:500;">전체 보기 →</a>
    </div>

    <style>
      .inquiry-row{display:grid;grid-template-columns:100px 1fr 120px 70px;gap:12px;padding:11px 0;border-bottom:1px solid var(--bg2);align-items:center;font-size:13px;}
      .inquiry-row:first-child{border-top:1px solid var(--bg2);}
      .inquiry-date{color:var(--text3);font-size:12px;}
    </style>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      new Chart(document.getElementById('visitChart'), {
        type: 'line',
        data: {
          labels: ${JSON.stringify(daily.results.map(d => d.date))},
          datasets: [{
            data: ${JSON.stringify(daily.results.map(d => d.count))},
            borderColor: '#2a6f3a', backgroundColor: 'rgba(42,111,58,.08)',
            borderWidth: 2, pointRadius: 3, tension: 0.3, fill: true
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#8a8a84', font: { family: 'Mona Sans', size: 11 } }, grid: { color: 'rgba(0,0,0,.05)' } },
            y: { ticks: { color: '#8a8a84', font: { family: 'Mona Sans', size: 11 } }, grid: { color: 'rgba(0,0,0,.05)' }, beginAtZero: true }
          }
        }
      })
      fetch('/admin/inquiries?limit=5', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const el = document.getElementById('inquiry-list')
          if (!data.length) { el.innerHTML = '<div style="color:var(--text3);font-size:13px;">문의 없음</div>'; return; }
          el.innerHTML = data.map(i => \`
            <div class="inquiry-row">
              <div class="inquiry-date">\${i.created_at.slice(0, 10)}</div>
              <div>\${i.name}</div>
              <div style="color:var(--text3);font-size:12px;">\${i.service_title ?? '—'}</div>
              <div>\${i.is_read ? '<span class="badge badge-read">READ</span>' : '<span class="badge badge-new">NEW</span>'}</div>
            </div>
          \`).join('')
        })
    </script>
  `

  return c.html(adminLayout('dashboard', 'Dashboard', body))
})

export default adminIndex
