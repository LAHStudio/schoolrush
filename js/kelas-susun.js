/* Round 10f: Susun Ayat Bahasa Melayu screen (the BM quiz in the Perpustakaan). Data + logic: js/kelas-susun-data.js (SUSL, SUSB, SUSCFG). Grade scale: QCFG/quizGrade in js/kelas-quiz-data.js. Result saving: recQuiz() in js/kelas-quiz.js.
   Same open API as QZ and SP: SUS.open({sub, lock, onClose(), onDone(result)}); lock = the only level allowed (Mod Kelas) or null (Mod Jalan-jalan: any level). back(), isOpen().
   Look: a school exercise-book page (cream paper, blue ruled lines, red margin, pencil / eraser / ruler / star stickers, a red "BAGUS!" stamp), all CSS and tiny inline SVG, no images.
   Input: a short press on a piece moves it (pool -> answer end, answer -> back to the pool). A longer move drags it: into the answer at the marked spot, to reorder inside the answer, or back to the pool. Pieces locked by a hint stay.
   No timer. Two tries per question; the mark is given once (SUSL.check). Hints and the streak bonus work like the English spelling quiz. */
const SUS=(()=>{
const CSS=`#su{--m:clamp(46px,12vw,84px);position:fixed;left:0;right:0;top:0;height:100%;z-index:60;display:none;flex-direction:column;gap:clamp(6px,1.5vmin,12px);box-sizing:border-box;padding:max(10px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) calc(var(--m) + env(safe-area-inset-left));background-color:#fffdf0;background-image:repeating-linear-gradient(180deg,transparent 0,transparent 33px,#b9d9f2 33px,#b9d9f2 35px);color:#23356b;font-family:Fredoka,sans-serif;overflow:hidden}
#su::before{content:"";position:absolute;top:0;bottom:0;left:calc(var(--m) - 14px + env(safe-area-inset-left));width:3px;background:#e8727a;pointer-events:none}
@keyframes supop{0%{transform:scale(2.2) rotate(-18deg);opacity:0}60%{transform:scale(.92) rotate(-8deg);opacity:1}100%{transform:scale(1) rotate(-8deg)}}@keyframes sush{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@media (prefers-reduced-motion:reduce){#su *{animation:none!important;transition:none!important}}
#su *{box-sizing:border-box}#su>*{position:relative;z-index:1}#su button{font-family:inherit}#su button:focus-visible{outline:4px solid #ff9f1c;outline-offset:2px}
#su .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:0 0 auto;font-size:clamp(13px,2.8vmin,20px);font-weight:600}
#su .pl{background:#fff;border:2px solid #7da7d9;color:#23356b;border-radius:999px;padding:.25em .9em;font-size:1em;font-weight:600;cursor:pointer;width:max-content;flex:0 0 auto;box-shadow:0 2px 0 #b9d3ee}#su .pl.st{cursor:default}
#su .ti{flex:0 0 auto;display:flex;align-items:center;gap:8px;font-size:clamp(17px,4vmin,30px);font-weight:700}#su .ti span{background:linear-gradient(transparent 58%,#ffe66d 58%);padding:0 .2em}#su .ti svg{flex:0 0 auto;width:clamp(26px,5vmin,40px);height:auto}
#su .tm{flex:0 0 auto;display:flex;align-items:center;gap:10px;justify-content:space-between;font-size:clamp(11px,2.4vmin,16px);font-weight:700}#su .sk{background:#fff4c2;border:2px solid #e8b84a;border-radius:999px;padding:.15em .7em;white-space:nowrap}#su .stk{color:#f2a900;letter-spacing:.05em;font-size:clamp(14px,3vmin,22px);text-shadow:0 1px 0 #fff}
#su .mw{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:clamp(6px,1.5vmin,12px)}#su .lf{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:clamp(6px,1.5vmin,12px);overflow:auto}#su .rt{flex:0 0 auto;display:flex;flex-direction:column;gap:clamp(6px,1.4vmin,10px)}
#su .pr{font-size:clamp(14px,3.1vmin,22px);font-weight:600}
#su .az{position:relative;min-height:calc(clamp(44px,8.5vmin,62px)*2 + 22px);display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;padding:10px 10px 12px;border:3px dashed #7da7d9;border-radius:12px;background:rgba(255,255,255,.72);transition:background .15s}#su .az.ov{background:rgba(255,230,109,.5);border-color:#e8a317}#su .az.no{animation:sush .4s}#su .az.ok{border-style:solid;border-color:#3fa862;background:rgba(190,240,205,.6)}
#su .az .em{position:absolute;left:12px;right:12px;top:50%;transform:translateY(-50%);text-align:center;font-size:clamp(13px,2.8vmin,19px);font-weight:600;opacity:.45;pointer-events:none}
#su .lb{font-size:clamp(11px,2.3vmin,15px);font-weight:700;opacity:.75;letter-spacing:.04em}
#su .pp{min-height:calc(clamp(44px,8.5vmin,62px) + 22px);display:flex;flex-wrap:wrap;align-content:flex-start;gap:10px;padding:10px;border-radius:12px;background:rgba(125,167,217,.14);border:2px solid rgba(125,167,217,.45)}
#su .pc{min-height:clamp(44px,8.5vmin,62px);max-width:100%;padding:.3em .8em;border:2px solid #9db6dc;border-radius:7px;background:#fff;color:#23356b;font-size:clamp(16px,4vmin,26px);font-weight:700;line-height:1.15;box-shadow:2px 3px 0 rgba(35,53,107,.28);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;text-align:center;position:relative}
#su .pp .pc:nth-child(odd){transform:rotate(-1.6deg)}#su .pp .pc:nth-child(even){transform:rotate(1.3deg)}#su .pc.an{background:#fffbd6;border-color:#e8b84a}#su .pc.lk{background:#ffe4b0;border-color:#e2893a;cursor:default}#su .pc.lk::after{content:"";position:absolute;top:-5px;right:-5px;width:12px;height:12px;border-radius:50%;background:#e2893a;border:2px solid #fff}
#su .pc:disabled{cursor:default}#su .pc.dg{opacity:.28}#su .pc.gh{position:fixed;z-index:90;pointer-events:none;margin:0;transform:rotate(-3deg) scale(1.06);box-shadow:4px 8px 14px rgba(0,0,0,.3);opacity:.96}#su .pc.ib::before{content:"";position:absolute;left:-7px;top:-3px;bottom:-3px;width:4px;border-radius:3px;background:#e8a317}#su .az.ie::after{content:"";width:4px;min-height:clamp(44px,8.5vmin,62px);border-radius:3px;background:#e8a317}
#su .fb{min-height:clamp(46px,9vmin,66px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:clamp(14px,3vmin,21px);font-weight:700;background:#fff;border:2px solid #b9d3ee;border-radius:14px;padding:.35em .8em;text-align:center}#su .fb.ok{background:#e1f8e8;border-color:#3fa862}#su .fb.no{background:#ffe7e4;border-color:#e0675d}#su .fb b{font-size:1.2em}#su .fb .cw{color:#b3200f;font-size:1.05em}#su .fb .bn{color:#a05a00}
#su .stamp{display:inline-block;border:4px solid #d93a2f;color:#d93a2f;border-radius:10px;padding:.02em .5em;font-size:clamp(20px,5vmin,34px);font-weight:800;letter-spacing:.06em;transform:rotate(-8deg);animation:supop .45s ease-out}
#su .ft{flex:0 0 auto;display:flex;gap:10px;justify-content:center;align-items:stretch;flex-wrap:wrap}
#su .btn{border:0;border-radius:999px;padding:.5em 1.2em;font-size:clamp(14px,3vmin,22px);font-weight:800;cursor:pointer;background:#ffd23f;color:#3a2a00;box-shadow:0 .14em 0 #b58a00;min-height:clamp(44px,9vmin,60px);width:max-content}#su .btn.sc{background:#fff;color:#23356b;box-shadow:0 .14em 0 #9db6dc;border:2px solid #9db6dc}#su .btn.go{background:#3fd27a;color:#05361a;box-shadow:0 .14em 0 #1d8a4c;flex:1 1 auto;max-width:360px}#su .btn:disabled{opacity:.5;cursor:default}
#su .hn{flex:0 0 auto;text-align:center;font-size:clamp(11px,2.3vmin,15px);opacity:.75;font-weight:600}
#su .rl{flex:0 0 auto;height:clamp(14px,3vmin,22px);border-radius:3px;background-color:#ffd96a;background-image:repeating-linear-gradient(90deg,#7a5a00 0,#7a5a00 2px,transparent 2px,transparent 12px);background-size:100% 40%;background-repeat:repeat-x;box-shadow:0 2px 0 #c9a02c;opacity:.9}
#su .ct{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2vmin,16px);text-align:center;overflow:auto}
#su h2{margin:0;font-size:clamp(22px,5.4vmin,40px);background:linear-gradient(transparent 58%,#ffe66d 58%);padding:0 .25em}#su .big{font-size:clamp(16px,3.8vmin,28px);font-weight:700}#su .sm{font-size:clamp(12px,2.6vmin,18px);font-weight:600;opacity:.88;max-width:34em}
#su .lvs{display:flex;flex-direction:column;gap:clamp(8px,2vmin,14px);width:min(92%,440px)}
#su .lv{background:#fff;color:#23356b;border:3px solid #7da7d9;border-radius:16px;padding:.45em 1em;font-size:clamp(17px,3.8vmin,28px);font-weight:800;cursor:pointer;display:flex;flex-direction:column;align-items:center;box-shadow:3px 4px 0 rgba(35,53,107,.25)}#su .lv small{font-size:.55em;font-weight:600;opacity:.75}#su .lv:disabled{opacity:.45;cursor:default;box-shadow:none}
#su .gc{width:clamp(88px,22vmin,150px);height:clamp(88px,22vmin,150px);border-radius:50%;background:#fff;color:#23356b;border:5px solid #d93a2f;display:flex;align-items:center;justify-content:center;font-size:clamp(30px,9vmin,60px);font-weight:800;flex:0 0 auto;transform:rotate(-6deg)}#su .gc.f{color:#c0332d}
#su .sb2{display:inline-block;padding:.2em 1em;border-radius:999px;font-weight:800;font-size:clamp(15px,3.4vmin,26px);background:#3fbf6b;color:#fff}#su .sb2.f{background:#e5564f}
#su .rw{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
#su .rv{width:min(100%,560px);max-height:30vh;overflow:auto;background:rgba(255,255,255,.85);border:2px solid #b9d3ee;border-radius:14px;padding:.3em .7em;text-align:left;flex:0 1 auto;min-height:60px}
#su .rr{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:.3em 0;border-bottom:1px solid #d6e4f5;font-size:clamp(12px,2.7vmin,18px)}#su .rr:last-child{border:0}#su .rr small{display:block;font-size:.88em;opacity:.9}#su .rr small.cw{color:#b3200f;font-weight:700}
#su .rr i{font-style:normal;font-weight:800;flex:0 0 auto;padding:.1em .6em;border-radius:99px;font-size:.9em;color:#fff}#su .rr i.ok{background:#3fbf6b}#su .rr i.no{background:#d94a44}
#su .cf{position:absolute;inset:0;z-index:5;background:rgba(20,30,70,.6);display:flex;align-items:center;justify-content:center;padding:20px}#su .cf>div{background:#fff;color:#23356b;border:3px solid #7da7d9;border-radius:18px;padding:1.2em 1.4em;width:min(92vw,420px);text-align:center;font-size:clamp(14px,3vmin,22px);font-weight:600}#su .cf p{margin:0 0 .8em}
@media (orientation:landscape) and (max-height:540px){#su{--m:54px;gap:5px;padding-top:max(6px,env(safe-area-inset-top));padding-bottom:max(6px,env(safe-area-inset-bottom))}#su .hn,#su .rl,#su .pr,#su .lb{display:none}#su .ti{font-size:clamp(14px,4vh,20px)}#su .mw{flex-direction:row;align-items:stretch;gap:14px}#su .lf{flex:1.35 1 0;min-width:0}#su .rt{flex:1 1 0;min-width:0;justify-content:center}#su .pc{min-height:40px;font-size:clamp(14px,4.4vh,20px)}#su .az{min-height:calc(40px*2 + 20px)}#su .pp{min-height:calc(40px + 20px)}#su .btn{min-height:40px;padding:.3em .9em;font-size:clamp(13px,3.6vh,18px)}#su .fb{min-height:44px;font-size:clamp(12px,3.4vh,17px)}#su .hd{font-size:clamp(12px,3.6vh,18px)}#su .pl{padding:.15em .8em}}`;
const GOOD=['Betul!','Hebat!','Bagus!','Tahniah!'],FINAL={'A+':'Cemerlang! Anda mahir menyusun ayat.','A':'Sangat baik! Teruskan usaha.','B+':'Bagus! Anda semakin mahir.','B':'Usaha yang baik. Teruskan berlatih.','C':'Tahniah, anda lulus!'},FAILTXT='Jangan putus asa. Teruskan berlatih untuk meningkatkan kemahiran.',RES={'A+':'Cemerlang','A':'Sangat Baik','B+':'Baik','B':'Memuaskan','C':'Lulus'},RESF='Perlu Latihan';
const PENCIL='<svg viewBox="0 0 48 16" aria-hidden="true"><rect x="0" y="3" width="8" height="10" rx="2" fill="#f4a3b3"/><rect x="8" y="3" width="4" height="10" fill="#c0c7d1"/><rect x="12" y="3" width="24" height="10" fill="#ffd23f"/><polygon points="36,3 48,8 36,13" fill="#f2d3a5"/><polygon points="43,6 48,8 43,10" fill="#3a3a3a"/></svg>';
let root,S=null,opt={},scr='',el=null,keyOn=false,dlg=false,dr=null;
const D=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const FB0='Pilih potongan untuk menyusun ayat.';
function build(){if(root)return;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);root=document.createElement('div');root.id='su';document.body.appendChild(root)}
function bestTxt(l){const r=cur&&cur.quiz&&cur.quiz.bm&&cur.quiz.bm[l];return r&&r.g?'Terbaik: '+r.best+'/'+QCFG.max+' · '+r.g:'Belum dimainkan'}
/* ---- screens ---- */
function menu(){endDrag();scr='menu';el=null;root.innerHTML='';const h=D('div','hd'),b=D('button','pl','Kembali');b.onclick=close;h.append(b,D('span',null,''));
 const c=D('div','ct');c.append(D('h2',null,'Susun Ayat Bahasa Melayu'),D('div','big',opt.lock?'Tahap anda: '+SUSLV[opt.lock]:'Pilih tahap'),D('div','sm','Pilih potongan untuk memasukkannya ke dalam ayat, atau seret potongan ke ruang jawapan. Pilih Semak Jawapan apabila siap. 10 soalan setiap pusingan, 2 percubaan setiap soalan. 1 petunjuk percuma, dan petunjuk bonus untuk jawapan betul berturut-turut.'));
 const w=D('div','lvs');Object.keys(SUSLV).forEach(l=>{const e=D('button','lv',SUSLV[l]),sm=D('small',null,opt.lock&&opt.lock!=l?'Dikunci mengikut tahap anda':'Bonus petunjuk setiap '+SUSCFG.streak[l]+' betul berturut-turut · '+bestTxt(l));e.append(sm);if(opt.lock&&opt.lock!=l)e.disabled=true;else e.onclick=()=>start(l);w.append(e)});c.append(w);root.append(h,c);const f=w.querySelector('button:not(:disabled)');if(f)f.focus()}
function start(l){S=SUSL.newSession(l);if(!S)return;question()}
function question(){endDrag();scr='q';dlg=false;const q=SUSL.cur(S);root.innerHTML='';
 const h=D('div','hd'),x=D('button','pl','Kembali');x.onclick=ask;const pg=D('span','pl st','Soalan '+(S.i+1)+'/'+S.qs.length),mk=D('span','pl st','');h.append(x,pg,mk);
 const ti=D('div','ti');ti.innerHTML=PENCIL;ti.append(D('span',null,'Susun Ayat Bahasa Melayu · '+SUSLV[S.level]));
 const tm=D('div','tm'),sk=D('span','sk',''),stk=D('span','stk','');tm.append(sk,stk);
 const pr=D('div','pr','Susun potongan menjadi ayat yang betul.'),az=D('div','az'),lb=D('div','lb','POTONGAN AYAT'),pp=D('div','pp');
 const fb=D('div','fb');fb.setAttribute('role','status');fb.setAttribute('aria-live','polite');fb.textContent=FB0;
 const ft=D('div','ft'),clr=D('button','btn sc','Kosongkan'),hb=D('button','btn sc',''),sub=D('button','btn go','Semak Jawapan');clr.onclick=doClear;hb.onclick=doHint;sub.onclick=doCheck;ft.append(clr,hb,sub);
 const hn=D('div','hn','Pilih potongan untuk meletakkannya. Seret untuk menukar susunan. Potongan yang dikunci oleh petunjuk tidak boleh dialih.'),rl=D('div','rl');
 const lf=D('div','lf'),rt=D('div','rt'),mw=D('div','mw');lf.append(pr,az,lb,pp);rt.append(fb,ft);mw.append(lf,rt);root.append(h,ti,tm,mw,hn,rl);
 el={mk,sk,stk,az,pp,fb,ft,clr,hb,sub};paint()}
function card(q,id,where){const p=q.pcs.find(x=>x.id==id),lk=where=='a'&&q.slots.indexOf(id)<q.lock,b=D('button','pc'+(where=='a'?' an':'')+(lk?' lk':''),p.t);b.type='button';b.dataset.id=id;
 b.setAttribute('aria-label',p.t+(lk?' (dikunci oleh petunjuk)':where=='a'?': pilih untuk pulangkan':': pilih untuk letak'));b.disabled=q.status!='play';
 b.onpointerdown=ev=>pdown(ev,b,id,where,lk);b.onclick=ev=>{if(ev.detail===0)tap(id,where,lk)};return b}
function paint(){if(!el)return;const q=SUSL.cur(S);el.az.innerHTML='';el.pp.innerHTML='';el.az.className='az'+(q.status=='ok'?' ok':'');
 if(!q.slots.length){const e=D('div','em','Pilih atau seret potongan ke sini');el.az.append(e)}
 q.slots.forEach(id=>el.az.append(card(q,id,'a')));SUSL.pool(q).forEach(id=>el.pp.append(card(q,id,'p')));
 const left=q.status=='play';el.mk.textContent='Markah: '+S.marks;el.sk.textContent='Streak '+S.streak+'/'+SUSCFG.streak[S.level];el.stk.textContent='★'.repeat(S.marks)+'☆'.repeat(Math.max(0,S.qs.length-S.marks));
 el.hb.textContent='Petunjuk ('+S.hints+')';el.hb.disabled=S.hints<1||!left;el.clr.disabled=!left||q.slots.length<=q.lock;el.sub.disabled=!left}
function msg(k,t){el.fb.className='fb'+(k?' '+k:'');el.fb.dataset.k=k?'1':'';el.fb.innerHTML='';el.fb.append(typeof t=='string'?D('span',null,t):t)}
/* ---- tap and drag ---- */
function tap(id,where,lk){if(scr!='q'||dlg)return;const q=SUSL.cur(S);if(q.status!='play')return;
 if(lk){msg('','Potongan ini dikunci oleh petunjuk.');return}
 const ok=where=='p'?SUSL.place(q,id):SUSL.unplace(q,id);if(ok){paint();if(el.fb.dataset.k)msg('',FB0)}}
function pdown(ev,b,id,where,lk){if(scr!='q'||dlg||ev.button>0||dr)return;const q=SUSL.cur(S);if(q.status!='play')return;dr={id,where,lk,b,x:ev.clientX,y:ev.clientY,pid:ev.pointerId,on:false,g:null,idx:0,over:false,pool:false};
 try{b.setPointerCapture(ev.pointerId)}catch(e){}b.onpointermove=pmove;b.onpointerup=pup;b.onpointercancel=()=>endDrag()}
const inR=(r,x,y,m)=>x>=r.left-m&&x<=r.right+m&&y>=r.top-m&&y<=r.bottom+m;
function pmove(ev){if(!dr||ev.pointerId!=dr.pid)return;
 if(!dr.on){if(dr.lk||Math.hypot(ev.clientX-dr.x,ev.clientY-dr.y)<9)return;dr.on=true;const r=dr.b.getBoundingClientRect(),g=dr.b.cloneNode(true);g.className='pc gh';g.removeAttribute('aria-label');g.style.width=r.width+'px';g.style.left=r.left+'px';g.style.top=r.top+'px';dr.dx=ev.clientX-r.left;dr.dy=ev.clientY-r.top;root.append(g);dr.g=g;dr.b.classList.add('dg')}
 ev.preventDefault();dr.g.style.left=(ev.clientX-dr.dx)+'px';dr.g.style.top=(ev.clientY-dr.dy)+'px';
 const a=el.az.getBoundingClientRect(),p=el.pp.getBoundingClientRect();dr.over=inR(a,ev.clientX,ev.clientY,14);dr.pool=!dr.over&&inR(p,ev.clientX,ev.clientY,6);
 el.az.classList.toggle('ov',dr.over);el.az.classList.remove('ie');el.az.querySelectorAll('.ib').forEach(n=>n.classList.remove('ib'));
 if(dr.over){const cs=[...el.az.querySelectorAll('.pc:not(.dg)')];let k=cs.length;for(let i=0;i<cs.length;i++){const r=cs[i].getBoundingClientRect();if(ev.clientY<r.top||(ev.clientY<=r.bottom&&ev.clientX<r.left+r.width/2)){k=i;break}}
  dr.idx=k;if(k<cs.length)cs[k].classList.add('ib');else el.az.classList.add('ie')}}
function pup(ev){if(!dr||ev.pointerId!=dr.pid)return;const d=dr;endDrag();if(!d.on){tap(d.id,d.where,d.lk);return}
 const q=SUSL.cur(S);let ch=false;if(d.over)ch=d.where=='p'?SUSL.place(q,d.id,d.idx):SUSL.move(q,d.id,d.idx);else if(d.pool&&d.where=='a')ch=SUSL.unplace(q,d.id);
 paint();if(ch&&el.fb.dataset.k)msg('',FB0)}
function endDrag(){if(!dr)return;const d=dr;dr=null;if(d.g)d.g.remove();if(d.b){d.b.classList.remove('dg');d.b.onpointermove=d.b.onpointerup=d.b.onpointercancel=null;try{d.b.releasePointerCapture(d.pid)}catch(e){}}if(el&&el.az){el.az.classList.remove('ov','ie');el.az.querySelectorAll('.ib').forEach(n=>n.classList.remove('ib'))}}
/* ---- buttons ---- */
function doClear(){if(scr!='q'||dlg)return;if(SUSL.clear(SUSL.cur(S))){paint();msg('',FB0)}}
function doHint(){if(scr!='q'||dlg)return;const k=SUSL.hint(S);if(k<0)return;paint();msg('','Petunjuk: satu potongan diletakkan dan dikunci. Teruskan menyusun!')}
function doCheck(){if(scr!='q'||dlg)return;const q=SUSL.cur(S),r=SUSL.check(S);if(r.r=='locked')return;
 if(r.r=='incomplete'){msg('no','Lengkapkan ayat dahulu: letakkan semua potongan ke dalam ruang jawapan.');return}
 paint();try{r.r=='ok'?(tone(660,0,.09,'sine',.14),tone(880,.09,.12,'sine',.14),tone(1175,.2,.16,'sine',.12)):tone(220,0,.22,'sawtooth',.09)}catch(e){}
 if(r.r=='retry'){el.az.classList.add('no');setTimeout(()=>{if(el&&el.az)el.az.classList.remove('no')},450);msg('no','Belum tepat. Susun semula dan cuba lagi. Baki percubaan: '+r.left+'.');return}
 el.fb.innerHTML='';el.fb.dataset.k='1';el.fb.className='fb '+(r.r=='ok'?'ok':'no');
 if(r.r=='ok'){el.fb.append(D('span','stamp','BAGUS!'),D('span',null,GOOD[Math.floor(Math.random()*GOOD.length)]+' +1 markah'));if(r.bonus)el.fb.append(D('span','bn','+1 Petunjuk diperoleh!'))}
 else el.fb.append(D('b',null,'Belum betul.'),D('span',null,'Ayat yang betul ialah:'),D('span','cw',q.s));
 el.ft.innerHTML='';const n=D('button','btn go',S.i>=S.qs.length-1?'Lihat Keputusan':'Soalan Seterusnya');n.onclick=next;el.ft.append(n);n.focus()}
function next(){if(scr!='q'||!SUSL.advance(S))return;if(S.done)result();else question()}
function result(){endDrag();scr='res';el=null;const g=quizGrade(S.marks);recQuiz('bm',S.level,S.marks);root.innerHTML='';const c=D('div','ct'),wrong=S.qs.length-S.marks;
 c.append(D('div','big','Susun Ayat Bahasa Melayu · '+SUSLV[S.level]),D('div','gc'+(g.pass?'':' f'),g.g),D('div','big',g.marks+'/'+QCFG.max+' · '+g.pct+'%'),D('div','sb2'+(g.pass?'':' f'),(g.pass?'LULUS · ':'GAGAL · ')+(RES[g.g]||RESF)),D('div','sm',FINAL[g.g]||FAILTXT),D('div','sm','Betul: '+S.marks+' · Salah: '+wrong));
 const rv=D('div','rv');S.qs.forEach((q,k)=>{const r=D('div','rr'),l=D('div');l.append(D('span',null,(k+1)+'. '+q.s));if(q.status!='ok'){l.append(D('small',null,'Jawapan anda: '+(q.given||'(tiada)')));l.append(D('small','cw','Jawapan betul: '+q.s))}else if(q.tries>0||q.hinted)l.append(D('small',null,q.hinted?'Dengan petunjuk':'Betul pada percubaan kedua'));
  r.append(l,D('i',q.status=='ok'?'ok':'no',q.status=='ok'?'Betul':'Salah'));rv.append(r)});c.append(rv);
 const w=D('div','rw'),a=D('button','btn','Main Lagi'),b=D('button','btn sc','Kembali ke Pilihan Tahap');a.onclick=()=>start(S.level);b.onclick=menu;w.append(a,b);c.append(w);root.append(c);a.focus();
 if(opt.onDone)opt.onDone({sub:'bm',level:S.level,marks:g.marks,pct:g.pct,g:g.g,pass:g.pass})}
function ask(){if(scr!='q'||dlg)return;endDrag();dlg=true;const c=D('div','cf'),b=D('div'),r=D('div','rw'),k=D('button','btn','Teruskan Main'),o=D('button','btn sc','Kembali');b.append(D('p',null,'Kembali ke pilihan tahap? Markah pusingan ini tidak akan disimpan.'));
 k.onclick=()=>{c.remove();dlg=false};o.onclick=()=>{dlg=false;menu()};r.append(k,o);b.append(r);c.append(b);root.append(c);k.focus()}
/* ---- input ---- */
function keys(e){if(!root||root.style.display!='flex')return;const k=e.key;
 if(k=='Escape'){e.preventDefault();e.stopPropagation();back();return}
 if(scr=='q'&&!dlg){const isB=e.target&&e.target.tagName=='BUTTON';if(k=='Enter'&&!isB){e.preventDefault();e.stopPropagation();if(SUSL.cur(S).status=='play')doCheck();else next()}}
 else if(scr=='menu'&&k.length==1&&'123'.includes(k)){const l=Object.keys(SUSLV)[+k-1];if(!(opt.lock&&opt.lock!=l)){e.preventDefault();e.stopPropagation();start(l)}}}
function onVV(){if(!root||root.style.display!='flex')return;const v=window.visualViewport;root.style.height=v?Math.round(v.height)+'px':'100%';root.style.top=v?Math.round(v.offsetTop)+'px':'0'}
function open(o){build();opt=o;S=null;root.style.display='flex';if(!keyOn){addEventListener('keydown',keys,true);addEventListener('resize',onVV);if(window.visualViewport)window.visualViewport.addEventListener('resize',onVV);keyOn=true}onVV();menu()}
function close(){endDrag();if(!root)return;root.style.display='none';root.innerHTML='';if(keyOn){removeEventListener('keydown',keys,true);removeEventListener('resize',onVV);if(window.visualViewport)window.visualViewport.removeEventListener('resize',onVV);keyOn=false}scr='';el=null;S=null;const f=opt.onClose;if(f)f()}
function back(){if(!root||root.style.display!='flex')return;if(dr){endDrag();return}if(dlg){const k=root.querySelector('.cf button');if(k)k.click();return}if(scr=='q')ask();else if(scr=='res')menu();else close()}
return{open,close,back,isOpen:()=>!!root&&root.style.display=='flex'};
})();
