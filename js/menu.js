const cv=$('cv'),ren=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});ren.setPixelRatio(Math.min(devicePixelRatio,2));
function fit(){ren.setSize(innerWidth,innerHeight,false)}addEventListener('resize',fit);fit();
let inMenu=true,selLv='sederhana',selG=null,tab=0,stageOn=false,bellDone=0;
const defL=()=>({m:{sk:SK[0],hs:'fringe',hc:HC[0],mo:0,es:1,mask:false},f:{sk:SK[0],hs:'bob',hc:HC[0],tud:'#f6f7fb',nt:false,rib:null,mo:0,es:1,mask:false}});
let LK=defL();
const ps=new T.Scene(),pc=new T.PerspectiveCamera(35,1,.1,50),pang={m:0,f:2},pv={m:null,f:null};
ps.add(new T.HemisphereLight(0xffffff,0x8896aa,1.1));const pdl=new T.DirectionalLight(0xffffff,.6);pdl.position.set(2,4,5);ps.add(pdl);
const gnd=new T.Mesh(new T.CircleGeometry(2.4,32),mat('#2a3f86'));gnd.rotation.x=-Math.PI/2;ps.add(gnd);
const ring=new T.Mesh(new T.RingGeometry(.55,.72,28),new T.MeshBasicMaterial({color:'#ffd23f'}));ring.rotation.x=-Math.PI/2;ring.position.y=.02;ring.visible=false;ps.add(ring);
function buildPV(){['m','f'].forEach(g=>{if(pv[g])ps.remove(pv[g]);pv[g]=player(g,'uni',LK[g]);ps.add(pv[g])})}
const BS=[['short','Pendek'],['fringe','Poni'],['spiky','Terpacak'],['side','Belah tepi'],['crew','Cukur pendek']],GS=[['bob','Bob'],['pony','Ekor kuda'],['bun','Sanggul'],['pigtails','Dua tocang'],['braid','Kepang']],
TUD=[['#f6f7fb','Putih'],['#4f8ad0','Biru'],['#1c2f6b','Biru tua']],RIB=[[null,'Tiada'],['#e24b4b','Merah'],['#ffd23f','Kuning'],['#d6568f','Merah jambu'],['#4a86c8','Biru']],
HC4=[HC[0],HC[2],HC[3],HC[4]],TABS=['Kulit','Rambut','Muka','Topeng'];
function opts(arr,isOn,fn,sw){const d=document.createElement('div');d.className='ops';arr.forEach(a=>{const b=document.createElement('button');if(sw){b.className='sw'+(isOn(a[0])?' on':'');b.style.background=a[0]}else{b.textContent=a[1];if(isOn(a[0]))b.className='on'}b.onclick=()=>fn(a[0]);d.appendChild(b)});return d}
function renderCP(){const c=$('cp');c.innerHTML='';if(!selG){const h=document.createElement('div');h.className='hn';h.textContent='Pilih watak anda';c.appendChild(h);return}
const g=selG,L=LK[g],tb=document.createElement('div');tb.className='ops';
TABS.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;if(i==tab)b.className='on';b.onclick=()=>{tab=i;renderCP()};tb.appendChild(b)});
const rd=document.createElement('button');rd.textContent='Rawak';rd.onclick=rawak;tb.appendChild(rd);c.appendChild(tb);
const add=(lab,arr,k,sw)=>{const l=document.createElement('div');l.className='lb';l.textContent=lab;c.appendChild(l);c.appendChild(opts(arr,v=>L[k]===v,v=>{L[k]=v;buildPV();renderCP()},sw))};
if(tab==0)add('Warna kulit',SK.map(s=>[s]),'sk',1);
if(tab==1){if(g=='m'){add('Gaya rambut',BS,'hs');add('Warna rambut',HC4.map(s=>[s]),'hc',1)}else{add('Tudung',[[false,'Pakai tudung'],[true,'Tanpa tudung']],'nt');if(!L.nt)add('Warna tudung',TUD,'tud');else{add('Gaya rambut',GS,'hs');add('Warna rambut',HC4.map(s=>[s]),'hc',1)}}}
if(tab==2){add('Mata',[[.8,'Kecil'],[1,'Biasa'],[1.2,'Besar']],'es');add('Senyuman',[[0,'Senyum'],[1,'Manis'],[2,'Terkejut']],'mo')}
if(tab==3)add('Topeng muka',[[false,'Tiada'],[true,'Pakai topeng']],'mask')}
function rawak(){const g=selG,L=LK[g];L.sk=R(SK);L.hc=R(HC4);L.mo=R([0,1,2]);L.es=R([.8,1,1.2]);if(g=='m')L.hs=R(BS)[0];else{L.nt=Math.random()<.5;L.hs=R(GS)[0];L.tud=R(TUD)[0]}buildPV();renderCP()}
function chk(){$('go').disabled=!(selG&&$('nm').value.trim())}
function pickG(g){selG=g;tab=0;renderCP();chk();tone(660,0,.08,'sine',.12)}
function showMenu(){inMenu=true;$('menu').style.display='flex';view('vm');const k=curKey();$('mC').hidden=!hasSaved();$('mC').textContent='Sambung Permainan'}
function startFlow(){selLv='sederhana';lvUI();LK=defL();selG=null;tab=0;$('nm').value='';$('go').disabled=true;ring.visible=false;buildPV();renderCP();view('vn')}
function okCont(p){if(!p)return false;if(getMode()=='story')return dayOk(p.save);const q=p.pos;return !!q&&Number.isFinite(q.x)&&Number.isFinite(q.z)&&Math.abs(q.x)<=200&&Math.abs(q.z)<=200} /* Round 14: same checks as dayOk / posRestore (the collision test stays in posRestore) */
function startGame(cont){if(cont){cur=PF[curKey()];if(!cur)return;lookFix(cur);if(cur.mode)LS.set('sk_mode',cur.mode);cur.lp=Date.now();save()}else{const nm=$('nm').value.replace(/[<>]/g,'').trim().slice(0,12);if(!nm||!selG||!newSlot||PF[newSlot])return;const k=newSlot;PF[k]=Object.assign(NP(),{name:nm,level:selLv,mode:getMode(),cv:2});cur=PF[k];cur.gen=selG;cur.L=Object.assign({},LK[selG]);cur.lp=Date.now();LS.set('sk_cur',k);save()}
if(cont&&okCont(cur))SS.set('sk_in',1);else SS.del('sk_in');inMenu=false;stageOn=false;$('menu').style.display='none';loading(()=>nav('world'))} /* Round 12: SS.del('sk_in') = the next world.html visit goes outside first (bus). Round 14: Teruskan with a valid saved day (Mod Kelas) or position (Mod Jalan-jalan) goes straight into the school */
/* Round 9e: save slots (6). Mod Kelas / Mod Jalan-jalan opens this screen. Empty slot = create the character; used slot = continue in the chosen mode; Padam asks twice. */
let newSlot=null;
const slotMode=p=>p&&(p.mode=='story'||p.mode=='roam')?p.mode:null,hasSaved=()=>Object.keys(PF).some(k=>/^s\d$/.test(k)&&PF[k]); /* Round 22: a slot holds ONE mode (p.mode); slots made before this have none and ask once */
function askMode(k,after){const p=PF[k];if(!p||document.getElementById('mdxv'))return;
 if(!document.getElementById('mdxcss')){const s=document.createElement('style');s.id='mdxcss';s.textContent='#mdxv{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(10,16,40,.8);font-family:Fredoka,sans-serif;padding:3vmin}#mdxv .mdc{display:flex;flex-direction:column;gap:.7em;align-items:center;text-align:center;background:#fff8e1;color:#1c2f6b;border-radius:1.2em;padding:1.2em 1.4em;max-width:min(92vw,26em)}#mdxv h2{margin:0;font-size:1.25em}#mdxv p{margin:0;font-size:.95em}#mdxv button{font:inherit;font-weight:600;border:0;border-radius:.9em;padding:.6em 1em;background:#ffd23f;color:#1c2f6b;cursor:pointer;width:100%}#mdxv .mdg{background:#dfe6ff}';document.head.appendChild(s)}
 const e=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n},v=e('div'),c=e('div','mdc');v.id='mdxv';
 c.appendChild(e('h2','','Pilih mod untuk slot ini'));c.appendChild(e('p','','Slot "'+(p.name||'?')+'" dibuat sebelum mod dikunci. Pilih satu mod. Pilihan ini tetap.'));
 ['story','roam'].forEach(m=>{const b=e('button','',MODN[m]);b.onclick=()=>{p.mode=m;save();v.remove();after(m)};c.appendChild(b)});
 const x=e('button','mdg','Batal');x.onclick=()=>v.remove();c.appendChild(x);v.appendChild(c);document.body.appendChild(v)}
/* Round 23: character version tag p.cv=2 = chibi 3D characters. Old slots keep their look (hair, colours, tudung); an unknown hair name falls back to a default and the hair ribbon (no longer drawn) is cleared. lookNote = one-time card before such a slot opens. */
function lookFix(p){if(!p||p.cv===2)return;p.cv=2;const L=p.L;if(L){L.rib=null;const m=p.gen!='f';if(!(m?BS:GS).some(a=>a[0]==L.hs)&&!(m&&L.hs=='bald'))L.hs=m?'fringe':'bob'}}
function lookNote(p,after){if(!p||document.getElementById('mdxv'))return;
 if(!document.getElementById('mdxcss')){const s=document.createElement('style');s.id='mdxcss';s.textContent='#mdxv{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(10,16,40,.8);font-family:Fredoka,sans-serif;padding:3vmin}#mdxv .mdc{display:flex;flex-direction:column;gap:.7em;align-items:center;text-align:center;background:#fff8e1;color:#1c2f6b;border-radius:1.2em;padding:1.2em 1.4em;max-width:min(92vw,26em)}#mdxv h2{margin:0;font-size:1.25em}#mdxv p{margin:0;font-size:.95em}#mdxv button{font:inherit;font-weight:600;border:0;border-radius:.9em;padding:.6em 1em;background:#ffd23f;color:#1c2f6b;cursor:pointer;width:100%}#mdxv .mdg{background:#dfe6ff}';document.head.appendChild(s)}
 const e=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n},v=e('div'),c=e('div','mdc');v.id='mdxv';
 c.appendChild(e('h2','','Watak gaya baharu!'));c.appendChild(e('p','','Watak kini bergaya chibi 3D. Rupa anda (kulit, rambut, tudung) dikekalkan.'+(p.L&&p.L.rib?' Pita rambut tidak lagi ada.':'')));
 const b=e('button','','Jom main!');b.onclick=()=>{v.remove();after()};c.appendChild(b);
 const x=e('button','mdg','Batal');x.onclick=()=>v.remove();c.appendChild(x);v.appendChild(c);document.body.appendChild(v)}
function slotCard(i,ctx,last){const k='s'+i,p=PF[k],pm=slotMode(p),c=document.createElement('div');c.className='slc'+(p?'':' em')+(p&&pm&&ctx!='all'&&pm!=ctx?' dim':'')+(last&&p&&p.lp?' last':'');c.setAttribute('role','button');c.tabIndex=0;
 const add=(tag,t,cl)=>{const e=document.createElement(tag);e.textContent=t;if(cl)e.className=cl;c.appendChild(e);return e};add('span','Slot '+i,'sn');
 if(!p){add('b','Kosong');add('small','Permainan baru');c.onclick=()=>{newSlot=k;startFlow()}}
 else{const sm=pm||getMode(),rs=Object.values(p.rooms||{}).filter(x=>x&&x.g),g=rs.length?gradeOf(rs.reduce((a,x)=>a+x.best,0)/rs.length):'—';let dt='';try{if(p.lp)dt=new Date(p.lp).toLocaleDateString('ms-MY',{day:'numeric',month:'short'})}catch(e){}
  add('b',(p.gen=='f'?'👧 ':'👦 ')+(p.name||'?'));add('small',pm?MODN[pm]:'Mod belum dipilih','slm');add('small',(sm=='roam'?'':'Gred '+g+' · ')+'Lencana '+Object.keys(p.badges||{}).length+'/'+BD.length);if(sm=='story'&&dayOk(p.save))add('small','Hari sekolah: Kelas '+p.save.n+'/6','sv');if(last&&p.lp)add('small','Dimainkan terakhir','slm');if(dt)add('small','Dimainkan '+dt);
  const d=add('button','Padam','sd');two(d,()=>{delete PF[k];if(curKey()==k){LS.set('sk_cur',null);cur=NP()}save();openSlots(ctx)},'Padam');const f=d.onclick;d.onclick=e=>{e.stopPropagation();f()};
  c.onclick=()=>{const go=()=>{const run=()=>{LS.set('sk_cur',k);startGame(true)};if(p.cv!==2)lookNote(p,run);else run()};if(!pm){askMode(k,m=>{if(ctx!='all'&&m!=ctx){openSlots(ctx);toast('Slot ini dikunci untuk '+MODN[m]+'. Guna Sambung Permainan.',2800);return}go()});return}if(ctx!='all'&&pm!=ctx){toast('Slot ini untuk '+MODN[pm]+'. Guna Sambung Permainan.',2600);return}go()}}
 c.onkeydown=e=>{if((e.key=='Enter'||e.key==' ')&&e.target===c){e.preventDefault();c.click()}};return c}
function openSlots(ctx){ctx=ctx||getMode();newSlot=null;const g=$('sl');g.innerHTML='';
 if(ctx=='all'){const ks=[1,2,3,4,5,6].filter(i=>PF['s'+i]).sort((a,b)=>(PF['s'+b].lp||0)-(PF['s'+a].lp||0));if(!ks.length){showMenu();return}$('sls').textContent='Sambung Permainan';ks.forEach((i,n)=>g.appendChild(slotCard(i,ctx,n==0)))}
 else{$('sls').textContent=MODN[ctx];for(let i=1;i<=6;i++)g.appendChild(slotCard(i,ctx))}view('vs')}
function bell(){bellSound(1.8)}
const MODN={story:'Mod Kelas',roam:'Mod Jalan-jalan'},getMode=()=>LS.get('sk_mode','roam')=='story'?'story':'roam';
$('menu').addEventListener('pointerdown',()=>{if(!bellDone){bellDone=1;bell()}});$('bellw').onclick=bell;
$('mK').onclick=()=>{LS.set('sk_mode','story');openSlots('story')};
$('mR').onclick=()=>{LS.set('sk_mode','roam');openSlots('roam')};$('mC').onclick=()=>openSlots('all');$('mL').onclick=()=>{drawBd();frm='vm';view('vl')};$('mS').onclick=()=>{frm='vm';applySet();view('vt')};$('mH').onclick=()=>{frm='vm';view('vh')};$('mKr').onclick=()=>{frm='vm';view('vk')};
$('bk').onclick=()=>view('vs');$('slb').onclick=()=>view('vm');$('go').onclick=()=>startGame(false);
$('stg').onclick=e=>{const r=$('stg').getBoundingClientRect();pickG(e.clientX-r.left<r.width/2?'m':'f')};
$('nm').oninput=chk;$('nm').onkeydown=e=>{if(e.key=='Enter'&&!$('go').disabled)startGame(false)};
const rt=$('rt');if(matchMedia('(pointer:coarse)').matches&&innerHeight>innerWidth)rt.style.display='flex';$('rtk').onclick=()=>rt.style.display='none';addEventListener('resize',()=>{if(innerWidth>innerHeight)rt.style.display='none'});
buildPV();renderCP();showMenu();
let last=0;function loop(ts){requestAnimationFrame(loop);const dt=Math.min((ts-last)/1000||0,.05),t=ts/1000;last=ts;const W=cv.clientWidth,H=cv.clientHeight;ren.setScissorTest(false);ren.setViewport(0,0,W,H);ren.setClearColor(0x16204a,0);ren.clear();
if(stageOn){const r=$('stg').getBoundingClientRect(),cr=cv.getBoundingClientRect(),x0=r.left-cr.left,y0=cr.bottom-r.bottom;
if(r.width>10&&r.height>10){const asp=r.width/r.height,px=Math.max(.5,Math.min(.95,5.6*.3153*asp*.52));pc.aspect=asp;pc.updateProjectionMatrix();pc.position.set(0,1.1,5.6);pc.lookAt(0,.9,0);
['m','f'].forEach(g=>{const G=pv[g],on=selG==g;G.position.set(g=='m'?-px:px,0,0);G.scale.setScalar((on?1.12:.95)*CHSZ.s);pang[g]+=dt*(on?1.2:.6);G.rotation.y=on?pang[g]:Math.sin(pang[g])*.5;anim(G,t,false)});
if(selG){ring.visible=true;ring.position.x=selG=='m'?-px:px}
ren.setScissorTest(true);ren.setViewport(x0,y0,r.width,r.height);ren.setScissor(x0,y0,r.width,r.height);ren.render(ps,pc);ren.setScissorTest(false);ren.setViewport(0,0,W,H)}}}requestAnimationFrame(loop);

/* Round 6: Keluar button. Android cannot always close a web app from code, so it falls back to a how-to-close card */
(function(){const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform=='MacIntel'&&navigator.maxTouchPoints>1),q=$('qx'),qm=document.createElement('div');qm.id='qm';document.body.appendChild(qm);
function how(){qm.innerHTML='';const h=document.createElement('h2');h.textContent='Cara tutup aplikasi';qm.appendChild(h);
[ios?'iPhone tak benarkan game tutup sendiri.':'Game tak dapat tutup sendiri di telefon ini.',ios?'Leret ke atas dari bawah skrin (atau tekan dua kali butang Home), kemudian leret kad SCHOOL RUSH ke atas.':'Tekan butang Terkini (Recent) atau leret ke atas dari bawah skrin, kemudian leret SCHOOL RUSH ke atas untuk tutup.'].forEach(t=>{const p=document.createElement('p');p.textContent=t;qm.appendChild(p)});
const b=document.createElement('button');b.textContent='OK';b.onclick=()=>qm.style.display='none';qm.appendChild(b);qm.style.display='flex'}
q.onclick=()=>{if(ios){how();return}try{window.close()}catch(e){}setTimeout(()=>{if(!document.hidden)how()},500)};
const sync=()=>{q.style.display=$('vm').hidden?'none':'flex'};new MutationObserver(sync).observe($('vm'),{attributes:true,attributeFilter:['hidden']});sync()})();

/* Round 10c: Tahap belajar (Mudah / Sederhana / Sukar) chosen when creating a character; saved as level in the slot. Tetapan can change it later. */
function lvUI(){document.querySelectorAll('#lvb [data-lv]').forEach(b=>b.classList.toggle('on',b.dataset.lv==selLv))}
document.querySelectorAll('#lvb [data-lv]').forEach(b=>b.onclick=()=>{selLv=b.dataset.lv;lvUI();tone(660,0,.08,'sine',.12)});
