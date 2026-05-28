import { Hono } from 'hono'
import { adminLayout, pageHeader } from '../../../views/admin/layout'
import { decrypt } from '../../../lib/crypto'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results: raw } = await c.env.my_services_db.prepare(`
    SELECT i.*, s.title as service_title FROM inquiries i
    LEFT JOIN services s ON i.service_id=s.id
    ORDER BY i.created_at DESC LIMIT 100
  `).all<any>()

  const inquiries = await Promise.all(raw.map(async (i: any) => {
    try {
      const { enc, iv } = JSON.parse(i.content)
      i.content = await decrypt(enc, iv, c.env.MASTER_KEY)
    } catch { i.content = '(복호화 실패)' }

    try {
      const { enc, iv } = JSON.parse(i.contact)
      i.contact_dec = await decrypt(enc, iv, c.env.MASTER_KEY)
    } catch { i.contact_dec = '(복호화 실패)' }

    // ✅ 어드민 UI에 해시 비밀번호 노출 불필요 — 제거
    delete i.password

    return i
  }))

  const body = `
    ${pageHeader('Inquiries')}

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:44px;">No</th>
            <th style="width:84px;">Date</th>
            <th style="width:110px;">Service</th>
            <th>Message</th>
            <th style="width:76px;">Status</th>
            <th style="width:110px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="(i, idx) in inquiries" :key="i.id">
            <tr :style="!i.is_read ? 'background:rgba(245,237,192,.18)' : ''" style="cursor:pointer;" @click="openDetail(i)">
              <td style="color:var(--text3);font-size:12px;text-align:center;" x-text="inquiries.length - idx"></td>
              <td style="color:var(--text3);font-size:12px;" x-text="i.created_at.slice(5,10)"></td>
              <td style="font-size:12px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:110px;" x-text="i.service_title ?? '—'"></td>
              <td style="max-width:0;"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:var(--text2);" x-text="i.content.length > 60 ? i.content.slice(0,60) + '…' : i.content"></div></td>
              <td><span class="badge" :class="i.status==='resolved'?'badge-resolved':'badge-pending'" x-text="i.status==='resolved'?'Done':'Pending'"></span></td>
              <td>
                <div style="display:flex;gap:6px;" @click.stop>
                  <button class="btn btn-ghost btn-sm" @click="openDetail(i)">관리</button>
                  <button class="btn btn-danger btn-sm" @click="deleteInquiry(i.id)">Del</button>
                </div>
              </td>
            </tr>
          </template>
          <template x-if="inquiries.length===0">
            <tr><td colspan="6" class="empty">문의 없음</td></tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div class="overlay" :class="{open:modal}">
      <div class="modal" style="max-width:640px;max-height:90vh;display:flex;flex-direction:column;" x-show="selected">

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div class="modal-title" style="margin-bottom:0;" x-text="'#' + (selected ? inquiries.length - inquiries.indexOf(selected) : '') + ' — ' + (selected?.service_title ?? '—')"></div>
          <span style="font-size:12px;color:var(--text3);" x-text="selected?.created_at?.slice(0,16).replace('T',' ')"></span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;">
            <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Name</div>
            <div style="font-size:13px;font-weight:500;" x-text="selected?.name"></div>
          </div>
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;">
            <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">IP Address</div>
            <div style="font-size:12px;font-family:monospace;color:var(--text2);" x-text="selected?.owner_ip ?? '—'"></div>
          </div>
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;">
            <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Contact</div>
            <div style="font-size:12px;font-family:monospace;word-break:break-all;" x-text="selected?.contact_dec"></div>
          </div>
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;">
            <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Password</div>
            <!-- ✅ 해시 비밀번호 노출 제거 — 어드민에게 불필요 -->
            <div style="font-size:12px;font-family:monospace;color:var(--text3);">••••••••</div>
          </div>
        </div>

        <div style="padding:14px 16px;background:var(--bg);border-radius:10px;border:1px solid var(--border);font-size:14px;line-height:1.7;margin-bottom:14px;white-space:pre-wrap;color:var(--text2);" x-text="selected?.content"></div>

        <!-- 고객 문의 페이지 직접 접근 — 비밀번호 없이는 열 수 없으므로 버튼 제거 -->

        <!-- 대화 스레드 -->
        <div style="flex:1;overflow-y:auto;margin-bottom:16px;" id="admin-thread-wrap">
          <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;border-bottom:1px solid var(--bg2);padding-bottom:8px;">Messages & Replies</div>
          <template x-for="m in messages" :key="m.id">
            <div style="padding:10px 0;border-bottom:1px solid var(--bg2);">
              <div style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:4px;">
                <span style="font-weight:700;padding:1px 6px;border-radius:3px;" :style="m.sender_role==='admin'?'background:var(--text);color:var(--surface)':'background:var(--bg3);color:var(--text2)'" x-text="m.sender_role.toUpperCase()"></span>
                <span style="color:var(--text3);" x-text="m.created_at.slice(5,16).replace('T',' ')"></span>
                <span x-show="m.sender_role!=='admin' && m.sender_ip"
                  style="font-family:monospace;font-size:10px;padding:1px 5px;border-radius:3px;"
                  :style="m.sender_ip !== selected.owner_ip ? 'color:var(--red);background:var(--red-bg);' : 'color:var(--text3);'"
                  x-text="m.sender_ip"></span>
              </div>
              <div style="font-size:13px;color:var(--text2);line-height:1.5;" x-text="m.content"></div>
            </div>
          </template>
          <template x-if="messages.length===0">
            <p style="font-size:12px;color:var(--text3);padding:10px 0;">아직 댓글이 없습니다.</p>
          </template>
        </div>

        <!-- 어드민 댓글 입력 -->
        <div style="display:flex;gap:8px;padding-top:14px;border-top:1px solid var(--bg2);">
          <input type="text" x-model="reply" placeholder="댓글을 입력하세요..." @keyup.enter="sendReply()"
            style="flex:1;background:var(--bg);border:1px solid var(--border);padding:10px 14px;border-radius:8px;font-family:inherit;font-size:13px;outline:none;color:var(--text);"/>
          <button class="btn btn-success" @click="sendReply()">등록</button>
        </div>

        <div class="modal-btns">
          <button class="btn btn-ghost" @click="modal=false">Close</button>
          <button class="btn btn-success" @click="resolve()">Resolved ✓</button>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script>
      document.body.setAttribute('x-data', 'inquiriesApp()')
      function inquiriesApp(){return{
        inquiries:${JSON.stringify(inquiries)},
        modal:false,selected:null,messages:[],reply:'',

        async openDetail(i){
          this.selected=i;this.modal=true;this.reply='';
          if(!i.is_read){
            await fetch(\`/admin/inquiries/\${i.id}/read\`,{method:'PATCH',credentials:'include'});
            i.is_read=1;
          }
          this.loadMessages();
        },
        async loadMessages(){
          const res=await fetch(\`/admin/inquiries/\${this.selected.id}/messages\`,{credentials:'include'})
          this.messages=await res.json();
          this.$nextTick(()=>{
            const wrap=document.getElementById('admin-thread-wrap');
            if(wrap)wrap.scrollTop=wrap.scrollHeight;
          });
        },

        // ✅ /admin/inquiries/:id/messages → sender_role 서버에서 'admin' 강제
        async sendReply(){
          if(!this.reply.trim())return;
          const res=await fetch(\`/admin/inquiries/\${this.selected.id}/messages\`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            credentials:'include',
            body:JSON.stringify({content:this.reply})
          })
          if(res.ok){this.reply='';this.loadMessages();}
          else{alert('댓글 등록에 실패했습니다.');}
        },

        async resolve(){
          await fetch(\`/admin/inquiries/\${this.selected.id}/status\`,{
            method:'PATCH',credentials:'include',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({status:'resolved'})
          })
          this.selected.status='resolved';
        },

        async deleteInquiry(id){
          if(!confirm('문의를 영구 삭제하시겠습니까? 관련 대화도 모두 삭제됩니다.'))return
          await fetch(\`/admin/inquiries/\${id}\`,{method:'DELETE',credentials:'include'})
          this.inquiries=this.inquiries.filter(i=>i.id!==id);
          this.modal=false;
        },
      }}
    </script>
  `

  return c.html(adminLayout('inquiries', 'Inquiries', body))
})

export default app
