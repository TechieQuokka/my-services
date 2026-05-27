import { html, raw } from 'hono/html'
import { styles } from './styles'
import { APP_VERSION } from '../../types'

export const Layout = (content: any) => html`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Adam Software — 웹개발 & AI 자동화</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Mona+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>${raw(styles)}</style>
</head>
<body>
  <div id="notice-bar-container"></div>
  <header>
    <div class="header-inner">
      <a href="/" class="logo" onclick="showPage('home');return false;">
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
      <div class="nav">
        <button class="nav-btn active" data-page="home" onclick="showPage('home')">Home</button>
        <button class="nav-btn" data-page="services" onclick="showPage('services')">Services</button>
        <button class="nav-btn" data-page="track" onclick="showPage('track')">문의확인</button>
        <button class="nav-cta" onclick="showPage('contact')">문의하기</button>
      </div>
    </div>
  </header>

  <div class="page-wrap">
    ${content}
  </div>

  <div id="detail-modal-overlay" class="modal-overlay">
    <div class="detail-modal" id="detail-modal">
      <!-- Content Injected via JS -->
    </div>
  </div>

  <footer>
    <div class="footer-inner">
      <span class="footer-brand">Adam Software <small style="opacity:.5;font-weight:400;margin-left:8px;">${APP_VERSION}</small></span>
      <span class="footer-copy">© 2026 · Built on Cloudflare Workers</span>
    </div>
  </footer>

  <script src="/front/js/app.js"></script>
</body>
</html>`
