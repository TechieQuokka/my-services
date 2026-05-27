import { Hono } from 'hono'
import { html } from 'hono/html'
import { setCookie } from 'hono/cookie'
import { createToken } from '../../middleware/auth'
import type { Env } from '../../types'

const login = new Hono<{ Bindings: Env }>()

login.get('/', (c) => {
  const error = c.req.query('error')
  return c.html(html`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Admin Login — My Services</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>
    :root{--bg:#e8e8e3;--bg2:#d4d4ce;--bg3:#c8c8c2;--surface:#f0efea;--surface2:#e2e1dc;--border:#b8b8b2;--border2:#a0a09a;--text:#1c1c1a;--text2:#5a5a54;--text3:#8a8a84;--red:#9a2a2a;--shadow-sm:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.08);--shadow-md:0 4px 12px rgba(0,0,0,.10),0 2px 4px rgba(0,0,0,.08);}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:var(--bg);color:var(--text);font-family:'Mona Sans',-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;}

    .login-wrap{width:360px;}

    .login-logo{display:flex;align-items:center;gap:10px;margin-bottom:40px;}
    .logo-icon{width:32px;height:32px;background:linear-gradient(145deg,#d0cfc9,#b8b8b0);border-radius:8px;border:1px solid var(--border2);box-shadow:var(--shadow-sm),inset 0 1px 0 rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:15px;}
    .logo-text{font-size:16px;font-weight:600;color:var(--text);letter-spacing:-0.3px;}
    .logo-text span{color:var(--text3);font-weight:400;}
    .logo-badge{margin-left:auto;font-size:11px;font-weight:600;background:var(--bg3);color:var(--text3);padding:2px 8px;border-radius:10px;border:1px solid var(--border);}

    .login-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px 28px 24px;box-shadow:var(--shadow-md);}
    .login-card::before{content:'';display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);margin:-28px -28px 24px;}

    .login-title{font-size:18px;font-weight:600;letter-spacing:-0.4px;margin-bottom:4px;}
    .login-sub{font-size:13px;color:var(--text3);margin-bottom:24px;}

    label{display:block;font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;}
    input[type=password]{
      width:100%;background:var(--bg);border:1px solid var(--border);
      color:var(--text);padding:10px 14px;font-family:inherit;font-size:14px;
      border-radius:8px;outline:none;transition:border-color .15s,background .15s;
      margin-bottom:14px;
    }
    input[type=password]:focus{border-color:var(--border2);background:var(--surface);}

    button[type=submit]{
      width:100%;background:var(--text);color:var(--surface);
      border:none;padding:11px;font-family:inherit;font-size:14px;font-weight:600;
      letter-spacing:-0.2px;cursor:pointer;border-radius:8px;
      transition:opacity .15s;margin-top:4px;
      box-shadow:0 1px 3px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.08);
    }
    button[type=submit]:hover{opacity:.88;}
    button[type=submit]:active{opacity:.8;transform:scale(.99);}

    .error-msg{margin-top:14px;font-size:12px;color:var(--red);background:#f9ecec;border:1px solid rgba(154,42,42,.2);border-radius:6px;padding:8px 12px;display:flex;align-items:center;gap:6px;}
    .error-msg::before{content:'⚠';font-size:13px;}
  </style>
</head>
<body>
  <div class="login-wrap">
    <div class="login-logo">
      <div class="logo-icon">⬡</div>
      <span class="logo-text">My<span>Services</span></span>
      <span class="logo-badge">ADMIN</span>
    </div>

    <div class="login-card">
      <div class="login-title">관리자 로그인</div>
      <div class="login-sub">계속하려면 비밀번호를 입력하세요.</div>
      <form method="POST" action="/admin/login">
        <label for="pw">Password</label>
        <input type="password" id="pw" name="password" autofocus placeholder="••••••••"/>
        <button type="submit">로그인 →</button>
      </form>
      ${error ? html`<div class="error-msg">비밀번호가 올바르지 않습니다.</div>` : ''}
    </div>
  </div>
</body>
</html>`)
})

login.post('/', async (c) => {
  const body = await c.req.parseBody()
  const password = body['password'] as string
  if (password !== c.env.ADMIN_PASSWORD) return c.redirect('/admin/login?error=1')
  const token = await createToken(c.env.ADMIN_PASSWORD)
  setCookie(c, 'admin_token', token, { httpOnly:true, secure:true, sameSite:'Lax', maxAge:60*60*24, path:'/' })
  return c.redirect('/admin')
})

export default login
