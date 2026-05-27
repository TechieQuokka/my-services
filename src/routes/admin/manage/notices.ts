import { Hono } from 'hono'
import { html } from 'hono/html'
import { db } from '../../../lib/db'
import { APP_VERSION } from '../../../types'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results: notices } = await db.notices.list(c.env, 50)

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Notices — My Services Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer><\/script>
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
    .page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
    .page-title{font-size:22px;font-weight:600;letter-spacing:-0.5px;}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;font-family:inherit;font-size:13px;font-weight:500;border-radius:8px;border:1px solid var(--border);cursor:pointer;transition:all .15s;}
    .btn-primary{background:var(--text);color:var(--surface);border-color:var(--text);}
    .btn-ghost{background:var(--surface);color:var(--text2);}
    .btn-danger{background:var(--red-bg);color:var(--red);border-color:rgba(154,42,42,.2);}
    .table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm);}
    table{width:100%;border-collapse:collapse;}
    thead{background:var(--bg2);}
    th{padding:11px 16px;font-size:11px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-align:left;text-transform:uppercase;border-bottom:1px solid var(--border);}
    td{padding:13px 16px;font-size:13px;border-bottom:1px solid var(--bg2);vertical-align:middle;}
    .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:100;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
    .overlay.open{display:flex;}
    .modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-md);padding:28px 32px;width:90%;max-width:600px;}
    .field{margin-bottom:14px;}
    .field label{display:block;font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;}
    .field input, .field textarea{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:9px 12px;font-family:inherit;font-size:13px;border-radius:8px;outline:none;}
    .field textarea{height:200px;resize:vertical;}
    .badge-fixed{background:var(--green-bg);color:var(--green);font-size:10px;padding:2px 6px;border-radius:4px;}
  </style>
</head>
<body x-data="noticeApp()">
  <nav class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⬡</div>
      <span class="logo-text">My<span>Services</span></span>
    </div>
    <div class="nav-section">
      <div class="nav-label">Menu</div>
      <a href="/admin" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</a>
      <a href="/admin/manage/services" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>Services</a>
      <a href="/admin/manage/notices" class="nav-item active"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>Notices</a>
      <a href="/admin/manage/inquiries" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Inquiries</a>
      <a href="/admin/manage/visitors" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Visitors</a>
      <a href="/admin/manage/stats" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Stats</a>
    </div>
    <div class="nav-section nav-bottom">
      <div class="nav-label">Site</div>
      <a href="/" class="nav-item" target="_blank"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Front Page</a>
    </div>
  </nav>

  <main class="main">
    <div class="page-header">
      <div class="page-title">Notices <small style="font-size:12px;color:var(--text3);font-weight:400;margin-left:6px;">${APP_VERSION}</small></div>
      <button class="btn btn-primary" @click="openCreate()">+ New Notice</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Date</th><th>Fixed</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <template x-for="n in notices" :key="n.id">
            <tr>
              <td style="font-weight:500;" x-text="n.title"></td>
              <td style="color:var(--text3);font-size:12px;" x-text="n.created_at.slice(0,10)"></td>
              <td><span x-show="n.is_fixed" class="badge-fixed">FIXED</span></td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" @click="openEdit(n)">Edit</button>
                  <button class="btn btn-danger" style="padding:4px 8px;font-size:11px;" @click="deleteNotice(n.id)">Del</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </main>

  <div class="overlay" :class="{open:modal}">
    <div class="modal">
      <div class="page-title" x-text="editTarget?'Edit Notice':'New Notice'"></div>
      <div class="field"><label>Title</label><input type="text" x-model="form.title"/></div>
      <div class="field"><label>Content</label><textarea x-model="form.content"></textarea></div>
      <div class="field" style="display:flex;align-items:center;gap:10px;">
        <input type="checkbox" id="is_fixed" x-model="form.is_fixed" style="width:auto;"/>
        <label for="is_fixed" style="margin-bottom:0;">상단 고정</label>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
        <button class="btn btn-ghost" @click="modal=false">Cancel</button>
        <button class="btn btn-primary" @click="submitForm()">Save</button>
      </div>
    </div>
  </div>

  <script>
    function noticeApp(){return{
      notices:${JSON.stringify(notices)},
      modal:false,editTarget:null,form:{},
      openCreate(){this.editTarget=null;this.form={title:'',content:'',is_fixed:false};this.modal=true;},
      openEdit(n){this.editTarget=n;this.form={...n,is_fixed:!!n.is_fixed};this.modal=true;},
      async submitForm(){
        const url=this.editTarget?'/api/notices/'+this.editTarget.id:'/api/notices'
        const method=this.editTarget?'PUT':'POST'
        await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({...this.form,is_fixed:this.form.is_fixed?1:0})})
        location.reload()
      },
      async deleteNotice(id){
        if(!confirm('삭제하시겠습니까?'))return
        await fetch('/api/notices/'+id,{method:'DELETE'})
        location.reload()
      }
    }}
  </script>
</body>
</html>`)
})

export default app
