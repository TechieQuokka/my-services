export const styles = `
  :root {
    --bg:#f4f3ef;
    --bg2:#eae9e3;
    --bg3:#ddddd6;
    --surface:#faf9f6;
    --border:#d4d4cc;
    --text:#1a1a17;
    --text2:#52524b;
    --text3:#8f8f86;
    --green:#1e6e30;
    --green-bg:#cce8d4;
    --purple:#3d2a96;
    --purple-bg:#d8d4f0;
    --shadow:0 1px 4px rgba(0,0,0,.06);
    --shadow-md:0 4px 16px rgba(0,0,0,.08);
  }
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;overflow-y:scroll;}
  body{
    background:var(--bg);
    color:var(--text);
    font-family:'Mona Sans',-apple-system,sans-serif;
    font-size:16px;
    line-height:1.6;
    display:flex;flex-direction:column;min-height:100vh;
  }

  /* HEADER — 공통 */
  body > header{
    position:sticky;top:0;z-index:100;
    background:rgba(244,243,239,.94);
    backdrop-filter:blur(16px);
    border-bottom:1px solid var(--border);
  }
  .header-inner{
    max-width:1120px;margin:0 auto;padding:0 40px;
    height:64px;display:flex;align-items:center;justify-content:space-between;
  }
  .logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;}
  .logo-mark{width:32px;height:32px;background:var(--text);border-radius:7px;display:flex;align-items:center;justify-content:center;}
  .logo-mark svg{display:block;}
  .logo-name{font-size:15px;font-weight:700;letter-spacing:-0.3px;color:var(--text);}
  .logo-sub{font-size:11px;color:var(--text3);font-weight:400;margin-left:2px;}
  .nav{display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none;}
  .nav::-webkit-scrollbar{display:none;}
  .nav-btn{padding:7px 12px;font-family:inherit;font-size:13px;font-weight:500;color:var(--text3);background:none;border:none;cursor:pointer;border-radius:7px;transition:color .15s,background .15s;white-space:nowrap;text-decoration:none;display:inline-flex;align-items:center;}
  .nav-btn:hover{color:var(--text);background:var(--bg2);}
  .nav-btn.active{color:var(--text);background:var(--surface);box-shadow:var(--shadow);}
  .nav-cta{margin-left:4px;padding:8px 16px;font-family:inherit;font-size:13px;font-weight:600;background:var(--text);color:var(--surface);border:none;border-radius:7px;cursor:pointer;transition:opacity .15s;white-space:nowrap;text-decoration:none;display:inline-flex;align-items:center;}
  .nav-cta:hover{opacity:.82;}

  /* FOOTER — 공통 */
  body > footer{border-top:1px solid var(--border);background:var(--bg2);}
  .footer-inner{max-width:1120px;margin:0 auto;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;}
  .footer-brand{font-size:14px;font-weight:600;color:var(--text2);}
  .footer-copy{font-size:13px;color:var(--text3);}

  /* 서비스 상세 래퍼 — 공통 */
  .service-detail-wrap *,.service-detail-wrap *::before,.service-detail-wrap *::after{box-sizing:border-box;}
  .service-detail-wrap{
    position:relative;
    isolation:isolate;
    overflow-x:clip;
  }
  body:has(.service-detail-wrap){min-height:unset;background:transparent;display:block;}
  body:has(.service-detail-wrap) .page-wrap{flex:none;}

  /* ── 홈 페이지 전용 (서비스 상세에서 완전 격리) ── */
  body:not(.service-mode) .page-wrap{flex:1;}
  body:not(.service-mode) .page{display:none;}
  body:not(.service-mode) .page.active{display:block;}

  /* HOME HERO */
  body:not(.service-mode) .hero{
    max-width:1120px;margin:0 auto;
    padding:72px 40px 64px;
    display:grid;grid-template-columns:1fr 480px;gap:64px;align-items:start;
  }
  body:not(.service-mode) .hero-left{}
  body:not(.service-mode) .hero-label{
    font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;
    color:var(--text3);margin-bottom:20px;display:flex;align-items:center;gap:8px;
  }
  body:not(.service-mode) .hero-label::before{content:'';width:6px;height:6px;border-radius:50%;background:#52a852;flex-shrink:0;}
  body:not(.service-mode) .hero h1{
    font-family:'Instrument Serif',serif;
    font-size:52px;line-height:1.06;letter-spacing:-1.5px;
    margin-bottom:22px;
  }
  body:not(.service-mode) .hero h1 em{font-style:italic;color:var(--text3);}
  body:not(.service-mode) .hero-desc{font-size:17px;line-height:1.85;color:var(--text2);margin-bottom:20px;max-width:440px;}
  body:not(.service-mode) .hero-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px;}
  body:not(.service-mode) .htag{
    font-size:12px;font-weight:600;
    color:var(--text2);
    background:var(--surface);
    border:1px solid var(--border);
    padding:4px 12px;border-radius:20px;
    letter-spacing:0.2px;
  }
  body:not(.service-mode) .hero-btns{display:flex;gap:10px;}
  body:not(.service-mode) .btn-dark{padding:12px 26px;font-family:inherit;font-size:14px;font-weight:600;background:var(--text);color:var(--surface);border:none;border-radius:8px;cursor:pointer;transition:opacity .15s;}
  body:not(.service-mode) .btn-dark:hover{opacity:.82;}
  body:not(.service-mode) .btn-ghost{padding:12px 22px;font-family:inherit;font-size:14px;font-weight:500;background:none;color:var(--text2);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:all .15s;}
  body:not(.service-mode) .btn-ghost:hover{background:var(--bg2);color:var(--text);}
  body:not(.service-mode) .hero-right{display:flex;flex-direction:column;gap:14px;}
  body:not(.service-mode) .hero-img-wrap{
    border-radius:16px;overflow:hidden;
    border:1px solid var(--border);
    box-shadow:var(--shadow-md);
    aspect-ratio:4/3;
    width:100%;
  }
  body:not(.service-mode) .hero-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;}
  body:not(.service-mode) .hero-stats{
    display:flex;align-items:center;
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:12px;
    overflow:hidden;
  }
  body:not(.service-mode) .hstat{flex:1;padding:14px 0;text-align:center;}
  body:not(.service-mode) .hstat-num{font-family:'Instrument Serif',serif;font-size:24px;line-height:1;letter-spacing:-0.5px;margin-bottom:3px;font-style:italic;}
  body:not(.service-mode) .hstat-lbl{font-size:11px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}
  body:not(.service-mode) .hsep{width:1px;height:40px;background:var(--border);flex-shrink:0;}

  /* METRICS BAR */
  body:not(.service-mode) .metrics-wrap{
    max-width:1120px;margin:0 auto;
    padding:0 40px 68px;
  }
  body:not(.service-mode) .metrics-bar{
    display:grid;grid-template-columns:repeat(4,1fr);
    border:1px solid var(--border);border-radius:12px;
    background:var(--surface);overflow:hidden;
  }
  body:not(.service-mode) .mitem{padding:22px 24px;border-right:1px solid var(--border);}
  body:not(.service-mode) .mitem:last-child{border-right:none;}
  body:not(.service-mode) .mnum{font-size:22px;font-weight:700;letter-spacing:-0.3px;margin-bottom:4px;}
  body:not(.service-mode) .mlbl{font-size:13px;color:var(--text3);}

  /* ABOUT + FEATURES */
  body:not(.service-mode) .home-lower{background:var(--bg2);border-top:1px solid var(--border);}
  body:not(.service-mode) .home-lower-inner{
    max-width:1120px;margin:0 auto;
    padding:72px 40px;
    display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start;
  }
  body:not(.service-mode) .sec-eyebrow{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:10px;}
  body:not(.service-mode) .sec-heading{font-family:'Instrument Serif',serif;font-size:36px;letter-spacing:-0.8px;line-height:1.1;margin-bottom:18px;}
  body:not(.service-mode) .sec-heading em{font-style:italic;color:var(--text3);}
  body:not(.service-mode) .sec-desc{font-size:15px;color:var(--text2);line-height:1.85;margin-bottom:12px;}
  body:not(.service-mode) .feat-list{display:flex;flex-direction:column;gap:0;}
  body:not(.service-mode) .feat-item{padding:18px 0;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:16px;}
  body:not(.service-mode) .feat-item:first-child{border-top:1px solid var(--border);}
  body:not(.service-mode) .feat-num{font-family:'Instrument Serif',serif;font-size:18px;color:var(--text3);flex-shrink:0;width:24px;margin-top:1px;}
  body:not(.service-mode) .feat-title{font-size:14px;font-weight:600;margin-bottom:4px;}
  body:not(.service-mode) .feat-desc{font-size:13px;color:var(--text2);line-height:1.6;}

  /* SERVICES */
  body:not(.service-mode) .services-page{max-width:1120px;margin:0 auto;padding:52px 40px;flex:1;}
  body:not(.service-mode) .page-hd{margin-bottom:32px;}
  body:not(.service-mode) .page-ey{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:8px;}
  body:not(.service-mode) .page-tt{font-family:'Instrument Serif',serif;font-size:40px;letter-spacing:-0.8px;line-height:1.1;}
  body:not(.service-mode) .page-tt em{font-style:italic;color:var(--text3);}
  body:not(.service-mode) .filter-row{display:flex;gap:6px;margin-bottom:32px;}
  body:not(.service-mode) .ftab{padding:6px 16px;font-family:inherit;font-size:13px;font-weight:500;color:var(--text3);background:var(--surface);border:1px solid var(--border);border-radius:20px;cursor:pointer;transition:all .15s;}
  body:not(.service-mode) .ftab.active{background:var(--text);color:var(--surface);border-color:var(--text);}
  body:not(.service-mode) .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px 22px;}
  body:not(.service-mode) .svc-card{cursor:pointer;transition:transform .18s ease;}
  body:not(.service-mode) .svc-card:hover{transform:translateY(-2px);}
  body:not(.service-mode) .svc-thumb{width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:var(--bg3);margin-bottom:14px;border:1px solid var(--border);position:relative;}
  body:not(.service-mode) .svc-thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s ease;}
  body:not(.service-mode) .svc-card:hover .svc-thumb img{transform:scale(1.04);}
  body:not(.service-mode) .svc-thumb-empty{width:100%;height:100%;background:var(--bg2);display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:13px;font-weight:500;}
  body:not(.service-mode) .svc-tag{position:absolute;bottom:10px;left:10px;padding:3px 10px;border-radius:5px;font-size:11px;font-weight:600;}
  body:not(.service-mode) .tag-webdev{background:var(--green-bg);color:var(--green);}
  body:not(.service-mode) .tag-ai{background:var(--purple-bg);color:var(--purple);}
  body:not(.service-mode) .svc-title{font-size:15px;font-weight:600;line-height:1.4;margin-bottom:5px;letter-spacing:-0.1px;}
  body:not(.service-mode) .svc-desc{font-size:13px;color:var(--text3);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
  body:not(.service-mode) .empty-svc{grid-column:1/-1;text-align:center;padding:80px;color:var(--text3);}

  /* BOARD */
  body:not(.service-mode) .track-page{max-width:1120px;margin:0 auto;padding:52px 40px;}
  body:not(.service-mode) .board-table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:32px;}
  body:not(.service-mode) .board-table{width:100%;border-collapse:collapse;font-size:14px;}
  body:not(.service-mode) .board-table th{background:var(--bg2);padding:14px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border);}
  body:not(.service-mode) .board-table td{padding:16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s;}
  body:not(.service-mode) .board-table tr:hover td{background:rgba(0,0,0,.02);}
  body:not(.service-mode) .board-table tr:last-child td{border-bottom:none;}
  body:not(.service-mode) .col-no{width:50px;color:var(--text3);font-size:12px;}
  body:not(.service-mode) .row-notice td{background:rgba(232,232,227,.4);}
  body:not(.service-mode) .badge-notice{background:var(--text);color:var(--surface);font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;}
  body:not(.service-mode) .col-status{width:80px;}
  body:not(.service-mode) .col-service{width:120px;color:var(--text3);font-size:13px;}
  body:not(.service-mode) .col-content{font-weight:500;}
  body:not(.service-mode) .col-name{width:100px;color:var(--text3);}
  body:not(.service-mode) .col-date{width:100px;color:var(--text3);font-size:12px;text-align:right;}
  body:not(.service-mode) .status-badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:12px;}
  body:not(.service-mode) .status-pending{background:var(--bg3);color:var(--text3);}
  body:not(.service-mode) .status-resolved{background:var(--green-bg);color:var(--green);}
  body:not(.service-mode) .detail-view-wrap{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:40px;margin-top:20px;}
  body:not(.service-mode) .detail-view-hd{border-bottom:1px solid var(--border);padding-bottom:24px;margin-bottom:32px;}
  body:not(.service-mode) .detail-view-tt{font-family:'Instrument Serif',serif;font-size:32px;letter-spacing:-0.5px;margin-bottom:10px;}
  body:not(.service-mode) .detail-view-meta{display:flex;gap:20px;font-size:13px;color:var(--text3);}
  body:not(.service-mode) .thread-wrap{margin:40px 0;border-top:1px solid var(--border);padding-top:20px;}
  body:not(.service-mode) .comment-item{padding:20px 0;border-bottom:1px solid var(--bg2);position:relative;}
  body:not(.service-mode) .comment-item:last-child{border-bottom:none;}
  body:not(.service-mode) .cmt-hd{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
  body:not(.service-mode) .cmt-author{font-size:13px;font-weight:600;}
  body:not(.service-mode) .cmt-badge{font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700;}
  body:not(.service-mode) .badge-admin{background:var(--text);color:var(--surface);}
  body:not(.service-mode) .badge-user{background:var(--green);color:white;}
  body:not(.service-mode) .badge-guest{background:var(--bg3);color:var(--text2);}
  body:not(.service-mode) .cmt-date{font-size:11px;color:var(--text3);}
  body:not(.service-mode) .cmt-body{font-size:14px;line-height:1.7;color:var(--text2);white-space:pre-wrap;}
  body:not(.service-mode) .reply-form{margin-top:20px;background:var(--bg2);padding:24px;border-radius:12px;}
  body:not(.service-mode) .reply-form textarea{width:100%;height:80px;padding:12px;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:14px;margin-bottom:12px;}
  body:not(.service-mode) .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(6px);z-index:200;align-items:center;justify-content:center;}
  body:not(.service-mode) .modal-overlay.open{display:flex;}
  body:not(.service-mode) .detail-modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;width:90%;max-width:560px;padding:32px;box-shadow:var(--shadow-md);}
  body:not(.service-mode) .detail-hd{border-bottom:1px solid var(--border);padding-bottom:20px;margin-bottom:20px;}
  body:not(.service-mode) .detail-title{font-size:18px;font-weight:600;margin-bottom:6px;}
  body:not(.service-mode) .detail-meta{font-size:12px;color:var(--text3);display:flex;gap:12px;}
  body:not(.service-mode) .detail-body{font-size:15px;line-height:1.7;color:var(--text2);white-space:pre-wrap;margin-bottom:24px;}
  body:not(.service-mode) .auth-box{text-align:center;padding:20px 0;}
  body:not(.service-mode) .notice-bar{background:var(--text);color:var(--surface);padding:10px 40px;font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:12px;}
  body:not(.service-mode) .notice-tag{background:var(--green);color:white;font-size:10px;padding:2px 6px;border-radius:4px;text-transform:uppercase;}

  /* CONTACT */
  body:not(.service-mode) .contact-page{max-width:840px;margin:0 auto;padding:52px 40px;}
  body:not(.service-mode) .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;margin-top:40px;}
  body:not(.service-mode) .cform{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:26px;}
  body:not(.service-mode) .ff{margin-bottom:14px;}
  body:not(.service-mode) .ff label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text3);margin-bottom:5px;}
  body:not(.service-mode) .ff input,body:not(.service-mode) .ff textarea,body:not(.service-mode) .ff select{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:10px 13px;font-family:inherit;font-size:14px;border-radius:8px;outline:none;transition:border-color .15s;}
  body:not(.service-mode) .ff input:focus,body:not(.service-mode) .ff textarea:focus,body:not(.service-mode) .ff select:focus{border-color:var(--text3);}
  body:not(.service-mode) .ff textarea{height:96px;resize:none;}
  body:not(.service-mode) .fsub{width:100%;margin-top:4px;padding:11px;font-family:inherit;font-size:14px;font-weight:600;background:var(--text);color:var(--surface);border:none;border-radius:8px;cursor:pointer;transition:opacity .15s;}
  body:not(.service-mode) .fsub:hover{opacity:.82;}
  body:not(.service-mode) .fsub:disabled{opacity:.4;cursor:not-allowed;}

  /* RESPONSIVE */
  @media(max-width:900px){
    .header-inner{padding:0 16px;height:60px;}
    .logo-sub{display:none;}
    .nav{gap:2px;padding-right:10px;}
    .nav-btn{padding:6px 8px;font-size:12px;}
    .nav-cta{padding:7px 12px;font-size:12px;margin-left:2px;}

    body:not(.service-mode) .hero{grid-template-columns:1fr;padding:40px 20px 48px;gap:32px;}
    body:not(.service-mode) .hero h1{font-size:40px;}
    body:not(.service-mode) .hero-right{gap:12px;}
    body:not(.service-mode) .metrics-wrap{padding:32px 20px 52px;}
    body:not(.service-mode) .metrics-bar{grid-template-columns:1fr 1fr;}
    body:not(.service-mode) .mitem:nth-child(2){border-right:none;}
    body:not(.service-mode) .mitem:nth-child(3){border-top:1px solid var(--border);}
    body:not(.service-mode) .mitem:nth-child(4){border-top:1px solid var(--border);border-right:none;}
    body:not(.service-mode) .home-lower-inner{grid-template-columns:1fr;gap:40px;padding:48px 20px;}
    body:not(.service-mode) .svc-grid{grid-template-columns:repeat(2,1fr);}
    body:not(.service-mode) .services-page,body:not(.service-mode) .contact-page,body:not(.service-mode) .track-page{padding:40px 20px;}
    body:not(.service-mode) .board-table{font-size:12px;}
    body:not(.service-mode) .col-service,body:not(.service-mode) .col-date{display:none;}
    body:not(.service-mode) .detail-view-wrap{padding:24px;}
    body:not(.service-mode) .detail-view-tt{font-size:24px;}
  }
  @media(max-width:480px){
    body:not(.service-mode) .svc-grid{grid-template-columns:1fr;}
    body:not(.service-mode) .hero-stats{border-radius:10px;}
    body:not(.service-mode) .hero-tags{gap:6px;}
    body:not(.service-mode) .contact-grid{grid-template-columns:1fr;gap:32px;}
  }
`
