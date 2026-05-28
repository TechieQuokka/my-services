import { Hono } from 'hono'
import { adminAuth } from './middleware/auth'
import frontIndex from './routes/front/index'
import frontServices from './routes/front/services'
import apiVisit from './routes/api/visit'
import apiInquiries from './routes/api/inquiries'
import apiNotices from './routes/api/notices'
import adminLogin from './routes/admin/login'
import adminIndex from './routes/admin/index'
import adminServices from './routes/admin/services'
import adminInquiries from './routes/admin/inquiries'
import adminVisitors from './routes/admin/visitors'
import adminStats from './routes/admin/stats'
import manageServices from './routes/admin/manage/services'
import manageNotices from './routes/admin/manage/notices'
import manageInquiries from './routes/admin/manage/inquiries'
import manageVisitors from './routes/admin/manage/visitors'
import manageStats from './routes/admin/manage/stats'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

app.route('/', frontIndex)
app.route('/services', frontServices)

app.route('/api/visit', apiVisit)
app.route('/api/inquiries', apiInquiries)
app.route('/api/notices', apiNotices)

// 어드민 인증 미들웨어 (login 페이지는 auth.ts 내부에서 통과)
app.use('/admin/*', adminAuth)
app.route('/admin/login', adminLogin)
app.route('/admin/logout', adminLogin)
app.route('/admin', adminIndex)
app.route('/admin/services', adminServices)
app.route('/admin/inquiries', adminInquiries)
app.route('/admin/visitors', adminVisitors)
app.route('/admin/stats', adminStats)
app.route('/admin/manage/services', manageServices)
app.route('/admin/manage/notices', manageNotices)
app.route('/admin/manage/inquiries', manageInquiries)
app.route('/admin/manage/visitors', manageVisitors)
app.route('/admin/manage/stats', manageStats)

const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env, ctx) => {
  await env.my_services_db.prepare(`DELETE FROM visitors WHERE expires_at < datetime('now')`).run()
}

export default { fetch: app.fetch, scheduled }
