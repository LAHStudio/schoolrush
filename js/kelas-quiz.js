/* Round 10c: the quiz screen (Menu Tahap, question, result) and its logic. Data: js/kelas-quiz-data.js, pictures: js/kelas-visuals.js.
   Layout follows the reference: a big speech bubble with the question and four answer pills (A to D), in the game's blue.
   Landscape = bubble left, pills right. Portrait = bubble on top, pills below. Sizes use clamp() and vmin so it fits phones and desktops in both directions.
   Logic (newSession / answer / advance) is separate from the screen. Questions are never shuffled. Once a pick is made the question is locked (no double marks).
   QZ.open({sub, lock, onClose(), onDone(result)}): lock = the only level allowed (Mod Kelas) or null (Mod Jalan-jalan: any level). */
function recQuiz(sub,level,marks){cur.quiz=cur.quiz||{};const q=cur.quiz[sub]=cur.quiz[sub]||{},r=q[level]=q[level]||{best:0,n:0};r.n++;if(marks>=r.best||!r.g){r.best=Math.max(r.best,marks);r.g=quizGrade(r.best).g}save();return r}
const QZ=(()=>{
const logic={newSession:(sub,level)=>({sub,level,qs:QD[sub][level],i:0,marks:0,done:false,locked:false,pick:-1}),
 answer(s,idx){if(s.locked||s.done||idx<0||idx>=s.qs[s.i].options.length)return null;s.locked=true;s.pick=idx;const ok=idx===s.qs[s.i].correctIndex;if(ok)s.marks++;return{ok,correct:s.qs[s.i].correctIndex}},
 advance(s){if(!s.locked)return false;s.locked=false;s.pick=-1;if(s.i>=s.qs.length-1)s.done=true;else s.i++;return true}};
const CSS=`#qz{position:fixed;inset:0;z-index:60;display:none;flex-direction:column;gap:clamp(6px,1.6vmin,14px);box-sizing:border-box;padding:max(10px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));background:radial-gradient(120% 90% at 20% 0%,#4f94ea 0%,#2f6fd0 45%,#1c3b8f 100%);color:#fff;font-family:Fredoka,sans-serif;overflow:hidden}
#qz *{box-sizing:border-box}#qz button{font-family:inherit}#qz button:focus-visible{outline:4px solid #ffd23f;outline-offset:2px}
#qz .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:0 0 auto;font-size:clamp(13px,2.8vmin,20px);font-weight:600}
#qz .pl{background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.55);color:#fff;border-radius:999px;padding:.25em .9em;font-size:1em;font-weight:600;cursor:pointer}
#qz .pl.st{cursor:default}
#qz .bd{flex:1 1 auto;min-height:0;display:grid;grid-template-rows:minmax(0,1fr);grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:clamp(12px,3.4vmin,32px);align-items:stretch}
#qz .bd.vis{grid-template-columns:minmax(0,1.45fr) minmax(0,1fr)}
@media (max-aspect-ratio:1/1){#qz .bd,#qz .bd.vis{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}}
#qz .bub{position:relative;background:#fff;color:#16204a;border-radius:clamp(20px,5vmin,40px);padding:clamp(10px,2.6vmin,26px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(4px,1.2vmin,12px);min-height:0;box-shadow:0 .35em 0 #b9d3f5,0 .9em 1.8em rgba(0,0,0,.28);text-align:center}
#qz .bub::after{content:"";position:absolute;left:13%;bottom:-.45em;width:clamp(16px,3.6vmin,30px);height:clamp(16px,3.6vmin,30px);background:#fff;transform:rotate(45deg);border-radius:0 0 6px 0}
#qz .qi{font-size:clamp(12px,2.7vmin,22px);font-weight:600;opacity:.85;flex:0 0 auto}
#qz .q{font-size:clamp(15px,3.7vmin,32px);font-weight:700;line-height:1.28;flex:0 0 auto}
#qz .vz{flex:1 1 0;min-height:70px;width:100%;display:flex;align-items:center;justify-content:center}
#qz .vz svg{width:100%;height:100%;display:block}
#qz .rt{display:flex;flex-direction:column;justify-content:center;gap:clamp(6px,1.6vmin,12px);min-height:0}
#qz .an{display:flex;flex-direction:column;gap:clamp(6px,1.6vmin,12px)}
#qz .pill{display:flex;align-items:center;gap:.6em;width:100%;min-height:clamp(44px,9.4vmin,68px);background:#fff;color:#16204a;border:3px solid #16204a;border-radius:999px;padding:.15em .9em .15em .3em;font-size:clamp(15px,3.3vmin,27px);font-weight:600;text-align:left;cursor:pointer;box-shadow:0 .14em 0 rgba(0,0,0,.25)}
#qz .pill b{flex:0 0 auto;width:1.9em;height:1.9em;border-radius:50%;background:#16204a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.9em}
#qz .pill span{flex:1 1 auto;min-width:0}
#qz .an.lt{display:grid;grid-template-columns:1fr 1fr}#qz .pill.lt{justify-content:center;padding:.15em}#qz .pill.lt b{width:2.1em;height:2.1em;font-size:1em}
#qz .hd button.pl{flex:0 0 auto;width:max-content;max-width:none;align-self:center;display:inline-flex}#qz .cf .rw{flex-wrap:nowrap}#qz .cf .nx{flex:0 0 auto;width:max-content;max-width:none;display:inline-flex}#qz .cf>div{width:min(92vw,420px)}
#qz .pill:disabled{cursor:default}#qz .pill.ok{background:#3fbf6b;border-color:#14633a;color:#fff}#qz .pill.no{background:#e5564f;border-color:#7d1d19;color:#fff}#qz .pill.dm{opacity:.55}
#qz .pill.ok b,#qz .pill.no b{background:#fff;color:#16204a}
#qz .fb{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:clamp(40px,8vmin,56px);font-size:clamp(13px,2.9vmin,22px);font-weight:600;background:rgba(255,255,255,.16);border-radius:16px;padding:.3em .6em .3em .9em}
#qz .nx{background:#ffd23f;color:#16204a;border:0;border-radius:999px;padding:.35em 1em;font-size:1em;font-weight:700;cursor:pointer;flex:0 0 auto;box-shadow:0 .12em 0 #b58a00}
#qz .ct{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2vmin,18px);text-align:center;overflow:auto}
#qz h2{margin:0;font-size:clamp(20px,5vmin,40px)}
#qz .lvs{display:flex;flex-direction:column;gap:clamp(8px,2vmin,16px);width:min(92vw,440px)}
#qz .lv{background:#fff;color:#16204a;border:3px solid #16204a;border-radius:22px;padding:.5em 1em;font-size:clamp(16px,3.6vmin,28px);font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;box-shadow:0 .14em 0 rgba(0,0,0,.25)}
#qz .lv small{font-size:.6em;font-weight:600;opacity:.75}#qz .lv:disabled{opacity:.45;cursor:default}
#qz .gc{width:clamp(88px,24vmin,170px);height:clamp(88px,24vmin,170px);border-radius:50%;background:#fff;color:#16204a;display:flex;align-items:center;justify-content:center;font-size:clamp(34px,10vmin,70px);font-weight:800;box-shadow:0 .1em 0 #b9d3f5,0 .5em 1.2em rgba(0,0,0,.3)}
#qz .gc.f{color:#c0332d}
#qz .sb2{display:inline-block;padding:.2em 1em;border-radius:999px;font-weight:800;font-size:clamp(16px,3.6vmin,28px);background:#3fbf6b;color:#fff}#qz .sb2.f{background:#e5564f}
#qz .big{font-size:clamp(18px,4.2vmin,32px);font-weight:700}
#qz .rw{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}#qz .rw .nx{padding:.45em 1.2em}#qz .rw .nx.sc{background:#fff}
#qz .cf{position:absolute;inset:0;background:rgba(10,20,60,.7);display:none;align-items:center;justify-content:center;padding:20px;z-index:2}
#qz .cf>div{background:#fff;color:#16204a;border-radius:22px;padding:1.2em 1.4em;max-width:420px;text-align:center;font-size:clamp(14px,3vmin,22px);font-weight:600}`;
let root,S=null,opt={},scr='',el,keyOn=false;
const D=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
function build(){if(root)return;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);root=document.createElement('div');root.id='qz';document.body.appendChild(root)}
function bestTxt(l){const r=cur&&cur.quiz&&cur.quiz[opt.sub]&&cur.quiz[opt.sub][l];return r&&r.g?'Terbaik: '+r.best+'/'+QCFG.max+' · '+r.g:'Belum dicuba'}
function menu(){scr='menu';root.innerHTML='';const h=D('div','hd'),b=D('button','pl','Bangun');b.onclick=close;h.append(b,D('span',null,''));const c=D('div','ct');c.append(D('h2',null,'Kuiz Matematik'),D('div','big',opt.lock?'Tahap anda: '+QLV[opt.lock]:'Pilih tahap kuiz'));
 const w=D('div','lvs');Object.keys(QLV).forEach(l=>{const e=D('button','lv',QLV[l]),sm=D('small',null,opt.lock&&opt.lock!=l?'Dikunci ikut tahap anda':bestTxt(l));e.append(sm);if(opt.lock&&opt.lock!=l)e.disabled=true;else e.onclick=()=>start(l);w.append(e)});c.append(w);root.append(h,c);const f=w.querySelector('button:not(:disabled)');if(f)f.focus()}
function start(l){S=logic.newSession(opt.sub,l);question()}
function question(){scr='q';root.innerHTML='';const q=S.qs[S.i],h=D('div','hd'),x=D('button','pl','Keluar');x.onclick=ask;const pg=D('span','pl st','Soalan '+(S.i+1)+' daripada '+S.qs.length),mk=D('span','pl st','Markah: '+S.marks);h.append(x,pg,mk);
 const bd=D('div','bd'+(q.visualId?' vis':'')),bub=D('div','bub');if(q.intro)bub.append(D('div','qi',q.intro));if(q.visualId){const v=D('div','vz');v.innerHTML=qvisual(q.visualId);bub.append(v)}bub.append(D('div','q',q.question));
 const rt=D('div','rt'),an=D('div','an');q.options.forEach((t,i)=>{const p=D('button','pill'),l=D('b',null,'ABCD'[i]),s=D('span',null,t);if(q.lettersOnly){p.classList.add('lt');p.append(l)}else p.append(l,s);p.onclick=()=>pick(i);an.append(p)});if(q.lettersOnly)an.classList.add('lt');
 const fb=D('div','fb');fb.append(D('span',null,'Pilih satu jawapan.'));rt.append(an,fb);bd.append(bub,rt);root.append(h,bd);el={an,fb,mk,pills:[...an.children]}}
function pick(i){if(scr!='q')return;const q=S.qs[S.i],r=logic.answer(S,i);if(!r)return;el.pills.forEach((p,k)=>{p.disabled=true;if(k==r.correct)p.classList.add('ok');else if(k==i)p.classList.add('no');else p.classList.add('dm')});
 el.mk.textContent='Markah: '+S.marks;el.fb.innerHTML='';el.fb.append(D('span',null,r.ok?'Betul!':'Belum tepat. Jawapan betul: '+'ABCD'[r.correct]+'. '+(q.names?q.names[r.correct]:q.options[r.correct])));
 const n=D('button','nx',S.i>=S.qs.length-1?'Lihat Keputusan':'Seterusnya');n.onclick=next;el.fb.append(n);n.focus();try{r.ok?(tone(660,0,.09,'sine',.14),tone(880,.09,.12,'sine',.14)):tone(220,0,.22,'sawtooth',.09)}catch(e){}}
function next(){if(scr!='q'||!logic.advance(S))return;if(S.done)result();else question()}
function result(){scr='res';const g=quizGrade(S.marks);recQuiz(S.sub,S.level,S.marks);root.innerHTML='';const c=D('div','ct');
 c.append(D('div','big','Kuiz Matematik · '+QLV[S.level]),D('div','gc'+(g.pass?'':' f'),g.g),D('div','big',g.marks+'/'+QCFG.max+' · '+g.pct+'%'),D('div','sb2'+(g.pass?'':' f'),g.pass?'LULUS':'GAGAL'));
 const r=D('div','rw'),a=D('button','nx','Cuba Lagi'),b=D('button','nx sc','Kembali ke Menu Tahap');a.onclick=()=>start(S.level);b.onclick=menu;r.append(a,b);c.append(r);root.append(c);a.focus();
 if(opt.onDone)opt.onDone({sub:S.sub,level:S.level,marks:g.marks,pct:g.pct,g:g.g,pass:g.pass})}
function ask(){if(scr!='q')return;const c=D('div','cf'),b=D('div'),r=D('div','rw'),k=D('button','nx','Teruskan'),o=D('button','nx sc','Keluar');b.append(D('p',null,'Keluar dari kuiz? Markah kuiz ini tidak disimpan.'));k.onclick=()=>c.remove();o.onclick=menu;r.append(k,o);b.append(r);c.append(b);c.style.display='flex';root.append(c);k.focus();scr='q'}
function keys(e){if(!root||root.style.display!='flex')return;const k=e.key;
 if(scr=='q'){const i='abcd'.indexOf(k.toLowerCase()),j='1234'.indexOf(k);if(k.length==1&&(i>=0||j>=0)){e.preventDefault();e.stopPropagation();pick(i>=0?i:j);return}if((k=='Enter'||k=='ArrowRight')&&S.locked){e.preventDefault();e.stopPropagation();next()}}
 else if(scr=='menu'&&'123'.includes(k)&&k.length==1){const l=Object.keys(QLV)[+k-1];if(!(opt.lock&&opt.lock!=l)){e.preventDefault();e.stopPropagation();start(l)}}
 if(k=='Escape'){e.preventDefault();e.stopPropagation();back()}}
function open(o){build();opt=o;S=null;root.style.display='flex';if(!keyOn){addEventListener('keydown',keys,true);keyOn=true}menu()}
function close(){if(!root)return;root.style.display='none';root.innerHTML='';if(keyOn){removeEventListener('keydown',keys,true);keyOn=false}scr='';const f=opt.onClose;if(f)f()}
function back(){if(!root||root.style.display!='flex')return;const cf=root.querySelector('.cf');if(cf){cf.remove();return}if(scr=='q')ask();else if(scr=='res')menu();else close()}
return{open,close,back,isOpen:()=>!!root&&root.style.display=='flex',logic};
})();
