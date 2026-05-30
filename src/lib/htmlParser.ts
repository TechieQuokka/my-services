/**
 * htmlParser.ts
 * v1.3.46 — extractNames varRe 제거: let/const/var 변수명을 prefix 대상에서 제외,
 *           함수 선언만 전역 노출되므로 함수명만 prefix 적용
 * v1.3.43 — applyPrefix 문자열 리터럴 보호:
 *           따옴표/백틱 안의 문자열을 플레이스홀더로 치환 후
 *           prefix 적용, 복원하여 클래스명 등 오염 방지
 * v1.3.42 — fixBodyOverflow 세미콜론 누락 버그 수정
 * v1.3.41 — fixVh: 100vh → calc(100dvh - 64px)
 * v1.3.40 — fixBodyOverflow 추가
 * v1.3.39 — fixVh 추가, applyPrefix 중복 실행 제거
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

function fixVh(css: string): string {
  return css.replace(/(\d*\.?\d+)vh/g, (_, n) => {
    const val = parseFloat(n)
    if (val === 100) return 'calc(100dvh - 64px)'
    return `${n}dvh`
  })
}

function fixBodyOverflow(css: string): string {
  const hasBodyBlock = /\bbody\s*\{/.test(css)
  if (hasBodyBlock) {
    return css.replace(/(\bbody\s*\{)([^}]*)(})/g, (_, open, inner, close) => {
      if (/overflow-y/.test(inner)) return _
      const trimmed = inner.trimEnd()
      const separator = trimmed.endsWith(';') ? '' : ';'
      return `${open}${inner}${separator}overflow-y: clip;\n${close}`
    })
  }
  return css + '\nbody { overflow-y: clip; }'
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

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

function extractNames(code: string): Set<string> {
  const names = new Set<string>()
  let m: RegExpExecArray | null
  const funcRe = /\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g
  while ((m = funcRe.exec(code)) !== null) names.add(m[1])
  return names
}

function applyPrefix(scripts: string[], prefix: string): { code: string; names: Set<string> } {
  if (!scripts.length) return { code: '', names: new Set() }
  const combined = scripts.join('\n\n')
  const names = extractNames(combined)
  if (!names.size) return { code: combined, names }

  const literals: string[] = []
  const placeholder = '\x00STR\x00'
  const withPlaceholders = combined.replace(
    /(`[\s\S]*?`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
    (match) => {
      literals.push(match)
      return `${placeholder}${literals.length - 1}${placeholder}`
    }
  )

  let result = withPlaceholders
  for (const name of names) {
    result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), `${prefix}${name}`)
  }

  result = result.replace(
    new RegExp(`${placeholder}(\\d+)${placeholder}`, 'g'),
    (_, idx) => literals[Number(idx)]
  )

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

  const { code: script_content, names } = applyPrefix(scripts, prefix)
  const body_content = applyPrefixToHtml(bodyContent, prefix, names)

  return { head_content, body_content, script_content }
}
