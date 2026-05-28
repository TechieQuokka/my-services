-- ============================================================
-- Migration: local DB → v1.3.12 (운영 DB 동기화)
-- ============================================================

-- 1. inquiries 테이블 누락 컬럼 추가
ALTER TABLE inquiries ADD COLUMN password TEXT;
ALTER TABLE inquiries ADD COLUMN owner_token TEXT;
ALTER TABLE inquiries ADD COLUMN owner_ip TEXT;

-- 2. visitors 테이블 누락 컬럼 추가
ALTER TABLE visitors ADD COLUMN visit_count INTEGER DEFAULT 1;

-- 3. notices 테이블 생성
CREATE TABLE IF NOT EXISTS notices (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_fixed    INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- 4. inquiry_messages 테이블 생성
CREATE TABLE IF NOT EXISTS inquiry_messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id   INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_role  TEXT NOT NULL,
  content      TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  sender_ip    TEXT,
  sender_token TEXT
);

-- 5. 인덱스
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry ON inquiry_messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_notices_fixed            ON notices(is_fixed);
