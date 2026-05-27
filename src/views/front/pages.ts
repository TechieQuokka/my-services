import { html } from 'hono/html'
import { imagekitUrl } from '../../lib/imagekit'
import { Service } from '../../types'

export const HomePage = () => html`
  <div class="page active" id="page-home">
    <section class="hero">
      <div>
        <div class="hero-label">현재 프로젝트 수주 가능</div>
        <h1>웹개발 &amp;<br><em>AI 자동화</em></h1>
        <p class="hero-desc">
          스타트업과 소상공인을 위한 웹 서비스 개발, AI 업무 자동화.
          복잡한 과정 없이 빠르게 만들고, 직접 소통합니다.
        </p>
        <div class="hero-btns">
          <button class="btn-dark" onclick="showPage('services')">서비스 보기</button>
          <button class="btn-ghost" onclick="showPage('contact')">무료 상담</button>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-img-wrap">
          <img src="https://thumbs.dreamstime.com/z/sample-jpeg-fluffy-white-pomeranian-puppy-sits-looks-camera-colorful-balls-front-364720569.jpg?ct=jpeg" alt="Adam Software" loading="lazy"/>
        </div>
        <div class="hero-stats">
          <div class="hstat"><div class="hstat-num">3+</div><div class="hstat-lbl">Years</div></div>
          <div class="hstat"><div class="hstat-num">20+</div><div class="hstat-lbl">Projects</div></div>
          <div class="hstat"><div class="hstat-num">24h</div><div class="hstat-lbl">Response</div></div>
        </div>
      </div>
    </section>

    <div class="metrics-wrap">
      <div class="metrics-bar">
        <div class="mitem"><div class="mnum">24h</div><div class="mlbl">평균 답변 시간</div></div>
        <div class="mitem"><div class="mnum">100%</div><div class="mlbl">직접 개발 · 소통</div></div>
        <div class="mitem"><div class="mnum">Free</div><div class="mlbl">초기 상담 무료</div></div>
        <div class="mitem"><div class="mnum">Edge</div><div class="mlbl">글로벌 엣지 배포</div></div>
      </div>
    </div>

    <div class="home-lower">
      <div class="home-lower-inner">
        <div>
          <div class="sec-eyebrow">About</div>
          <div class="sec-heading">작지만<br><em>빠릅니다</em></div>
          <p class="sec-desc">
            1인 스튜디오입니다. 덕분에 의사결정이 빠르고, 고객과 직접 대화합니다.
            PM을 거치지 않아도 되고, 엉뚱한 결과물이 나오는 일도 없습니다.
          </p>
          <p class="sec-desc">
            Cloudflare Workers 기반으로 개발해 서버 관리 부담이 없고,
            전 세계 어디서나 빠른 속도를 보장합니다.
          </p>
        </div>
        <div class="feat-list">
          <div class="feat-item">
            <div class="feat-num">01</div>
            <div>
              <div class="feat-title">빠른 개발 사이클</div>
              <div class="feat-desc">아이디어에서 배포까지 평균 2주. 대기업 에이전시가 기획서 쓰는 동안 런칭합니다.</div>
            </div>
          </div>
          <div class="feat-item">
            <div class="feat-num">02</div>
            <div>
              <div class="feat-title">AI 자동화</div>
              <div class="feat-desc">반복 업무를 AI 파이프라인으로 대체합니다. 운영 비용과 시간을 줄여드립니다.</div>
            </div>
          </div>
          <div class="feat-item">
            <div class="feat-num">03</div>
            <div>
              <div class="feat-title">장기 파트너십</div>
              <div class="feat-desc">프로젝트 완료 후에도 운영과 유지보수를 함께합니다. 일회성 거래가 아닙니다.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`

export const ServicesPage = (services: Service[]) => html`
  <div class="page" id="page-services">
    <div class="services-page">
      <div class="page-hd">
        <div class="page-ey">What we do</div>
        <div class="page-tt">제공 <em>서비스</em></div>
      </div>
      <div class="filter-row">
        <button class="ftab active" onclick="filterCards('all',this)">전체</button>
        <button class="ftab" onclick="filterCards('webdev',this)">Web Dev</button>
        <button class="ftab" onclick="filterCards('ai',this)">AI</button>
      </div>
      <div class="svc-grid" id="services-grid">
        ${services.length === 0
          ? html`<div class="empty-svc">등록된 서비스가 없습니다.</div>`
          : services.map(s => html`
        <div class="svc-card" data-cat="${s.category}" onclick="location.href='/services/${s.id}'">
          <div class="svc-thumb">
            ${s.thumb_url
              ? html`<img src="${imagekitUrl(s.thumb_url,{w:800,h:600,q:82})}" alt="${s.title}" loading="lazy"/>`
              : html`<div class="svc-thumb-empty">${s.title}</div>`
            }
            <div class="svc-tag ${s.category === 'webdev' ? 'tag-webdev' : 'tag-ai'}">${s.category === 'webdev' ? 'Web Dev' : 'AI'}</div>
          </div>
          <div class="svc-title">${s.title}</div>
          <div class="svc-desc">${s.description ?? ''}</div>
        </div>`)}
      </div>
    </div>
  </div>
`

export const TrackPage = () => html`
  <div class="page" id="page-track">
    <div class="track-page">
      <!-- List View -->
      <div id="board-list-view">
        <div class="page-hd">
          <div class="page-ey">Board</div>
          <div class="page-tt">문의 <em>게시판</em></div>
        </div>
        
        <div class="board-table-wrap">
          <table class="board-table">
            <thead>
              <tr>
                <th class="col-no">NO</th>
                <th class="col-status">상태</th>
                <th class="col-service">서비스</th>
                <th class="col-content">내용</th>
                <th class="col-name">작성자</th>
                <th class="col-date">날짜</th>
              </tr>
            </thead>
            <tbody id="board-body">
              <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text3);">로딩 중...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail View (Full Page Style) -->
      <div id="board-detail-view" style="display:none;">
        <div id="detail-content-area"></div>
      </div>
    </div>
  </div>
`

export const ContactPage = (services: Service[]) => html`
  <div class="page" id="page-contact">
    <div class="contact-page">
      <div class="page-hd">
        <div class="page-ey">Contact</div>
        <div class="page-tt">프로젝트를 <em>시작해볼까요?</em></div>
      </div>
      <div class="contact-grid">
        <div>
          <p class="contact-desc">어떤 걸 만들고 싶은지 알려주세요. 규모나 예산이 정해지지 않아도 괜찮습니다. 같이 얘기해보면서 맞춰가면 됩니다.</p>
          <div class="cinfo-item">보통 24시간 이내 답변</div>
          <div class="cinfo-item">초기 상담 무료</div>
        </div>
        <div>
          <div class="cform" id="cf-form">
            <div class="ff">
              <label>Service</label>
              <select id="cf-service">
                <option value="">서비스를 선택해주세요</option>
                ${services.map(s => html`<option value="${s.id}">${s.title}</option>`)}
              </select>
            </div>
            <div class="ff"><label>Name</label><input type="text" id="cf-name" placeholder="이름"/></div>
            <div class="ff"><label>Contact</label><input type="text" id="cf-contact" placeholder="이메일 또는 전화번호"/></div>
            <div class="ff"><label>Password</label><input type="password" id="cf-password" placeholder="비밀번호 (조회 시 필요)"/></div>
            <div class="ff"><label>Message</label><textarea id="cf-content" placeholder="어떤 걸 만들고 싶으신가요?"></textarea></div>
            <button class="fsub" id="cf-btn" onclick="submitContact()">문의 보내기 →</button>
          </div>
          <div class="form-success" id="cf-success" style="display:none;">
            <p>문의가 접수되었습니다.<br>빠른 시일 내에 연락드리겠습니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`
