import type { Env } from '../types'
/**
 * KV 기반 Rate Limiter
 * key     : 구분 식별자 (예: `rl:login:1.2.3.4`)
 * max     : ttlSec 내 최대 허용 횟수
 * ttlSec  : 카운터 유지 시간 (초)
 * 반환값  : { limited: true } 면 차단, { limited: false, count } 면 통과
 *
 * v1.3.48 — expirationTtl을 매 put마다 명시:
 *           TTL 미지정 시 Cloudflare KV가 영구 키로 덮어써서
 *           rate limit이 영구히 풀리지 않는 버그 수정
 */
export async function rateLimit(
  env: Env,
  key: string,
  max: number,
  ttlSec: number
): Promise<{ limited: boolean; count: number }> {
  try {
    const raw = await env.RATE_LIMIT_KV.get(key)
    const count = raw ? Number(raw) : 0
    if (count >= max) return { limited: true, count }
    await env.RATE_LIMIT_KV.put(key, String(count + 1), {
      expirationTtl: ttlSec  // 항상 TTL 명시 (미지정 시 영구 키로 덮어씀)
    })
    return { limited: false, count: count + 1 }
  } catch {
    // KV 오류 시 통과 (서비스 중단 방지)
    return { limited: false, count: 0 }
  }
}
