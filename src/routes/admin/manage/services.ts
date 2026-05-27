import { Hono } from 'hono'
import { html } from 'hono/html'
import { APP_VERSION } from '../../../types'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results: services } = await c.env.my_services_db
    .prepare('SELECT * FROM services ORDER BY sort_order ASC')
    .all()

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Services — My Services Admin</title>
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
    .btn-primary:hover{opacity:.85;}
    .btn-ghost{background:var(--surface);color:var(--text2);}
    .btn-ghost:hover{background:var(--surface2);color:var(--text);border-color:var(--border2);}
    .btn-danger{background:var(--red-bg);color:var(--red);border-color:rgba(154,42,42,.2);}
    .btn-danger:hover{opacity:.8;}
    .btn-sm{padding:5px 12px;font-size:12px;}
    .table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm);}
    table{width:100%;border-collapse:collapse;}
    thead{background:var(--bg2);}
    th{padding:11px 16px;font-size:11px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-align:left;text-transform:uppercase;border-bottom:1px solid var(--border);}
    td{padding:13px 16px;font-size:13px;border-bottom:1px solid var(--bg2);vertical-align:middle;}
    tr:last-child td{border-bottom:none;}
    tbody tr:hover td{background:rgba(0,0,0,.02);}
    .thumb{width:52px;height:38px;object-fit:cover;border-radius:6px;background:var(--bg3);}
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;}
    .badge-webdev{background:var(--green-bg);color:var(--green);}
    .badge-ai{background:var(--purple-bg);color:var(--purple);}
    .badge-on{background:var(--green-bg);color:var(--green);}
    .badge-off{background:var(--bg3);color:var(--text3);}
    .actions{display:flex;gap:6px;flex-wrap:wrap;}
    .empty{padding:48px;text-align:center;color:var(--text3);font-size:13px;}
    .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:100;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
    .overlay.open{display:flex;}
    .modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-md);padding:28px 32px;width:90%;max-width:500px;max-height:90vh;overflow-y:auto;}
    .modal-title{font-size:17px;font-weight:600;letter-spacing:-0.3px;margin-bottom:20px;}
    .field{margin-bottom:14px;}
    .field label{display:block;font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;}
    .field input,.field textarea,.field select{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:9px 12px;font-family:inherit;font-size:13px;border-radius:8px;outline:none;transition:border-color .15s;}
    .field input:focus,.field textarea:focus,.field select:focus{border-color:var(--border2);background:var(--surface);}
    .field select option{background:var(--surface);}
    .field textarea{height:80px;resize:vertical;}
    .modal-btns{display:flex;gap:10px;margin-top:20px;justify-content:flex-end;}

    /* Page Upload Modal */
    .drop-zone{
      border:2px dashed var(--border2);border-radius:10px;
      padding:36px 20px;text-align:center;cursor:pointer;
      transition:border-color .15s,background .15s;
      background:var(--bg);
    }
    .drop-zone:hover,.drop-zone.drag-over{border-color:var(--text);background:var(--surface2);}
    .drop-zone svg{margin-bottom:10px;opacity:.4;}
    .drop-zone p{font-size:13px;color:var(--text3);}
    .drop-zone strong{color:var(--text2);}
    .file-selected{margin-top:12px;padding:10px 14px;background:var(--green-bg);border:1px solid rgba(42,111,58,.2);border-radius:8px;font-size:13px;color:var(--green);display:flex;align-items:center;gap:8px;}
    .preview-link{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--text3);text-decoration:none;margin-top:8px;}
    .preview-link:hover{color:var(--text);}
  </style>
</head>
<body x-data="servicesApp()">
  <nav class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⬡</div>
      <span class="logo-text">My<span>Services</span></span>
    </div>
    <div class="nav-section">
      <div class="nav-label">Menu</div>
      <a href="/admin" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</a>
      <a href="/admin/manage/services" class="nav-item active"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>Services</a>
      <a href="/admin/manage/notices" class="nav-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>Notices</a>
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
      <div class="page-title">Services <small style="font-size:12px;color:var(--text3);font-weight:400;margin-left:6px;">${APP_VERSION}</small></div>
      <button class="btn btn-primary" @click="openCreate()">+ New Service</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Thumb</th><th>Title</th><th>Category</th><th>Status</th><th>Order</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <template x-if="services.length===0">
            <tr><td colspan="6" class="empty">서비스 없음</td></tr>
          </template>
          <template x-for="s in services" :key="s.id">
            <tr>
              <td><img class="thumb" :src="s.thumb_url||''" onerror="this.style.visibility='hidden'"/></td>
              <td style="font-weight:500;" x-text="s.title"></td>
              <td><span class="badge" :class="'badge-'+s.category" x-text="s.category==='webdev'?'Web Dev':'AI'"></span></td>
              <td><span class="badge" :class="s.is_active?'badge-on':'badge-off'" x-text="s.is_active?'Active':'Off'"></span></td>
              <td style="color:var(--text3);" x-text="s.sort_order"></td>
              <td>
                <div class="actions">
                  <button class="btn btn-ghost btn-sm" @click="toggleActive(s)">Toggle</button>
                  <button class="btn btn-ghost btn-sm" @click="openEdit(s)">Edit</button>
                  <button class="btn btn-ghost btn-sm" @click="openPage(s)">Page</button>
                  <button class="btn btn-danger btn-sm" @click="deleteService(s.id)">Del</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </main>

  <!-- Service Edit Modal -->
  <div class="overlay" :class="{open:modal}">
    <div class="modal">
      <div class="modal-title" x-text="editTarget?'Edit Service':'New Service'"></div>
      <div class="field"><label>Title</label><input type="text" x-model="form.title" placeholder="서비스 제목"/></div>
      <div class="field"><label>Category</label><select x-model="form.category"><option value="webdev">Web Dev</option><option value="ai">AI</option></select></div>
      <div class="field"><label>Description</label><textarea x-model="form.description" placeholder="서비스 설명"></textarea></div>
      <div class="field"><label>Thumb Type</label><select x-model="form.thumb_type"><option value="upload">Upload</option><option value="url">URL (Microlink)</option></select></div>
      <template x-if="form.thumb_type==='url'">
        <div class="field"><label>Thumb Origin URL</label><input type="text" x-model="form.thumb_origin" placeholder="https://..."/></div>
      </template>
      <template x-if="form.thumb_type==='upload'">
        <div class="field"><label>Thumb URL</label><input type="text" x-model="form.thumb_url" placeholder="https://ik.imagekit.io/..."/></div>
      </template>
      <div class="field"><label>Sort Order</label><input type="number" x-model="form.sort_order" placeholder="0"/></div>
      <div class="modal-btns">
        <button class="btn btn-ghost" @click="modal=false">Cancel</button>
        <button class="btn btn-primary" @click="submitForm()" x-text="saving?'Saving...':'Save'"></button>
      </div>
    </div>
  </div>

  <!-- Page Upload Modal -->
  <div class="overlay" :class="{open:pageModal}">
    <div class="modal">
      <div class="modal-title" x-text="'Page — ' + (pageTarget?.title ?? '')"></div>
      <p style="font-size:13px;color:var(--text3);margin-bottom:18px;">index.html 파일을 업로드하면 서비스 페이지에 적용됩니다. 문의하기 버튼은 자동으로 추가됩니다.</p>

      <!-- Drop Zone -->
      <div class="drop-zone"
        @click="$refs.fileInput.click()"
        @dragover.prevent="dragOver=true"
        @dragleave="dragOver=false"
        @drop.prevent="onDrop($event)"
        :class="{'drag-over':dragOver}">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p><strong>클릭하거나 파일을 드래그</strong>하세요</p>
        <p style="font-size:12px;margin-top:4px;">index.html</p>
      </div>
      <input type="file" accept=".html" x-ref="fileInput" style="display:none" @change="onFileSelect($event)"/>

      <template x-if="pageFile">
        <div class="file-selected">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span x-text="pageFile.name"></span>
        </div>
      </template>

      <template x-if="pageTarget">
        <a :href="'/services/'+pageTarget.id" target="_blank" class="preview-link">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          현재 페이지 미리보기
        </a>
      </template>

      <div class="modal-btns">
        <button class="btn btn-ghost" @click="pageModal=false;pageFile=null">Cancel</button>
        <button class="btn btn-primary" @click="uploadPage()" :disabled="!pageFile" x-text="uploading?'Uploading...':'Upload'"></button>
      </div>
    </div>
  </div>

  <script>
    function servicesApp(){return{
      services:${JSON.stringify(services)},
      modal:false,editTarget:null,saving:false,form:{},
      pageModal:false,pageTarget:null,pageFile:null,uploading:false,dragOver:false,

      openCreate(){this.editTarget=null;this.form={title:'',category:'webdev',description:'',thumb_type:'upload',thumb_url:'',thumb_origin:'',sort_order:0};this.modal=true;},
      openEdit(s){this.editTarget=s;this.form={...s};this.modal=true;},
      openPage(s){this.pageTarget=s;this.pageFile=null;this.pageModal=true;},

      onFileSelect(e){this.pageFile=e.target.files[0]||null;},
      onDrop(e){this.dragOver=false;const f=e.dataTransfer.files[0];if(f&&f.name.endsWith('.html'))this.pageFile=f;else alert('HTML 파일만 업로드 가능합니다.');},

      async uploadPage(){
        if(!this.pageFile||!this.pageTarget)return
        this.uploading=true
        const html=await this.pageFile.text()
        const res=await fetch(\`/admin/services/\${this.pageTarget.id}/page\`,{
          method:'POST',credentials:'include',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({html_content:html})
        })
        if(res.ok){alert('페이지가 업로드되었습니다!');this.pageModal=false;this.pageFile=null;}
        else{alert('업로드 실패. 다시 시도해주세요.');}
        this.uploading=false
      },

      async submitForm(){
        if(!this.form.title)return alert('제목을 입력해주세요.')
        this.saving=true
        const url=this.editTarget?\`/admin/services/\${this.editTarget.id}\`:'/admin/services'
        const method=this.editTarget?'PUT':'POST'
        const res=await fetch(url,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(this.form)})
        if(res.ok){this.modal=false;location.reload()}else{alert('오류가 발생했습니다.')}
        this.saving=false
      },
      async toggleActive(s){
        await fetch(\`/admin/services/\${s.id}/toggle\`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_active:s.is_active?0:1})})
        s.is_active=s.is_active?0:1
      },
      async deleteService(id){
        if(!confirm('정말 삭제하시겠습니까?'))return
        await fetch(\`/admin/services/\${id}\`,{method:'DELETE',credentials:'include'})
        this.services=this.services.filter(s=>s.id!==id)
      }
    }}
  </script>
</body>
</html>`)
})

export default app
