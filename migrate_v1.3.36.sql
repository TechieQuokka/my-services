-- Migration: v1.3.35 → v1.3.36
-- service_images 테이블 제거 (ImageKit thumb_url/thumb_origin으로 완전 대체됨)

DROP TABLE IF EXISTS service_images;
