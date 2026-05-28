import type { Env, Service, ServicePage, ServiceImage, Visitor, Inquiry, Notice, InquiryMessage } from '../types'

const now = () => new Date().toISOString()
const expires = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

// ─── Services ───────────────────────────────────────────
export const db = {
  services: {
    list: (env: Env) =>
      env.my_services_db.prepare('SELECT * FROM services ORDER BY sort_order ASC').all<Service>(),

    active: (env: Env) =>
      env.my_services_db.prepare('SELECT * FROM services WHERE is_active=1 ORDER BY sort_order ASC').all<Service>(),

    get: (env: Env, id: number) =>
      env.my_services_db.prepare('SELECT * FROM services WHERE id=?').bind(id).first<Service>(),

    create: (env: Env, data: Omit<Service, 'id' | 'created_at' | 'updated_at'>) =>
      env.my_services_db.prepare(
        `INSERT INTO services (title,category,description,thumb_type,thumb_url,thumb_origin,is_active,sort_order,created_at,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`
      ).bind(data.title, data.category, data.description, data.thumb_type, data.thumb_url, data.thumb_origin, data.is_active, data.sort_order, now(), now()).run(),

    update: (env: Env, id: number, data: Partial<Service>) =>
      env.my_services_db.prepare(
        `UPDATE services SET title=?,category=?,description=?,thumb_type=?,thumb_url=?,thumb_origin=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`
      ).bind(data.title, data.category, data.description, data.thumb_type, data.thumb_url, data.thumb_origin, data.is_active, data.sort_order, now(), id).run(),

    toggle: (env: Env, id: number, is_active: number) =>
      env.my_services_db.prepare('UPDATE services SET is_active=?,updated_at=? WHERE id=?').bind(is_active, now(), id).run(),

    delete: (env: Env, id: number) =>
      env.my_services_db.prepare('DELETE FROM services WHERE id=?').bind(id).run(),
  },

  // ─── Service Pages ───────────────────────────────────
  pages: {
    get: (env: Env, service_id: number) =>
      env.my_services_db.prepare('SELECT * FROM service_pages WHERE service_id=?').bind(service_id).first<ServicePage>(),

    upsert: (env: Env, service_id: number, html_content: string) =>
      env.my_services_db.prepare(
        `INSERT INTO service_pages (service_id,html_content,version,updated_at) VALUES (?,?,1,?)
         ON CONFLICT(service_id) DO UPDATE SET html_content=excluded.html_content, version=version+1, updated_at=excluded.updated_at`
      ).bind(service_id, html_content, now()).run(),
  },

  // ─── Service Images ──────────────────────────────────
  images: {
    list: (env: Env, service_id: number) =>
      env.my_services_db.prepare('SELECT * FROM service_images WHERE service_id=? ORDER BY sort_order ASC').bind(service_id).all<ServiceImage>(),

    create: (env: Env, service_id: number, image_url: string, sort_order: number) =>
      env.my_services_db.prepare('INSERT INTO service_images (service_id,image_url,sort_order,created_at) VALUES (?,?,?,?)').bind(service_id, image_url, sort_order, now()).run(),

    delete: (env: Env, id: number) =>
      env.my_services_db.prepare('DELETE FROM service_images WHERE id=?').bind(id).run(),
  },

  // ─── Visitors ────────────────────────────────────────
  visitors: {
    create: (env: Env, data: Omit<Visitor, 'id' | 'expires_at'>) =>
      env.my_services_db.prepare(
        `INSERT INTO visitors (session_id,visited_at,page_url,service_id,public_ip,local_ip,referrer,device_type,os,browser,screen,dpr,touch_pts,cpu_cores,ram_gb,language,timezone,user_agent,bot_score,bot_verdict,flag_webdriver,flag_headless,flag_no_plugins,flag_no_langs,flag_no_chrome,flag_in_iframe,expires_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        data.session_id, data.visited_at, data.page_url, data.service_id,
        data.public_ip, data.local_ip, data.referrer, data.device_type,
        data.os, data.browser, data.screen, data.dpr, data.touch_pts,
        data.cpu_cores, data.ram_gb, data.language, data.timezone,
        data.user_agent, data.bot_score, data.bot_verdict,
        data.flag_webdriver, data.flag_headless, data.flag_no_plugins,
        data.flag_no_langs, data.flag_no_chrome, data.flag_in_iframe,
        expires()
      ).run(),

    list: (env: Env, limit = 100, offset = 0) =>
      env.my_services_db.prepare('SELECT * FROM visitors ORDER BY visited_at DESC LIMIT ? OFFSET ?').bind(limit, offset).all<Visitor>(),

    stats: (env: Env) =>
      env.my_services_db.prepare(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN date(visited_at)=date('now') THEN 1 END) as today,
          COUNT(CASE WHEN bot_verdict='BOT' THEN 1 END) as bots,
          COUNT(CASE WHEN device_type='Desktop' THEN 1 END) as desktop,
          COUNT(CASE WHEN device_type='Mobile' OR device_type='Android Phone' OR device_type='iPhone' THEN 1 END) as mobile
        FROM visitors
      `).first(),

    cleanup: (env: Env) =>
      env.my_services_db.prepare(`DELETE FROM visitors WHERE expires_at < datetime('now')`).run(),
  },

  // ─── Inquiries ───────────────────────────────────────
  inquiries: {
    list: (env: Env, limit = 50, offset = 0) =>
      env.my_services_db.prepare(
        `SELECT i.*, s.title as service_title FROM inquiries i
         LEFT JOIN services s ON i.service_id=s.id
         ORDER BY i.created_at DESC LIMIT ? OFFSET ?`
      ).bind(limit, offset).all<Inquiry & { service_title: string }>(),

    get: (env: Env, id: number) =>
      env.my_services_db.prepare(
        `SELECT i.*, s.title as service_title FROM inquiries i
         LEFT JOIN services s ON i.service_id=s.id WHERE i.id=?`
      ).bind(id).first<Inquiry & { service_title: string }>(),

    unread: (env: Env) =>
      env.my_services_db.prepare('SELECT COUNT(*) as count FROM inquiries WHERE is_read=0').first<{ count: number }>(),

    count: (env: Env) =>
      env.my_services_db.prepare('SELECT COUNT(*) as count FROM inquiries').first<{ count: number }>(),

    create: (env: Env, data: { service_id: number; visitor_id: number | null; name: string; contact: string; password: string | null; content: string; owner_token?: string; owner_ip?: string }) =>
      env.my_services_db.prepare(
        'INSERT INTO inquiries (service_id,visitor_id,name,contact,password,content,owner_token,owner_ip,created_at) VALUES (?,?,?,?,?,?,?,?,?)'
      ).bind(data.service_id, data.visitor_id, data.name, data.contact, data.password, data.content, data.owner_token ?? null, data.owner_ip ?? null, now()).run(),

    delete: (env: Env, id: number) =>
      env.my_services_db.prepare('DELETE FROM inquiries WHERE id=?').bind(id).run(),

    markRead: (env: Env, id: number) =>
      env.my_services_db.prepare(`UPDATE inquiries SET is_read=1, read_at=datetime('now') WHERE id=?`).bind(id).run(),

    updateStatus: (env: Env, id: number, status: string) =>
      env.my_services_db.prepare('UPDATE inquiries SET status=? WHERE id=?').bind(status, id).run(),

    purgeOldest: (env: Env, n: number) =>
      env.my_services_db.prepare(
        'DELETE FROM inquiries WHERE id IN (SELECT id FROM inquiries ORDER BY created_at ASC LIMIT ?)'
      ).bind(n).run(),

    // ─── Inquiry Messages ───
    getMessages: (env: Env, inquiry_id: number) =>
      env.my_services_db.prepare('SELECT * FROM inquiry_messages WHERE inquiry_id=? ORDER BY created_at ASC').bind(inquiry_id).all<InquiryMessage>(),

    createMessage: (env: Env, data: { inquiry_id: number; sender_role: string; content: string; sender_ip?: string; sender_token?: string }) =>
      env.my_services_db.prepare(
        'INSERT INTO inquiry_messages (inquiry_id,sender_role,content,sender_ip,sender_token,created_at) VALUES (?,?,?,?,?,?)'
      ).bind(data.inquiry_id, data.sender_role, data.content, data.sender_ip ?? null, data.sender_token ?? null, now()).run(),
  },

  // ─── Notices ──────────────────────────────────────────
  notices: {
    list: (env: Env, limit = 10) =>
      env.my_services_db.prepare('SELECT * FROM notices ORDER BY is_fixed DESC, created_at DESC LIMIT ?').bind(limit).all<Notice>(),

    get: (env: Env, id: number) =>
      env.my_services_db.prepare('SELECT * FROM notices WHERE id=?').bind(id).first<Notice>(),

    create: (env: Env, data: { title: string; content: string; is_fixed: number }) =>
      env.my_services_db.prepare(
        'INSERT INTO notices (title,content,is_fixed,created_at,updated_at) VALUES (?,?,?,?,?)'
      ).bind(data.title, data.content, data.is_fixed, now(), now()).run(),

    update: (env: Env, id: number, data: Partial<Notice>) =>
      env.my_services_db.prepare(
        'UPDATE notices SET title=?,content=?,is_fixed=?,updated_at=? WHERE id=?'
      ).bind(data.title, data.content, data.is_fixed, now(), id).run(),

    delete: (env: Env, id: number) =>
      env.my_services_db.prepare('DELETE FROM notices WHERE id=?').bind(id).run(),
  },
}
