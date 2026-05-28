/**
 * visitTracker.ts
 * 홈(app.js)과 서비스 상세(layout.ts)에서 공유하는 visit 추적 스크립트 생성기
 * v1.3.35 — getBrowser() fallback 'ua.slice(0,30)' → 'Unknown' 수정
 */

export function buildVisitScript(serviceId: number | null): string {
  return `
(function () {
  const SERVICE_ID = ${serviceId === null ? 'null' : serviceId}
  const ua = navigator.userAgent
  function getOS() {
    if (/Windows NT 10/.test(ua)) return 'Windows 10/11'
    const mac = ua.match(/Mac OS X ([\d_]+)/); if (mac) return 'macOS ' + mac[1].replace(/_/g, '.')
    const and = ua.match(/Android ([\d.]+)/); if (and) return 'Android ' + and[1]
    const ios = ua.match(/iPhone OS ([\d_]+)/); if (ios) return 'iOS ' + ios[1].replace(/_/g, '.')
    return /Linux/.test(ua) ? 'Linux' : 'Unknown'
  }
  function getBrowser() {
    for (const [r, n] of [[/Edg\\/([\d.]+)/, 'Edge'], [/Chrome\\/([\d.]+)/, 'Chrome'], [/Firefox\\/([\d.]+)/, 'Firefox'], [/Version\\/([\d.]+).*Safari/, 'Safari']]) {
      const m = ua.match(r); if (m) return n + ' ' + m[1]
    }
    return 'Unknown'
  }
  function getType() {
    if (/iPad/.test(ua)) return 'Tablet'
    if (/iPhone/.test(ua)) return 'iPhone'
    if (/Android.*Mobile/.test(ua)) return 'Android Phone'
    return /Mobi/.test(ua) ? 'Mobile' : 'Desktop'
  }
  const isMobile = /Mobi|Android|iPhone|iPad/.test(ua)
  const s1 = !!navigator.webdriver
  const s2 = !!['HeadlessChrome', 'PhantomJS'].find(x => ua.includes(x))
  const s3 = ![...(navigator.plugins || [])].length && !isMobile
  const s4 = !navigator.languages?.length
  const s5 = /Chrome/.test(ua) && typeof window.chrome === 'undefined'
  const s6 = window.self !== window.top
  const botScore = Math.min(100, [s1*40, s2*50, s3*20, s4*15, s5*30, s6*10].reduce((a, b) => a + b))

  const today = new Date().toISOString().slice(0, 10)
  const sessionKey = 'session_' + today
  let sessionId = localStorage.getItem(sessionKey)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(sessionKey, sessionId)
    Object.keys(localStorage)
      .filter(k => k.startsWith('session_') && k !== sessionKey)
      .forEach(k => localStorage.removeItem(k))
  }

  fetch('/api/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      visited_at: new Date().toISOString(),
      page_url: location.href,
      service_id: SERVICE_ID,
      local_ip: null,
      referrer: document.referrer || null,
      device_type: getType(),
      os: getOS(),
      browser: getBrowser(),
      screen: screen.width + 'x' + screen.height,
      dpr: devicePixelRatio,
      touch_pts: navigator.maxTouchPoints,
      cpu_cores: navigator.hardwareConcurrency || null,
      ram_gb: navigator.deviceMemory || null,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      user_agent: ua,
      bot_score: botScore,
      bot_verdict: botScore >= 60 ? 'BOT' : botScore >= 25 ? 'SUSPECT' : 'HUMAN',
      flag_webdriver: s1 ? 1 : 0,
      flag_headless: s2 ? 1 : 0,
      flag_no_plugins: s3 ? 1 : 0,
      flag_no_langs: s4 ? 1 : 0,
      flag_no_chrome: s5 ? 1 : 0,
      flag_in_iframe: s6 ? 1 : 0,
    })
  })
})()
`.trim()
}
