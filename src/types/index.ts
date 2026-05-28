export const APP_VERSION = 'v1.3.40'

export interface InquiryMessage {
  id: number
  inquiry_id: number
  sender_role: 'admin' | 'user'
  sender_ip?: string | null
  sender_token?: string | null
  content: string
  created_at: string
}

export interface Service {
  id: number
  title: string
  category: 'webdev' | 'ai'
  description: string | null
  thumb_type: 'upload' | 'url'
  thumb_url: string | null
  thumb_origin: string | null
  is_active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ServicePage {
  id: number
  service_id: number
  head_content: string | null
  body_content: string | null
  script_content: string | null
  version: number
  updated_at: string
}

export interface Visitor {
  id: number
  session_id: string
  visited_at: string
  page_url: string | null
  service_id: number | null
  public_ip: string | null
  local_ip: string | null
  referrer: string | null
  device_type: string | null
  os: string | null
  browser: string | null
  screen: string | null
  dpr: number | null
  touch_pts: number | null
  cpu_cores: number | null
  ram_gb: number | null
  language: string | null
  timezone: string | null
  user_agent: string | null
  bot_score: number | null
  bot_verdict: string | null
  flag_webdriver: number
  flag_headless: number
  flag_no_plugins: number
  flag_no_langs: number
  flag_no_chrome: number
  flag_in_iframe: number
  visit_count: number
  expires_at: string
}

export interface Inquiry {
  id: number
  service_id: number | null
  visitor_id: number | null
  name: string
  contact: string
  password: string | null
  content: string
  owner_token?: string | null
  owner_ip?: string | null
  is_read: number
  read_at: string | null
  status: 'pending' | 'resolved'
  created_at: string
}

export interface ApiKey {
  id: number
  service: string
  key_enc: string
  iv: string
  created_at: string
  updated_at: string
}

export interface Notice {
  id: number
  title: string
  content: string
  is_fixed: number
  created_at: string
  updated_at: string
}

export interface Env {
  my_services_db: D1Database
  RATE_LIMIT_KV: KVNamespace
  MASTER_KEY: string
  ADMIN_PASSWORD: string
  IMAGEKIT_PRIVATE_KEY: string
  IMAGEKIT_PUBLIC_KEY: string
  IMAGEKIT_URL_ENDPOINT: string
}
