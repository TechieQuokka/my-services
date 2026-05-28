import { Hono } from 'hono'
import { db } from '../../../lib/db'
import { adminLayout, pageHeader } from '../../../views/admin/layout'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results: notices } = await db.notices.list(c.env, 50)

  const body = `
    ${pageHeader('Notices', true, '<button class="btn btn-primary" @click="openCreate()">+ New Notice</button>')}

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
              <td><span x-show="n.is_fixed" style="background:var(--green-bg);color:var(--green);font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;">FIXED</span></td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn btn-ghost btn-sm" @click="openEdit(n)">Edit</button>
                  <button class="btn btn-danger btn-sm" @click="deleteNotice(n.id)">Del</button>
                </div>
              </td>
            </tr>
          </template>
          <template x-if="notices.length===0">
            <tr><td colspan="4" class="empty">공지사항 없음</td></tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="overlay" :class="{open:modal}">
      <div class="modal" style="max-width:600px;">
        <div class="modal-title" x-text="editTarget?'Edit Notice':'New Notice'"></div>
        <div class="field"><label>Title</label><input type="text" x-model="form.title"/></div>
        <div class="field"><label>Content</label><textarea x-model="form.content" style="height:200px;"></textarea></div>
        <div class="field" style="display:flex;align-items:center;gap:10px;">
          <input type="checkbox" id="is_fixed" x-model="form.is_fixed" style="width:auto;"/>
          <label for="is_fixed" style="margin-bottom:0;text-transform:none;font-size:13px;">상단 고정</label>
        </div>
        <div class="modal-btns">
          <button class="btn btn-ghost" @click="modal=false">Cancel</button>
          <button class="btn btn-primary" @click="submitForm()">Save</button>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script>
      document.body.setAttribute('x-data', 'noticeApp()')
      function noticeApp(){return{
        notices:${JSON.stringify(notices)},
        modal:false,editTarget:null,form:{},
        openCreate(){this.editTarget=null;this.form={title:'',content:'',is_fixed:false};this.modal=true;},
        openEdit(n){this.editTarget=n;this.form={...n,is_fixed:!!n.is_fixed};this.modal=true;},
        async submitForm(){
          const url=this.editTarget?'/api/notices/'+this.editTarget.id:'/api/notices'
          const method=this.editTarget?'PUT':'POST'
          await fetch(url,{
            method,
            credentials:'include',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({...this.form,is_fixed:this.form.is_fixed?1:0})
          })
          location.reload()
        },
        async deleteNotice(id){
          if(!confirm('삭제하시겠습니까?'))return
          await fetch('/api/notices/'+id,{
            method:'DELETE',
            credentials:'include'
          })
          this.notices=this.notices.filter(n=>n.id!==id)
        }
      }}
    </script>
  `

  return c.html(adminLayout('notices', 'Notices', body))
})

export default app
