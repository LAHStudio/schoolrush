/* Mod Kelas (Story Mode). Loaded before world.js; only does anything when sk_mode = 'story'.
   Hooks used by world.js: storyBoot() after loading, storyDoor(door) on E at a door, storyTick(dt,t) every frame.
   The analog clock is the timer: 1 real second = 1/4 clock minute (CFG.RATE).
   Tweak the numbers in CFG. The Kantin (Round 7) and the Padang Balapan (Round 9) are real room pages (see RP); the other rooms still use the placeholder card in enterRoom(). */
(function(){
const MODE=LS.get('sk_mode','roam')=='story'?'story':'roam';
const CFG={DAY:6,
  BELL:[450,510,570,600,660,720],  /* class bells: 7:30 8:30 9:30(Rehat, Kantin) 10:00 11:00 12:00 (clock minutes) */
  BALIK:780,ENDWALK:6,             /* balik bell 1:00 pm; real seconds of free walking after class 6 before it rings */
  RATE:.25,SEC:30,                 /* 1 real second = 1/4 clock-minute; 30 real seconds to reach class */
  FIRST:[6,10],BREAK:[6,12],       /* real seconds of free time before a bell */
  NEAR:.3,NEARMIN:8,ONTIME:100,BONUS:2,LATE:30,CAUGHT:20,PSPD:4,PDELAY:2,CATCH:.85,
  PGAP:.25,PGAPMAX:1.2,PGAPK:.045,
  PSPD2:5.5,PRAMP:60,JOIN:40,JDELAY:1.5,JDELAY2:3.5,JNEAR:6,
  RREM:590,RAUTO:595,RPEN:20,RBON:50,RSPD:3.5,RNEAR:2.5};  /* Round 15d: Waktu Rehat is relaxed: window 9:30 to 10:00 (no timer, no late). RREM = 9:50 prefect reminder (clock minutes), RAUTO = 9:55 auto transport to the Kantin, RPEN = points lost then, RBON = Sempat rehat bonus when you enter the Kantin yourself, RSPD = prefect walking speed, RNEAR = how close they stop (m) */  /* Round 14c: main prefect speeds up from PSPD to PSPD2 over PRAMP real seconds; after JOIN real seconds late (= 10 game minutes at RATE .25) the patrol prefects join the chase (JDELAY s before they run, JDELAY2 if closer than JNEAR) */  /* Round 14b: beep gap while the prefect runs (same numbers as the outside guard: closer = faster) */
const LAB=['Sains','Bahasa Melayu','Matematik','English','Pendidikan Jasmani','Waktu Rehat']; /* index = DR index; 5 = Kantin */
const RP={0:'kelas',1:'kelas',2:'kelas',3:'kelas',4:'padang',5:'kantin'},RS={0:'sains',1:'bm',2:'mat',3:'eng'}; /* Round 10h: 0 = Makmal Sains */ /* Round 10: Matematik and English share kelas.html (Round 10e: also the Perpustakaan, room 1 = bm); RS = which subject the page builds (sessionStorage sk_kelas) */ /* DR index -> real room page (the others still use the placeholder card) */
let st='off',order=[],n=0,cls=-1,tleft=0,ttot=0,score=0,ok=0,lt=0,navOn=false,ph=null,ex=[],lateT=0,mainT=0,joined=false,bd=null,bt=0,clk=0,ringT=0,ew=0,bd2=0,gr={},rm=0; /* gr = today's grades by class index, filled when a real room is finished (Round 7: Kantin) */
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const bellAt=i=>CFG.BELL[i];
const hm=m=>{const h=Math.floor(m/60),mi=Math.floor(m%60);return (h%12||12)+':'+String(mi).padStart(2,'0')+(h<12?' PG':h<15?' TH':' PTG')};
const room=()=>$('room');
/* day plan: Kantin (Waktu Rehat) always slot 3 (9:30); Padang Balapan (PJ) slot 1 or 2 only; others random */
function plan(){const pj=Math.random()<.5?0:1,rest=shuf([0,1,2,3]);let r=0;const o=[];for(let s=0;s<6;s++)o.push(s==2?5:s==pj?4:rest[r++]);return o}
window.storyPlan=plan;
function drawClock(){const c=$('ck');if(!c||c.hidden)return;const g=c.getContext('2d'),W=200,C=100;g.clearRect(0,0,W,W);
 g.beginPath();g.arc(C,C,94,0,7);g.fillStyle='#fffdf5';g.fill();g.lineWidth=8;g.strokeStyle='#1c2f6b';g.stroke();
 if((st=='class'||st=='late')&&ttot>0){const f=st=='late'?0:Math.max(0,tleft/ttot);if(f>0){g.beginPath();g.arc(C,C,82,-Math.PI/2,-Math.PI/2+f*Math.PI*2);g.lineWidth=9;g.strokeStyle=navOn?'#e24b4b':'#ffd23f';g.stroke()}}
 g.strokeStyle='#1c2f6b';g.lineCap='round';for(let i=0;i<12;i++){const a=i*Math.PI/6,l=i%3?6:11;g.lineWidth=i%3?2:3;g.beginPath();g.moveTo(C+Math.sin(a)*(70-l),C-Math.cos(a)*(70-l));g.lineTo(C+Math.sin(a)*70,C-Math.cos(a)*70);g.stroke()}
 g.fillStyle='#1c2f6b';g.font='bold 30px sans-serif';g.textAlign='center';g.textBaseline='middle';[[12,0],[3,90],[6,180],[9,270]].forEach(p=>{const a=p[1]*Math.PI/180;g.fillText(p[0],C+Math.sin(a)*50,C-Math.cos(a)*50)});
 const hand=(ang,len,w,col)=>{g.beginPath();g.moveTo(C,C);g.lineTo(C+Math.sin(ang)*len,C-Math.cos(ang)*len);g.lineWidth=w;g.strokeStyle=col;g.stroke()};
 hand(((clk/60)%12)*Math.PI/6,36,12,'#1c2f6b');hand((clk%60)*Math.PI/30,56,8,'#2f6fd0');g.beginPath();g.arc(C,C,6,0,7);g.fillStyle='#e24b4b';g.fill()}
function pills(){const a=$('stm'),b=$('scr'),bl=$('bl');a.hidden=b.hidden=false;b.textContent=st=='free'?'Jalan-jalan':hm(clk);a.className='hp';
 if(st=='idle')a.textContent='Tunggu loceng...';
 else if(st=='class'){a.textContent=LAB[cls]+' · '+fmt(tleft);if(navOn)a.className='hp near'}
 else if(st=='late'){a.textContent='LEWAT! '+LAB[cls];a.className='hp late'}
 else if(st=='rehat')a.textContent='Waktu Rehat · Kantin';
 else if(st=='endwalk')a.textContent='Hampir waktu balik...';
 else if(st=='balik')a.textContent='Balik! Ke pintu keluar';
 else a.hidden=true;
 bl.className=st=='late'?'late':ringT>0?'ring':st=='class'?'on':'';
 if(window.HUD)HUD.set({pts:score,note:st=='class'||st=='late'||st=='rehat'?LAB[cls]:null})} /* Round 15: HUD points + Catatan */
function setNav(on){if(on&&!navOn){navOn=true;tgt=cls;flood()}else if(!on&&navOn){navOn=false;tgt=-1;dist=null}}
function sched(first){st='idle';setNav(false);hidePref();clk=bellAt(n)-rnd.apply(null,first?CFG.FIRST:CFG.BREAK)*CFG.RATE;ringT=0;pills()}
function ring(){cls=order[n];clk=bellAt(n);ttot=tleft=CFG.SEC;st=cls==5?'rehat':'class';rm=0;ringT=2.6; /* Round 15d: Kantin = Waktu Rehat, no timer */
 bellSound(2.4);try{navigator.vibrate&&navigator.vibrate([250,120,250])}catch(e){}
 toast(cls==5?'Ringg!!! Waktu Rehat! Jalan ke Kantin ya, tak perlu berlari.':'Ringg!!! Kelas '+LAB[cls]+' di '+DR[cls][6]+'. Cepat!',3800);pills()}
function late(){st='late';setNav(true);score=Math.max(0,score-CFG.LATE);bellSound(.9);SRA.whistle();toast('Lewat! Pengawas datang!',3000);say('Alamak, lewat!');spawnPref();pills()}
/* ---- prefect chase ---- */
function spawnPref(){if(!ph){const m=npc('pengawas');sc.add(m);ph={m,x:0,z:0,f:0,mv:0,d:0}}
 const ks=Object.keys(ND).filter(k=>k!='TL'&&k!='BR'&&Math.hypot(X(ND[k][0])-P.x,Z(ND[k][1])-P.z)>=12);const k=R(ks.length?ks:['TS','BS']);
 ph.x=X(ND[k][0]);ph.z=Z(ND[k][1]);ph.d=CFG.PDELAY;ph.m.visible=true;bt=0;releaseEx();lateT=0;mainT=0;joined=false}
function hidePref(){if(ph)ph.m.visible=false;releaseEx();pfOff();sayOff()}
/* ---- Round 14c: after JOIN real seconds of being late the patrol prefects (ns entries with role 'pengawas' in world.js) chase too. n.ch=1 stops world.js moving them; releaseEx() sends them back to patrol. Built as a list so the later locker system can add chasers the same way ---- */
function joinEx(){joined=true;ns.forEach(o=>{if(o.role!='pengawas'||o.ch)return;o.ch=1;o.hid=0;o.m.visible=true;o.mv=0;o.d=Math.hypot(o.x-P.x,o.z-P.z)<CFG.JNEAR?CFG.JDELAY2:CFG.JDELAY;ex.push(o)});if(ex.length){SRA.whistle();toast('Pengawas lain datang!',2800)}}
function releaseEx(){ex.forEach(o=>{o.ch=0;o.tx=o.x;o.tz=o.z;o.w=.3+Math.random()*.7;o.mv=0});ex=[]}
function pSpd(t){return CFG.PSPD+(CFG.PSPD2-CFG.PSPD)*Math.min(1,Math.max(0,t)/CFG.PRAMP)}
/* ---- Round 14b: prefect markers, like the outside guard: red ring under the feet, "!" bubble, red triangle on the minimap (storyMM, called by drawMM in world.js), faster beep when close ---- */
let pfM=[],pfV=null,pfBt=0;
function pfOn(t,c,i){let o=pfM[i];if(!o){const r=new T.Mesh(new T.RingGeometry(.55,.8,28),new T.MeshBasicMaterial({color:'#e02424',side:T.DoubleSide,transparent:true,opacity:.85}));r.rotation.x=-Math.PI/2;sc.add(r);
  const b=document.createElement('div');b.id='pfb'+(i||'');b.textContent='!';b.style.cssText='position:fixed;z-index:8;pointer-events:none;display:none;transform:translate(-50%,-100%);font:900 2.2em Fredoka,sans-serif;color:#fff;background:#e02424;border:3px solid #fff;border-radius:50%;width:1.3em;height:1.3em;line-height:1.25em;text-align:center;box-shadow:0 2px 6px #0006';document.body.appendChild(b);pfM[i]=o={r,b};if(!pfV)pfV=new T.Vector3()}
 o.r.visible=true;o.r.position.set(c.x,.06,c.z);o.r.scale.setScalar(1+.12*Math.sin(t*8+i));
 pfV.set(c.x,2.4,c.z).project(cam);if(pfV.z<1){o.b.style.display='block';o.b.style.left=(pfV.x*.5+.5)*cv.clientWidth+'px';o.b.style.top=(-pfV.y*.5+.5)*cv.clientHeight+'px'}else o.b.style.display='none'}
function pfOff(){pfM.forEach(o=>{o.r.visible=false;o.b.style.display='none'})}
/* ---- Round 15d: 9:50 reminder. Patrol prefects walk near the player (calm chase, no catching, no beep) and each shows a white speech bubble ---- */
let syM=[],syV=null;
function pfSay(c,i){let b=syM[i];if(!b){b=document.createElement('div');b.id='pfsay'+i;b.textContent='waktu rehat nak habis, cepat ke kantin!';b.style.cssText='position:fixed;z-index:8;pointer-events:none;display:none;transform:translate(-50%,-100%);font:600 .95em Fredoka,sans-serif;color:#111;background:#fff;border:2px solid #111;border-radius:.7em;padding:.3em .6em;max-width:min(60vw,16em);text-align:center;line-height:1.25;box-shadow:0 2px 6px #0006';document.body.appendChild(b);syM[i]=b;if(!syV)syV=new T.Vector3()}
 syV.set(c.x,2.6,c.z).project(cam);if(syV.z<1){b.style.display='block';const hw=(b.offsetWidth||0)/2+4;b.style.left=Math.max(hw,Math.min(cv.clientWidth-hw,(syV.x*.5+.5)*cv.clientWidth))+'px';b.style.top=(-syV.y*.5+.5)*cv.clientHeight+'px'}else b.style.display='none'}
function sayOff(){syM.forEach(b=>b.style.display='none')}
function startRemind(){rm=1;setNav(true);ns.forEach(o=>{if(o.role!='pengawas'||o.ch)return;o.ch=1;o.hid=0;o.m.visible=true;o.mv=0;o.d=0;ex.push(o)});tone(520,0,.18,'sine',.08);toast('Waktu rehat nak habis! Cepat ke Kantin.',2600)}
function autoKantin(){score=Math.max(0,score-CFG.RPEN);toast('Waktu rehat dah habis! Pengawas hantar kamu ke Kantin.',3000);enterRoom(5,false,true)}
window.storyMM=function(mg,f){const a=MODE=='story'&&st=='late'&&ph&&ph.m.visible?[ph].concat(ex):[],lk=window.lockPf?window.lockPf():null;if(lk)a.push(lk);/* Round 18c: lockPf = the prefect sent by a locker (js/lockers.js), null when none */if(!a.length)return;const k=1+.15*Math.sin(Date.now()/90);mg.fillStyle='#e02424';mg.strokeStyle='#fff';mg.lineWidth=2.5;a.forEach(c=>{const q=f(c.x,c.z);mg.beginPath();mg.moveTo(q[0],q[1]-13*k);mg.lineTo(q[0]-11*k,q[1]+9*k);mg.lineTo(q[0]+11*k,q[1]+9*k);mg.closePath();mg.fill();mg.stroke()})};
function bfs(){if(!bd)bd=new Int16Array(GW*GH);bd.fill(-1);let[ci,cj]=cell(P.x,P.z);ci=Math.max(0,Math.min(GW-1,ci));cj=Math.max(0,Math.min(GH-1,cj));let s=ci+cj*GW;
 if(bk[s]){let f=false;for(const[a,b]of N8){const i=ci+a,j=cj+b;if(i>=0&&j>=0&&i<GW&&j<GH&&!bk[i+j*GW]){s=i+j*GW;f=true;break}}if(!f)return}
 bd[s]=0;const q=[s];for(let h=0;h<q.length;h++){const c=q[h],i=c%GW,j=c/GW|0;for(let k=0;k<4;k++){const a=i+N8[k][0],b=j+N8[k][1];if(a<0||b<0||a>=GW||b>=GH)continue;const m=b*GW+a;if(bd[m]<0&&!bk[m]){bd[m]=bd[c]+1;q.push(m)}}}}
function chase(dt,t,calm){if(!calm&&(!ph||!ph.m.visible))return;if(!calm){lateT+=dt;if(!joined&&lateT>=CFG.JOIN)joinEx()}
 const L=calm?ex.slice():[ph].concat(ex);let run=false;L.forEach(c=>{if(c.d>0)c.d-=dt;else run=true});
 if(run){bt-=dt;if(bt<=0){bt=.3;bfs()}if(!calm)mainT+=ph.d<=0?dt:0}
 let dm=1e9;
 L.forEach((c,i)=>{c.mv=0;const going=c.d<=0;
  if(going){let tx=P.x,tz=P.z;const[pi,pj]=cell(c.x,c.z),cc=pi+pj*GW;
   if(pi>=0&&pj>=0&&pi<GW&&pj<GH&&bd&&bd[cc]>0){let best=cc,bi=pi,bj=pj;for(const[a,b]of N8){const i2=pi+a,j2=pj+b;if(i2<0||j2<0||i2>=GW||j2>=GH)continue;const m=i2+j2*GW;if(bd[m]<0||bd[m]>=bd[best])continue;
    if(a&&b&&(bk[(pi+a)+pj*GW]||bk[pi+(pj+b)*GW]))continue;best=m;bi=i2;bj=j2}
    if(best!=cc){tx=GX+(bi+.5)*GC;tz=GZ+(bj+.5)*GC}}
   const dx=tx-c.x,dz=tz-c.z,l=Math.hypot(dx,dz),sp=calm?CFG.RSPD:i==0?pSpd(mainT):CFG.PSPD;if(l>.01&&!(calm&&Math.hypot(c.x-P.x,c.z-P.z)<CFG.RNEAR)){c.x+=dx/l*sp*dt;c.z+=dz/l*sp*dt;c.f=la(c.f,Math.atan2(dx,dz),Math.min(1,dt*10));c.mv=1}else if(calm)c.f=la(c.f,Math.atan2(P.x-c.x,P.z-c.z),Math.min(1,dt*10));
   dm=Math.min(dm,Math.hypot(c.x-P.x,c.z-P.z))}
  c.m.position.set(c.x,0,c.z);c.m.rotation.y=c.f;anim(c.m,t,c.mv);if(calm)pfSay(c,i);else pfOn(t,c,i)});
 if(!calm&&run){pfBt-=dt;if(pfBt<=0){pfBt=Math.max(CFG.PGAP,Math.min(CFG.PGAPMAX,CFG.PGAP+dm*CFG.PGAPK));tone(740,0,.07,'square',.07)}}else pfBt=0;
 if(!calm&&dm<CFG.CATCH){SRA.whistle();say('Kena tangkap! Jom ke kelas!');toast('Pengawas hantar kamu ke kelas.',2800);score=Math.max(0,score-CFG.CAUGHT);enterRoom(cls,true)}}
/* ---- Round 18: small hooks for js/lockers.js (the prefect sent by a locker). pfGo = one step of the same path-finding chase for one prefect o (speed sp), returns the distance to the player; pfMark / pfUnmark = the red ring and "!" bubble in marker slot i (the late chase uses 0 to 2, lockers use 5); storyPen = lose points in Mod Kelas only (false in Mod Jalan-jalan) ---- */
window.pfGo=function(c,dt,sp){bt-=dt;if(bt<=0){bt=.3;bfs()}let tx=P.x,tz=P.z;const[pi,pj]=cell(c.x,c.z),cc=pi+pj*GW;
 if(bd&&pi>=0&&pj>=0&&pi<GW&&pj<GH&&bd[cc]>0){let best=cc,bi=pi,bj=pj;for(const[a,b]of N8){const i2=pi+a,j2=pj+b;if(i2<0||j2<0||i2>=GW||j2>=GH)continue;const m=i2+j2*GW;if(bd[m]<0||bd[m]>=bd[best])continue;
  if(a&&b&&(bk[(pi+a)+pj*GW]||bk[pi+(pj+b)*GW]))continue;best=m;bi=i2;bj=j2}
  if(best!=cc){tx=GX+(bi+.5)*GC;tz=GZ+(bj+.5)*GC}}
 const dx=tx-c.x,dz=tz-c.z,l=Math.hypot(dx,dz);c.mv=0;if(l>.01){c.x+=dx/l*sp*dt;c.z+=dz/l*sp*dt;c.f=la(c.f,Math.atan2(dx,dz),Math.min(1,dt*10));c.mv=1}return Math.hypot(c.x-P.x,c.z-P.z)};
window.pfMark=pfOn;window.pfUnmark=function(i){const o=pfM[i];if(o){o.r.visible=false;o.b.style.display='none'}};
window.storyPen=function(n){if(MODE!='story'||st=='off')return false;score=Math.max(0,score-n);pills();return true};
/* ---- rooms (placeholder for now) ---- */
function card(h,lines,btns){const r=room();r.innerHTML='';const a=document.createElement('h2');a.textContent=h;r.appendChild(a);
 lines.forEach(l=>{const p=document.createElement('p');p.textContent=l[0];if(l[1])p.className='rs2';r.appendChild(p)});
 const k=document.createElement('div');k.className='rk';btns.forEach(b=>{const e=document.createElement('button');e.textContent=b[0];e.onclick=b[1];k.appendChild(e)});r.appendChild(k);
 r.style.display='flex';document.body.classList.add('mn');halt=true}
function closeCard(){room().style.display='none'}
function enterRoom(i,caught,forced){const lateNow=caught||st=='late'||forced;let g;
 if(forced){lt++;g='Waktu rehat nak habis! -'+CFG.RPEN+' mata.'}else if(i==5&&st=='rehat'){score+=CFG.RBON;ok++;g='Sempat rehat! +'+CFG.RBON+' mata.'} /* Round 15d: Kantin = relaxed rehat, small bonus, no late; forced = auto transport at 9:55 */
 else if(lateNow){lt++;g=caught?'Lewat dan kena hantar pengawas.':'Lewat! Cikgu jeling kamu.'}else{const b=CFG.ONTIME+Math.floor(tleft)*CFG.BONUS;score+=b;ok++;g=(i==5?'Sempat rehat! +':'Tepat masa! +')+b+' mata.';}
 st='room';ringT=0;setNav(false);hidePref();pills();
 if(RP[i]){if(RS[i])SS.set('sk_kelas',RS[i]);SS.set('sk_day',{order,n,score,ok,lt,gr,g});SS.set('sk_go',1);loading(()=>nav(RP[i]));return} /* real room pages (Kantin Round 7, Padang Round 9); the day is kept for this session only */
 loading(()=>{ /* TODO later rounds: Padang Balapan and the classrooms go to their own pages like the Kantin */
  card(i==5?'Kantin belum siap':'Bilik belum siap',[[i==5?'Waktu Rehat · Kantin':LAB[i]+' · '+DR[i][6]],[g,1],[i==5?'Mini game kantin akan datang. Sabar ya!':'Cikgu belum sampai lagi. Sabar ya!']],[['Keluar',()=>{closeCard();leave(i)}]])})}
/* Round 9f: autosave the Mod Kelas day into the slot at a class boundary (n = classes finished, i = the door the player stands at) */
function snap(i){if(MODE!='story')return;cur.save={v:1,order:order.slice(),n,score,ok,lt,gr:JSON.parse(JSON.stringify(gr||{})),room:i,t:Date.now()};save()}
/* Round 10b3: back doors. placeBack(r) = stand outside the back door of room r, facing away from it. storyBack(i) = E at an OPEN back door (DD index i): Mod Jalan-jalan only. */
function placeBack(r){const b=BK.find(a=>a[0]==r),q=b&&DD[b[1]],n=b&&BKN[b[1]];if(!q){place(r);return}P.x=q[0]+n[0]*.4;P.z=q[1]+n[1]*.4;P.y=0;P.vy=0;P.stun=0;P.slow=0;P.f=Math.atan2(n[0],n[1]);cp.x=P.x;cp.z=P.z;cy=P.f+Math.PI;hold=0}
window.storyBack=function(i){const r=BK.find(b=>b[1]==i)[0];if(MODE=='story'){say('Pintu belakang tak boleh digunakan waktu kelas.');return}if(!RS[r]){say('Bilik ini belum siap lagi.');return}SS.set('sk_kelas',RS[r]);savePos(true);SS.set('sk_go',1);SS.set('sk_back',1);loading(()=>nav('kelas'))};
function place(i){const d=DR[i];P.x=d[7];P.z=d[8];P.y=0;P.vy=0;P.stun=0;P.slow=0;P.f=Math.atan2(d[4],d[5]);cp.x=P.x;cp.z=P.z;cy=P.f+Math.PI;hold=0}
function after(i,msg){place(i);snap(i);document.body.classList.remove('mn');halt=false;if(n>=CFG.DAY)endWalk();else{sched(false);toast(msg||'Masa berlalu... loceng akan berbunyi lagi.',2800)}}
function leave(i){n++;loading(()=>after(i))}
/* after class 6: a few seconds of free walking, then the balik bell (long, no timer, no prefect), then the end card */
function endWalk(){st='endwalk';ew=CFG.ENDWALK;clk=CFG.BALIK-ew*CFG.RATE;setNav(false);hidePref();ringT=0;pills();toast('Kelas dah habis. Jalan-jalan sekejap...',3000)}
function ringBalik(){st='balik';bd2=4.6;clk=CFG.BALIK;ringT=4.6;bellSound(5);try{navigator.vibrate&&navigator.vibrate([400,150,400,150,400])}catch(e){}toast('Ringg!!! Loceng balik! Jalan perlahan ke pintu keluar ya.',4200);pills()}
/* Round 12: after the balik bell the day goes outside (luar.html): walk to the bus stop and board; storyBoot then shows the end card (ret.home) */
function goHome(){st='done';SS.set('sk_day',{order,n,score,ok,lt,gr});SS.set('sk_out','home');$('stm').hidden=true;$('bl').className='';ringT=0;loading(()=>nav('luar'))}
function endDay(){st='done';clk=CFG.BALIK;$('stm').hidden=true;$('bl').className='';ringT=0;drawClock();if(score>(cur.sb||0))cur.sb=score;cur.save=null;save(); /* Round 9f: day finished, so no saved day to continue */
 card('Sekolah tamat!',[['Jam 1:00 tengah hari. Loceng balik dah berbunyi!'],['Skor: '+score,1],['Tepat masa: '+ok+' · Lewat: '+lt],['Skor terbaik: '+(cur.sb||0)]],[['Main lagi',()=>{SS.del('sk_in');location.reload()}],['Sambung jalan-jalan',freeRoam],['Halaman utama',()=>nav('index')]]);
 room().insertBefore(report(),room().querySelector('.rk'))}
/* Round 7: Kad Laporan on the end card. Classes with no real room yet show a dash */
function report(){const f=document.createElement('div'),w=document.createElement('div'),o=document.createElement('p');let sum=0,c=0;w.className='rc';
 order.forEach(k=>{const x=gr[k],d=document.createElement('div'),g=x?x.g:'—';d.className='gr1';d.innerHTML='<span></span><b></b>';d.children[0].textContent=LAB[k];d.children[1].textContent=g;d.children[1].className=gcls(g);if(x){sum+=x.s;c++}w.appendChild(d)});
 o.className='rs2';o.textContent='Kad Laporan'+(c?' · Gred hari ini: '+gradeOf(sum/c):'');f.appendChild(o);f.appendChild(w);return f}
/* free roaming after Sekolah tamat: still Mod Kelas, but no bells, timer, clock or prefect. Score and best score stay as saved */
function freeRoam(){closeCard();document.body.classList.remove('mn');st='free';ringT=0;setNav(false);hidePref();$('ck').hidden=true;$('bl').hidden=true;$('stm').hidden=true;halt=false;pills();toast('Sekolah dah tamat. Jalan-jalan sepuasnya!',3200)}
/* ---- Round 9f: Mod Jalan-jalan remembers its last position (cur.pos). Saved when entering a room, on Pause, when the page is hidden or closed, and every 10 s while walking. Only switched on (posOn) after the start-up restore, so the entrance never overwrites it */
let posOn=false,lpx=1e9,lpz=1e9;
function savePos(force){if(MODE=='story'||!posOn||!cur||!PF[curKey()])return;if(!force&&Math.hypot(P.x-lpx,P.z-lpz)<.3)return;lpx=P.x;lpz=P.z;cur.pos={x:Math.round(P.x*100)/100,z:Math.round(P.z*100)/100,f:Math.round(P.f*100)/100};save()}
function posRestore(){const q=cur.pos;if(!q||!Number.isFinite(q.x)||!Number.isFinite(q.z)||Math.abs(q.x)>200||Math.abs(q.z)>200||hit(q.x,q.z,.35))return;
 P.x=q.x;P.z=q.z;P.y=0;P.vy=0;P.stun=0;P.slow=0;P.f=Number.isFinite(q.f)?q.f:P.f;cp.x=P.x;cp.z=P.z;cy=P.f+Math.PI;hold=0;lpx=P.x;lpz=P.z}
window.savePos=()=>savePos(true);
if(MODE!='story'){setInterval(()=>{if(!halt)savePos()},10000);addEventListener('pagehide',()=>savePos());document.addEventListener('visibilitychange',()=>{if(document.hidden)savePos()})}
/* ---- Round 12d: leaving school through the entrance door (E at the door inside). Mod Jalan-jalan: always free. Mod Kelas: allowed while waiting for a bell, during the class countdown, in the free walk before the balik bell and after Sekolah tamat; NOT while the prefect chases you (late). The day is kept in sk_day and put back by storyBoot (ret.exit). */
const EXN=()=>Math.hypot(P.x-X(336),P.z-(Z(538)-.06))<1.7,EXOK=()=>MODE!='story'||st=='idle'||st=='class'||st=='endwalk'||st=='free'||st=='balik';
window.exitHint=function(){return !halt&&EXN()&&EXOK()?'Keluar sekolah':''};
window.exitGo=function(){if(halt||!EXN())return false;
 if(MODE=='story'){if(st=='late'){say('Pengawas sedang kejar kamu!');return true}if(st=='rehat'){say('Waktu rehat! Pergi ke Kantin.');return true}if(st=='balik'){halt=true;goHome();return true} /* Round 15d: after the balik bell the player walks out of the exit door himself, then the bus flow */
  if(!EXOK())return false;
  SS.set('sk_day',st=='free'?{free:1,score}:{order:order.slice(),n,score,ok,lt,gr,st,clk,tleft,ttot,cls,ew,exit:1})}
 SS.set('sk_out','exit');halt=true;loading(()=>nav('luar'));return true};
/* ---- hooks ---- */
window.storyBoot=function(){const day=SS.get('sk_day'),ret=SS.get('sk_ret'),arr=SS.get('sk_arr');SS.del('sk_ret');SS.del('sk_arr');
 if(MODE!='story'){if(ret&&ret.roam){if(ret.back)placeBack(ret.room);else place(ret.room!=null?ret.room:5)}else if(!arr)posRestore();halt=false;posOn=true;return} /* Round 12: coming in from the outdoor map = stand at the school entrance, not at the saved spot */ /* Mod Jalan-jalan: back from a room page, stand at its door */
 if(day&&ret&&ret.exit){ /* Round 12d: back from outside in the middle of the day (or after Sekolah tamat) */
  SS.del('sk_day');$('scr').hidden=false;
  if(day.free){score=day.score||0;st='free';$('ck').hidden=true;$('bl').hidden=true;freeRoam();return}
  if(Array.isArray(day.order)&&day.order.length==6){order=day.order.slice();n=Math.max(0,Math.min(6,day.n|0));score=day.score||0;ok=day.ok||0;lt=day.lt||0;gr=day.gr&&typeof day.gr=='object'?day.gr:{};
   $('ck').hidden=false;$('bl').hidden=false;
   if(day.st=='class'&&Number.isInteger(day.cls)&&day.cls>=0&&day.cls<6&&day.ttot>0){st='class';cls=day.cls;ttot=day.ttot;tleft=Math.max(0,day.tleft);clk=Number.isFinite(day.clk)?day.clk:bellAt(n)}
   else if(day.st=='endwalk'&&n>=CFG.DAY){st='endwalk';ew=Math.max(0,day.ew||0);clk=CFG.BALIK-ew*CFG.RATE}
   else{sched(false)}
   halt=false;pills();drawClock();toast(ret.caught?'Balik ke dalam! Waktu belajar!':'Kamu masuk semula ke sekolah.',2400);return}}
 if(day&&ret&&ret.home&&Array.isArray(day.order)){ /* Round 12: back from the bus ride home: show Sekolah tamat */
  SS.del('sk_day');order=day.order;n=day.n;score=day.score;ok=day.ok;lt=day.lt;gr=day.gr||{};st='off';$('scr').hidden=false;$('ck').hidden=false;$('bl').hidden=false;endDay();return}
 if(day&&ret&&!ret.roam&&Array.isArray(day.order)){ /* back from the Kantin: carry on the same day */
  SS.del('sk_day');order=day.order;n=day.n+1;score=day.score;ok=day.ok;lt=day.lt;gr=day.gr||{};const rr=ret.room!=null?ret.room:5;if(ret.grade)gr[rr]={g:ret.grade,s:ret.score};st='off';
  $('scr').hidden=false;$('ck').hidden=false;$('bl').hidden=false;$('stm').hidden=true;
  after(rr,(day.g?day.g+' ':'')+(ret.grade?'Gred '+(rr==5?'Kantin':LAB[rr])+': '+ret.grade+'. ':'')+'Masa berlalu... loceng akan berbunyi lagi.');return}
 SS.del('sk_day');
 /* Round 9f: a saved day in this slot (app was closed or killed): offer Sambung or Mula baru */
 if(dayOk(cur.save)){const s=cur.save;$('scr').hidden=false;$('ck').hidden=false;$('bl').hidden=false;$('stm').hidden=true;
  card('Hari sekolah belum habis',[['Kelas '+s.n+'/6 sudah siap.'],['Skor: '+s.score,1],['Sambung hari ini atau mula hari baru?']],[['Sambung',()=>{closeCard();document.body.classList.remove('mn');order=s.order.slice();n=s.n;score=s.score;ok=s.ok;lt=s.lt;gr=s.gr&&typeof s.gr=='object'?s.gr:{};st='off';after(s.room,'Hari disambung. Loceng akan berbunyi lagi.')}],['Mula baru',()=>{cur.save=null;save();closeCard();SS.del('sk_in');SS.del('sk_day');SS.del('sk_out');loading(()=>nav('luar'))}]]);return} /* Round 14: a new day starts with the bus (luar.html, arrive flow) */
 if(cur.save){cur.save=null;save()} /* unreadable saved day: drop it */
 freshDay()};
function freshDay(){
 const tp=WALLET.topUp(WALLET.CFG.pocket); /* Round 15b: new school day, wallet topped up to the daily pocket money, never above */
 order=plan();n=0;score=ok=lt=0;st='off';$('scr').hidden=false;$('ck').hidden=false;$('bl').hidden=false;clk=bellAt(0)-2;pills();$('stm').hidden=true;drawClock();
 card('Hari sekolah bermula!',[['Lihat jam dan loceng. Loceng berbunyi dahulu.'],['Sampai ke kelas dalam 30 saat.'],['Pukul 9:30 ialah Waktu Rehat di Kantin.'],['Lewat? Pengawas akan kejar kamu!']],[['Jom!',()=>{closeCard();document.body.classList.remove('mn');halt=false;sched(true);if(tp)toast('Duit saku hari ini: '+WALLET.fmt(WALLET.CFG.pocket),2600)}]])}
window.storyDoor=function(d){const i=DR.indexOf(d);
 if(MODE!='story'){if(RP[i]){if(RS[i])SS.set('sk_kelas',RS[i]);savePos();SS.set('sk_go',1);loading(()=>nav(RP[i]));return true}return false} /* Mod Jalan-jalan: Matematik, English, Padang and Kantin are real rooms so far */
 if(st=='rehat'){if(i==5)enterRoom(5,false);else say('Waktu rehat! Pergi ke Kantin.');return true}
 if(st=='class'||st=='late'){if(i==cls)enterRoom(i,false);else say(cls==5?'Bukan sini! Pergi ke Kantin.':'Bukan kelas ini! Cari '+LAB[cls]+'.');return true}
 if(st=='free'){say('Sekolah dah tamat. Bilik dikunci.');return true}
 if(st=='endwalk'||st=='balik'||st=='done'){say('Kelas dah habis. Jom balik!');return true}
 say('Loceng belum berbunyi lagi.');return true};
window.storyTick=function(dt,t){if(MODE!='story')return;if(halt){pfOff();sayOff();return}
 if(ringT>0){ringT-=dt;if(ringT<=0)ringT=0}
 if(st=='idle'){clk+=dt*CFG.RATE;if(clk>=bellAt(n))ring();else pills()}
 else if(st=='class'){tleft-=dt;clk=bellAt(n)+(ttot-Math.max(0,tleft))*CFG.RATE;if(tleft<=Math.max(CFG.NEARMIN,ttot*CFG.NEAR))setNav(true);if(tleft<=0)late();else pills()}
 else if(st=='late'){clk+=dt*CFG.RATE;chase(dt,t);pills()}
 else if(st=='rehat'){clk+=dt*CFG.RATE;if(clk>=CFG.RAUTO)autoKantin();else{if(clk>=CFG.RREM){if(!rm)startRemind();chase(dt,t,true)}pills()}} /* Round 15d: Waktu Rehat window, no timer */
 else if(st=='endwalk'){ew-=dt;clk=CFG.BALIK-Math.max(0,ew)*CFG.RATE;if(ew<=0)ringBalik();else pills()}
 else if(st=='balik'){bd2-=dt;pills()}
 drawClock()};
if(MODE=='story'){const r=document.createElement('div');r.id='room';document.body.appendChild(r)}
})();
