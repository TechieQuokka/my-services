import type { Env } from '../types'

/**
 * KV 기반 Rate Limiter
 * key     : 구분 식별자 (예: `rl:login:1.2.3.4`)
 * max     : ttlSec 내 최대 허용 횟수
 * ttlSec  : 카운터 유지 시간 (초)
 * 반환값  : { limited: true } 면 차단, { limited: false, count } 면 통과
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

    // 첫 요청이면 TTL 설정, 이후엔 TTL 유지하며 카운트만 증가
    await env.RATE_LIMIT_KV.put(key, String(count + 1), {
      expirationTtl: ttlSec,
    })
    return { limited: false, count: count + 1 }
  } catch {
    // KV 오류 시 통과 (서비스 중단 방지)
    return { limited: false, count: 0 }
  }
}
