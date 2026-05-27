-- 서비스 목록
CREATE TABLE IF NOT EXISTS services (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  description   TEXT,
  thumb_type    TEXT NOT NULL DEFAULT 'upload',
  thumb_url     TEXT,
  thumb_origin  TEXT,
  is_active     INTEGER DEFAULT 1,
  sort_order    INTEGER DEFAULT 0,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- 서비스 광고 페이지 (index.html)
CREATE TABLE IF NOT EXISTS service_pages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id    INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  html_content  TEXT NOT NULL,
  version       INTEGER DEFAULT 1,
  updated_at    TEXT NOT NULL,
  UNIQUE(service_id)
);

-- 서비스 포트폴리오 이미지
CREATE TABLE IF NOT EXISTS service_images (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id    INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  sort_order    INTEGER DEFAULT 0,
  created_at    TEXT NOT NULL
);

-- 방문자 로그
CREATE TABLE IF NOT EXISTS visitors (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT NOT NULL,
  visited_at      TEXT NOT NULL,
  page_url        TEXT,
  service_id      INTEGER REFERENCES services(id),
  public_ip       TEXT,
  local_ip        TEXT,
  referrer        TEXT,
  device_type     TEXT,
  os              TEXT,
  browser         TEXT,
  screen          TEXT,
  dpr             REAL,
  touch_pts       INTEGER,
  cpu_cores       INTEGER,
  ram_gb          REAL,
  language        TEXT,
  timezone        TEXT,
  user_agent      TEXT,
  bot_score       INTEGER,
  bot_verdict     TEXT,
  flag_webdriver  INTEGER DEFAULT 0,
  flag_headless   INTEGER DEFAULT 0,
  flag_no_plugins INTEGER DEFAULT 0,
  flag_no_langs   INTEGER DEFAULT 0,
  flag_no_chrome  INTEGER DEFAULT 0,
  flag_in_iframe  INTEGER DEFAULT 0,
  expires_at      TEXT NOT NULL
);

-- 문의 내역
CREATE TABLE IF NOT EXISTS inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id  INTEGER NOT NULL REFERENCES services(id),
  visitor_id  INTEGER REFERENCES visitors(id),
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,
  password    TEXT,
  content     TEXT NOT NULL,
  is_read     INTEGER DEFAULT 0,
  read_at     TEXT,
  status      TEXT DEFAULT 'pending',
  created_at  TEXT NOT NULL
);

-- API 키 (암호화 저장)
CREATE TABLE IF NOT EXISTS api_keys (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  service     TEXT NOT NULL,
  key_enc     TEXT NOT NULL,
  iv          TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- 공지사항
CREATE TABLE IF NOT EXISTS notices (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_fixed    INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- 문의 상세 대화 (v1.2.0)
CREATE TABLE IF NOT EXISTS inquiry_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id  INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL, -- 'admin' or 'user'
  content     TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry ON inquiry_messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_notices_fixed      ON notices(is_fixed);
CREATE INDEX IF NOT EXISTS idx_services_category  ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active    ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_visitors_expires   ON visitors(expires_at);
CREATE INDEX IF NOT EXISTS idx_visitors_service   ON visitors(service_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_service  ON inquiries(service_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_is_read  ON inquiries(is_read);
