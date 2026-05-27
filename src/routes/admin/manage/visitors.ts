import { Hono } from 'hono'
import { html } from 'hono/html'
import { APP_VERSION } from '../../../types'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results: services } = await c.env.my_services_db
    .prepare('SELECT id, title FROM services ORDER BY sort_order ASC')
    .all<{ id: number; title: string }>()

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Visitors — My Services Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  <style>
    :root{--bg:#e8e8e3;--bg2:#d4d4ce;--bg3:#c8c8c2;--surface:#f0efea;--surface2:#e2e1dc;--border:#b8b8b2;--border2:#a0a09a;--text:#1c1c1a;--text2:#5a5a54;--text3:#8a8a84;--green:#2a6f3a;--green-bg:#d4ead8;--red:#9a2a2a;--red-bg:#f0d4d4;--yellow:#7a6200;--yellow-bg:#f5edc0;--shadow-sm:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.08);--shadow-md:0 4px 12px rgba(0,0,0,.10),0 2px 4px rgba(0,0,0,.08);}
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
    .page-title{font-size:22px;font-weight:600;letter-spacing:-0.5px;margin-bottom:20px;}
    .filters{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center;}
    .filter-select,.filter-input{background:var(--surface);border:1px solid var(--border);color:var(--text);padding:7px 12px;font-family:inherit;font-size:13px;border-radius:8px;outline:none;transition:border-color .15s;}
    .filter-select:focus,.filter-input:focus{border-color:var(--border2);}
    .filter-select option{background:var(--surface);}
    .btn{display:inline-flex;align-items:center;padding:7px 16px;font-family:inherit;font-size:13px;font-weight:500;border-radius:8px;border:1px solid var(--border);cursor:pointer;transition:all .15s;}
    .btn-primary{background:var(--text);color:var(--surface);border-color:var(--text);}
    .btn-primary:hover{opacity:.85;}
    .btn-ghost{background:var(--surface);color:var(--text2);}
    .btn-ghost:hover{background:var(--surface2);color:var(--text);}
    .table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow-x:auto;box-shadow:var(--shadow-sm);}
    table{width:100%;border-collapse:collapse;min-width:900px;}
    thead{background:var(--bg2);}
    th{padding:10px 12px;font-size:11px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-align:left;text-transform:uppercase;border-bottom:1px solid var(--border);white-space:nowrap;}
    td{padding:10px 12px;font-size:12px;border-bottom:1px solid var(--bg2);vertical-align:middle;white-space:nowrap;}
    tr:last-child td{border-bottom:none;}
    tbody tr:hover td{background:rgba(0,0,0,.02);}
    .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;}
    .badge-BOT{background:var(--red-bg);color:var(--red);}
    .badge-SUSPECT{background:var(--yellow-bg);color:var(--yellow);}
    .badge-HUMAN{background:var(--green-bg);color:var(--green);}
    .flag-on{color:var(--red);font-size:10px;}
    .flag-off{color:var(--bg3);font-size:10px;}
    .empty{padding:48px;text-align:center;color:var(--text3);font-size:13px;}
    .pagination{display:flex;gap:8px;margin-top:14px;align-items:center;font-size:13px;color:var(--text3);}
  </style>
</head>
<body x-data="visitorsApp()">
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
      <a href="/admin/manage/visitors" class="nav-item active"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Visitors</a>
      <a href="/admin/manage/stats" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Stats</a>
    </div>
    <div class="nav-section nav-bottom">
      <div class="nav-label">Site</div>
      <a href="/" class="nav-item" target="_blank"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Front Page</a>
    </div>
  </nav>

  <main class="main">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div class="page-title" style="margin-bottom:0;">Visitors</div>
      <div style="font-size:12px;color:var(--text3);">${APP_VERSION}</div>
    </div>
    <div class="filters">
      <select class="filter-select" x-model="filter.bot">
        <option value="">All Verdicts</option>
        <option value="human">Human</option>
        <option value="suspect">Suspect</option>
        <option value="bot">Bot</option>
      </select>
      <select class="filter-select" x-model="filter.service_id">
        <option value="">All Services</option>
        ${services.map(s => html`<option value="${s.id}">${s.title}</option>`)}
      </select>
      <input class="filter-input" type="date" x-model="filter.date_from"/>
      <input class="filter-input" type="date" x-model="filter.date_to"/>
      <button class="btn btn-primary" @click="load(0)">Filter</button>
      <button class="btn btn-ghost" @click="resetFilter()">Reset</button>
      <span style="margin-left:auto;font-size:13px;color:var(--text3);" x-text="total+' total'"></span>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th><th>IP</th><th>Verdict</th><th>Score</th>
            <th>Device</th><th>OS</th><th>Browser</th><th>Page</th>
            <th title="Webdriver">WD</th><th title="Headless">HL</th>
            <th title="No Plugins">PLG</th><th title="No Langs">LNG</th>
            <th title="No Chrome">CHR</th><th title="iFrame">IFR</th>
          </tr>
        </thead>
        <tbody>
          <template x-if="visitors.length===0&&!loading"><tr><td colspan="14" class="empty">방문자 없음</td></tr></template>
          <template x-if="loading"><tr><td colspan="14" class="empty" style="color:var(--text3);">로딩 중...</td></tr></template>
          <template x-for="v in visitors" :key="v.id">
            <tr>
              <td style="color:var(--text3);" x-text="v.visited_at?.slice(0,16).replace('T',' ')"></td>
              <td x-text="v.public_ip??'—'"></td>
              <td><span class="badge" :class="'badge-'+(v.bot_verdict??'HUMAN')" x-text="v.bot_verdict??'—'"></span></td>
              <td style="color:var(--text3);" x-text="v.bot_score??'—'"></td>
              <td x-text="v.device_type??'—'"></td>
              <td x-text="v.os??'—'"></td>
              <td x-text="v.browser??'—'"></td>
              <td style="color:var(--text3);max-width:140px;overflow:hidden;text-overflow:ellipsis;" x-text="v.page_url?(v.page_url.length>20?v.page_url.slice(0,20)+'…':v.page_url):'—'"></td>
              <td :class="v.flag_webdriver?'flag-on':'flag-off'" x-text="v.flag_webdriver?'●':'○'"></td>
              <td :class="v.flag_headless?'flag-on':'flag-off'" x-text="v.flag_headless?'●':'○'"></td>
              <td :class="v.flag_no_plugins?'flag-on':'flag-off'" x-text="v.flag_no_plugins?'●':'○'"></td>
              <td :class="v.flag_no_langs?'flag-on':'flag-off'" x-text="v.flag_no_langs?'●':'○'"></td>
              <td :class="v.flag_no_chrome?'flag-on':'flag-off'" x-text="v.flag_no_chrome?'●':'○'"></td>
              <td :class="v.flag_in_iframe?'flag-on':'flag-off'" x-text="v.flag_in_iframe?'●':'○'"></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="btn btn-ghost" @click="load(offset-100)" :disabled="offset===0" style="padding:5px 12px;font-size:12px;">← Prev</button>
      <span x-text="'Page '+(Math.floor(offset/100)+1)"></span>
      <button class="btn btn-ghost" @click="load(offset+100)" :disabled="visitors.length<100" style="padding:5px 12px;font-size:12px;">Next →</button>
    </div>
  </main>

  <script>
    function visitorsApp(){return{
      visitors:[],total:0,offset:0,loading:false,
      filter:{bot:'',service_id:'',date_from:'',date_to:''},
      async init(){await this.load(0)},
      async load(newOffset){
        this.loading=true;this.offset=Math.max(0,newOffset)
        const p=new URLSearchParams({limit:'100',offset:String(this.offset)})
        if(this.filter.bot)p.set('bot',this.filter.bot)
        if(this.filter.service_id)p.set('service_id',this.filter.service_id)
        if(this.filter.date_from)p.set('date_from',this.filter.date_from)
        if(this.filter.date_to)p.set('date_to',this.filter.date_to)
        const res=await fetch('/admin/visitors?'+p,{credentials:'include'})
        this.visitors=await res.json();this.loading=false
      },
      resetFilter(){this.filter={bot:'',service_id:'',date_from:'',date_to:''};this.load(0)}
    }}
  </script>
</body>
</html>`)
})

export default app
