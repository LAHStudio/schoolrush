/* Round 10i: Sains, station Papan Putih = Kitaran Kehidupan (screen). Data + logic: js/kelas-sains-data.js (SAND, SANL, SANC). Grade scale: QCFG/quizGrade in js/kelas-quiz-data.js. Result saving: recQuiz() in js/kelas-quiz.js.
   Same open API as QZ, SP and SUS: SAP.open({sub, lock, onClose()}), back(), isOpen(). The station has one difficulty (Mudah), so there is no level menu and lock is not needed.
   No onDone on purpose: the Sains class grade and the door rule wait until all 3 stations exist (Round 10k).
   Look: a whiteboard (white board, dark frame, blue marker text), all CSS, no image files. Round 10i2: every card has its SVG picture (big) above a smaller label (js/kelas-sains-art.js, sainsArt(id)); after Semak Jawapan the 5 pictures show again in the correct order with arrows and a return arrow, in the box where the cards were, with the explanation under it.
   Input: a short press on a pool card puts it in the first empty slot, a short press on a card in a slot sends it back. A longer move drags it to a chosen slot (swap if taken) or back to the pool.
   Semak Jawapan checks once per cycle (no second marks); Cuba Semula clears the slots before checking. Each cycle is shown with its marks and a short explanation. */
const SAP=(()=>{
const CSS=`#sains{position:fixed;left:0;right:0;top:0;height:100%;z-index:60;display:none;flex-direction:column;gap:clamp(6px,1.5vmin,12px);box-sizing:border-box;padding:max(10px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));background:#3b4350;color:#1c2f6b;font-family:Fredoka,sans-serif;overflow:hidden}
#sains *{box-sizing:border-box}#sains button{font-family:inherit}#sains button:focus-visible{outline:4px solid #ff9f1c;outline-offset:2px}
@keyframes spsh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}@media (prefers-reduced-motion:reduce){#sains *{animation:none!important;transition:none!important}}
#sains .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:0 0 auto;font-size:clamp(13px,2.8vmin,20px);font-weight:600;color:#fff}
#sains .xpl{background:#fff;border:2px solid #9db6dc;color:#1c2f6b;border-radius:999px;padding:.25em .9em;font-size:1em;font-weight:600;cursor:pointer;width:max-content;flex:0 0 auto}#sains .xpl.st{cursor:default}
#sains .xbd{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:clamp(6px,1.5vmin,12px);background:#f7f8f4;border:clamp(5px,1.2vmin,10px) solid #2b2b2b;border-radius:14px;padding:clamp(8px,2vmin,18px);overflow:auto}
#sains .xbd>*{flex-shrink:0}#sains .ti{flex:0 0 auto;font-size:clamp(17px,4vmin,30px);font-weight:700;color:#2a49a8}#sains .pr{flex:0 0 auto;font-size:clamp(13px,3vmin,21px);font-weight:600}
#sains .xlb{font-size:clamp(11px,2.3vmin,15px);font-weight:700;opacity:.75;letter-spacing:.04em}
#sains .sl{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(5px,1.4vmin,10px)}
#sains .sw{display:flex;flex-direction:column;gap:3px;min-width:0}#sains .sn{text-align:center;font-weight:800;font-size:clamp(11px,2.4vmin,16px);color:#2a49a8}
#sains .xsk{position:relative;min-height:clamp(90px,22vmin,170px);border:3px dashed #7da7d9;border-radius:10px;background:#fff;display:flex;align-items:stretch;justify-content:center;transition:background .15s}#sains .xsk.ov{background:#fff3b0;border-color:#e8a317}#sains .xsk.no{animation:spsh .4s}
#sains .xsk.ok{border-style:solid;border-color:#2f9e5b;background:#e1f8e8}#sains .xsk.bad{border-style:solid;border-color:#d1473f;background:#ffe7e4}
#sains .xim{display:block;flex:0 0 auto;width:clamp(54px,15vmin,118px);aspect-ratio:1/1;pointer-events:none}#sains .xim svg{display:block;width:100%;height:100%}#sains .xtx{display:block;min-width:0;pointer-events:none}
#sains .xdn{background:#fffbea;border-color:#e8b84a;justify-content:center;align-items:flex-start;gap:clamp(2px,1vmin,8px)}#sains .xsi{display:flex;flex-direction:column;align-items:center;gap:1px}#sains .xsi .xim{width:clamp(42px,11vmin,84px)}#sains .xnm{font-weight:800;font-size:clamp(11px,2.3vmin,16px);color:#2a49a8}#sains .xar{align-self:center;font-weight:800;font-size:clamp(14px,3.4vmin,24px);color:#2a49a8}
#sains .mk{position:absolute;top:-11px;right:-7px;z-index:2;width:1.6em;height:1.6em;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#fff;border:2px solid #14501f;color:#14501f;font-size:clamp(13px,3vmin,19px);font-weight:800;line-height:1}#sains .xsk.bad .mk{border-color:#9a2b24;color:#9a2b24}
#sains .em{align-self:center;font-size:clamp(11px,2.3vmin,15px);font-weight:600;opacity:.4}
#sains .cd{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;flex:1 1 auto;min-width:0;margin:0;padding:.3em .3em .35em;border:2px solid #9db6dc;border-radius:8px;background:#fff;color:#1c2f6b;font-size:clamp(10px,2.1vmin,14px);font-weight:700;line-height:1.1;box-shadow:1px 3px 0 rgba(28,47,107,.28);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;text-align:center;overflow-wrap:break-word;word-break:normal;position:relative}
#sains .xsk .cd{border-color:#e8b84a;background:#fffbd6;box-shadow:none;border-radius:6px}#sains .cd:disabled{cursor:default;color:#1c2f6b}#sains .cd.dg{opacity:.28}
#sains .cd.gh{position:fixed;z-index:90;pointer-events:none;transform:rotate(-3deg) scale(1.06);box-shadow:4px 8px 14px rgba(0,0,0,.3);opacity:.96;flex:none}
#sains .xpp{display:flex;flex-wrap:wrap;gap:clamp(6px,1.6vmin,10px);min-height:clamp(52px,10vmin,76px);padding:8px;border-radius:10px;background:rgba(125,167,217,.14);border:2px solid rgba(125,167,217,.45)}#sains .xpp .cd{flex:0 1 auto;width:clamp(96px,22vmin,170px)}
#sains .fb{flex:0 0 auto;min-height:clamp(40px,8vmin,60px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:clamp(12px,2.8vmin,19px);font-weight:600;background:#fff;border:2px solid #b9d3ee;border-radius:12px;padding:.35em .8em;text-align:center}
#sains .fb.ok{background:#e1f8e8;border-color:#2f9e5b}#sains .fb.no{background:#fff0dc;border-color:#e2893a}#sains .fb b{font-size:1.15em}#sains .fb .cw{color:#14501f;font-weight:700}
#sains .ft{flex:0 0 auto;display:flex;gap:10px;justify-content:center;align-items:stretch;flex-wrap:wrap}
#sains .btn{border:0;border-radius:999px;padding:.5em 1.2em;font-size:clamp(14px,3vmin,22px);font-weight:800;cursor:pointer;background:#ffd23f;color:#3a2a00;box-shadow:0 .14em 0 #b58a00;min-height:clamp(44px,9vmin,60px);width:max-content}#sains .btn.sc{background:#fff;color:#1c2f6b;box-shadow:0 .14em 0 #9db6dc;border:2px solid #9db6dc}#sains .btn.go{background:#3fd27a;color:#05361a;box-shadow:0 .14em 0 #1d8a4c}#sains .btn:disabled{opacity:.5;cursor:default}
#sains .ct{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(6px,1.6vmin,12px);text-align:center;background:#f7f8f4;border:clamp(5px,1.2vmin,10px) solid #2b2b2b;border-radius:14px;padding:clamp(10px,2.4vmin,22px)}
#sains .ct h2{margin:0;font-size:clamp(20px,5vmin,34px);color:#2a49a8}#sains .big{font-size:clamp(16px,3.8vmin,28px);font-weight:700}#sains .sm{font-size:clamp(12px,2.7vmin,18px);font-weight:600;max-width:36em}
#sains .gc{font-size:clamp(38px,11vmin,80px);font-weight:800;color:#2f9e5b;line-height:1}#sains .gc.f{color:#d1473f}
#sains .xrw{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
#sains .rv{width:min(100%,520px);background:#fff;border:2px solid #b9d3ee;border-radius:12px;padding:.3em .7em;text-align:left}
#sains .rr{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:.3em 0;border-bottom:1px solid #d6e4f5;font-size:clamp(12px,2.7vmin,18px)}#sains .rr:last-child{border:0}
#sains .rr i{font-style:normal;font-weight:800;flex:0 0 auto;padding:.1em .6em;border-radius:99px;font-size:.9em;color:#fff;background:#2f9e5b}#sains .rr i.no{background:#d1473f}
#sains .cf{position:absolute;inset:0;z-index:5;background:rgba(20,30,70,.6);display:flex;align-items:center;justify-content:center;padding:20px}#sains .cf>div{background:#fff;color:#1c2f6b;border:3px solid #7da7d9;border-radius:18px;padding:1.2em 1.4em;width:min(92vw,420px);text-align:center;font-size:clamp(14px,3vmin,22px);font-weight:600}#sains .cf p{margin:0 0 .8em}
@media (max-width:640px) and (orientation:portrait){#sains .xl1{display:none}#sains .pr{font-size:clamp(12px,3.1vw,16px)}#sains .sl{grid-template-columns:1fr;gap:clamp(6px,1.1vh,10px)}#sains .sw{flex-direction:row;align-items:stretch;gap:8px}#sains .sn{flex:0 0 1.5em;align-self:center;font-size:clamp(14px,3.6vmin,20px)}#sains .xsk{flex:1 1 auto;min-height:clamp(54px,8.2vh,76px)}#sains .xsk .cd{flex-direction:row;align-items:center;text-align:left;gap:10px;padding:.15em .6em .15em .25em}#sains .xsk .xim{width:clamp(44px,7.6vh,68px)}#sains .xsk .xtx{flex:1 1 auto;font-size:clamp(12px,3.5vw,16px)}#sains .xpp .cd{width:clamp(88px,27vw,124px)}#sains .xpp .xim{width:clamp(44px,7vh,64px)}#sains .xpp{min-height:0}#sains .xsi .xim{width:clamp(34px,9.6vw,42px)}#sains .xdn{gap:2px}#sains .xar{font-size:13px}#sains .fb{min-height:clamp(32px,4.5vh,44px)}}
@media (orientation:landscape) and (max-height:540px){#sains{gap:5px;padding-top:max(6px,env(safe-area-inset-top));padding-bottom:max(6px,env(safe-area-inset-bottom))}#sains .pr,#sains .xlb{display:none}#sains .ti{font-size:clamp(14px,4vh,20px)}#sains .xim{width:clamp(34px,13vh,52px)}#sains .xsk{min-height:calc(clamp(34px,13vh,52px) + 34px)}#sains .xsi .xim{width:clamp(30px,10vh,44px)}#sains .xpp{min-height:46px}}
#sains .sl{position:relative;display:block;width:min(100%,440px,calc(100vh - 300px));min-width:210px;aspect-ratio:1/1;margin:0 auto;gap:0}#sains .sl .xrg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#sains .sl .sw{position:absolute;display:block;width:27%;aspect-ratio:1/1;transform:translate(-50%,-50%);z-index:1}
#sains .sl .sn{position:absolute;top:-8px;left:-8px;z-index:3;width:1.7em;height:1.7em;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#2a49a8;color:#fff;font-size:clamp(11px,2.4vmin,15px);flex:none;align-self:auto}
#sains .sl .xsk{height:100%;min-height:0;flex:none}#sains .sl .xsk .cd{flex-direction:column;align-items:center;text-align:center;justify-content:center;gap:1px;padding:.15em;font-size:clamp(9px,min(2.6vw,2.6vh),13px)}#sains .sl .xsk .xim{width:60%}#sains .sl .xsk .xtx{flex:0 0 auto;font-size:inherit;line-height:1.05}#sains .sl .em{font-size:clamp(9px,2vmin,13px)}
#sains .xlf,#sains .xrr{display:contents}#sains .ti{order:1}#sains .pr{order:2}#sains .xl1{order:3}#sains .sl{order:4}#sains .xlb:not(.xl1){order:5}#sains .xpp{order:6}#sains .fb{order:7}
@media (orientation:landscape){#sains .xbd{flex-direction:row;align-items:flex-start;gap:clamp(10px,3vmin,24px)}#sains .xlf{display:flex;flex-direction:column;gap:clamp(6px,1.5vmin,12px);flex:0 0 38%;min-width:0}#sains .xrr{display:flex;flex-direction:column;align-items:center;gap:clamp(4px,1vmin,8px);flex:1 1 auto;min-width:0}#sains .xlf>.ti{order:1}#sains .xlf>.pr{order:2}#sains .xlf>.xlb:not(.xl1){order:3}#sains .xlf>.xpp{order:4}#sains .xlf>.fb{order:5}#sains .xrr>.xl1{order:1}#sains .xrr>.sl{order:2}#sains .xlf>.xpp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}#sains .xlf>.xpp .cd{width:auto}#sains .xlf>.xpp .xim{width:clamp(40px,10vh,70px)}#sains .sl{width:min(100%,640px,calc(100vh - 250px))}}
@media (max-width:640px) and (orientation:portrait){#sains .sl{width:min(100%,calc(100vh - 480px));min-width:210px}#sains .xpp .cd{width:calc((100% - 20px)/3)}}
@media (orientation:landscape) and (max-height:540px){#sains .xbd{padding:6px 10px}#sains .sl{width:min(100%,calc(100vh - 140px));min-width:170px}#sains .xlf>.xpp{gap:4px;padding:4px;grid-template-columns:repeat(3,minmax(0,1fr))}#sains .xlf>.xpp .xim{width:clamp(26px,9vh,38px)}#sains .sl .sn{top:-6px;left:-6px}}`;
let root,S=null,opt={},scr='',el=null,keyOn=false,dlg=false,dr=null;
const D=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const FB0='Pilih kad untuk meletakkannya di petak, atau seret kad ke petak yang anda mahu.';
const FINAL={'A+':'Cemerlang! Anda mahir kitaran hidup.','A':'Sangat baik! Teruskan usaha.','B+':'Bagus! Anda semakin mahir.','B':'Usaha yang baik. Teruskan berlatih.','C':'Tahniah, anda lulus!'},FAILTXT='Jangan putus asa. Cuba lagi untuk menambah markah.';
function bestTxt(){const r=cur&&cur.quiz&&cur.quiz[SANC.key]&&cur.quiz[SANC.key][SANC.level];return r&&r.g?'Terbaik: '+r.best+'/'+QCFG.max+' · '+r.g:'Belum dimainkan'}
function build(){if(root)return;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);root=document.createElement('div');root.id='sains';document.body.appendChild(root)}
/* ---- screens ---- */
function intro(){endDrag();scr='intro';el=null;S=null;root.innerHTML='';const h=D('div','hd'),b=D('button','xpl','Kembali');b.onclick=close;h.append(b,D('span',null,'Papan Putih'));
 const c=D('div','ct');c.append(D('h2',null,'Kitaran Kehidupan'),D('div','big','Tahap: Mudah'),D('div','sm','Susun 5 peringkat hidup dalam 3 kitaran: katak, tumbuhan berbunga dan ayam. Pilih kad untuk meletakkannya di petak, atau seret kad ke petak yang anda mahu. Pilih Semak Jawapan apabila siap. Setiap kad yang betul dapat 2 markah, jumlah 30 markah.'),D('div','sm',bestTxt()));
 const w=D('div','xrw'),a=D('button','btn go','Mula'),k=D('button','btn sc','Tutup');a.onclick=start;k.onclick=close;w.append(a,k);c.append(w);root.append(h,c);a.focus()}
function start(){S=SANL.newSession();cycle()}
function card(id,where){const q=SANL.cur(S),b=D('button','cd'),im=D('span','xim');b.type='button';im.setAttribute('aria-hidden','true');im.innerHTML=typeof sainsArt=='function'?sainsArt(id):'';b.append(im,D('span','xtx',SANL.label(q,id)));b.dataset.id=id;if(q.status!='play')b.disabled=true;else{b.onpointerdown=ev=>pdown(ev,b,id,where);b.onclick=ev=>{if(ev.detail===0)tap(id,where)}}return b}
const RR=36;
function ringArrows(){const d=D('div','xrg'),n=SANC.slots,pt=(deg)=>{const a=deg*Math.PI/180;return(50+RR*Math.cos(a)).toFixed(2)+' '+(50+RR*Math.sin(a)).toFixed(2)};let h='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="display:block;width:100%;height:100%" aria-hidden="true"><defs><marker id="sgarw" viewBox="0 0 10 10" refX="6" refY="5" markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#f5a623"/></marker></defs><circle cx="50" cy="50" r="'+(RR-17)+'" fill="none" stroke="#dbe7f5" stroke-width="1.2" stroke-dasharray="2 3"/><text x="50" y="56" text-anchor="middle" font-size="18" fill="#f5c46b">\u21BB</text>';for(let k=0;k<n;k++){const b=-90+k*360/n,w=360/n;h+='<path d="M'+pt(b+w*.36)+' A'+RR+' '+RR+' 0 0 1 '+pt(b+w*.64)+'" fill="none" stroke="#f5a623" stroke-width="2.4" stroke-linecap="round" marker-end="url(#sgarw)"/>'}d.innerHTML=h+'</svg>';return d}
function cycle(){endDrag();scr='q';dlg=false;const q=SANL.cur(S);root.innerHTML='';
 const h=D('div','hd'),x=D('button','xpl','Kembali');x.onclick=ask;const mk=D('span','xpl st','Markah: '+S.marks+'/'+SANC.max);h.append(x,D('span','xpl st','Kitaran '+(S.i+1)+'/'+S.qs.length),mk);
 const bd=D('div','xbd'),ti=D('div','ti',q.d.t),pr=D('div','pr',q.d.a),lb1=D('div','xlb xl1','PUSINGAN KITARAN (1 KE 5, IKUT ARAH JAM)'),sl=D('div','sl'),lb2=D('div','xlb','KAD PERINGKAT'),pp=D('div','xpp'),fb=D('div','fb'),ft=D('div','ft');
 fb.setAttribute('role','status');fb.setAttribute('aria-live','polite');fb.textContent=FB0;
 el={sl,pp,fb,ft,mk,lb1,lb2,sk:[]};
 sl.append(ringArrows());
 for(let k=0;k<SANC.slots;k++){const w=D('div','sw'),s=D('div','xsk'),a=(-90+k*360/SANC.slots)*Math.PI/180;w.style.left=(50+RR*Math.cos(a)).toFixed(2)+'%';w.style.top=(50+RR*Math.sin(a)).toFixed(2)+'%';s.dataset.i=k;el.sk.push(s);w.append(D('div','sn',String(k+1)),s);sl.append(w)}
 const lf=D('div','xlf'),rg=D('div','xrr');lf.append(ti,pr,lb2,pp,fb);rg.append(lb1,sl);bd.append(lf,rg);root.append(h,bd,ft);paint();
}
function paint(){const q=SANL.cur(S),done=q.status=='done';
 el.sk.forEach((s,k)=>{s.innerHTML='';s.className='xsk'+(done?(q.ok[k]?' ok':' bad'):'');const id=done?q.d.c[k][0]:q.slots[k];if(id){s.append(card(id,'s'));if(done)s.append(D('span','mk',q.ok[k]?'✔':'✘'))}else s.append(D('span','em','kosong'))});
 el.pp.innerHTML='';el.pp.className='xpp';el.pp.style.display=done?'none':'';el.lb2.style.display=done?'none':'';el.lb2.textContent='KAD PERINGKAT';el.lb1.textContent=done?'URUTAN BETUL (IKUT ARAH JAM, KEMBALI KE 1)':'PUSINGAN KITARAN (1 KE 5, IKUT ARAH JAM)';
 if(!done)SANL.pool(q).forEach(id=>el.pp.append(card(id,'p')));
 el.ft.innerHTML='';
 if(!done){const a=D('button','btn go','Semak Jawapan'),c=D('button','btn sc','Cuba Semula');a.onclick=doCheck;c.onclick=doClear;el.ft.append(a,c)}
 else{const n=D('button','btn go',S.i>=S.qs.length-1?'Lihat Keputusan':'Kitaran Seterusnya');n.onclick=next;el.ft.append(n)}}
function msg(k,t){el.fb.className='fb'+(k?' '+k:'');el.fb.innerHTML='';el.fb.textContent=t;delete el.fb.dataset.k}
/* ---- tap and drag ---- */
function tap(id,where){if(scr!='q'||dlg)return;const q=SANL.cur(S);if(q.status!='play')return;const ok=where=='p'?SANL.place(q,id):SANL.unplace(q,id);if(ok){paint();msg('',FB0)}}
function pdown(ev,b,id,where){if(scr!='q'||dlg||ev.button>0||dr)return;const q=SANL.cur(S);if(q.status!='play')return;dr={id,where,b,x:ev.clientX,y:ev.clientY,pid:ev.pointerId,on:false,g:null,slot:-1,pool:false};
 try{b.setPointerCapture(ev.pointerId)}catch(e){}b.onpointermove=pmove;b.onpointerup=pup;b.onpointercancel=()=>endDrag()}
const inR=(r,x,y,m)=>x>=r.left-m&&x<=r.right+m&&y>=r.top-m&&y<=r.bottom+m;
function pmove(ev){if(!dr||ev.pointerId!=dr.pid)return;
 if(!dr.on){if(Math.hypot(ev.clientX-dr.x,ev.clientY-dr.y)<9)return;dr.on=true;const r=dr.b.getBoundingClientRect(),g=dr.b.cloneNode(true);g.className='cd gh';g.style.width=r.width+'px';g.style.left=r.left+'px';g.style.top=r.top+'px';dr.dx=ev.clientX-r.left;dr.dy=ev.clientY-r.top;root.append(g);dr.g=g;dr.b.classList.add('dg')}
 ev.preventDefault();dr.g.style.left=(ev.clientX-dr.dx)+'px';dr.g.style.top=(ev.clientY-dr.dy)+'px';
 dr.slot=-1;el.sk.forEach((s,k)=>{const o=dr.slot<0&&inR(s.getBoundingClientRect(),ev.clientX,ev.clientY,8);if(o)dr.slot=k;s.classList.toggle('ov',o)});
 dr.pool=dr.slot<0&&inR(el.pp.getBoundingClientRect(),ev.clientX,ev.clientY,6)}
function pup(ev){if(!dr||ev.pointerId!=dr.pid)return;const d=dr;endDrag();if(!d.on){tap(d.id,d.where);return}
 const q=SANL.cur(S);let ch=false;if(d.slot>=0)ch=SANL.place(q,d.id,d.slot);else if(d.pool&&d.where=='s')ch=SANL.unplace(q,d.id);paint();if(ch)msg('',FB0)}
function endDrag(){if(!dr)return;const d=dr;dr=null;if(d.g)d.g.remove();if(d.b){d.b.classList.remove('dg');d.b.onpointermove=d.b.onpointerup=d.b.onpointercancel=null;try{d.b.releasePointerCapture(d.pid)}catch(e){}}if(el&&el.sk)el.sk.forEach(s=>s.classList.remove('ov'))}
/* ---- buttons ---- */
function doClear(){if(scr!='q'||dlg)return;if(SANL.clear(SANL.cur(S))){paint();msg('',FB0)}}
function doCheck(){if(scr!='q'||dlg)return;const q=SANL.cur(S),r=SANL.check(S);if(r.r=='locked')return;
 if(r.r=='incomplete'){el.sk.forEach(s=>{if(!s.querySelector('.cd')){s.classList.add('no');setTimeout(()=>{if(s)s.classList.remove('no')},450)}});msg('no','Lengkapkan semua 5 petak dahulu.');return}
 paint();try{r.marks==SANC.max/3?(tone(660,0,.09,'sine',.14),tone(880,.09,.12,'sine',.14),tone(1175,.2,.16,'sine',.12)):tone(r.marks>=6?660:260,0,.2,r.marks>=6?'sine':'sawtooth',.1)}catch(e){}
 el.mk.textContent='Markah: '+S.marks+'/'+SANC.max;
 const full=r.marks==SANC.max/3;el.fb.className='fb '+(full?'ok':'no');el.fb.innerHTML='';el.fb.dataset.k='1';
 el.fb.append(D('b',null,(full?'✔ Betul semua! ':'✘ Belum semua betul. ')+'Markah: '+r.marks+'/'+SANC.max/3));
 if(!full)el.fb.append(D('span','cw','Urutan betul: '+q.d.c.map((c,k)=>(k+1)+'. '+c[1]).join(' → ')));
 el.fb.append(D('span',null,q.d.e));const n=el.ft.querySelector('button');if(n)n.focus();if(el.fb.scrollIntoView)el.fb.scrollIntoView({block:'nearest'})}
function next(){if(scr!='q'||!SANL.advance(S))return;if(S.done)result();else cycle()}
function result(){endDrag();scr='res';el=null;const raw=S.marks,sc=SANL.scale(raw),g=quizGrade(sc),r=recQuiz(SANC.key,SANC.level,sc);root.innerHTML='';
 const h=D('div','hd');h.append(D('span',null,'Papan Putih'));const c=D('div','ct');
 c.append(D('h2',null,'Kitaran Kehidupan · Mudah'),D('div','gc'+(g.pass?'':' f'),g.g),D('div','big','Markah: '+raw+'/'+SANC.max),D('div','sm',(g.pass?'LULUS · ':'GAGAL · ')+(FINAL[g.g]||FAILTXT)),D('div','sm','Rekod terbaik: '+r.best+'/'+QCFG.max+' · '+r.g));
 const rv=D('div','rv');S.qs.forEach(q=>{const row=D('div','rr');row.append(D('span',null,q.d.t+': '+q.marks+'/'+SANC.max/3),D('i',q.marks==SANC.max/3?'':'no',q.marks==SANC.max/3?'Betul':'Ada salah'));rv.append(row)});c.append(rv);
 const w=D('div','xrw'),a=D('button','btn','Main Lagi'),k=D('button','btn sc','Tutup');a.onclick=start;k.onclick=close;w.append(a,k);c.append(w);root.append(h,c);a.focus();if(opt.onDone)opt.onDone({sc,raw,g:g.g})}
function ask(){if(scr!='q'||dlg)return;endDrag();dlg=true;const c=D('div','cf'),b=D('div'),r=D('div','xrw'),k=D('button','btn','Teruskan Main'),o=D('button','btn sc','Keluar');b.append(D('p',null,'Keluar dari kuiz ini? Markah pusingan ini tidak akan disimpan.'));
 k.onclick=()=>{c.remove();dlg=false};o.onclick=()=>{dlg=false;intro()};r.append(k,o);b.append(r);c.append(b);root.append(c);k.focus()}
/* ---- input ---- */
function keys(e){if(!root||root.style.display!='flex')return;const k=e.key;
 if(k=='Escape'){e.preventDefault();e.stopPropagation();back();return}
 if(scr=='q'&&!dlg){const isB=e.target&&e.target.tagName=='BUTTON';if(k=='Enter'&&!isB){e.preventDefault();e.stopPropagation();if(SANL.cur(S).status=='play')doCheck();else next()}}}
function onVV(){if(!root||root.style.display!='flex')return;const v=window.visualViewport;root.style.height=v?Math.round(v.height)+'px':'100%';root.style.top=v?Math.round(v.offsetTop)+'px':'0'}
function open(o){build();opt=o||{};S=null;root.style.display='flex';if(!keyOn){addEventListener('keydown',keys,true);addEventListener('resize',onVV);if(window.visualViewport)window.visualViewport.addEventListener('resize',onVV);keyOn=true}onVV();intro()}
function close(){endDrag();if(!root)return;root.style.display='none';root.innerHTML='';if(keyOn){removeEventListener('keydown',keys,true);removeEventListener('resize',onVV);if(window.visualViewport)window.visualViewport.removeEventListener('resize',onVV);keyOn=false}scr='';el=null;S=null;const f=opt.onClose;if(f)f()}
function back(){if(!root||root.style.display!='flex')return;if(dr){endDrag();return}if(dlg){const k=root.querySelector('.cf button');if(k)k.click();return}if(scr=='q')ask();else close()}
return{open,close,back,isOpen:()=>!!root&&root.style.display=='flex'};
})();
