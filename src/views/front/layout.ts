import { html, raw } from 'hono/html'
import { styles } from './styles'
import { APP_VERSION } from '../../types'
import { buildVisitScript } from '../../lib/visitTracker'
export interface LayoutOptions {
  serviceMode?: boolean
  serviceId?: number
  serviceTitle?: string
  headContent?: string
  scriptContent?: string
}
const ServiceNav = () => `
  <div class="nav">
    <a class="nav-btn" href="/">Home</a>
    <a class="nav-btn" href="/#services">Services</a>
    <a class="nav-btn" href="/#track">문의확인</a>
    <a class="nav-cta" href="/#contact">문의하기</a>
  </div>
`
const HomeNav = () => `
  <div class="nav">
    <button class="nav-btn active" data-page="home" onclick="showPage('home')">Home</button>
    <button class="nav-btn" data-page="services" onclick="showPage('services')">Services</button>
    <button class="nav-btn" data-page="track" onclick="showPage('track')">문의확인</button>
    <button class="nav-cta" onclick="showPage('contact')">문의하기</button>
  </div>
`
export const Layout = (content: any, options: LayoutOptions = {}) => {
  const { serviceMode = false, serviceId, serviceTitle, headContent = '', scriptContent = '' } = options
  const title = serviceMode && serviceTitle
    ? `${serviceTitle} — Adam Software`
    : 'Adam Software — 웹개발 & AI 자동화'
  return html`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Mona+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>${raw(styles)}</style>
  ${serviceMode && headContent ? raw(headContent) : ''}
</head>
<body ${raw(serviceMode ? 'class="service-mode"' : '')}>
  ${!serviceMode ? raw('<div id="notice-bar-container"></div>') : ''}
  <header>
    <div class="header-inner">
      <a href="/" class="logo">
        <div class="logo-mark">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white"/>
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/>
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".6"/>
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".3"/>
          </svg>
        </div>
        <div>
          <span class="logo-name">Adam Software</span>
          <span class="logo-sub">/ Web & AI</span>
        </div>
      </a>
      ${raw(serviceMode ? ServiceNav() : HomeNav())}
    </div>
  </header>
  <div class="page-wrap">
    ${serviceMode
      ? raw(`<div class="service-detail-wrap">${content}</div>`)
      : content
    }
  </div>
  ${!serviceMode ? html`
  <div id="detail-modal-overlay" class="modal-overlay">
    <div class="detail-modal" id="detail-modal"></div>
  </div>` : ''}
  <footer>
    <div class="footer-inner">
      <span class="footer-brand">Adam Software <small style="opacity:.5;font-weight:400;margin-left:8px;">${APP_VERSION}</small></span>
      <span class="footer-copy">© 2026 · Built on Cloudflare Workers</span>
    </div>
  </footer>
  <script src="/front/js/app.js"></script>
  ${serviceMode && scriptContent ? raw(`<script>${scriptContent}</script>`) : ''}
  ${raw(`<script>${buildVisitScript(serviceMode && serviceId ? serviceId : null)}</script>`)}
</body>
</html>`
}
