-- Migration: v1.3.15 → v1.3.16
-- service_pages: html_content → head_content / body_content / script_content

-- 기존 테이블 백업
ALTER TABLE service_pages RENAME TO service_pages_backup;

-- 새 테이블 생성
CREATE TABLE service_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER UNIQUE NOT NULL,
  head_content TEXT,
  body_content TEXT,
  script_content TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 백업 테이블 제거 (기존 데이터 재업로드 필요)
DROP TABLE service_pages_backup;
