function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('page-' + name)?.classList.add('active')
  document.querySelector('[data-page="' + name + '"]')?.classList.add('active')
  window.scrollTo(0, 0)

  if (name === 'track') {
    document.getElementById('board-list-view').style.display = 'block'
    document.getElementById('board-detail-view').style.display = 'none'
    loadBoard()
  }
}

function filterCards(cat, btn) {
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  document.querySelectorAll('#services-grid .svc-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none'
  })
}

function getOwnerToken() {
  let token = localStorage.getItem('ownership_token')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('ownership_token', token)
  }
  return token
}

async function submitContact() {
  const service_id = document.getElementById('cf-service').value
  const name = document.getElementById('cf-name').value.trim()
  const contact = document.getElementById('cf-contact').value.trim()
  const password = document.getElementById('cf-password').value.trim()
  const content = document.getElementById('cf-content').value.trim()

  if (!service_id || !name || !contact || !password || !content) return alert('모든 항목을 입력해주세요.')

  const btn = document.getElementById('cf-btn')
  btn.textContent = '전송 중...'; btn.disabled = true

  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact, password, content, service_id: Number(service_id), owner_token: getOwnerToken() })
    })

    if (res.ok) {
      const data = await res.json()
      lastAuth = { id: data.id, name, password }
      // 문의 성공 후 track 페이지로 이동하여 상세 바로 표시
      showPage('track')
      await submitAuthPage(data.id, lastAuth)
    } else {
      alert('오류가 발생했습니다.')
    }
  } catch (e) {
    alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    btn.textContent = '문의 보내기 →'; btn.disabled = false
  }
}

// ── loadBoard TTL 캐시 (30초) ─────────────────────────────────────
let _boardCache = null
let _boardCacheAt = 0
const BOARD_TTL = 30 * 1000 // 30초

async function loadBoard(force = false) {
  const now = Date.now()
  if (!force && _boardCache && now - _boardCacheAt < BOARD_TTL) {
    renderBoard(_boardCache)
    return
  }

  try {
    const res = await fetch('/api/inquiries/board')
    const data = await res.json()
    _boardCache = data
    _boardCacheAt = now
    renderBoard(data)
  } catch (e) {
    console.error('[loadBoard] fetch 실패', e)
    const body = document.getElementById('board-body')
    body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text3);">불러오기 실패. 다시 시도해주세요.</td></tr>'
  }
}

function renderBoard(data) {
  const body = document.getElementById('board-body')

  const inquiries = data.filter(i => !i.is_notice)
  const inquiryTotal = inquiries.length
  let inquiryIdx = 0

  body.innerHTML = data.map((i) => {
    if (i.is_notice) {
      return `
        <tr class="row-notice" onclick="viewFullNotice(${i.id})">
          <td class="col-no"></td>
          <td><span class="status-badge status-resolved">NOTICE</span></td>
          <td class="col-service">System</td>
          <td class="col-content">📢 ${i.snippet}</td>
          <td class="col-name">${i.name}</td>
          <td class="col-date">${i.created_at.slice(5, 10)}</td>
        </tr>
      `
    } else {
      const no = inquiryTotal - inquiryIdx
      inquiryIdx++
      return `
        <tr onclick="openAuthPage(${i.id})">
          <td class="col-no">${no}</td>
          <td><span class="status-badge status-${i.status}">${i.status === 'resolved' ? '완료' : '대기'}</span></td>
          <td class="col-service">${i.service_title}</td>
          <td class="col-content">🔒 ${i.snippet}</td>
          <td class="col-name">${i.name}</td>
          <td class="col-date">${i.created_at.slice(5, 10)}</td>
        </tr>
      `
    }
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:40px;">내역이 없습니다.</td></tr>'
}

async function viewFullNotice(id) {
  const res = await fetch('/api/notices/' + id)
  const n = await res.json()
  renderDetailView({
    title: n.title,
    meta: `공지일: ${n.created_at.slice(0, 10)} | Admin`,
    content: n.content,
    messages: []
  })
}

let lastAuth = null

async function submitAuthPage(id, manualCreds = null, skipScroll = false) {
  const name = manualCreds ? manualCreds.name : document.getElementById('auth-name')?.value.trim()
  const password = manualCreds ? manualCreds.password : document.getElementById('auth-password')?.value.trim()

  if (!name || !password) return alert('이름과 비밀번호를 입력해주세요.')

  const res = await fetch('/api/inquiries/track/detail', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, password, current_token: getOwnerToken() })
  })

  if (res.ok) {
    const { data, messages } = await res.json()
    lastAuth = { id, name, password }
    renderDetailView({
      id: data.id,
      title: data.service_title || '일반 문의',
      meta: `작성자: ${data.name} | 날짜: ${data.created_at.slice(0, 16).replace('T', ' ')}`,
      content: data.content,
      messages: messages
    }, skipScroll)
  } else {
    alert('인증에 실패했습니다. 이름 또는 비밀번호를 확인해주세요.')
  }
}

function openAuthPage(id) {
  document.getElementById('board-list-view').style.display = 'none'
  document.getElementById('board-detail-view').style.display = 'block'
  const area = document.getElementById('detail-content-area')
  area.innerHTML = `
    <div class="detail-view-wrap" style="max-width:480px;margin:100px auto;text-align:center;">
      <div class="detail-view-hd"><div class="detail-view-tt">비밀글 보기</div></div>
      <div class="auth-box">
        <div class="ff"><input type="text" id="auth-name" placeholder="이름"/></div>
        <div class="ff" style="margin-top:10px;"><input type="password" id="auth-password" placeholder="비밀번호"/></div>
        <div style="display:flex;gap:10px;margin-top:24px;">
          <button class="btn-ghost" style="flex:1;padding:12px;" onclick="showPage('track')">목록으로</button>
          <button class="btn-dark" style="flex:1;padding:12px;" onclick="submitAuthPage(${id})">확인</button>
        </div>
      </div>
    </div>
  `
}

function renderDetailView(data, skipScroll = false) {
  document.getElementById('board-list-view').style.display = 'none'
  document.getElementById('board-detail-view').style.display = 'block'

  const area = document.getElementById('detail-content-area')

  const commentsHtml = data.messages.map(m => `
    <div class="comment-item">
      <div class="cmt-hd">
        <span class="cmt-author">${m.sender_role === 'admin' ? 'Adam Software' : (m.role_display === 'owner' ? '작성자' : 'Guest')}</span>
        <span class="cmt-badge ${m.sender_role === 'admin' ? 'badge-admin' : (m.role_display === 'owner' ? 'badge-user' : 'badge-guest')}">
          ${m.sender_role === 'admin' ? 'ADMIN' : (m.role_display === 'owner' ? 'OWNER' : 'GUEST')}
        </span>
        <span class="cmt-date">${m.created_at.slice(5, 16).replace('T', ' ')}</span>
      </div>
      <div class="cmt-body">${m.content}</div>
    </div>
  `).join('')

  area.innerHTML = `
    <div class="detail-view-wrap">
      <div class="detail-view-hd">
        <div class="detail-view-tt">${data.title}</div>
        <div class="detail-view-meta">${data.meta}</div>
      </div>
      <div class="detail-view-body">${data.content}</div>
      <div class="thread-wrap">
        <h3 style="font-size:15px; font-weight:600; margin-bottom:20px;">답변 및 소통</h3>
        ${commentsHtml || '<p style="font-size:13px; color:var(--text3); padding:20px 0;">아직 등록된 답변이 없습니다.</p>'}
      </div>
      ${data.id ? `
      <div class="reply-form">
        <h4 style="font-size:13px; font-weight:600; margin-bottom:12px;">의견 남기기</h4>
        <textarea id="reply-content" placeholder="내용을 입력해주세요."></textarea>
        <button class="btn-primary" style="width:100%; padding:12px;" onclick="submitReply(${data.id})">댓글 등록</button>
      </div>` : ''}
      <div class="detail-view-ft" style="margin-top:40px;">
        <button class="btn-ghost" style="padding:12px 40px;" onclick="showPage('track')">목록으로 돌아가기</button>
      </div>
    </div>
  `
  if (!skipScroll) window.scrollTo(0, 0)
}

async function submitReply(id) {
  const content = document.getElementById('reply-content').value.trim()
  if (!content || !lastAuth) return alert('인증이 필요합니다.')

  const res = await fetch(`/api/inquiries/${id}/messages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      name: lastAuth.name,
      password: lastAuth.password,
      sender_token: getOwnerToken()
    })
  })
  if (res.ok) {
    // 댓글 등록 후 캐시 무효화 (새 댓글이 board에 반영되도록)
    _boardCache = null
    await submitAuthPage(id, lastAuth, true)
  } else {
    alert('오류 발생')
  }
}

async function loadNotices() {
  const res = await fetch('/api/notices')
  const data = await res.json()
  const container = document.getElementById('notice-bar-container')
  if (data.length > 0) {
    const pinned = data.find(n => n.is_fixed) || data[0]
    container.innerHTML = `<div class="notice-bar"><span class="notice-tag">Notice</span><span>${pinned.title}</span><a href="#" style="color:white;text-decoration:underline;margin-left:10px;" onclick="viewNoticePopup(${pinned.id});return false;">보기</a></div>`
  }
}

async function viewNoticePopup(id) {
  const res = await fetch('/api/notices/' + id)
  const n = await res.json()
  const overlay = document.getElementById('detail-modal-overlay')
  const modal = document.getElementById('detail-modal')
  modal.innerHTML = `<div class="detail-hd"><div class="detail-title">${n.title}</div><div class="detail-meta"><span>공지일: ${n.created_at.slice(0, 10)}</span></div></div><div class="detail-body">${n.content}</div><button class="btn-dark" style="width:100%;padding:12px;" onclick="closeModal()">닫기</button>`
  overlay.classList.add('open')
}

function closeModal() { document.getElementById('detail-modal-overlay').classList.remove('open') }

// 초기화 (visit 추적은 layout.ts에서 buildVisitScript로 주입)
;(function () {
  loadNotices()

  const urlParams = new URLSearchParams(location.search)
  const adminTrackKey = urlParams.get('admin_track')
  if (adminTrackKey && adminTrackKey.startsWith('admin_track_')) {
    const raw = sessionStorage.getItem(adminTrackKey)
    if (raw) {
      sessionStorage.removeItem(adminTrackKey)
      try {
        const { id, name, password } = JSON.parse(raw)
        if (id && name && password) {
          history.replaceState(null, '', '/#track')
          showPage('track')
          submitAuthPage(id, { id, name, password })
          return
        }
      } catch (e) {}
    }
  }

  const pending = sessionStorage.getItem('pending_inquiry')
  if (pending) {
    sessionStorage.removeItem('pending_inquiry')
    try {
      const { id, name, password } = JSON.parse(pending)
      showPage('track')
      submitAuthPage(id, { id, name, password })
    } catch (e) {}
    return
  }

  // hash 기반 초기 페이지 라우팅
  const hash = location.hash
  if (hash === '#track') showPage('track')
  else if (hash === '#services') showPage('services')
  else if (hash === '#contact') showPage('contact')
})()
