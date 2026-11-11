const T=THREE,R=a=>a[Math.floor(Math.random()*a.length)],rnd=(a,b)=>a+Math.random()*(b-a),$=i=>document.getElementById(i);
const SK=['#b87a50','#8d5a3b','#a8693f','#c68a5a','#6e4328','#d9a57a','#f0c9a0'],HC=['#14161d','#14161d','#2a1d16','#3b2a1e','#5a3a22'],CL=['#e24b4b','#e8a33d','#3da36b','#4a86c8','#8a5bd0','#d6568f','#2e9aa8','#e7d24a'],S={mask:false};
let mt=0,halt=true,au=null;
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
/* Round 7: save version 2 adds rooms (best result per room, Mod Kelas only) and level (difficulty, selector comes in a later round). Old saves are upgraded on load. */
const NP=()=>({v:2,drinks:0,s:[0,0,0,0],slip:0,gem:0,gol:0,badges:{},rooms:{},level:'sederhana',save:null,pos:null});
function fixP(p){p.v=2;p.gol=p.gol||0;p.lp=p.lp||0;p.rooms=p.rooms||{};p.level=p.level||'sederhana';p.save=p.save||null;p.pos=p.pos||null;return p}
/* Round 9f: save.save = the Mod Kelas day in progress (written at class boundaries, cleared at Sekolah tamat or Mula baru); save.pos = Mod Jalan-jalan last position {x,z,f}. Both live in the slot profile. dayOk() checks a saved day before it is used */
const dayOk=s=>!!s&&Array.isArray(s.order)&&s.order.length==6&&s.order.every(k=>Number.isInteger(k)&&k>=0&&k<=5)&&Number.isInteger(s.n)&&s.n>=1&&s.n<=6&&Number.isFinite(s.score)&&Number.isFinite(s.ok)&&Number.isFinite(s.lt)&&Number.isInteger(s.room)&&s.room>=0&&s.room<=5;
/* Round 9e: 6 save slots. One slot = one profile object holding everything for that player (name, character, badges, records, counters, last played). Slots are stored under the keys s1..s6.
   Older saves were stored under the lowercase name: they move into the first free slots on the first load. The old data is copied once to sk_profiles_bak, so nothing is lost (a 7th or later old profile stays only in that backup). Settings (sk_set) stay device-wide. */
function migrateSlots(){const ks=Object.keys(PF),isS=k=>/^s[1-6]$/.test(k);if(ks.every(isS))return;if(localStorage.getItem('sk_profiles_bak')==null)LS.set('sk_profiles_bak',PF);
 const out={},cc=LS.get('sk_cur',null);let nc=null;ks.filter(isS).forEach(k=>out[k]=PF[k]);
 ks.filter(k=>!isS(k)).forEach(k=>{for(let i=1;i<=6;i++)if(!out['s'+i]){out['s'+i]=PF[k];if(k==cc)nc='s'+i;break}});
 PF=out;LS.set('sk_cur',nc||(cc&&out[cc]?cc:null));LS.set('sk_profiles',PF)}
let cur=NP();
let PF=LS.get('sk_profiles',{}),rc=null,frm='vm';{migrateSlots();Object.keys(PF).forEach(k=>fixP(PF[k]));const k=LS.get('sk_cur',null);if(k&&PF[k])cur=PF[k]}
const SET=Object.assign({snd:1,vol:.8,ts:1,lh:0,cf:1,lo:0,mus:1,mvol:.6},LS.get('sk_set',{}));
function save(){LS.set('sk_profiles',PF)}
/* Round 7: session storage (cleared when the app is closed, so a killed app restarts the day) */
const SS={get(k){try{return JSON.parse(sessionStorage.getItem(k))}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{sessionStorage.removeItem(k)}catch(e){}}};
/* Round 7: grades. Stall score 0-100 (mistakes and time), room score = average of its games, grade from GRD (edit the numbers to retune). Stars 3 / 2 / 1 from the stall score */
const GRD=[[98,'A+'],[85,'A'],[70,'B'],[55,'C'],[0,'D']],RM=[['mat','Matematik'],['sains','Sains'],['eng','English'],['bm','Bahasa Melayu'],['pj','Pendidikan Jasmani'],['kantin','Kantin (Waktu Rehat)']];
const gradeOf=s=>(GRD.find(g=>s>=g[0])||GRD[GRD.length-1])[1];
const stallScore=(wr,sec,lim)=>Math.max(15,Math.round(100-Math.min(60,wr*12)-(sec<=lim?0:Math.min(25,(sec-lim)/lim*40))));
const starsOf=s=>s>=95?3:s>=70?2:1;
const gcls=g=>'gd g'+({'A+':'AP','A':'A','B+':'BP','B':'B','C':'C','D':'D','Gagal':'F'}[g]||'N');
/* Round 7c (Round 8a: wait 1.0 s): camera (shared by the hallway and the Kantin). The view never turns by itself while you walk. After CAMC.wait seconds of being blocked,
   or of walking more than CAMC.away from straight ahead, it eases back behind the player. While the stick is held its directions stay tied to the
   view you started with (CAMS.iy), so the easing never flips your walking direction; releasing the stick or turning it by CAMC.latch re-reads the view. */
const CAMC={wait:1,away:70*Math.PI/180,ease:2.4,latch:30*Math.PI/180,block:.25},CAMS={iy:0,la:null,tb:0,ta:0,ez:0};
const wrapA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
function camMap(cy,ix,iz,mv,drag){if(!mv){CAMS.la=null;CAMS.iy=cy;return[0,0]}const a=Math.atan2(ix,iz);
 if(drag||CAMS.la===null||Math.abs(wrapA(a-CAMS.la))>CAMC.latch){CAMS.iy=cy;CAMS.la=a}
 const s=Math.sin(CAMS.iy),c=Math.cos(CAMS.iy);return[ix*c+iz*s,-ix*s+iz*c]}
function camStep(cy,dt,mv,blocked,pf,hold){if(!SET.cf||hold>0){CAMS.tb=CAMS.ta=0;CAMS.ez=0;return cy}
 const away=mv&&!blocked&&Math.abs(wrapA(pf-(cy+Math.PI)))>CAMC.away;
 CAMS.tb=mv&&blocked?CAMS.tb+dt:0;CAMS.ta=away?CAMS.ta+dt:0;
 if(CAMS.tb>=CAMC.wait||CAMS.ta>=CAMC.wait)CAMS.ez=1;
 if(CAMS.ez){const tg=pf+Math.PI;if(Math.abs(wrapA(tg-cy))<.04){CAMS.ez=0;CAMS.tb=CAMS.ta=0;return tg}return la(cy,tg,Math.min(1,dt*CAMC.ease))}
 return cy}
function recRoom(id,score,stalls){const r=cur.rooms[id]||(cur.rooms[id]={best:0,n:0});r.n++;if(score>=r.best){r.best=score;r.g=gradeOf(score);r.st=stalls}save();return r}
const BD=[['air8','Tabiat Sihat','Minum air 8 kali'],['sampah12','Pelajar Prihatin','Buang 12 sampah dengan betul'],['slip5','Kaki Licin','Terpijak kulit pisang 5 kali'],['gem5','Laju Kilat','Ambil 5 gem laju'],['gol5','Penjaring','Jaring 5 gol di padang']],
TIPS=['Jangan pijak kulit pisang! Licin tau.','Tong biru untuk kertas, tong oren untuk plastik.','Minum air, badan segar!','Wuuu, kejar loceng!','Lompat! Sampah pun boleh dielak.','Botol kaca masuk tong coklat.','Prefect tengah perhati... senyum sikit.','Hati-hati kat selekoh tu!','Cikgu dah masuk kelas... cepat sikit!','Pengawas tengah ronda, buat-buat rajin.','Loceng berbunyi, kaki jangan malas!','Jangan lewat, nanti kena kejar dengan pengawas.'];
function toast(t,ms){const m=$('msg');m.textContent=t;m.style.display='block';clearTimeout(mt);mt=setTimeout(()=>m.style.display='none',ms||2600)}
/* Round 10b2: the vase ritual (easter egg). vaseHit(id) = a key click and nothing else; the vases found are saved quietly in cur.sec (no counter anywhere in the game).
   When VASE_NEED different vases have been triggered, the pop message shows once and cur.sec.ritual is set (backOpen() = every back door is unlocked).
   VASE_NEED is 10 for real (6 hallway + 4 classroom vases); set it lower only to test. Returns true on the very moment the ritual completes. */
const VASE_NEED=10;
const backOpen=()=>!!(cur&&cur.sec&&cur.sec.ritual);
function vaseHit(id){tone(1500,0,.03,'square',.12);tone(900,.05,.05,'square',.1);if(!cur)return false;cur.sec=cur.sec||{};const k='v_'+id;if(!cur.sec[k]){cur.sec[k]=Date.now();save()}
 if(!cur.sec.ritual&&Object.keys(cur.sec).filter(x=>x.slice(0,2)=='v_').length>=VASE_NEED){cur.sec.ritual=Date.now();save();setTimeout(()=>{toast('Ritual Pasu selesai. Semua pintu belakang dibuka!',6000);[0,1,2,3].forEach(i=>tone(520+i*130,.1+i*.14,.18,'triangle',.16))},350);return true}return false}
function award(id,t,d){if(cur.badges[id])return;cur.badges[id]=Date.now();save();toast('Lencana baharu: '+t+'! '+d,3800);[0,1,2].forEach(i=>tone(600+i*150,i*.12,.15,'triangle',.12))}
function loading(fn){halt=true;$('tip').textContent=R(TIPS);$('ld').style.display='flex';setTimeout(()=>{$('ld').style.display='none';fn()},1100)}
const curKey=()=>LS.get('sk_cur',null);
function actx(){au=au||new (window.AudioContext||window.webkitAudioContext)();if(au.state=='suspended')au.resume();return au}
['pointerdown','touchend','keydown'].forEach(e=>addEventListener(e,()=>{try{actx()}catch(x){}},{passive:true}));
function bellSound(secs){if(!SET.snd)return;try{const a=actx(),v=SET.snd*SET.vol;if(v<=0)return;const d=secs||2.2,t0=a.currentTime+.03,m=a.createGain(),tr=a.createGain(),lf=a.createOscillator(),lg=a.createGain();
m.gain.setValueAtTime(.0001,t0);m.gain.exponentialRampToValueAtTime(.5*v,t0+.02);m.gain.setValueAtTime(.5*v,t0+d*.6);m.gain.exponentialRampToValueAtTime(.0001,t0+d);
tr.gain.value=.55;lf.frequency.value=17;lg.gain.value=.45;lf.connect(lg);lg.connect(tr.gain);tr.connect(m);m.connect(a.destination);lf.start(t0);lf.stop(t0+d+.05);
[[1050,1,'triangle'],[2440,.55,'sine'],[3880,.3,'sine'],[5360,.16,'sine']].forEach(p=>{const o=a.createOscillator(),g=a.createGain();o.type=p[2];o.frequency.value=p[0];g.gain.value=p[1];o.connect(g);g.connect(tr);o.start(t0);o.stop(t0+d+.05)})}catch(e){}}
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
function tone(f,t0,d,ty,v){try{au=actx();const o=au.createOscillator(),g=au.createGain(),t=au.currentTime+t0;o.type=ty||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(Math.max(.0001,(v||.15)*SET.snd*SET.vol),t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(au.destination);o.start(t);o.stop(t+d)}catch(e){}}
const la=(a,b,k)=>a+(((b-a+Math.PI*3)%(Math.PI*2))-Math.PI)*k;
/* Round 6: back-button helpers (index.html and world.html). Not used inside the chat preview iframe */
const SR_IFR=!!(window.parent&&window.parent!==window);
let SR_TRAP=0;function backKeep(){try{history.pushState({sr:1},'');SR_TRAP=1}catch(e){}}
function nav(to){const p=window.parent;if(p&&p!==window&&p.__sr){p.__sr(to);return}
 /* replace, not push, so the history never keeps stale game pages; if a back-trap entry was added, step back over it first */
 const go=()=>location.replace(to+'.html');if(SR_TRAP){SR_TRAP=0;addEventListener('popstate',go,{once:true});history.back();setTimeout(go,400)}else go()}
/* Round 6c: coming back from the background. Start screen reloads itself if the app was away 30+ s or the GPU context was lost (progress is in localStorage) */
(function(){if(SR_IFR)return;const idx=document.body.classList.contains('idx');let hid=0;
document.addEventListener('visibilitychange',()=>{if(document.hidden){hid=Date.now();return}if(idx&&hid&&Date.now()-hid>30000)location.reload()});
const c=document.getElementById('cv');if(c&&idx)c.addEventListener('webglcontextrestored',()=>location.reload())})();
