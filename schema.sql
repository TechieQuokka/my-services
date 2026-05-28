-- my-services schema
-- v1.3.16 (synced to production DB)

CREATE TABLE IF NOT EXISTS services (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'webdev',
  description  TEXT,
  thumb_type   TEXT NOT NULL DEFAULT 'upload',
  thumb_url    TEXT,
  thumb_origin TEXT,
  is_active    INTEGER DEFAULT 1,
  sort_order   INTEGER DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_pages (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id     INTEGER UNIQUE NOT NULL,
  head_content   TEXT,
  body_content   TEXT,
  script_content TEXT,
  version        INTEGER NOT NULL DEFAULT 1,
  updated_at     TEXT NOT NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS visitors (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id       TEXT NOT NULL,
  visited_at       TEXT NOT NULL,
  page_url         TEXT,
  service_id       INTEGER REFERENCES services(id),
  public_ip        TEXT,
  local_ip         TEXT,
  referrer         TEXT,
  device_type      TEXT,
  os               TEXT,
  browser          TEXT,
  screen           TEXT,
  dpr              REAL,
  touch_pts        INTEGER,
  cpu_cores        INTEGER,
  ram_gb           REAL,
  language         TEXT,
  timezone         TEXT,
  user_agent       TEXT,
  bot_score        INTEGER,
  bot_verdict      TEXT,
  flag_webdriver   INTEGER DEFAULT 0,
  flag_headless    INTEGER DEFAULT 0,
  flag_no_plugins  INTEGER DEFAULT 0,
  flag_no_langs    INTEGER DEFAULT 0,
  flag_no_chrome   INTEGER DEFAULT 0,
  flag_in_iframe   INTEGER DEFAULT 0,
  expires_at       TEXT NOT NULL,
  visit_count      INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id  INTEGER REFERENCES services(id),
  visitor_id  INTEGER REFERENCES visitors(id),
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_read     INTEGER DEFAULT 0,
  read_at     TEXT,
  status      TEXT DEFAULT 'pending',
  created_at  TEXT NOT NULL,
  password    TEXT,
  owner_token TEXT,
  owner_ip    TEXT
);

CREATE TABLE IF NOT EXISTS inquiry_messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id   INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_role  TEXT NOT NULL,
  content      TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  sender_ip    TEXT,
  sender_token TEXT
);

CREATE TABLE IF NOT EXISTS notices (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  is_fixed   INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  service    TEXT NOT NULL,
  key_enc    TEXT NOT NULL,
  iv         TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
