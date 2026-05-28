import { Hono } from 'hono'
import { adminLayout, pageHeader } from '../../../views/admin/layout'
import type { Env } from '../../../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results: services } = await c.env.my_services_db
    .prepare('SELECT id, title FROM services ORDER BY sort_order ASC')
    .all<{ id: number; title: string }>()

  const serviceOptions = services.map(s =>
    `<option value="${s.id}">${s.title}</option>`
  ).join('')

  const body = `
    ${pageHeader('Visitors')}

    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center;">
      <select class="fsel" x-model="filter.bot">
        <option value="">All Verdicts</option>
        <option value="human">Human</option>
        <option value="suspect">Suspect</option>
        <option value="bot">Bot</option>
      </select>
      <select class="fsel" x-model="filter.service_id">
        <option value="">All Services</option>
        ${serviceOptions}
      </select>
      <input class="fsel" type="date" x-model="filter.date_from"/>
      <input class="fsel" type="date" x-model="filter.date_to"/>
      <button class="btn btn-primary" @click="load(0)">Filter</button>
      <button class="btn btn-ghost" @click="resetFilter()">Reset</button>
      <span style="margin-left:auto;font-size:13px;color:var(--text3);" x-text="visitors.length + ' rows'"></span>
    </div>

    <div class="table-wrap" style="overflow-x:auto;">
      <table style="min-width:900px;">
        <thead>
          <tr>
            <th>Date</th><th>IP</th><th>Verdict</th><th>Score</th>
            <th>Count</th>
            <th>Device</th><th>OS</th><th>Browser</th><th>Page</th>
            <th title="Webdriver">WD</th><th title="Headless">HL</th>
            <th title="No Plugins">PLG</th><th title="No Langs">LNG</th>
            <th title="No Chrome">CHR</th><th title="iFrame">IFR</th>
          </tr>
        </thead>
        <tbody>
          <template x-if="visitors.length===0&&!loading"><tr><td colspan="15" class="empty">방문자 없음</td></tr></template>
          <template x-if="loading"><tr><td colspan="15" class="empty" style="color:var(--text3);">로딩 중...</td></tr></template>
          <template x-for="v in visitors" :key="v.id">
            <tr>
              <td style="color:var(--text3);font-size:12px;" x-text="v.visited_at?.slice(0,16).replace('T',' ')"></td>
              <td style="font-size:12px;" x-text="v.public_ip??'—'"></td>
              <td><span class="badge" :class="'badge-'+(v.bot_verdict??'HUMAN')" x-text="v.bot_verdict??'—'"></span></td>
              <td style="color:var(--text3);font-size:12px;" x-text="v.bot_score??'—'"></td>
              <td>
                <span style="font-size:12px;font-weight:600;"
                  :style="(v.visit_count??1) > 1 ? 'color:var(--green);' : 'color:var(--text3);'"
                  x-text="v.visit_count ?? 1"></span>
              </td>
              <td style="font-size:12px;" x-text="v.device_type??'—'"></td>
              <td style="font-size:12px;" x-text="v.os??'—'"></td>
              <td style="font-size:12px;" x-text="v.browser??'—'"></td>
              <td style="color:var(--text3);max-width:140px;overflow:hidden;text-overflow:ellipsis;font-size:12px;" x-text="v.page_url?(v.page_url.length>20?v.page_url.slice(0,20)+'…':v.page_url):'—'"></td>
              <td style="font-size:12px;" :style="v.flag_webdriver?'color:var(--red)':'color:var(--bg3)'" x-text="v.flag_webdriver?'●':'○'"></td>
              <td style="font-size:12px;" :style="v.flag_headless?'color:var(--red)':'color:var(--bg3)'" x-text="v.flag_headless?'●':'○'"></td>
              <td style="font-size:12px;" :style="v.flag_no_plugins?'color:var(--red)':'color:var(--bg3)'" x-text="v.flag_no_plugins?'●':'○'"></td>
              <td style="font-size:12px;" :style="v.flag_no_langs?'color:var(--red)':'color:var(--bg3)'" x-text="v.flag_no_langs?'●':'○'"></td>
              <td style="font-size:12px;" :style="v.flag_no_chrome?'color:var(--red)':'color:var(--bg3)'" x-text="v.flag_no_chrome?'●':'○'"></td>
              <td style="font-size:12px;" :style="v.flag_in_iframe?'color:var(--red)':'color:var(--bg3)'" x-text="v.flag_in_iframe?'●':'○'"></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div style="display:flex;gap:8px;margin-top:14px;align-items:center;font-size:13px;color:var(--text3);">
      <button class="btn btn-ghost btn-sm" @click="load(offset-100)" :disabled="offset===0">← Prev</button>
      <span x-text="'Page '+(Math.floor(offset/100)+1)"></span>
      <button class="btn btn-ghost btn-sm" @click="load(offset+100)" :disabled="visitors.length<100">Next →</button>
    </div>

    <style>
      .fsel{background:var(--surface);border:1px solid var(--border);color:var(--text);padding:7px 12px;font-family:inherit;font-size:13px;border-radius:8px;outline:none;}
      .fsel:focus{border-color:var(--border2);}
    </style>

    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script>
      document.body.setAttribute('x-data', 'visitorsApp()')
      function visitorsApp(){return{
        visitors:[],offset:0,loading:false,
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
  `

  return c.html(adminLayout('visitors', 'Visitors', body))
})

export default app
