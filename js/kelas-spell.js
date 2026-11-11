/* Round 10d: English Spelling Challenge screen (the English quiz). Data + logic: js/kelas-spell-data.js (SPL, SPB, SPCFG). Grade scale: QCFG/quizGrade in js/kelas-quiz-data.js. Result saving: recQuiz() in js/kelas-quiz.js.
   Same open API as QZ: SP.open({sub, lock, onClose(), onDone(result)}); lock = the only level allowed (Mod Kelas) or null (Mod Jalan-jalan: any level).
   Letter boxes: every letter is its own box. Round 10d3: NO phone keyboard (it covered the boxes). The game has its own on-screen A-Z keys (QWERTY + DEL) under the boxes; a physical keyboard still works through a capture listener. Landscape phones use two columns (boxes left, keys + buttons right).
   Timer: one setInterval at a time (stopTimer() before every start), based on a deadline so it never drifts; paused while the Exit dialog is open or the tab is hidden. A timed-out word gets no mark and a Next button. */
const SP=(()=>{
const CSS=`#sp{position:fixed;left:0;right:0;top:0;height:100%;z-index:60;display:none;flex-direction:column;gap:clamp(6px,1.6vmin,14px);box-sizing:border-box;padding:max(10px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));background:radial-gradient(120% 70% at 50% -8%,#7a4de8 0%,#2d2185 40%,#0c0a3a 100%);color:#fff;font-family:Fredoka,sans-serif;overflow:hidden}
#sp::before,#sp::after{content:"";position:absolute;top:-10%;width:34%;height:90%;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,0) 70%);clip-path:polygon(42% 0,58% 0,100% 100%,0 100%);animation:spsw 7s ease-in-out infinite alternate}
#sp::before{left:6%;transform-origin:50% 0;--a:-10deg}#sp::after{right:6%;transform-origin:50% 0;--a:10deg;animation-delay:-3s}
@keyframes spsw{from{transform:rotate(var(--a))}to{transform:rotate(calc(var(--a)*-1))}}
@keyframes sppop{0%{transform:scale(.9)}60%{transform:scale(1.08)}100%{transform:scale(1)}}@keyframes spsh{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}@keyframes spbl{50%{opacity:.25}}
@media (prefers-reduced-motion:reduce){#sp *,#sp::before,#sp::after{animation:none!important;transition:none!important}}
#sp *{box-sizing:border-box}#sp>*{position:relative;z-index:1}#sp button{font-family:inherit}#sp button:focus-visible{outline:4px solid #ffd23f;outline-offset:2px}
#sp .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:0 0 auto;font-size:clamp(13px,2.8vmin,20px);font-weight:600}
#sp .pl{background:rgba(255,255,255,.14);border:2px solid rgba(120,230,255,.7);color:#fff;border-radius:999px;padding:.25em .9em;font-size:1em;font-weight:600;cursor:pointer;width:max-content;flex:0 0 auto}#sp .pl.st{cursor:default}
#sp .ti{flex:0 0 auto;text-align:center;font-size:clamp(11px,2.4vmin,16px);letter-spacing:.14em;font-weight:700;color:#8ff0ff;text-transform:uppercase}
#sp .tm{flex:0 0 auto;display:flex;align-items:center;gap:10px}#sp .tb{flex:1 1 auto;height:clamp(10px,2vmin,16px);border-radius:99px;background:rgba(0,0,0,.4);border:2px solid #4fe3ff;overflow:hidden}
#sp .tf{height:100%;width:100%;background:linear-gradient(90deg,#4fe3ff,#6ee86e);border-radius:99px}#sp .tm.lo .tf{background:#ff5a4f}#sp .tm.lo .tn{color:#ff8f86;animation:spbl .8s steps(2) infinite}
#sp .sk{font-size:clamp(11px,2.4vmin,16px);padding:.15em .7em;white-space:nowrap}#sp .tn{flex:0 0 auto;min-width:2.2em;text-align:center;font-size:clamp(18px,4.4vmin,32px);font-weight:800;color:#fff}
#sp .stg{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2vmin,18px);text-align:center}
#sp .pr{font-size:clamp(15px,3.4vmin,26px);font-weight:700;color:#fff;text-shadow:0 0 12px #7a4de8}
#sp .bxs{width:100%;display:flex;flex-direction:column;align-items:center;gap:clamp(6px,1.4vmin,12px)}#sp .row{display:flex;justify-content:center;gap:var(--gp,6px)}
#sp .bx{width:var(--bw,44px);height:calc(var(--bw,44px)*1.25);flex:0 0 auto;display:flex;align-items:center;justify-content:center;padding:0;border-radius:calc(var(--bw,44px)*.2);font-size:calc(var(--bw,44px)*.68);font-weight:800;line-height:1;position:relative;color:#fff;border:3px solid #8f8cff;background:#3b3a9a;box-shadow:0 .12em 0 rgba(0,0,0,.35)}
#sp .bx.em,#sp .bx.fl{cursor:pointer;touch-action:manipulation}#sp .bx.em{background:#100d4a;border:3px dashed #4fe3ff;box-shadow:inset 0 0 14px rgba(79,227,255,.25)}
#sp .bx.fl{background:#fff;color:#1a1450;border:3px solid #4fe3ff;box-shadow:0 0 12px rgba(79,227,255,.55)}
#sp .bx.sl{border:4px solid #ffd23f;box-shadow:0 0 0 3px rgba(255,210,63,.45),0 0 22px #ffd23f;transform:translateY(-5px)}#sp .bx.sl::after{content:"";position:absolute;left:18%;right:18%;bottom:-.34em;height:.2em;border-radius:9px;background:#ffd23f}
#sp .bx.ok{background:#3fbf6b;border:3px solid #b8ffd0;color:#fff;box-shadow:0 0 18px #3fbf6b;animation:sppop .5s}#sp .bx.no{background:#d94a44;border:3px solid #ffc3bf;color:#fff;animation:spsh .4s}#sp .bx.ok,#sp .bx.no{cursor:default;transform:none}
#sp .bx.no::after,#sp .bx.sl.no::after{display:none}
#sp .fb{min-height:clamp(46px,9vmin,64px);width:min(100%,560px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:clamp(14px,3vmin,22px);font-weight:700;background:rgba(255,255,255,.12);border-radius:16px;padding:.35em .8em}
#sp .fb.ok{background:rgba(63,191,107,.35)}#sp .fb.no{background:rgba(217,74,68,.35)}#sp .fb b{font-size:1.25em}#sp .fb .cw{letter-spacing:.22em;font-size:1.15em;color:#ffd23f}
#sp .ft{flex:0 0 auto;display:flex;gap:10px;justify-content:center;align-items:stretch}
#sp .btn{border:0;border-radius:999px;padding:.5em 1.3em;font-size:clamp(15px,3.2vmin,24px);font-weight:800;cursor:pointer;background:#ffd23f;color:#1a1450;box-shadow:0 .14em 0 #b58a00;min-height:clamp(44px,9vmin,60px);width:max-content;max-width:none}
#sp .mw{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:clamp(6px,1.6vmin,14px)}#sp .lf{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:clamp(6px,1.6vmin,14px)}#sp .rt{flex:0 0 auto;display:flex;flex-direction:column;gap:clamp(6px,1.4vmin,10px)}
#sp .kb{display:flex;flex-direction:column;gap:clamp(4px,.9vmin,7px);width:100%}#sp .kr{display:flex;justify-content:center;gap:clamp(3px,.8vmin,6px)}
#sp .kk{flex:1 1 0;max-width:64px;min-width:0;height:clamp(40px,6.8vh,56px);border:0;border-radius:10px;background:#fff;color:#1a1450;font-size:clamp(16px,3.2vmin,26px);font-weight:800;padding:0;cursor:pointer;touch-action:manipulation;box-shadow:0 .12em 0 #9a94d6;user-select:none;-webkit-user-select:none}#sp .kk:active{transform:translateY(2px);box-shadow:0 .04em 0 #9a94d6;background:#e9e6ff}#sp .kk.kd{flex:1.7 1 0;max-width:110px;background:#ffd23f;box-shadow:0 .12em 0 #b58a00;font-size:clamp(12px,2.6vmin,20px)}#sp .kb.off{opacity:.4;pointer-events:none}
@media (orientation:landscape) and (max-height:540px){#sp{gap:6px;padding-top:max(6px,env(safe-area-inset-top));padding-bottom:max(6px,env(safe-area-inset-bottom))}#sp .ti,#sp .hn,#sp .pr{display:none}#sp .mw{flex-direction:row;align-items:stretch;gap:14px}#sp .lf{flex:1.15 1 0;min-width:0}#sp .rt{flex:1 1 0;min-width:0;justify-content:center}#sp .kk{height:clamp(30px,10.5vh,46px)}#sp .btn{min-height:40px;padding:.3em .9em;font-size:clamp(14px,3.6vh,20px)}#sp .fb{min-height:44px;font-size:clamp(12px,3.4vh,18px)}#sp .tn{font-size:clamp(16px,5vh,26px)}#sp .hd{font-size:clamp(12px,3.6vh,18px)}#sp .pl{padding:.15em .8em}}
#sp .btn.sc{background:#fff;box-shadow:0 .14em 0 #9a94d6}#sp .btn.go{background:#3fd27a;box-shadow:0 .14em 0 #1d8a4c;flex:1 1 auto;max-width:360px}#sp .btn:disabled{opacity:.5;cursor:default}
#sp .hn{flex:0 0 auto;text-align:center;font-size:clamp(11px,2.3vmin,15px);opacity:.8;font-weight:600}
#sp .ct{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2vmin,16px);text-align:center;overflow:auto}
#sp h2{margin:0;font-size:clamp(22px,5.4vmin,42px);text-shadow:0 0 16px #7a4de8}#sp .big{font-size:clamp(16px,3.8vmin,28px);font-weight:700}#sp .sm{font-size:clamp(12px,2.6vmin,18px);font-weight:600;opacity:.9;max-width:34em}
#sp .lvs{display:flex;flex-direction:column;gap:clamp(8px,2vmin,14px);width:min(92vw,440px)}
#sp .lv{background:#fff;color:#1a1450;border:3px solid #4fe3ff;border-radius:22px;padding:.45em 1em;font-size:clamp(17px,3.8vmin,28px);font-weight:800;cursor:pointer;display:flex;flex-direction:column;align-items:center;box-shadow:0 0 14px rgba(79,227,255,.5),0 .14em 0 rgba(0,0,0,.3)}#sp .lv small{font-size:.55em;font-weight:600;opacity:.75}#sp .lv:disabled{opacity:.45;cursor:default;box-shadow:none}
#sp .gc{width:clamp(88px,22vmin,150px);height:clamp(88px,22vmin,150px);border-radius:50%;background:#fff;color:#1a1450;display:flex;align-items:center;justify-content:center;font-size:clamp(30px,9vmin,60px);font-weight:800;box-shadow:0 0 24px #7a4de8,0 .1em 0 #b9b3ff;flex:0 0 auto}#sp .gc.f{color:#c0332d}
#sp .sb2{display:inline-block;padding:.2em 1em;border-radius:999px;font-weight:800;font-size:clamp(15px,3.4vmin,26px);background:#3fbf6b;color:#fff}#sp .sb2.f{background:#e5564f}
#sp .rw{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
#sp .rv{width:min(94vw,520px);max-height:30vh;overflow:auto;background:rgba(0,0,0,.28);border-radius:16px;padding:.3em .6em;text-align:left;flex:0 1 auto;min-height:60px}
#sp .rr{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:.3em 0;border-bottom:1px solid rgba(255,255,255,.14);font-size:clamp(12px,2.7vmin,18px)}#sp .rr:last-child{border:0}#sp .rr b{letter-spacing:.12em}#sp .rr small{display:block;font-size:.85em;opacity:.85;letter-spacing:.1em}
#sp .rr i{font-style:normal;font-weight:800;flex:0 0 auto;padding:.1em .6em;border-radius:99px;font-size:.9em}#sp .rr i.ok{background:#3fbf6b}#sp .rr i.no{background:#d94a44}#sp .rr i.time{background:#b8830a}
#sp .cf{position:absolute;inset:0;z-index:5;background:rgba(8,6,40,.78);display:flex;align-items:center;justify-content:center;padding:20px}#sp .cf>div{background:#fff;color:#1a1450;border-radius:22px;padding:1.2em 1.4em;width:min(92vw,420px);text-align:center;font-size:clamp(14px,3vmin,22px);font-weight:600}#sp .cf p{margin:0 0 .8em}`;
const GOOD=['Correct!','Excellent!','Brilliant!','Well done!'],FINAL={'A+':'Outstanding! You are a spelling champion!','A':'Excellent work! Your spelling is impressive!','B+':'Great job! Keep building your vocabulary!','B':'Good effort! Keep practising!','C':'You passed! Keep learning new words!'},FAILTXT='Keep practising! Every word helps you improve!';
const dg=g=>g==QCFG.fail?'Fail':g;
let root,S=null,opt={},scr='',el=null,keyOn=false,tid=0,TM=null,dlg=false,hidP=false,vvOn=false;
const D=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
function build(){if(root)return;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);root=document.createElement('div');root.id='sp';document.body.appendChild(root)}
function bestTxt(l){const r=cur&&cur.quiz&&cur.quiz.eng&&cur.quiz.eng[l];return r&&r.g?'Best: '+r.best+'/'+QCFG.max+' · '+dg(r.g):'Not played yet'}
/* ---- timer ---- */
function stopTimer(){if(tid){clearInterval(tid);tid=0}}
function startTimer(sec){stopTimer();TM={end:Date.now()+sec*1000,tot:sec,rem:sec*1000};tick();if(TM)tid=setInterval(tick,200)}
function tick(){if(!TM||!el||scr!='q')return;const left=Math.max(0,(TM.end-Date.now())/1000);el.tf.style.width=(left/TM.tot*100)+'%';el.tn.textContent=Math.ceil(left);el.tm.classList.toggle('lo',left<=5&&left>0);if(left<=0){stopTimer();timeUp()}}
function pauseT(){if(!tid||!TM)return;TM.rem=Math.max(0,TM.end-Date.now());stopTimer()}
function resumeT(){if(tid||!TM||scr!='q'||SPL.cur(S).status!='play')return;TM.end=Date.now()+TM.rem;tid=setInterval(tick,200)}
function timeUp(){if(scr!='q')return;const q=SPL.cur(S);if(!SPL.timeout(S))return;paint();showFb('time');try{tone(220,0,.25,'sawtooth',.09)}catch(e){}}
/* ---- screens ---- */
function menu(){stopTimer();TM=null;scr='menu';el=null;root.innerHTML='';const h=D('div','hd'),b=D('button','pl','Back');b.onclick=close;h.append(b,D('span',null,''));
 const c=D('div','ct');c.append(D('h2',null,'English Spelling Challenge'),D('div','big',opt.lock?'Your level: '+SPLV[opt.lock]:'Choose a level'),D('div','sm','Tap an empty box, then tap the missing letters. Press Submit before the time runs out. 10 words per round. 1 free hint, plus bonus hints for spelling words correctly in a row.'));
 const w=D('div','lvs');Object.keys(SPLV).forEach(l=>{const e=D('button','lv',SPLV[l]),sm=D('small',null,opt.lock&&opt.lock!=l?'Locked to your level':SPCFG.time[l]+' seconds per word · '+bestTxt(l));e.append(sm);if(opt.lock&&opt.lock!=l)e.disabled=true;else e.onclick=()=>start(l);w.append(e)});c.append(w);root.append(h,c);const f=w.querySelector('button:not(:disabled)');if(f)f.focus()}
function start(l){S=SPL.newSession(l);if(!S)return;question()}
function question(){stopTimer();scr='q';dlg=false;const q=SPL.cur(S);root.innerHTML='';
 const h=D('div','hd'),x=D('button','pl','Exit');x.onclick=ask;const pg=D('span','pl st','Question '+(S.i+1)+' / '+S.qs.length),mk=D('span','pl st','Score: '+S.marks);h.append(x,pg,mk);
 const ti=D('div','ti',SPLV[S.level]+' · English Spelling Challenge');
 const tm=D('div','tm'),tb=D('div','tb'),tf=D('div','tf'),tn=D('div','tn',S.sec),sk=D('span','pl st sk','');tb.append(tf);tm.append(sk,tb,tn);
 const stg=D('div','stg'),pr=D('div','pr','Complete the word'),bxs=D('div','bxs'),fb=D('div','fb');fb.setAttribute('role','status');fb.setAttribute('aria-live','polite');fb.textContent='Tap an empty box, then tap a letter.';stg.append(pr,bxs,fb);
 const ft=D('div','ft');const clr=D('button','btn sc','Clear'),hb=D('button','btn sc','Hint ('+S.hints+')'),sub=D('button','btn go','Submit Answer');clr.onclick=doClear;hb.onclick=doHint;sub.onclick=doSubmit;hb.disabled=S.hints<1;ft.append(clr,hb,sub);
 const hn=D('div','hn','Tap a box, then tap a letter. DEL deletes. Revealed letters are locked.');
 const kb=D('div','kb');['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].forEach((r,ri)=>{const row=D('div','kr');r.split('').forEach(ch=>{const k=D('button','kk',ch);k.type='button';k.setAttribute('aria-label','Letter '+ch);k.onclick=()=>doType(ch);row.append(k)});if(ri==2){const d=D('button','kk kd','DEL');d.type='button';d.setAttribute('aria-label','Backspace');d.onclick=doBs;row.append(d)}kb.append(row)});
 const lf=D('div','lf'),rt=D('div','rt'),mw=D('div','mw');lf.append(tm,stg);rt.append(kb,ft);mw.append(lf,rt);root.append(h,ti,mw,hn);el={mk,tm,tf,tn,sk,bxs,fb,ft,kb,boxes:[],clr,hb,sub};buildBoxes(q);paint();layout();startTimer(S.sec)}
function buildBoxes(q){el.bxs.innerHTML='';el.boxes=[];const L=q.cells.length;el.rows=[D('div','row')];el.rows2=null;q.cells.forEach((c,i)=>{const b=c.lock?D('div','bx lk'):D('button','bx em');b.type='button';if(!c.lock){b.onclick=()=>{pickBox(i)};b.setAttribute('aria-label','Letter '+(i+1)+' of '+L)}b.textContent=c.ch;el.boxes.push(b)})}
function layout(){if(!root||!el||!el.bxs)return;const q=SPL.cur(S),L=q.cells.length,W=Math.max(120,el.bxs.clientWidth||root.clientWidth-28),gp=Math.max(3,Math.min(8,Math.round(W/70))),one=Math.floor((W-gp*(L-1))/L),two=!(one>=30),per=two?Math.ceil(L/2):L,bw=Math.max(18,Math.min(two?Math.floor((W-gp*(per-1))/per):one,64,Math.floor(((root.clientHeight||600)*.17))));
 el.bxs.style.setProperty('--bw',bw+'px');el.bxs.style.setProperty('--gp',gp+'px');el.bxs.innerHTML='';const rows=two?[el.boxes.slice(0,per),el.boxes.slice(per)]:[el.boxes];rows.forEach(r=>{const d=D('div','row');r.forEach(b=>d.append(b));el.bxs.append(d)})}
function paint(){const q=SPL.cur(S);if(!el)return;q.cells.forEach((c,i)=>{const b=el.boxes[i];b.textContent=c.ch;if(c.lock){b.className='bx lk'+(q.status=='ok'?' ok':'');b.disabled=true;return}
  let k='bx '+(c.ch?'fl':'em');if(q.status=='ok')k='bx ok';else if(q.status!='play')k='bx no';else if(i==q.sel)k+=' sl';b.className=k;b.disabled=q.status!='play';b.setAttribute('aria-label','Letter '+(i+1)+' of '+q.cells.length+(c.ch?': '+c.ch:': empty')+(i==q.sel&&q.status=='play'?', selected':''))});
 el.kb.classList.toggle('off',q.status!='play');el.mk.textContent='Score: '+S.marks;el.sk.textContent='Streak '+S.streak+'/'+SPCFG.streak[S.level];el.hb.textContent='Hint ('+S.hints+')';el.hb.disabled=S.hints<1||q.status!='play'}
function pickBox(i){if(scr!='q')return;if(SPL.select(SPL.cur(S),i)){paint()}}
function doType(ch){if(scr!='q'||dlg)return;const q=SPL.cur(S);if(SPL.type(q,ch)){paint();if(el.fb.dataset.k){el.fb.className='fb';el.fb.dataset.k='';el.fb.textContent='Tap an empty box, then tap a letter.'}}}
function doBs(){if(scr!='q'||dlg)return;if(SPL.backspace(SPL.cur(S)))paint()}
function doHint(){if(scr!='q'||dlg)return;const t=SPL.hint(S);if(t<0)return;paint();el.fb.className='fb';el.fb.dataset.k='1';el.fb.textContent='Hint used: one letter revealed.'}
function doClear(){if(scr!='q'||dlg)return;if(SPL.clear(SPL.cur(S))){paint()}}
function doSubmit(){if(scr!='q'||dlg)return;const r=SPL.submit(S);if(r.r=='locked')return;if(r.r=='incomplete'){el.fb.className='fb no';el.fb.dataset.k='1';el.fb.textContent='Please fill every empty box first.';return}
 stopTimer();paint();showFb(r.r,r.bonus);try{r.r=='ok'?(tone(660,0,.09,'sine',.14),tone(880,.09,.12,'sine',.14),tone(1175,.2,.16,'sine',.12)):tone(220,0,.22,'sawtooth',.09)}catch(e){}}
function showFb(k,bonus){const q=SPL.cur(S);el.fb.innerHTML='';el.fb.dataset.k='1';el.fb.className='fb '+(k=='ok'?'ok':'no');
 if(k=='ok')el.fb.append(D('b',null,GOOD[Math.floor(Math.random()*GOOD.length)]),D('span',null,'+1 point'));if(k=='ok'&&bonus)el.fb.append(D('span','cw','+1 Hint earned!'));
 else{el.fb.append(D('b',null,k=='time'?"Time's up!":'Not quite!'),D('span',null,k=='time'?'No point this time. The correct spelling is:':'The correct spelling is:'),D('span','cw',q.word.split('').join(' ')))}
 el.tm.classList.remove('lo');el.ft.innerHTML='';const n=D('button','btn go',S.i>=S.qs.length-1?'See Results':'Next');n.onclick=next;el.ft.append(n);n.focus()}
function next(){if(scr!='q'||!SPL.advance(S))return;if(S.done)result();else question()}
function result(){stopTimer();TM=null;scr='res';el=null;const g=quizGrade(S.marks);recQuiz('eng',S.level,S.marks);root.innerHTML='';const c=D('div','ct');
 const wrong=S.qs.length-S.marks;c.append(D('div','big','English Spelling Challenge · '+SPLV[S.level]),D('div','gc'+(g.pass?'':' f'),dg(g.g)),D('div','big',g.marks+'/'+QCFG.max+' · '+g.pct+'%'),D('div','sb2'+(g.pass?'':' f'),g.pass?'PASS':'FAIL'),D('div','sm',FINAL[g.g]||FAILTXT),D('div','sm','Correct: '+S.marks+' · Incorrect or missed: '+wrong));
 const rv=D('div','rv');S.qs.forEach((q,k)=>{const r=D('div','rr'),l=D('div'),b=D('b',null,(k+1)+'. '+q.word);if(q.hinted)b.textContent+=' (hint)';l.append(b);if(q.status!='ok')l.append(D('small',null,'Your answer: '+(q.ans||SPL.text(q))));const t=D('i',q.status=='ok'?'ok':q.status=='time'?'time':'no',q.status=='ok'?'Correct':q.status=='time'?'Time up':'Wrong');r.append(l,t);rv.append(r)});c.append(rv);
 const w=D('div','rw'),a=D('button','btn','Play Again'),b=D('button','btn sc','Back to Level Selection');a.onclick=()=>start(S.level);b.onclick=menu;w.append(a,b);c.append(w);root.append(c);a.focus();
 if(opt.onDone)opt.onDone({sub:'eng',level:S.level,marks:g.marks,pct:g.pct,g:g.g,pass:g.pass})}
function ask(){if(scr!='q'||dlg)return;dlg=true;pauseT();const c=D('div','cf'),b=D('div'),r=D('div','rw'),k=D('button','btn','Keep Playing'),o=D('button','btn sc','Leave');b.append(D('p',null,'Leave the game? Your score for this round will not be saved.'));
 k.onclick=()=>{c.remove();dlg=false;resumeT()};o.onclick=()=>{dlg=false;menu()};r.append(k,o);b.append(r);c.append(b);root.append(c);k.focus()}
/* ---- input ---- */
function keys(e){if(!root||root.style.display!='flex')return;const k=e.key;
 if(k=='Escape'){e.preventDefault();e.stopPropagation();back();return}
 if(scr=='q'){if(dlg)return;const isB=e.target&&e.target.tagName=='BUTTON';
  if(k.length==1&&/[a-zA-Z]/.test(k)&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();e.stopPropagation();doType(k);return}
  if(k=='Backspace'){e.preventDefault();e.stopPropagation();doBs();return}
  if(k=='Enter'&&!isB){e.preventDefault();e.stopPropagation();if(SPL.cur(S).status=='play')doSubmit();else next();return}
  if(k=='ArrowLeft'||k=='ArrowRight'){e.preventDefault();e.stopPropagation();if(SPL.move(SPL.cur(S),k=='ArrowLeft'?-1:1))paint();return}
  if(k==' '&&!isB){e.preventDefault();e.stopPropagation()}}
 else if(scr=='menu'&&k.length==1&&'123'.includes(k)){const l=Object.keys(SPLV)[+k-1];if(!(opt.lock&&opt.lock!=l)){e.preventDefault();e.stopPropagation();start(l)}}}
function onVis(){if(!root||root.style.display!='flex'||scr!='q')return;if(document.hidden){hidP=true;pauseT()}else if(hidP){hidP=false;if(!dlg)resumeT()}}
function onVV(){if(!root||root.style.display!='flex')return;const v=window.visualViewport;root.style.height=v?Math.round(v.height)+'px':'100%';root.style.top=v?Math.round(v.offsetTop)+'px':'0';layout()}
function open(o){build();opt=o;S=null;root.style.display='flex';if(!keyOn){addEventListener('keydown',keys,true);addEventListener('resize',onVV);document.addEventListener('visibilitychange',onVis);if(window.visualViewport)window.visualViewport.addEventListener('resize',onVV);keyOn=true}onVV();menu()}
function close(){stopTimer();TM=null;if(!root)return;root.style.display='none';root.innerHTML='';if(keyOn){removeEventListener('keydown',keys,true);removeEventListener('resize',onVV);document.removeEventListener('visibilitychange',onVis);if(window.visualViewport)window.visualViewport.removeEventListener('resize',onVV);keyOn=false}scr='';el=null;S=null;const f=opt.onClose;if(f)f()}
function back(){if(!root||root.style.display!='flex')return;if(dlg){const k=root.querySelector('.cf button');if(k)k.click();return}if(scr=='q')ask();else if(scr=='res')menu();else close()}
return{open,close,back,isOpen:()=>!!root&&root.style.display=='flex'};
})();
