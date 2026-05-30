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

    /* HEADER */
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

    /* PAGES */
    .page-wrap{flex:1;}
    .page{display:none;}
    .page.active{display:block;}

    /* ── 서비스 상세 래퍼 ── */
    .service-detail-wrap *,.service-detail-wrap *::before,.service-detail-wrap *::after{box-sizing:border-box;}
    .service-detail-wrap{
      position:relative;
      isolation:isolate;
      overflow-x:clip;
    }

    /* ── HOME HERO ── */
    .hero{
      max-width:1120px;margin:0 auto;
      padding:72px 40px 64px;
      display:grid;grid-template-columns:1fr 480px;gap:64px;align-items:start;
    }
    .hero-left{}
    .hero-label{
      font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;
      color:var(--text3);margin-bottom:20px;display:flex;align-items:center;gap:8px;
    }
    .hero-label::before{content:'';width:6px;height:6px;border-radius:50%;background:#52a852;flex-shrink:0;}
    .hero h1{
      font-family:'Instrument Serif',serif;
      font-size:52px;line-height:1.06;letter-spacing:-1.5px;
      margin-bottom:22px;
    }
    .hero h1 em{font-style:italic;color:var(--text3);}
    .hero-desc{font-size:17px;line-height:1.85;color:var(--text2);margin-bottom:20px;max-width:440px;}
    .hero-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px;}
    .htag{
      font-size:12px;font-weight:600;
      color:var(--text2);
      background:var(--surface);
      border:1px solid var(--border);
      padding:4px 12px;border-radius:20px;
      letter-spacing:0.2px;
    }
    .hero-btns{display:flex;gap:10px;}
    .btn-dark{padding:12px 26px;font-family:inherit;font-size:14px;font-weight:600;background:var(--text);color:var(--surface);border:none;border-radius:8px;cursor:pointer;transition:opacity .15s;}
    .btn-dark:hover{opacity:.82;}
    .btn-ghost{padding:12px 22px;font-family:inherit;font-size:14px;font-weight:500;background:none;color:var(--text2);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:all .15s;}
    .btn-ghost:hover{background:var(--bg2);color:var(--text);}

    .hero-right{display:flex;flex-direction:column;gap:14px;}
    .hero-img-wrap{
      border-radius:16px;overflow:hidden;
      border:1px solid var(--border);
      box-shadow:var(--shadow-md);
      aspect-ratio:4/3;
      width:100%;
    }
    .hero-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;}

    .hero-stats{
      display:flex;align-items:center;
      background:var(--surface);
      border:1px solid var(--border);
      border-radius:12px;
      overflow:hidden;
    }
    .hstat{flex:1;padding:14px 0;text-align:center;}
    .hstat-num{font-family:'Instrument Serif',serif;font-size:24px;line-height:1;letter-spacing:-0.5px;margin-bottom:3px;font-style:italic;}
    .hstat-lbl{font-size:11px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}
    .hsep{width:1px;height:40px;background:var(--border);flex-shrink:0;}

    /* METRICS BAR */
    .metrics-wrap{
      max-width:1120px;margin:0 auto;
      padding:0 40px 68px;
    }
    .metrics-bar{
      display:grid;grid-template-columns:repeat(4,1fr);
      border:1px solid var(--border);border-radius:12px;
      background:var(--surface);overflow:hidden;
    }
    .mitem{padding:22px 24px;border-right:1px solid var(--border);}
    .mitem:last-child{border-right:none;}
    .mnum{font-size:22px;font-weight:700;letter-spacing:-0.3px;margin-bottom:4px;}
    .mlbl{font-size:13px;color:var(--text3);}

    /* ABOUT + FEATURES */
    .home-lower{background:var(--bg2);border-top:1px solid var(--border);}
    .home-lower-inner{
      max-width:1120px;margin:0 auto;
      padding:72px 40px;
      display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start;
    }
    .sec-eyebrow{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:10px;}
    .sec-heading{font-family:'Instrument Serif',serif;font-size:36px;letter-spacing:-0.8px;line-height:1.1;margin-bottom:18px;}
    .sec-heading em{font-style:italic;color:var(--text3);}
    .sec-desc{font-size:15px;color:var(--text2);line-height:1.85;margin-bottom:12px;}
    .feat-list{display:flex;flex-direction:column;gap:0;}
    .feat-item{padding:18px 0;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:16px;}
    .feat-item:first-child{border-top:1px solid var(--border);}
    .feat-num{font-family:'Instrument Serif',serif;font-size:18px;color:var(--text3);flex-shrink:0;width:24px;margin-top:1px;}
    .feat-title{font-size:14px;font-weight:600;margin-bottom:4px;}
    .feat-desc{font-size:13px;color:var(--text2);line-height:1.6;}

    /* ── SERVICES ── */
    .services-page{max-width:1120px;margin:0 auto;padding:52px 40px;flex:1;}
    .page-hd{margin-bottom:32px;}
    .page-ey{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:8px;}
    .page-tt{font-family:'Instrument Serif',serif;font-size:40px;letter-spacing:-0.8px;line-height:1.1;}
    .page-tt em{font-style:italic;color:var(--text3);}
    .filter-row{display:flex;gap:6px;margin-bottom:32px;}
    .ftab{padding:6px 16px;font-family:inherit;font-size:13px;font-weight:500;color:var(--text3);background:var(--surface);border:1px solid var(--border);border-radius:20px;cursor:pointer;transition:all .15s;}
    .ftab.active{background:var(--text);color:var(--surface);border-color:var(--text);}
    .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px 22px;}
    .svc-card{cursor:pointer;transition:transform .18s ease;}
    .svc-card:hover{transform:translateY(-2px);}
    .svc-thumb{width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:var(--bg3);margin-bottom:14px;border:1px solid var(--border);position:relative;}
    .svc-thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s ease;}
    .svc-card:hover .svc-thumb img{transform:scale(1.04);}
    .svc-thumb-empty{width:100%;height:100%;background:var(--bg2);display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:13px;font-weight:500;}
    .svc-tag{position:absolute;bottom:10px;left:10px;padding:3px 10px;border-radius:5px;font-size:11px;font-weight:600;}
    .tag-webdev{background:var(--green-bg);color:var(--green);}
    .tag-ai{background:var(--purple-bg);color:var(--purple);}
    .svc-title{font-size:15px;font-weight:600;line-height:1.4;margin-bottom:5px;letter-spacing:-0.1px;}
    .svc-desc{font-size:13px;color:var(--text3);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
    .empty-svc{grid-column:1/-1;text-align:center;padding:80px;color:var(--text3);}

    /* ── BOARD ── */
    .track-page{max-width:1120px;margin:0 auto;padding:52px 40px;}
    .board-table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:32px;}
    .board-table{width:100%;border-collapse:collapse;font-size:14px;}
    .board-table th{background:var(--bg2);padding:14px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border);}
    .board-table td{padding:16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s;}
    .board-table tr:hover td{background:rgba(0,0,0,.02);}
    .board-table tr:last-child td{border-bottom:none;}
    .col-no{width:50px;color:var(--text3);font-size:12px;}
    .row-notice td{background:rgba(232,232,227,.4);}
    .badge-notice{background:var(--text);color:var(--surface);font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;}
    .col-status{width:80px;}
    .col-service{width:120px;color:var(--text3);font-size:13px;}
    .col-content{font-weight:500;}
    .col-name{width:100px;color:var(--text3);}
    .col-date{width:100px;color:var(--text3);font-size:12px;text-align:right;}
    .status-badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:12px;}
    .status-pending{background:var(--bg3);color:var(--text3);}
    .status-resolved{background:var(--green-bg);color:var(--green);}
    .detail-view-wrap{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:40px;margin-top:20px;}
    .detail-view-hd{border-bottom:1px solid var(--border);padding-bottom:24px;margin-bottom:32px;}
    .detail-view-tt{font-family:'Instrument Serif',serif;font-size:32px;letter-spacing:-0.5px;margin-bottom:10px;}
    .detail-view-meta{display:flex;gap:20px;font-size:13px;color:var(--text3);}
    .thread-wrap{margin:40px 0;border-top:1px solid var(--border);padding-top:20px;}
    .comment-item{padding:20px 0;border-bottom:1px solid var(--bg2);position:relative;}
    .comment-item:last-child{border-bottom:none;}
    .cmt-hd{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
    .cmt-author{font-size:13px;font-weight:600;}
    .cmt-badge{font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700;}
    .badge-admin{background:var(--text);color:var(--surface);}
    .badge-user{background:var(--green);color:white;}
    .badge-guest{background:var(--bg3);color:var(--text2);}
    .cmt-date{font-size:11px;color:var(--text3);}
    .cmt-body{font-size:14px;line-height:1.7;color:var(--text2);white-space:pre-wrap;}
    .reply-form{margin-top:20px;background:var(--bg2);padding:24px;border-radius:12px;}
    .reply-form textarea{width:100%;height:80px;padding:12px;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:14px;margin-bottom:12px;}
    .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(6px);z-index:200;align-items:center;justify-content:center;}
    .modal-overlay.open{display:flex;}
    .detail-modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;width:90%;max-width:560px;padding:32px;box-shadow:var(--shadow-md);}
    .detail-hd{border-bottom:1px solid var(--border);padding-bottom:20px;margin-bottom:20px;}
    .detail-title{font-size:18px;font-weight:600;margin-bottom:6px;}
    .detail-meta{font-size:12px;color:var(--text3);display:flex;gap:12px;}
    .detail-body{font-size:15px;line-height:1.7;color:var(--text2);white-space:pre-wrap;margin-bottom:24px;}
    .auth-box{text-align:center;padding:20px 0;}
    .notice-bar{background:var(--text);color:var(--surface);padding:10px 40px;font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:12px;}
    .notice-tag{background:var(--green);color:white;font-size:10px;padding:2px 6px;border-radius:4px;text-transform:uppercase;}

    /* ── CONTACT ── */
    .contact-page{max-width:840px;margin:0 auto;padding:52px 40px;}
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;margin-top:40px;}
    .cform{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:26px;}
    .ff{margin-bottom:14px;}
    .ff label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text3);margin-bottom:5px;}
    .ff input,.ff textarea,.ff select{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:10px 13px;font-family:inherit;font-size:14px;border-radius:8px;outline:none;transition:border-color .15s;}
    .ff input:focus,.ff textarea:focus,.ff select:focus{border-color:var(--text3);}
    .ff textarea{height:96px;resize:none;}
    .fsub{width:100%;margin-top:4px;padding:11px;font-family:inherit;font-size:14px;font-weight:600;background:var(--text);color:var(--surface);border:none;border-radius:8px;cursor:pointer;transition:opacity .15s;}
    .fsub:hover{opacity:.82;}
    .fsub:disabled{opacity:.4;cursor:not-allowed;}

    body:has(.service-detail-wrap){min-height:unset;background:transparent;display:block;}
    body:has(.service-detail-wrap) .page-wrap{flex:none;}

    /* FOOTER */
    body > footer{border-top:1px solid var(--border);background:var(--bg2);}
    .footer-inner{max-width:1120px;margin:0 auto;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;}
    .footer-brand{font-size:14px;font-weight:600;color:var(--text2);}
    .footer-copy{font-size:13px;color:var(--text3);}

    /* ── 서비스 상세 페이지 hero 충돌 방지 ── */
    body.service-mode .hero {
      max-width: none;
      margin: 0;
    }

    /* RESPONSIVE */
    @media(max-width:900px){
      .header-inner{padding:0 16px;height:60px;}
      .logo-sub{display:none;}
      .nav{gap:2px;padding-right:10px;}
      .nav-btn{padding:6px 8px;font-size:12px;}
      .nav-cta{padding:7px 12px;font-size:12px;margin-left:2px;}

      .hero{grid-template-columns:1fr;padding:40px 20px 48px;gap:32px;}
      .hero h1{font-size:40px;}
      .hero-right{gap:12px;}

      .metrics-wrap{padding:32px 20px 52px;}
      .metrics-bar{grid-template-columns:1fr 1fr;}
      .mitem:nth-child(2){border-right:none;}
      .mitem:nth-child(3){border-top:1px solid var(--border);}
      .mitem:nth-child(4){border-top:1px solid var(--border);border-right:none;}
      .home-lower-inner{grid-template-columns:1fr;gap:40px;padding:48px 20px;}
      .svc-grid{grid-template-columns:repeat(2,1fr);}
      .services-page,.contact-page,.track-page{padding:40px 20px;}
      .board-table{font-size:12px;}
      .col-service,.col-date{display:none;}
      .detail-view-wrap{padding:24px;}
      .detail-view-tt{font-size:24px;}
    }
    @media(max-width:480px){
      .svc-grid{grid-template-columns:1fr;}
      .hero-stats{border-radius:10px;}
      .hero-tags{gap:6px;}
      .contact-grid{grid-template-columns:1fr;gap:32px;}
    }
`