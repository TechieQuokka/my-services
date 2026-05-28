/**
 * htmlParser.ts
 * v1.3.40 — fixBodyOverflow 추가: body에 overflow-y:clip 자동 주입
 *           position:absolute 요소가 컨테이너 밖으로 나가
 *           html scrollHeight를 늘려 하단 빈 여백이 생기는 문제 방지
 * v1.3.39 — fixVh 추가: vh 단위를 dvh로 치환하여 서비스 상세 페이지의 여백 버그 수정
 *           applyPrefix 중복 실행 제거, scopeStyles 재귀 시 stripCssComments 스킵
 */

export function makePrefix(serviceId: number): string {
  const hex = (serviceId * 2654435761 >>> 0).toString(16).padStart(8, '0')
  return `svc_${hex}_`
}

function scopeSelector(selector: string, SCOPE: string): string {
  return selector
    .split(',')
    .map(s => {
      const t = s.trim()
      if (!t) return t
      if (/^(body|html|:root)$/.test(t)) return SCOPE
      if (t === '*') return `${SCOPE} *`
      if (t.startsWith(SCOPE)) return t
      return `${SCOPE} ${t}`
    })
    .join(', ')
}

function fixOverflowX(css: string): string {
  return css.replace(/overflow-x:\s*hidden/g, 'overflow-x: clip')
}

// vh → dvh 치환: min-height, height, max-height 등 모든 vh 단위
// dvh는 브라우저 실제 가용 높이(주소창/탭바 제외) 기준이라
// header/footer가 있는 레이아웃에서 여백 버그를 방지함
function fixVh(css: string): string {
  return css.replace(/(\d*\.?\d+)vh/g, '$1dvh')
}

// body에 overflow-y: clip 자동 주입
// position:absolute/fixed 요소가 .service-detail-wrap 밖으로 삐져나가
// html scrollHeight를 늘려 하단에 빈 여백이 생기는 문제를 방지
// - body { ... } 블록이 있으면 overflow-y 가 없을 때만 추가
// - body 블록 자체가 없으면 끝에 body { overflow-y: clip } 주입
function fixBodyOverflow(css: string): string {
  const hasBodyBlock = /\bbody\s*\{/.test(css)

  if (hasBodyBlock) {
    return css.replace(/(\bbody\s*\{)([^}]*)(})/g, (_, open, inner, close) => {
      if (/overflow-y/.test(inner)) return _ // 이미 있으면 그대로
      return `${open}${inner}overflow-y: clip;\n${close}`
    })
  }

  // body 블록 없으면 끝에 주입
  return css + '\nbody { overflow-y: clip; }'
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

// stripped: 이미 주석 제거된 상태로 재귀 진입 시 true → stripCssComments 스킵
function scopeStyles(css: string, stripped = false): string {
  if (!stripped) {
    css = stripCssComments(css)
    css = fixOverflowX(css)
    css = fixVh(css)
    css = fixBodyOverflow(css)
  }

  const SCOPE = '.service-detail-wrap'
  let result = ''
  let i = 0

  while (i < css.length) {
    const remaining = css.slice(i)

    // @keyframes, @font-face — 내부 건드리지 않고 통째로 통과
    const atRawMatch = remaining.match(/^(@(?:keyframes|font-face)[^{]*\{)/)
    if (atRawMatch) {
      let depth = 1
      let j = i + atRawMatch[1].length
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++
        else if (css[j] === '}') depth--
        j++
      }
      result += css.slice(i, j)
      i = j
      continue
    }

    // @media, @supports, @layer — 헤더 그대로, 내부 재귀 스코프 (stripped=true 전달)
    const atBlockMatch = remaining.match(/^(@(?:media|supports|layer)[^{]*\{)/)
    if (atBlockMatch) {
      const atHeader = atBlockMatch[1]
      result += atHeader
      i += atHeader.length
      let depth = 1
      let j = i
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++
        else if (css[j] === '}') depth--
        j++
      }
      result += scopeStyles(css.slice(i, j - 1), true)
      result += '}'
      i = j
      continue
    }

    // 일반 셀렉터 { ... }
    const blockMatch = remaining.match(/^([^{}@]+)\{/)
    if (blockMatch) {
      const selector = blockMatch[1].trim()
      if (selector) result += scopeSelector(selector, SCOPE)
      i += blockMatch[1].length
      continue
    }

    result += css[i]
    i++
  }

  return result
}

function extractHead(html: string): string {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  if (!headMatch) return ''
  const headContent = headMatch[1]
  const lines: string[] = []
  let m: RegExpExecArray | null

  const linkRe = /<link\b[^>]*>/gi
  while ((m = linkRe.exec(headContent)) !== null) lines.push(m[0])

  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi
  while ((m = styleRe.exec(headContent)) !== null) {
    lines.push(`<style>${scopeStyles(m[1])}</style>`)
  }

  const scriptSrcRe = /<script\b[^>]*\bsrc\s*=[^>]*><\/script>/gi
  while ((m = scriptSrcRe.exec(headContent)) !== null) lines.push(m[0])

  return lines.join('\n')
}

function extractBody(html: string): { bodyContent: string; scripts: string[] } {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (!bodyMatch) return { bodyContent: '', scripts: [] }
  let bodyContent = bodyMatch[1]
  const scripts: string[] = []
  const scriptRe = /<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi
  bodyContent = bodyContent.replace(scriptRe, (_, inner) => {
    scripts.push(inner)
    return ''
  })
  bodyContent = bodyContent.replace(/<footer[\s\S]*?<\/footer>/gi, '')
  bodyContent = bodyContent.replace(/\n{3,}/g, '\n\n').trim()
  return { bodyContent, scripts }
}

// 함수명/변수명 추출 헬퍼 (중복 제거)
function extractNames(code: string): Set<string> {
  const names = new Set<string>()
  let m: RegExpExecArray | null
  const funcRe = /\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g
  const varRe = /^\s*(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm
  while ((m = funcRe.exec(code)) !== null) names.add(m[1])
  while ((m = varRe.exec(code)) !== null) names.add(m[1])
  return names
}

function applyPrefix(scripts: string[], prefix: string): { code: string; names: Set<string> } {
  if (!scripts.length) return { code: '', names: new Set() }
  const combined = scripts.join('\n\n')
  const names = extractNames(combined)
  if (!names.size) return { code: combined, names }
  let result = combined
  for (const name of names) {
    result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), `${prefix}${name}`)
  }
  return { code: result, names }
}

function applyPrefixToHtml(html: string, prefix: string, names: Set<string>): string {
  if (!names.size) return html
  return html.replace(/(\bon\w+\s*=\s*["'])([^"']*)(["'])/g, (_, open, code, close) => {
    let replaced = code
    for (const name of names) {
      replaced = replaced.replace(new RegExp(`\\b${name}\\b`, 'g'), `${prefix}${name}`)
    }
    return open + replaced + close
  })
}

export interface ParsedPage {
  head_content: string
  body_content: string
  script_content: string
}

export function parseServiceHtml(html: string, serviceId: number): ParsedPage {
  const prefix = makePrefix(serviceId)
  const head_content = extractHead(html)
  const { bodyContent, scripts } = extractBody(html)

  // applyPrefix 한 번만 실행 — names 재사용
  const { code: script_content, names } = applyPrefix(scripts, prefix)
  const body_content = applyPrefixToHtml(bodyContent, prefix, names)

  return { head_content, body_content, script_content }
}
