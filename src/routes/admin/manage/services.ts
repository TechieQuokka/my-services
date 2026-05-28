import { Hono } from 'hono'
import { adminLayout, pageHeader } from '../../../views/admin/layout'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results: services } = await c.env.my_services_db
    .prepare('SELECT * FROM services ORDER BY sort_order ASC')
    .all<any>()

  const body = `
    ${pageHeader('Services', true, '<button class="btn btn-primary" @click="openCreate()">+ New Service</button>')}

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Category</th><th>Status</th><th>Order</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <template x-if="services.length===0">
            <tr><td colspan="5" class="empty">서비스 없음</td></tr>
          </template>
          <template x-for="s in services" :key="s.id">
            <tr>
              <td style="font-weight:500;" x-text="s.title"></td>
              <td><span class="badge" :class="'badge-'+s.category" x-text="s.category==='webdev'?'Web Dev':'AI'"></span></td>
              <td><span class="badge" :class="s.is_active?'badge-on':'badge-off'" x-text="s.is_active?'Active':'Off'"></span></td>
              <td style="color:var(--text3);" x-text="s.sort_order"></td>
              <td>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
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

    <!-- ── Service Edit / Create Modal ───────────────────────────── -->
    <div class="overlay" :class="{open:modal}">
      <div class="modal" style="max-width:560px;">
        <div class="modal-title" x-text="editTarget?'Edit Service':'New Service'"></div>

        <div class="field"><label>Title</label><input type="text" x-model="form.title" placeholder="서비스 제목"/></div>
        <div class="field">
          <label>Category</label>
          <select x-model="form.category">
            <option value="webdev">Web Dev</option>
            <option value="ai">AI</option>
          </select>
        </div>
        <div class="field"><label>Description</label><textarea x-model="form.description" placeholder="서비스 설명"></textarea></div>
        <div class="field"><label>Sort Order</label><input type="number" x-model="form.sort_order" placeholder="0"/></div>

        <!-- 썸네일 업로드 (Edit 시에만) -->
        <template x-if="editTarget">
          <div>
            <div style="height:1px;background:var(--bg2);margin:18px 0;"></div>
            <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;">Thumbnail Image</div>

            <template x-if="thumbPreview">
              <div style="margin-bottom:12px;position:relative;display:inline-block;">
                <img :src="thumbPreview" style="width:160px;height:120px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:block;"/>
                <button @click="thumbPreview=null;thumbFile=null"
                  style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:var(--red);color:white;border:none;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;padding:0;">✕</button>
              </div>
            </template>

            <div class="drop-zone"
              @click="$refs.thumbInput.click()"
              @dragover.prevent="thumbDrag=true"
              @dragleave="thumbDrag=false"
              @drop.prevent="onThumbDrop($event)"
              :class="{'drag-over':thumbDrag}">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p style="margin-top:8px;"><strong>클릭하거나 드래그</strong>해서 이미지 선택</p>
              <p style="font-size:11px;margin-top:2px;color:var(--text3);">JPG · PNG · WEBP · GIF</p>
            </div>
            <input type="file" accept="image/*" x-ref="thumbInput" style="display:none" @change="onThumbSelect($event)"/>

            <template x-if="thumbFile">
              <div style="margin-top:8px;padding:8px 12px;background:var(--green-bg);border:1px solid rgba(42,111,58,.2);border-radius:6px;font-size:12px;color:var(--green);display:flex;align-items:center;gap:6px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span x-text="thumbFile.name + ' (' + (thumbFile.size/1024).toFixed(0) + ' KB)'"></span>
              </div>
            </template>
            <template x-if="thumbUploading">
              <div style="margin-top:8px;padding:8px 12px;background:var(--yellow-bg);border:1px solid rgba(122,98,0,.15);border-radius:6px;font-size:12px;color:var(--yellow);">
                ⏳ 업로드 중...
              </div>
            </template>
            <template x-if="thumbError">
              <div style="margin-top:8px;padding:8px 12px;background:var(--red-bg);border:1px solid rgba(154,42,42,.2);border-radius:6px;font-size:12px;color:var(--red);" x-text="thumbError"></div>
            </template>
          </div>
        </template>

        <div class="modal-btns">
          <button class="btn btn-ghost" @click="closeModal()">Cancel</button>
          <button class="btn btn-primary" @click="submitForm()" x-text="saving?'Saving...':'Save'"></button>
        </div>
      </div>
    </div>

    <!-- ── Page Upload Modal ──────────────────────────────────────── -->
    <div class="overlay" :class="{open:pageModal}">
      <div class="modal">
        <div class="modal-title" x-text="'Page — ' + (pageTarget?.title ?? '')"></div>
        <p style="font-size:13px;color:var(--text3);margin-bottom:18px;">index.html 파일을 업로드하면 서비스 페이지에 적용됩니다. 문의하기 버튼은 자동으로 추가됩니다.</p>
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
          <div style="margin-top:12px;padding:10px 14px;background:var(--green-bg);border:1px solid rgba(42,111,58,.2);border-radius:8px;font-size:13px;color:var(--green);display:flex;align-items:center;gap:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span x-text="pageFile.name"></span>
          </div>
        </template>
        <template x-if="pageTarget">
          <a :href="'/services/'+pageTarget.id" target="_blank" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--text3);text-decoration:none;margin-top:8px;">
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

    <style>
      .drop-zone{border:2px dashed var(--border2);border-radius:10px;padding:28px 20px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s;background:var(--bg);}
      .drop-zone:hover,.drop-zone.drag-over{border-color:var(--text);background:var(--surface2);}
      .drop-zone svg{display:block;margin:0 auto 8px;}
      .drop-zone p{font-size:13px;color:var(--text3);}
      .drop-zone strong{color:var(--text2);}
    </style>

    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script>
      document.body.setAttribute('x-data', 'servicesApp()')
      function servicesApp(){return{
        services: ${JSON.stringify(services)},
        modal: false, editTarget: null, saving: false, form: {},

        thumbFile: null, thumbPreview: null, thumbDrag: false,
        thumbUploading: false, thumbError: null,

        pageModal: false, pageTarget: null, pageFile: null,
        uploading: false, dragOver: false,

        openCreate() {
          this.editTarget = null
          this.form = { title:'', category:'webdev', description:'', sort_order:0 }
          this.thumbFile = null; this.thumbPreview = null; this.thumbError = null
          this.modal = true
        },
        openEdit(s) {
          this.editTarget = s
          this.form = { title:s.title, category:s.category, description:s.description??'', sort_order:s.sort_order }
          this.thumbFile = null; this.thumbPreview = null; this.thumbError = null
          this.modal = true
        },
        closeModal() {
          this.modal = false
          this.thumbFile = null; this.thumbPreview = null; this.thumbError = null
        },

        compressThumb(file) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = ev => {
              const img = new Image()
              img.onload = () => {
                const MAX_W = 800, MAX_H = 600
                let w = img.width, h = img.height
                if (w > MAX_W || h > MAX_H) {
                  const ratio = Math.min(MAX_W / w, MAX_H / h)
                  w = Math.round(w * ratio); h = Math.round(h * ratio)
                }
                const canvas = document.createElement('canvas')
                canvas.width = w; canvas.height = h
                canvas.getContext('2d').drawImage(img, 0, 0, w, h)
                canvas.toBlob(blob => {
                  if (!blob) { reject(new Error('압축 실패')); return }
                  const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
                  resolve({ file: compressed, preview: canvas.toDataURL('image/jpeg', 0.82) })
                }, 'image/jpeg', 0.82)
              }
              img.onerror = () => reject(new Error('이미지 로드 실패'))
              img.src = ev.target.result
            }
            reader.readAsDataURL(file)
          })
        },
        async onThumbSelect(e) {
          const f = e.target.files[0]
          if (!f) return
          this.thumbError = null
          try {
            const { file, preview } = await this.compressThumb(f)
            this.thumbFile = file; this.thumbPreview = preview
          } catch(err) { this.thumbError = err.message }
        },
        async onThumbDrop(e) {
          this.thumbDrag = false
          const f = e.dataTransfer.files[0]
          if (!f) return
          if (!f.type.startsWith('image/')) { this.thumbError = '이미지 파일만 업로드 가능합니다.'; return }
          this.thumbError = null
          try {
            const { file, preview } = await this.compressThumb(f)
            this.thumbFile = file; this.thumbPreview = preview
          } catch(err) { this.thumbError = err.message }
        },

        async uploadThumb(serviceId) {
          if (!this.thumbFile) return true
          this.thumbUploading = true; this.thumbError = null
          const fd = new FormData()
          fd.append('file', this.thumbFile)
          try {
            const res = await fetch(\`/admin/services/\${serviceId}/thumb\`, {
              method: 'POST', credentials: 'include', body: fd
            })
            const data = await res.json()
            if (!res.ok || !data.ok) {
              this.thumbError = data.error || '업로드 실패. 다시 시도해주세요.'
              return false
            }
            return true
          } catch(e) {
            this.thumbError = '네트워크 오류가 발생했습니다.'
            return false
          } finally {
            this.thumbUploading = false
          }
        },

        async submitForm() {
          if (!this.form.title) return alert('제목을 입력해주세요.')
          this.saving = true
          const url = this.editTarget ? \`/admin/services/\${this.editTarget.id}\` : '/admin/services'
          const method = this.editTarget ? 'PUT' : 'POST'
          const res = await fetch(url, {
            method, credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.form)
          })
          if (!res.ok) { alert('오류가 발생했습니다.'); this.saving = false; return }
          if (this.editTarget && this.thumbFile) {
            const ok = await this.uploadThumb(this.editTarget.id)
            if (!ok) { this.saving = false; return }
          }
          this.saving = false
          this.closeModal()
          location.reload()
        },

        async toggleActive(s) {
          await fetch(\`/admin/services/\${s.id}/toggle\`, {
            method:'PATCH', credentials:'include',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ is_active: s.is_active ? 0 : 1 })
          })
          s.is_active = s.is_active ? 0 : 1
        },

        async deleteService(id) {
          if (!confirm('정말 삭제하시겠습니까?')) return
          await fetch(\`/admin/services/\${id}\`, { method:'DELETE', credentials:'include' })
          this.services = this.services.filter(s => s.id !== id)
        },

        openPage(s) { this.pageTarget = s; this.pageFile = null; this.pageModal = true },
        onFileSelect(e) { this.pageFile = e.target.files[0] || null },
        onDrop(e) {
          this.dragOver = false
          const f = e.dataTransfer.files[0]
          if (f && f.name.endsWith('.html')) this.pageFile = f
          else alert('HTML 파일만 업로드 가능합니다.')
        },
        async uploadPage() {
          if (!this.pageFile || !this.pageTarget) return
          this.uploading = true
          const html = await this.pageFile.text()
          const res = await fetch(\`/admin/services/\${this.pageTarget.id}/page\`, {
            method:'POST', credentials:'include',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ html_content: html })
          })
          if (res.ok) { alert('페이지가 업로드되었습니다!'); this.pageModal = false; this.pageFile = null }
          else { alert('업로드 실패. 다시 시도해주세요.') }
          this.uploading = false
        },
      }}
    </script>
  `

  return c.html(adminLayout('services', 'Services', body))
})

export default app
