import { APP_VERSION } from '../../types'

export type AdminPage = 'dashboard' | 'services' | 'notices' | 'inquiries' | 'visitors' | 'stats'

const NAV_ITEMS: { id: AdminPage; label: string; href: string; icon: string }[] = [
  {
    id: 'dashboard', label: 'Dashboard', href: '/admin',
    icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
  },
  {
    id: 'services', label: 'Services', href: '/admin/manage/services',
    icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'
  },
  {
    id: 'notices', label: 'Notices', href: '/admin/manage/notices',
    icon: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>'
  },
  {
    id: 'inquiries', label: 'Inquiries', href: '/admin/manage/inquiries',
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
  },
  {
    id: 'visitors', label: 'Visitors', href: '/admin/manage/visitors',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  {
    id: 'stats', label: 'Stats', href: '/admin/manage/stats',
    icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
  },
]

function icon(paths: string) {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${paths}</svg>`
}

function sidebar(active: AdminPage) {
  const navItems = NAV_ITEMS.map(item => `
    <a href="${item.href}" class="nav-item${item.id === active ? ' active' : ''}">
      ${icon(item.icon)}
      ${item.label}
    </a>
  `).join('')

  return `
  <nav class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⬡</div>
      <span class="logo-text">My<span>Services</span></span>
    </div>
    <div class="nav-section">
      <div class="nav-label">Menu</div>
      ${navItems}
    </div>
    <div class="nav-section nav-bottom">
      <div class="nav-label">Site</div>
      <a href="/" class="nav-item" target="_blank">
        ${icon('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>')}
        Front Page
      </a>
      <a href="/admin/logout" class="nav-item nav-logout" onclick="return confirm('로그아웃 하시겠습니까?')">
        ${icon('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>')}
        Logout
      </a>
    </div>
  </nav>`
}

export const ADMIN_CSS = `
  :root{
    --bg:#e8e8e3;--bg2:#d4d4ce;--bg3:#c8c8c2;
    --surface:#f0efea;--surface2:#e2e1dc;
    --border:#b8b8b2;--border2:#a0a09a;
    --text:#1c1c1a;--text2:#5a5a54;--text3:#8a8a84;
    --green:#2a6f3a;--green-bg:#d4ead8;
    --purple:#4a3a9a;--purple-bg:#dcd8f0;
    --red:#9a2a2a;--red-bg:#f0d4d4;
    --yellow:#7a6200;--yellow-bg:#f5edc0;
    --shadow-sm:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.08);
    --shadow-md:0 4px 12px rgba(0,0,0,.10),0 2px 4px rgba(0,0,0,.08);
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:var(--text);font-family:'Mona Sans',-apple-system,sans-serif;display:flex;min-height:100vh;}

  /* ── Sidebar ── */
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
  .nav-logout{color:var(--red) !important;opacity:.75;}
  .nav-logout:hover{background:var(--red-bg) !important;opacity:1;}
  .nav-bottom{margin-top:auto;}

  /* ── Main ── */
  .main{margin-left:220px;flex:1;padding:36px 40px;}
  .page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
  .page-title{font-size:22px;font-weight:600;letter-spacing:-0.5px;}
  .version-badge{font-size:12px;color:var(--text3);font-weight:500;background:var(--bg2);padding:4px 10px;border-radius:6px;border:1px solid var(--border);}

  /* ── Buttons ── */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;font-family:inherit;font-size:13px;font-weight:500;border-radius:8px;border:1px solid var(--border);cursor:pointer;transition:all .15s;}
  .btn-primary{background:var(--text);color:var(--surface);border-color:var(--text);}
  .btn-primary:hover{opacity:.85;}
  .btn-ghost{background:var(--surface);color:var(--text2);}
  .btn-ghost:hover{background:var(--surface2);color:var(--text);border-color:var(--border2);}
  .btn-success{background:var(--green-bg);color:var(--green);border-color:rgba(42,111,58,.2);}
  .btn-success:hover{opacity:.8;}
  .btn-danger{background:var(--red-bg);color:var(--red);border-color:rgba(154,42,42,.2);}
  .btn-danger:hover{opacity:.8;}
  .btn-sm{padding:5px 12px;font-size:12px;}

  /* ── Cards ── */
  .card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px 24px;box-shadow:var(--shadow-sm);margin-bottom:20px;}
  .card-title{font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:18px;}

  /* ── Table ── */
  .table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm);}
  table{width:100%;border-collapse:collapse;}
  thead{background:var(--bg2);}
  th{padding:11px 16px;font-size:11px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-align:left;text-transform:uppercase;border-bottom:1px solid var(--border);}
  td{padding:13px 16px;font-size:13px;border-bottom:1px solid var(--bg2);vertical-align:middle;}
  tr:last-child td{border-bottom:none;}
  tbody tr:hover td{background:rgba(0,0,0,.02);}
  .empty{padding:48px;text-align:center;color:var(--text3);font-size:13px;}

  /* ── Badge ── */
  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;}
  .badge-webdev{background:var(--green-bg);color:var(--green);}
  .badge-ai{background:var(--purple-bg);color:var(--purple);}
  .badge-on{background:var(--green-bg);color:var(--green);}
  .badge-off{background:var(--bg3);color:var(--text3);}
  .badge-new{background:var(--yellow-bg);color:var(--yellow);}
  .badge-read{background:var(--bg3);color:var(--text3);}
  .badge-pending{background:var(--yellow-bg);color:var(--yellow);}
  .badge-resolved{background:var(--green-bg);color:var(--green);}
  .badge-BOT{background:var(--red-bg);color:var(--red);}
  .badge-SUSPECT{background:var(--yellow-bg);color:var(--yellow);}
  .badge-HUMAN{background:var(--green-bg);color:var(--green);}

  /* ── Modal ── */
  .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:100;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
  .overlay.open{display:flex;}
  .modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-md);padding:28px 32px;width:90%;max-width:520px;max-height:90vh;overflow-y:auto;}
  .modal-title{font-size:17px;font-weight:600;letter-spacing:-0.3px;margin-bottom:20px;}
  .modal-btns{display:flex;gap:10px;margin-top:20px;justify-content:flex-end;}

  /* ── Form Fields ── */
  .field{margin-bottom:14px;}
  .field label{display:block;font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;}
  .field input,.field textarea,.field select{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:9px 12px;font-family:inherit;font-size:13px;border-radius:8px;outline:none;transition:border-color .15s;}
  .field input:focus,.field textarea:focus,.field select:focus{border-color:var(--border2);background:var(--surface);}
  .field select option{background:var(--surface);}
  .field textarea{height:80px;resize:vertical;}

  /* ── Stats ── */
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 20px;box-shadow:var(--shadow-sm);position:relative;overflow:hidden;}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);}
  .stat-label{font-size:11px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-transform:uppercase;margin-bottom:8px;}
  .stat-value{font-size:30px;font-weight:600;letter-spacing:-1px;}
  .stat-sub{font-size:12px;color:var(--text3);margin-top:4px;}
  .stat-value.green{color:var(--green);}
  .stat-value.red{color:var(--red);}
  .stat-value.yellow{color:var(--yellow);}
`

export function adminLayout(
  active: AdminPage,
  title: string,
  bodyContent: string,
  extraHead = ''
): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title} — My Services Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  ${extraHead}
  <style>${ADMIN_CSS}</style>
</head>
<body>
  ${sidebar(active)}
  <main class="main">
    ${bodyContent}
  </main>
</body>
</html>`
}

export function pageHeader(title: string, showVersion = true, extra = '') {
  return `
  <div class="page-header">
    <div class="page-title">${title}</div>
    <div style="display:flex;align-items:center;gap:10px;">
      ${extra}
      ${showVersion ? `<span class="version-badge">${APP_VERSION}</span>` : ''}
    </div>
  </div>`
}
