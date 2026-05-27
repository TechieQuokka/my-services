import { Hono } from 'hono'
import { APP_VERSION } from '../../../types'

import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results: inquiries } = await c.env.my_services_db.prepare(`
    SELECT i.*, s.title as service_title FROM inquiries i
    LEFT JOIN services s ON i.service_id=s.id
    ORDER BY i.created_at DESC LIMIT 100
  `).all()

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Inquiries — My Services Admin</title>
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
    .page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
    .page-title{font-size:22px;font-weight:600;letter-spacing:-0.5px;}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;font-family:inherit;font-size:13px;font-weight:500;border-radius:8px;border:1px solid var(--border);cursor:pointer;transition:all .15s;}
    .btn-ghost{background:var(--surface);color:var(--text2);}
    .btn-ghost:hover{background:var(--surface2);color:var(--text);}
    .btn-success{background:var(--green-bg);color:var(--green);border-color:rgba(42,111,58,.2);}
    .btn-danger{background:var(--red-bg);color:var(--red);border-color:rgba(154,42,42,.2);}
    .btn-sm{padding:5px 12px;font-size:12px;}
    .table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm);}
    table{width:100%;border-collapse:collapse;}
    thead{background:var(--bg2);}
    th{padding:11px 16px;font-size:11px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-align:left;text-transform:uppercase;border-bottom:1px solid var(--border);}
    td{padding:13px 16px;font-size:13px;border-bottom:1px solid var(--bg2);vertical-align:middle;}
    tr:last-child td{border-bottom:none;}
    tbody tr.unread{background:rgba(245,237,192,.2);}
    tbody tr:hover td{background:rgba(0,0,0,.02);}
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;}
    .badge-pending{background:var(--yellow-bg);color:var(--yellow);}
    .badge-resolved{background:var(--green-bg);color:var(--green);}
    .content-preview{color:var(--text3);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .actions{display:flex;gap:6px;}
    .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:100;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
    .overlay.open{display:flex;}
    .modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-md);padding:28px 32px;width:95%;max-width:600px;max-height:90vh;display:flex;flex-direction:column;}
    .modal-title{font-size:17px;font-weight:600;letter-spacing:-0.3px;margin-bottom:20px; flex-shrink:0;}
    
    .post-content{padding:16px; background:var(--bg); border-radius:12px; border:1px solid var(--border); font-size:14px; line-height:1.6; margin-bottom:24px; white-space:pre-wrap;}
    .thread-section{flex:1; overflow-y:auto; margin-bottom:20px;}
    .thread-title{font-size:12px; font-weight:600; color:var(--text3); text-transform:uppercase; margin-bottom:12px; border-bottom:1px solid var(--bg2); padding-bottom:8px;}
    .cmt{padding:12px 0; border-bottom:1px solid var(--bg2);}
    .cmt:last-child{border-bottom:none;}
    .cmt-meta{display:flex; align-items:center; gap:8px; font-size:11px; margin-bottom:4px;}
    .cmt-role{font-weight:700; padding:1px 5px; border-radius:3px;}
    .role-admin{background:var(--text); color:var(--surface);}
    .role-user{background:var(--bg3); color:var(--text2);}
    .cmt-body{font-size:13px; color:var(--text2); line-height:1.5;}

    .reply-box{display:flex; gap:8px; flex-shrink:0; padding-top:16px; border-top:1px solid var(--bg2);}
    .reply-box input{flex:1; background:var(--bg); border:1px solid var(--border); padding:10px 14px; border-radius:8px; font-family:inherit; font-size:13px;}
  </style>
</head>
<body x-data="inquiriesApp()">
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
      <a href="/admin/manage/inquiries" class="nav-item active"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Inquiries</a>
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
      <div class="page-title">Inquiries <small style="font-size:12px;color:var(--text3);font-weight:400;margin-left:6px;">${APP_VERSION}</small></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Name</th><th>Service</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <template x-for="i in inquiries" :key="i.id">
            <tr :class="{unread:!i.is_read}">
              <td style="color:var(--text3);font-size:12px;" x-text="i.created_at.slice(5,10)"></td>
              <td style="font-weight:500;" x-text="i.name"></td>
              <td style="color:var(--text3);font-size:12px;" x-text="i.service_title??'—'"></td>
              <td><div class="content-preview" x-text="i.content"></div></td>
              <td><span class="badge" :class="i.status==='resolved'?'badge-resolved':'badge-pending'" x-text="i.status==='resolved'?'Done':'Pending'"></span></td>
              <td>
                <div class="actions">
                  <button class="btn btn-ghost btn-sm" @click="openDetail(i)">Manage</button>
                  <button class="btn btn-danger btn-sm" @click="deleteInquiry(i.id)">Del</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </main>

  <div class="overlay" :class="{open:modal}">
    <div class="modal" x-show="selected">
      <div class="modal-title" x-text="'Manage Inquiry — ' + (selected?.name ?? '')"></div>
      
      <div class="post-content" x-text="selected?.content"></div>

      <div class="thread-section" id="admin-thread-wrap">
        <div class="thread-title">Messages & Replies</div>
        <template x-for="m in messages" :key="m.id">
          <div class="cmt">
            <div class="cmt-meta">
              <span class="cmt-role" :class="m.sender_role === 'admin' ? 'role-admin' : 'role-user'" x-text="m.sender_role.toUpperCase()"></span>
              <span style="color:var(--text3);" x-text="m.created_at.slice(5,16).replace('T',' ')"></span>
            </div>
            <div class="cmt-body" x-text="m.content"></div>
          </div>
        </template>
        <template x-if="messages.length===0">
          <p style="font-size:12px; color:var(--text3); padding:10px 0;">아직 댓글이 없습니다.</p>
        </template>
      </div>

      <div class="reply-box">
        <input type="text" x-model="reply" placeholder="댓글을 입력하세요..." @keyup.enter="sendReply()"/>
        <button class="btn btn-primary" @click="sendReply()">등록</button>
      </div>

      <div class="modal-btns">
        <button class="btn btn-ghost" @click="modal=false">Close</button>
        <button class="btn btn-success" @click="resolve()">Resolved</button>
      </div>
    </div>
  </div>

  <script>
    function inquiriesApp(){return{
      inquiries:${JSON.stringify(inquiries)},
      modal:false,selected:null,messages:[],reply:'',
      async openDetail(i){
        this.selected=i;this.modal=true;this.reply='';
        if(!i.is_read){await fetch(\`/admin/inquiries/\${i.id}/read\`,{method:'PATCH',credentials:'include'});i.is_read=1;}
        this.loadMessages();
      },
      async loadMessages(){
        const res=await fetch(\`/admin/inquiries/\${this.selected.id}/messages\`,{credentials:'include'})
        this.messages=await res.json();
        this.$nextTick(() => { const wrap=document.getElementById('admin-thread-wrap'); wrap.scrollTop=wrap.scrollHeight; });
      },
      async sendReply(){
        if(!this.reply.trim())return;
        await fetch(\`/api/inquiries/\${this.selected.id}/messages\`,{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({content:this.reply,sender_role:'admin'})
        })
        this.reply='';
        this.loadMessages();
      },
      async resolve(){
        await fetch(\`/admin/inquiries/\${this.selected.id}/status\`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'resolved'})})
        this.selected.status='resolved';
      },
      async deleteInquiry(id){
        if(!confirm('문의를 영구 삭제하시겠습니까? 관련 대화도 모두 삭제됩니다.'))return
        await fetch(\`/admin/inquiries/\${id}\`,{method:'DELETE',credentials:'include'})
        this.inquiries=this.inquiries.filter(i=>i.id!==id)
      }
    }}
  </script>
</body>
</html>`)
})

export default app
