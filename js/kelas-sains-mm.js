/* Round 10j: Sains, station Meja Makmal = Rantai Makanan (Sederhana). Screen code; data + logic are in js/kelas-sains-mm-data.js, pictures in js/kelas-sains-mm-art.js.
   Same API as QZ / SP / SUS / SAP: open(opt), close(), back(), isOpen(). Root id #sainsmm, every class starts with xm (global names SAM*, SAML, SAMC, SAMD). Tap only (no drag). */
const SAM=(()=>{
const CSS=`#sainsmm{position:fixed;left:0;right:0;top:0;height:100%;z-index:60;display:none;flex-direction:column;gap:clamp(6px,1.5vmin,12px);box-sizing:border-box;padding:max(10px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));background:#2e4a4f;color:#1c2f6b;font-family:Fredoka,sans-serif;overflow:hidden}
#sainsmm *{box-sizing:border-box}#sainsmm button{font-family:inherit}#sainsmm button:focus-visible{outline:4px solid #ff9f1c;outline-offset:2px}
@keyframes xmsh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}@media (prefers-reduced-motion:reduce){#sainsmm *{animation:none!important;transition:none!important}}
#sainsmm .xmh{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:0 0 auto;font-size:clamp(13px,2.8vmin,20px);font-weight:600;color:#fff}
#sainsmm .xmpl{background:#fff;border:2px solid #9db6dc;color:#1c2f6b;border-radius:999px;padding:.25em .9em;font-size:1em;font-weight:600;cursor:pointer;width:max-content;flex:0 0 auto}
#sainsmm .xmx{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:clamp(6px,1.5vmin,12px);background:#f7f8f4;border:clamp(5px,1.2vmin,10px) solid #2b2b2b;border-radius:14px;padding:clamp(8px,2vmin,18px);overflow:auto}
#sainsmm .xmx>*{flex-shrink:0}#sainsmm .xmt{font-size:clamp(17px,4vmin,30px);font-weight:700;color:#2a49a8}#sainsmm .xmp{font-size:clamp(12px,2.8vmin,20px);font-weight:600}
#sainsmm .xml{font-size:clamp(11px,2.3vmin,15px);font-weight:700;opacity:.75;letter-spacing:.04em}
#sainsmm .xmg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(6px,1.4vmin,10px)}
#sainsmm .xmk{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;min-width:0;margin:0;padding:.3em .3em .35em;border:2px solid #9db6dc;border-radius:8px;background:#fff;color:#1c2f6b;font-size:clamp(11px,2.3vmin,15px);font-weight:700;line-height:1.1;box-shadow:1px 3px 0 rgba(28,47,107,.28);cursor:pointer;user-select:none;-webkit-user-select:none;text-align:center;overflow-wrap:break-word}
#sainsmm .xmk.on{border-color:#2a49a8;background:#e4edff;box-shadow:0 0 0 3px #7da7d9}#sainsmm .xmk.ok{border-color:#2f9e5b;background:#e1f8e8}#sainsmm .xmk.bad{border-color:#d1473f;background:#ffe7e4}#sainsmm .xmk.miss{border:3px dashed #2f9e5b}#sainsmm .xmk.st{cursor:default}#sainsmm .xmk:disabled{cursor:default;color:#1c2f6b}
#sainsmm .xmi{display:block;flex:0 0 auto;width:clamp(48px,14vmin,100px);aspect-ratio:1/1;pointer-events:none}#sainsmm .xmi svg{display:block;width:100%;height:100%}#sainsmm .xmn{display:block;min-width:0;pointer-events:none}
#sainsmm .xmm{position:absolute;top:-11px;right:-7px;z-index:2;width:1.6em;height:1.6em;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#fff;border:2px solid #14501f;color:#14501f;font-size:clamp(13px,3vmin,19px);font-weight:800;line-height:1}#sainsmm .xmk.bad .xmm,#sainsmm .xmsk.bad .xmm{border-color:#9a2b24;color:#9a2b24}
#sainsmm .xmr{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(5px,1.4vmin,10px)}#sainsmm .xms{display:flex;flex-direction:column;gap:3px;min-width:0}#sainsmm .xmsn{text-align:center;font-weight:800;font-size:clamp(11px,2.4vmin,16px);color:#2a49a8}
#sainsmm .xmsk{position:relative;min-height:clamp(86px,21vmin,160px);border:3px dashed #7da7d9;border-radius:10px;background:#fff;display:flex;align-items:stretch;justify-content:center}#sainsmm .xmsk.ok{border-style:solid;border-color:#2f9e5b;background:#e1f8e8}#sainsmm .xmsk.bad{border-style:solid;border-color:#d1473f;background:#ffe7e4}#sainsmm .xmsk .xmk{flex:1 1 auto;border-color:#e8b84a;background:#fffbd6;box-shadow:none;border-radius:6px}
#sainsmm .xmem{align-self:center;font-size:clamp(11px,2.3vmin,15px);font-weight:600;opacity:.4}
#sainsmm .xmq{display:flex;flex-wrap:wrap;gap:clamp(6px,1.6vmin,10px);min-height:clamp(52px,10vmin,76px);padding:8px;border-radius:10px;background:rgba(125,167,217,.14);border:2px solid rgba(125,167,217,.45)}#sainsmm .xmq .xmk{flex:0 1 auto;width:clamp(90px,20vmin,150px)}
#sainsmm .xmv{display:flex;align-items:center;justify-content:center;gap:clamp(4px,1.2vmin,10px)}#sainsmm .xmv .xmk{flex:1 1 0}
#sainsmm .xma{flex:0 0 auto;width:clamp(40px,9vmin,60px);height:clamp(40px,9vmin,60px);border:3px solid #7da7d9;border-radius:50%;background:#fff;color:#2a49a8;font-size:clamp(20px,5vmin,32px);font-weight:800;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}#sainsmm .xma.ok{border-color:#2f9e5b;background:#e1f8e8;color:#14501f}#sainsmm .xma.bad{border-color:#d1473f;background:#ffe7e4;color:#9a2b24}#sainsmm .xma:disabled{cursor:default}#sainsmm .xma .xv{display:none}
#sainsmm .xmf{flex:0 0 auto;min-height:clamp(40px,8vmin,60px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:clamp(12px,2.8vmin,19px);font-weight:600;background:#fff;border:2px solid #b9d3ee;border-radius:12px;padding:.35em .8em;text-align:center}#sainsmm .xmf.ok{background:#e1f8e8;border-color:#2f9e5b}#sainsmm .xmf.no{background:#fff0dc;border-color:#e2893a}#sainsmm .xmf b{font-size:1.1em}
#sainsmm .xmo{flex:0 0 auto;display:flex;gap:10px;justify-content:center;align-items:stretch;flex-wrap:wrap}
#sainsmm .xmb{border:0;border-radius:999px;padding:.5em 1.2em;font-size:clamp(14px,3vmin,22px);font-weight:800;cursor:pointer;background:#ffd23f;color:#3a2a00;box-shadow:0 .14em 0 #b58a00;min-height:clamp(44px,9vmin,60px);width:max-content}#sainsmm .xmb.sc{background:#fff;color:#1c2f6b;box-shadow:0 .14em 0 #9db6dc;border:2px solid #9db6dc}#sainsmm .xmb.go{background:#3fd27a;color:#05361a;box-shadow:0 .14em 0 #1d8a4c}
#sainsmm .xmc{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(6px,1.6vmin,12px);text-align:center;background:#f7f8f4;border:clamp(5px,1.2vmin,10px) solid #2b2b2b;border-radius:14px;padding:clamp(10px,2.4vmin,22px)}
#sainsmm .xmc h2{margin:0;font-size:clamp(20px,5vmin,34px);color:#2a49a8}#sainsmm .xmbig{font-size:clamp(16px,3.8vmin,28px);font-weight:700}#sainsmm .xmsm{font-size:clamp(12px,2.7vmin,18px);font-weight:600;max-width:36em}
#sainsmm .xmgc{font-size:clamp(38px,11vmin,80px);font-weight:800;color:#2f9e5b;line-height:1}#sainsmm .xmgc.f{color:#d1473f}
#sainsmm .xmw{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
#sainsmm .xmrv{width:min(100%,520px);background:#fff;border:2px solid #b9d3ee;border-radius:12px;padding:.3em .7em;text-align:left}
#sainsmm .xmrr{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:.3em 0;border-bottom:1px solid #d6e4f5;font-size:clamp(12px,2.7vmin,18px)}#sainsmm .xmrr:last-child{border:0}
#sainsmm .xmrr i{font-style:normal;font-weight:800;flex:0 0 auto;padding:.1em .6em;border-radius:99px;font-size:.9em;color:#fff;background:#2f9e5b}#sainsmm .xmrr i.no{background:#d1473f}
#sainsmm .xmcf{position:absolute;inset:0;z-index:5;background:rgba(20,30,70,.6);display:flex;align-items:center;justify-content:center;padding:20px}#sainsmm .xmcf>div{background:#fff;color:#1c2f6b;border:3px solid #7da7d9;border-radius:18px;padding:1.2em 1.4em;width:min(92vw,420px);text-align:center;font-size:clamp(14px,3vmin,22px);font-weight:600}#sainsmm .xmcf p{margin:0 0 .8em}
@media (min-width:700px){#sainsmm .xmg{grid-template-columns:repeat(6,minmax(0,1fr))}}
@media (max-width:640px) and (orientation:portrait){#sainsmm .xmp{font-size:clamp(12px,3.1vw,16px)}#sainsmm .xmg{grid-template-columns:repeat(2,minmax(0,1fr))}#sainsmm .xmk{flex-direction:row;align-items:center;text-align:left;gap:8px;padding:.15em .5em .15em .25em;font-size:clamp(12px,3.5vw,16px)}#sainsmm .xmi{width:clamp(40px,7vh,60px)}#sainsmm .xmn{flex:1 1 auto}#sainsmm .xmr{grid-template-columns:1fr;gap:clamp(5px,1vh,9px)}#sainsmm .xms{flex-direction:row;align-items:stretch;gap:8px}#sainsmm .xmsn{flex:0 0 1.5em;align-self:center}#sainsmm .xmsk{flex:1 1 auto;min-height:clamp(50px,7.6vh,70px)}#sainsmm .xmq .xmk{width:clamp(130px,42vw,190px)}#sainsmm .xmv{flex-direction:column}#sainsmm .xmv .xmk{flex:0 0 auto;width:100%}#sainsmm .xma{width:clamp(34px,5.4vh,44px);height:clamp(34px,5.4vh,44px)}#sainsmm .xma .xh{display:none}#sainsmm .xma .xv{display:inline}#sainsmm .xmf{min-height:clamp(32px,4.5vh,44px)}}
@media (orientation:landscape) and (max-height:540px){#sainsmm{gap:5px;padding-top:max(6px,env(safe-area-inset-top));padding-bottom:max(6px,env(safe-area-inset-bottom))}#sainsmm .xmp{font-size:clamp(10px,3vh,14px)}#sainsmm .xml{display:none}#sainsmm .xmt{font-size:clamp(14px,4vh,20px)}#sainsmm .xmi{width:clamp(30px,11vh,46px)}#sainsmm .xmsk{min-height:calc(clamp(30px,11vh,46px) + 30px)}#sainsmm .xmq{min-height:40px}#sainsmm .xmx{gap:4px;padding:6px 10px}#sainsmm .xmsn{display:none}#sainsmm .xmf{min-height:30px;padding:.2em .6em}}`;
let root,S=null,opt={},scr='',el=null,keyOn=false,dlg=false;
const D=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const FINAL={'A+':'Cemerlang! Anda mahir rantai makanan.','A':'Sangat baik! Teruskan usaha.','B+':'Bagus! Anda semakin mahir.','B':'Usaha yang baik. Teruskan berlatih.','C':'Tahniah, anda lulus!'},FAILTXT='Jangan putus asa. Cuba lagi untuk menambah markah.';
const LBL=['LANGKAH 1/3 · PILIH ORGANISMA','LANGKAH 2/3 · SUSUN RANTAI','LANGKAH 3/3 · ARAH ANAK PANAH'],PH=['pick','order','arrow'];
function bestTxt(){const r=cur&&cur.quiz&&cur.quiz[SAMC.key]&&cur.quiz[SAMC.key][SAMC.level];return r&&r.g?'Terbaik: '+r.best+'/'+QCFG.max+' · '+r.g:'Belum dimainkan'}
function build(){if(root)return;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);root=document.createElement('div');root.id='sainsmm';document.body.appendChild(root)}
const names=(q,ids)=>ids.map(id=>SAML.label(q,id));
/* ---- screens ---- */
function intro(){scr='intro';el=null;S=null;root.innerHTML='';const h=D('div','xmh'),b=D('button','xmpl','Kembali');b.onclick=close;h.append(b,D('span',null,'Meja Makmal'));
 const c=D('div','xmc');c.append(D('h2',null,'Rantai Makanan'),D('div','xmbig','Tahap: Sederhana'),D('div','xmsm','Ada 3 cabaran: hutan, gurun dan lautan. Setiap cabaran ada 3 langkah: pilih 4 organisma yang betul, susun rantai makanan, kemudian pilih arah anak panah. Pilih Semak Jawapan apabila siap. Setiap cabaran 10 markah, jumlah 30 markah.'),D('div','xmsm',bestTxt()));
 const w=D('div','xmw'),a=D('button','xmb go','Mula'),k=D('button','xmb sc','Tutup');a.onclick=start;k.onclick=close;w.append(a,k);c.append(w);root.append(h,c);a.focus()}
function start(){S=SAML.newSession();cycle()}
function cycle(){scr='q';dlg=false;const q=SAML.cur(S);root.innerHTML='';
 const h=D('div','xmh'),b=D('button','xmpl','Kembali');b.onclick=ask;const hs=D('span');h.append(b,hs);
 const bd=D('div','xmx'),ti=D('div','xmt',q.d.t),lb=D('div','xml'),pr=D('div','xmp'),ct=D('div'),fb=D('div','xmf');bd.append(ti,lb,pr,ct,fb);
 const ft=D('div','xmo'),cl=D('button','xmb sc','Kosongkan'),go=D('button','xmb go');cl.onclick=doClear;go.onclick=doGo;ft.append(cl,go);root.append(h,bd,ft);
 el={hs,lb,pr,ct,fb,cl,go};paint();msg('',initMsg(q))}
function initMsg(q){if(q.ph=='pick')return'Pilih kad untuk memilih organisma, pilih lagi untuk membatalkan.';if(q.ph=='order')return q.pm<SAMC.n?'Pilihan yang salah sudah diganti dengan kad yang betul supaya anda boleh teruskan.':'Bagus! Sekarang susun rantai makanan.';return'Pilih setiap anak panah untuk menukar arahnya.'}
function card(q,id,cls,fn,mark){const b=D(fn?'button':'div','xmk'+(cls?' '+cls:'')+(fn?'':' st')),im=D('span','xmi');if(fn){b.type='button';b.onclick=fn}im.setAttribute('aria-hidden','true');im.innerHTML=typeof samArt=='function'?samArt(id):'';b.append(im,D('span','xmn',SAML.label(q,id)));if(mark)b.append(D('span','xmm',mark));return b}
function paint(){const q=SAML.cur(S),pi=PH.indexOf(q.ph),ch=SAML.chain(q);
 el.hs.textContent='Meja Makmal · Cabaran '+(S.i+1)+'/'+S.qs.length+' · Markah '+S.marks+'/'+SAMC.max;el.lb.textContent=LBL[pi];el.ct.innerHTML='';
 if(q.ph=='pick'){el.pr.textContent='Pilih 4 organisma yang ada dalam rantai makanan ini. Dipilih: '+q.sel.length+'/'+SAMC.n;
  const g=D('div','xmg');q.deck.forEach(id=>{const on=q.sel.indexOf(id)>=0,inC=ch.indexOf(id)>=0;let cls=on?'on':'',mk='';
   if(q.chk){if(on){cls=inC?'ok':'bad';mk=inC?'✔':'✘'}else if(inC)cls='miss'}
   g.append(card(q,id,cls,q.chk?null:()=>tapPick(id),mk))});el.ct.append(g)}
 else if(q.ph=='order'){el.pr.textContent='Susun organisma mengikut rantai makanan: mula dengan tumbuhan atau alga, akhir dengan pemangsa. Pilih kad untuk meletakkannya di petak, pilih kad dalam petak untuk memulangkannya.';
  const r=D('div','xmr');q.slots.forEach((id,k)=>{const w=D('div','xms'),sk=D('div','xmsk');w.append(D('div','xmsn',String(k+1)),sk);
   if(id){if(q.chk){const okk=id===ch[k];sk.className='xmsk '+(okk?'ok':'bad');sk.append(card(q,id,'',null,okk?'✔':'✘'))}else sk.append(card(q,id,'',()=>tapOrder(id)))}else sk.append(D('span','xmem','kosong'));r.append(w)});
  el.ct.append(D('div','xml','PETAK'),r);if(!q.chk){const pp=D('div','xmq');SAML.pool(q).forEach(id=>pp.append(card(q,id,'',()=>tapOrder(id))));el.ct.append(D('div','xml','KAD'),pp)}}
 else{el.pr.textContent='Pilih setiap anak panah untuk menukar arahnya. Anak panah menunjuk kepada organisma yang memakan.';
  const v=D('div','xmv');ch.forEach((id,k)=>{v.append(card(q,id,'',null));if(k<SAMC.arrows){const a=D('button','xma'+(q.chk?(q.arr[k]=='r'?' ok':' bad'):'')),d=q.arr[k];a.type='button';a.disabled=q.chk;a.setAttribute('aria-label','Anak panah '+(k+1));
   if(d){const h1=D('span','xh',d=='r'?'→':'←'),v1=D('span','xv',d=='r'?'↓':'↑');a.append(h1,v1)}else a.append(D('span',null,'?'));a.onclick=()=>tapArrow(k);v.append(a)}});el.ct.append(v)}
 el.cl.style.display=q.ph=='order'&&!q.chk?'':'none';
 el.go.textContent=!q.chk?'Semak Jawapan':(q.ph=='arrow'?(S.i<S.qs.length-1?'Cabaran Seterusnya':'Lihat Keputusan'):'Langkah Seterusnya')}
function msg(k,t,b){el.fb.className='xmf'+(k?' '+k:'');el.fb.innerHTML='';el.fb.textContent='';if(b){el.fb.append(D('b',null,b))}el.fb.append(D('span',null,t))}
/* ---- input ---- */
function tapPick(id){if(scr!='q'||dlg)return;const q=SAML.cur(S);if(SAML.toggle(q,id)){paint();msg('','Pilih kad untuk memilih organisma, pilih lagi untuk membatalkan.')}else if(q.ph=='pick'&&!q.chk)msg('no','Sudah pilih 4. Pilih satu kad yang dipilih untuk membatalkannya dahulu.')}
function tapOrder(id){if(scr!='q'||dlg)return;const q=SAML.cur(S);if(SAML.place(q,id)||SAML.unplace(q,id)){paint();msg('','Pilih kad untuk meletakkannya di petak, pilih kad dalam petak untuk memulangkannya.')}}
function tapArrow(k){if(scr!='q'||dlg)return;if(SAML.flip(SAML.cur(S),k)){paint();msg('','')}}
function doClear(){if(scr!='q'||dlg)return;if(SAML.clear(SAML.cur(S))){paint();msg('','Semua kad dipulangkan.')}}
function doGo(){if(scr!='q'||dlg)return;const q=SAML.cur(S);
 if(!q.chk){const ph=q.ph,r=ph=='pick'?SAML.checkPick(S):ph=='order'?SAML.checkOrder(S):SAML.checkArrow(S);
  if(r.r=='incomplete'){msg('no',ph=='pick'?'Pilih tepat 4 organisma dahulu.':ph=='order'?'Letakkan kesemua 4 kad dalam petak dahulu.':'Pilih arah ketiga-tiga anak panah dahulu.');return}
  if(r.r!='ok')return;paint();const ch=SAML.chain(q);
  if(ph=='pick')msg(q.pm==SAMC.n?'ok':'no','Organisma dalam rantai ini: '+names(q,ch).join(', ')+'.','Langkah 1: '+q.pm+'/'+SAMC.n);
  else if(ph=='order')msg(q.om==SAMC.pairs?'ok':'no',q.om==SAMC.pairs?'Urutan betul!':'Urutan betul: '+names(q,ch).join(' → ')+'.','Langkah 2: '+q.om+'/'+SAMC.pairs);
  else msg(q.marks==SAMC.per?'ok':'no',q.d.e,'Langkah 3: '+q.am+'/'+SAMC.arrows+' · Cabaran ini: '+q.marks+'/'+SAMC.per);
  return}
 const n=SAML.next(S);if(n=='step'){paint();msg('',initMsg(q))}else if(n=='cycle')cycle();else if(n=='end')result()}
function result(){scr='res';el=null;const raw=S.marks,sc=SAML.scale(raw),g=quizGrade(sc),r=recQuiz(SAMC.key,SAMC.level,sc);root.innerHTML='';
 const h=D('div','xmh');h.append(D('span',null,'Meja Makmal'));const c=D('div','xmc');
 c.append(D('h2',null,'Rantai Makanan · Sederhana'),D('div','xmgc'+(g.pass?'':' f'),g.g),D('div','xmbig','Markah: '+raw+'/'+SAMC.max),D('div','xmsm',(g.pass?'LULUS · ':'GAGAL · ')+(FINAL[g.g]||FAILTXT)),D('div','xmsm','Rekod terbaik: '+r.best+'/'+QCFG.max+' · '+r.g));
 const rv=D('div','xmrv');S.qs.forEach(q=>{const row=D('div','xmrr');row.append(D('span',null,q.d.t.replace('Rantai Makanan di ','')+': '+q.marks+'/'+SAMC.per),D('i',q.marks==SAMC.per?'':'no',q.marks==SAMC.per?'Betul':'Ada salah'));rv.append(row)});c.append(rv);
 const w=D('div','xmw'),a=D('button','xmb','Main Lagi'),k=D('button','xmb sc','Tutup');a.onclick=start;k.onclick=close;w.append(a,k);c.append(w);root.append(h,c);a.focus();if(opt.onDone)opt.onDone({sc,raw,g:g.g})}
function ask(){if(scr!='q'||dlg)return;dlg=true;const c=D('div','xmcf'),b=D('div'),r=D('div','xmw'),k=D('button','xmb','Teruskan Main'),o=D('button','xmb sc','Keluar');b.append(D('p',null,'Keluar dari kuiz ini? Markah pusingan ini tidak akan disimpan.'));
 k.onclick=()=>{c.remove();dlg=false};o.onclick=()=>{dlg=false;intro()};r.append(k,o);b.append(r);c.append(b);root.append(c);k.focus()}
function keys(e){if(!root||root.style.display!='flex')return;const k=e.key;
 if(k=='Escape'){e.preventDefault();e.stopPropagation();back();return}
 if(scr=='q'&&!dlg){const isB=e.target&&e.target.tagName=='BUTTON';if(k=='Enter'&&!isB){e.preventDefault();e.stopPropagation();doGo()}}}
function onVV(){if(!root||root.style.display!='flex')return;const v=window.visualViewport;root.style.height=v?Math.round(v.height)+'px':'100%';root.style.top=v?Math.round(v.offsetTop)+'px':'0'}
function open(o){build();opt=o||{};S=null;root.style.display='flex';if(!keyOn){addEventListener('keydown',keys,true);addEventListener('resize',onVV);if(window.visualViewport)window.visualViewport.addEventListener('resize',onVV);keyOn=true}onVV();intro()}
function close(){if(!root)return;root.style.display='none';root.innerHTML='';if(keyOn){removeEventListener('keydown',keys,true);removeEventListener('resize',onVV);if(window.visualViewport)window.visualViewport.removeEventListener('resize',onVV);keyOn=false}scr='';el=null;S=null;const f=opt.onClose;if(f)f()}
function back(){if(!root||root.style.display!='flex')return;if(dlg){const k=root.querySelector('.xmcf button');if(k)k.click();return}if(scr=='q')ask();else close()}
return{open,close,back,isOpen:()=>!!root&&root.style.display=='flex'};
})();
