import { html } from 'hono/html'

export const InquiryWidget = (id: number) => html`
<link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  #cta-wrap{position:fixed;bottom:24px;right:24px;z-index:9999;}
  #cta-btn{
    background:#1c1c1a;color:#f0efea;border:none;
    padding:13px 22px;font-family:'Mona Sans',-apple-system,sans-serif;
    font-size:14px;font-weight:600;cursor:pointer;border-radius:10px;
    letter-spacing:-0.2px;box-shadow:0 4px 16px rgba(0,0,0,.2);
    transition:opacity .15s,transform .15s;
  }
  #cta-btn:hover{opacity:.88;transform:translateY(-1px);}
  #inquiry-overlay{
    display:none;position:fixed;inset:0;
    background:rgba(0,0,0,.35);z-index:10000;
    align-items:center;justify-content:center;
    backdrop-filter:blur(6px);
  }
  #inquiry-overlay.open{display:flex;}
  #inquiry-modal{
    background:#f0efea;border:1px solid #b8b8b2;
    padding:28px 32px;width:90%;max-width:460px;
    border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.15);
  }
  #inquiry-modal h2{font-family:'Mona Sans',-apple-system,sans-serif;font-size:17px;font-weight:600;margin-bottom:20px;color:#1c1c1a;letter-spacing:-0.3px;}
  .iq-field{margin-bottom:12px;}
  .iq-field label{display:block;font-family:'Mona Sans',-apple-system,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#8a8a84;margin-bottom:5px;}
  .iq-field input,.iq-field textarea{width:100%;background:#e8e8e3;border:1px solid #b8b8b2;color:#1c1c1a;padding:9px 12px;font-family:'Mona Sans',-apple-system,sans-serif;font-size:13px;border-radius:8px;outline:none;transition:border-color .15s;}
  .iq-field input:focus,.iq-field textarea:focus{border-color:#a0a09a;background:#f0efea;}
  .iq-field textarea{height:90px;resize:none;}
  .iq-btns{display:flex;gap:10px;margin-top:16px;}
  #iq-submit{flex:1;background:#1c1c1a;color:#f0efea;border:none;padding:11px;font-family:'Mona Sans',-apple-system,sans-serif;font-size:13px;font-weight:600;cursor:pointer;border-radius:8px;transition:opacity .15s;}
  #iq-submit:hover{opacity:.88;}
  #iq-cancel{background:transparent;color:#5a5a54;border:1px solid #b8b8b2;padding:11px 16px;font-family:'Mona Sans',-apple-system,sans-serif;font-size:13px;cursor:pointer;border-radius:8px;}
</style>
<div id="cta-wrap">
  <button id="cta-btn" onclick="document.getElementById('inquiry-overlay').classList.add('open')">문의하기 →</button>
</div>
<div id="inquiry-overlay">
  <div id="inquiry-modal">
    <h2>문의하기</h2>
    <div class="iq-field"><label>Name</label><input id="iq-name" type="text" placeholder="이름"/></div>
    <div class="iq-field"><label>Contact</label><input id="iq-contact" type="text" placeholder="이메일 또는 전화번호"/></div>
    <div class="iq-field"><label>Password</label><input id="iq-password" type="password" placeholder="비밀번호 (조회 시 필요)"/></div>
    <div class="iq-field"><label>Message</label><textarea id="iq-content" placeholder="문의 내용을 입력해주세요."></textarea></div>
    <div class="iq-btns">
      <button id="iq-cancel" onclick="document.getElementById('inquiry-overlay').classList.remove('open')">취소</button>
      <button id="iq-submit" onclick="submitInquiryWidget()">전송 →</button>
    </div>
  </div>
</div>
<script>
async function submitInquiryWidget(){
  const name=document.getElementById('iq-name').value.trim()
  const contact=document.getElementById('iq-contact').value.trim()
  const password=document.getElementById('iq-password').value.trim()
  const content=document.getElementById('iq-content').value.trim()
  if(!name||!contact||!password||!content){alert('모든 항목을 입력해주세요.');return;}
  const btn=document.getElementById('iq-submit')
  btn.textContent='전송 중...';btn.disabled=true
  
  // visitor_id 수집 시도 (세션 스토리지 등에서)
  let visitor_id = null;
  try {
    const vdata = localStorage.getItem('visitor_id');
    if(vdata) visitor_id = Number(vdata);
  } catch(e){}

  const res=await fetch('/api/inquiries',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name,contact,password,content,service_id:${id},visitor_id})
  })
  if(res.ok){
    alert('문의가 전송되었습니다. 빠른 시일 내에 연락드리겠습니다.');
    document.getElementById('inquiry-overlay').classList.remove('open')
  } else {
    const data = await res.json();
    alert('오류가 발생했습니다: ' + (data.error || '다시 시도해주세요.'));
  }
  btn.textContent='전송 →';btn.disabled=false
}
</script>
`
