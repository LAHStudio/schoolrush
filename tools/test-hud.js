/* Round 15: new HUD plate (js/hud.js). Pure helpers, DOM assembly against a tiny fake DOM, and the wiring in the pages. Run: node tools/test-hud.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const src=rd('js/hud.js');
/* ---- fake DOM ---- */
function mkEl(tag,id){const e={tag,id:id||'',className:'',children:[],hidden:false,textContent:'',_h:'',attrs:{},parent:null,
 set innerHTML(v){this._h=v},get innerHTML(){return this._h},
 append(...a){a.forEach(x=>{if(x.parent){x.parent.children=x.parent.children.filter(c=>c!==x)}x.parent=e;e.children.push(x)})},
 setAttribute(k,v){e.attrs[k]=v},getAttribute(k){return e.attrs[k]||null}};
 Object.defineProperty(e,'textContent',{get(){return e._t||''},set(v){e._t=v;if(v==='')e.children.forEach(c=>c.parent=null),e.children=[]}});return e}
function setup(opts){opts=opts||{};const ids={};const mk=(i,t)=>ids[i]=mkEl(t||'span',i);
 const hud=mk('hud','div');['mdl','ex','stm','scr','wc','stt'].forEach(i=>{const e=mk(i,i=='ex'?'button':'span');hud.append(e)});
 ids.mdl.className='hp';const doc={getElementById:i=>ids[i]||null,createElement:t=>mkEl(t)};
 /* ids created by build() are registered when they get an id: patch createElement to register */
 doc.createElement=t=>{const e=mkEl(t);return new Proxy(e,{set(o,k,v){o[k]=v;if(k=='id'&&v)ids[v]=o;return true}})};
 const toasts=[];const win={document:doc,toast:(t)=>toasts.push(t),location:{pathname:opts.path||'/world.html'}};
 const store={sk_mode:opts.mode||'roam',sk_day:opts.day||null,sk_kelas:opts.kelas||null};
 const LS={get:(k,d)=>store[k]==null?d:store[k]},SS={get:k=>store[k]==null?null:store[k]};
 const cur=opts.cur===undefined?{name:'Aiman',gen:'m',L:{sk:'#b87a50',hc:'#14161d',mo:0,es:1}}:opts.cur;
 new Function('window','document','LS','SS','cur',src.replace("typeof window!=='undefined'?window:globalThis","window"))(win,doc,LS,SS,cur);
 return{win,ids,hud,toasts,H:win.HUD}}
/* ---- pure helpers ---- */
{const {H}=setup();
 ok(H.modeText('story')=='MOD : Kelas'&&H.modeText('roam')=='MOD : Jalan-jalan','mode text');
 ok(H.noteText(null)=='KELAS : Tiada'&&H.noteText('')=='KELAS : Tiada'&&H.noteText('Sains')=='KELAS : Sains','note text');
 ok(H.money(0)=='RM 0.00'&&H.money(50)=='RM 0.50'&&H.money(250)=='RM 2.50'&&H.money(-5)=='RM 0.00'&&H.money('x')=='RM 0.00'&&H.money(149.6)=='RM 1.50','money in whole sen, never negative');
 ok(H.roomName('mat')=='Matematik'&&H.roomName('kantin')=='Waktu Rehat'&&H.roomName('zzz')==null,'room names');
 const m=H.faceSvg('m',{sk:'#6e4328',hc:'#3b2a1e',mo:2,es:1.2}),f=H.faceSvg('f',{sk:'#d9a57a',tud:'#4f8ad0',nt:false,rib:'#e24b4b'}),f2=H.faceSvg('f',{sk:'#d9a57a',hc:'#2a1d16',nt:true});
 ok(/^<svg/.test(m)&&m.includes('#6e4328')&&m.includes('#3b2a1e')&&!m.includes('#4f8ad0'),'boy face uses skin and hair');
 ok(f.includes('#4f8ad0')&&f.includes('#e24b4b'),'girl with tudung uses tudung colour and ribbon');
 ok(f2.includes('#2a1d16')&&!f2.includes('#4f8ad0'),'girl without tudung shows hair');
 ok(H.faceSvg('m',null).includes('#b87a50')&&H.faceSvg(undefined,undefined).startsWith('<svg'),'missing look falls back to defaults');
 ok(!/<script|onerror/i.test(H.faceSvg('f',{sk:'"><script>',tud:'<x>'}))&&!H.faceSvg('f',{sk:'"><script>'}).includes('<script>'),'colours are escaped');
 ok(H.pageNote('roam')==null&&H.pageNote('story')==null,'world page: no static note');}
/* ---- DOM assembly ---- */
{const s=setup({mode:'story',day:{score:70}}),I=s.ids;
 ok(I.hud.getAttribute('data-h15')=='1','hud marked as built');
 ok(I.hud.children[0].id=='hdr1'&&I.hud.children[1]===I.mdl&&I.hud.children[2].id=='hdn'&&I.hud.children[3].id=='hdx','order: plate row, MOD line, Catatan, old pills');
 const r1=I.hdr1;ok(r1.children[0].id=='hdp'&&r1.children[1].id=='hdbt','plate then buttons');
 ok(I.hdbt.children[0].id=='hdbag'&&I.hdbt.children[1]===I.ex,'bag and the original pause button stacked beside the plate');
 ok(['stm','scr','wc','stt'].every(i=>I.hdx.children.includes(I[i])),'old pills moved into the last row, same elements');
 ok(I.mdl.textContent=='MOD : Kelas','MOD line text in Mod Kelas');
 ok(I.hdnm.textContent=='Aiman','name shown');
 ok(I.hdpt.textContent=='70'&&I.hdpr.hidden===false,'points shown in Mod Kelas, read from the saved day');
 ok(I.hdmn.textContent=='RM 0.00','pocket money default RM 0.00');
 ok(I.hdnt.textContent=='KELAS : Tiada','Catatan default Tiada');
 s.H.set({pts:85,note:'Sains'});ok(I.hdpt.textContent=='85'&&I.hdnt.textContent=='KELAS : Sains','set() updates points and Catatan');
 s.H.set({note:null});ok(I.hdnt.textContent=='KELAS : Tiada'&&I.hdpt.textContent=='85','set() clears the note, keeps points');
 I.hdbag.onclick();ok(s.toasts.length==1&&/segera hadir/.test(s.toasts[0]),'bag shows the coming-soon toast');}
{const s=setup({mode:'roam'}),I=s.ids;
 ok(I.mdl.textContent=='MOD : Jalan-jalan'&&I.hdpr.hidden===true&&I.hdnt.textContent=='KELAS : Tiada','Mod Jalan-jalan: mode line, no points row, Tiada');}
{const s=setup({mode:'story',path:'/kantin.html'});ok(s.ids.hdnt.textContent=='KELAS : Waktu Rehat','Kantin page in Mod Kelas shows Waktu Rehat');}
{const s=setup({mode:'story',path:'/padang.html'});ok(s.ids.hdnt.textContent=='KELAS : Pendidikan Jasmani','Padang page in Mod Kelas shows Pendidikan Jasmani');}
{const s=setup({mode:'story',path:'/kelas.html',kelas:'sains'});ok(s.ids.hdnt.textContent=='KELAS : Sains','classroom page in Mod Kelas shows the room subject');}
{const s=setup({mode:'roam',path:'/kelas.html',kelas:'sains'});ok(s.ids.hdnt.textContent=='KELAS : Tiada','classroom page in Mod Jalan-jalan stays Tiada');}
{const s=setup({mode:'story',cur:{name:'Aina',gen:'f',L:{sk:'#d9a57a',tud:'#1c2f6b'},w:{c:150}}}),I=s.ids;ok(I.hdmn.textContent=='RM 1.50'&&I.hdav.innerHTML.includes('#1c2f6b'),'wallet value cur.w.c shown and girl portrait drawn');}
{const s=setup({mode:'roam',cur:null});ok(s.ids.hdnm.textContent==''&&s.ids.hdav.innerHTML.startsWith('<svg'),'no profile: empty name, default face, no crash');}
{const s=setup({});s.win.document.getElementById('hud').setAttribute('data-h15','1');const n=s.ids.hud.children.length;s.H.build();ok(s.ids.hud.children.length==n,'build() is idempotent');}
/* ---- wiring in the pages and scripts ---- */
for(const p of['world','kantin','luar','padang','kelas']){const h=rd(p+'.html');ok(/"js\/ui\.js", "js\/audio\.js", "js\/hud\.js"/.test(h),p+'.html loads js/hud.js right after js/audio.js'); ok(h.includes('id="ex"')&&h.includes('id="mdl"')&&h.includes('id="hud"'),p+'.html keeps the old hud ids')}
const st=rd('js/story.js');
ok(!st.includes("Skor '+score;")&&st.includes("b.textContent=st=='free'?'Jalan-jalan':hm(clk);"),'story.js: Skor removed from the clock pill');
ok(st.includes("HUD.set({pts:score,note:st=='class'||st=='late'||st=='rehat'?LAB[cls]:null})"),'story.js: pills() feeds the HUD');
ok(!/\$\('mdl'\)\.textContent/.test(st+rd('js/kantin.js')+rd('js/luar.js')+rd('js/padang.js')+rd('js/kelas.js')),'old #mdl writers removed (hud.js owns the MOD line)');
ok(rd('sw.js').includes("'js/hud.js'")&&rd('sw.js').includes("CACHE='sr-r21b'"),'sw.js: cache sr-r15 and js/hud.js pre-cached');
ok(rd('css/style.css').includes('#hdn{')&&rd('css/style.css').includes('#hdav{'),'css has the HUD rules');
/* ---- other scripts must not use the new names ---- */
const others=fs.readdirSync(path.join(__dirname,'..','js')).filter(f=>f!='hud.js'&&f!='wallet.js').map(f=>rd('js/'+f)).join('\n');
ok(!/\bHUD\b/.test(others.replace(/\/\*[\s\S]*?\*\//g,'').replace(/if\(window\.HUD\)HUD\.set\(/g,'').replace(/typeof HUD!=='undefined'&&HUD&&HUD\.face\)HUD\.face\(/g,'')),'no other script defines or uses global HUD (only the guarded story.js hook and the guarded bag.js portrait refresh)');
ok(!/id=["']?hd(p|av|pl|nm|pr|rm|n|x|bt|bag|r1)\b/.test(others),'no other script uses the hd* ids');
console.log(pass+' passed, '+fail+' failed');process.exit(fail?1:0);
