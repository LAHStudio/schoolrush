/* Round 12d: Node stub test (no browser, nothing rendered) for the guard chase logic in js/luar-logic.js (LUC.CH, LUL.chase*, beepGap, flow 'exit')
   and for the wiring in js/luar.js, js/story.js, js/world.js. Run: node tools/test-exit.js */
const fs=require('fs'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const {LUC,LUL}=require('../js/luar-logic.js');
let f=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)f++};
ok(LUL.flow({out:'exit',story:true,hasDay:true,savedDay:true})=='exit'&&LUL.flow({out:'exit',story:false})=='exit','flow: out=exit wins over a saved day');
ok(LUL.flow({out:'home',hasDay:true})=='home'&&LUL.flow({story:true,savedDay:true})=='skip'&&LUL.flow({})=='arrive','flow: old results unchanged');
/* world with the fence (gate x -3..3 at z -19), two benches and a tree trunk */
const boxes=[{x0:-35,x1:-3,z0:-19.2,z1:-18.8},{x0:3,x1:35,z0:-19.2,z1:-18.8},{x0:-6.1,x1:-3.9,z0:-14.45,z1:-13.55},{x0:6,x1:8,z0:-9,z1:-8},{x0:9.5,x1:10.5,z0:-12,z1:-11}];
const R_=LUC.CH.r,free=(x,z)=>x>-34.6&&x<34.6&&z>-33.6&&z<16.6&&!boxes.some(b=>x+R_>b.x0&&x-R_<b.x1&&z+R_>b.z0&&z-R_<b.z1);
function sim(px,pz,tx,tz,maxT){const c=LUL.chaseMake(LUC.GUARD.x,LUC.GUARD.z),p={x:px,z:pz};LUL.chaseStart(c);let t=0,run=0,ev,waitEnd=0;
 for(;t<maxT;t+=1/60){const wasWait=c.st=='wait';const dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz);if(l>.05){const s=Math.min(LUC.CH.pspd/60,l),nx=p.x+dx/l*s,nz=p.z+dz/l*s;if(free(nx,nz)){p.x=nx;p.z=nz}else if(free(nx,p.z))p.x=nx;else if(free(p.x,nz))p.z=nz}
  ev=LUL.chaseTick(c,1/60,p,free);if(wasWait&&c.st=='run')waitEnd=t;if(ev=='caught')return{t,waitEnd,c};}
 return{t:-1,waitEnd,c}}
/* wait phase: the guard stays put about 3 s */
{const c=LUL.chaseMake(5,-20),p={x:0,z:0};LUL.chaseStart(c);let t=0,moved=false;for(;t<LUC.CH.wait-.1;t+=1/60){LUL.chaseTick(c,1/60,p,free);if(c.x!=5||c.z!=-20)moved=true}
 ok(!moved&&c.st=='wait','chase: the guard waits about '+LUC.CH.wait+' s before running');let ev='';for(;t<LUC.CH.wait+.2;t+=1/60){ev=LUL.chaseTick(c,1/60,p,free)||ev}
 ok(c.st=='run'||c.st=='caught','chase: then he runs')}
ok(LUC.CH.k==1.15&&LUC.CH.wait==3,'chase: 1.15x player speed, 3 s wait (spec)');
/* a player who keeps walking away along the pavement is eventually caught (guard faster) */
let r=sim(0,-10,-30,-4,60);ok(r.t>0,'chase: caught while walking away along the near pavement (t '+r.t.toFixed(1)+' s)');
/* across the fence: guard has to use the gate */
r=sim(20,-12,20,-12,40);ok(r.t>0&&r.t<20,'chase: player across the fence, guard goes round through the gate (t '+r.t.toFixed(1)+' s)');
/* the guard never passes through the fence or a solid */
{const c=LUL.chaseMake(LUC.GUARD.x,LUC.GUARD.z),p={x:20,z:-12};LUL.chaseStart(c);let bad=false,gated=false;for(let t=0;t<30;t++){for(let i=0;i<60;i++){const ev=LUL.chaseTick(c,1/60,p,free);if(!free(c.x,c.z))bad=true;if(Math.abs(c.z-LUC.FZ)<.5&&Math.abs(c.x)<=LUC.GATE+.2)gated=true;if(ev=='caught')t=99}}
 ok(!bad&&gated,'chase: stays out of solids and crosses the fence line only inside the gate')}
/* slides round a bench that is straight ahead */
{const c=LUL.chaseMake(-5,-17),p={x:-5,z:-9};c.st='run';let t=0,ev='';for(;t<10&&ev!='caught';t+=1/60)ev=LUL.chaseTick(c,1/60,p,free);ok(ev=='caught','chase: gets round a bench in the way (t '+t.toFixed(1)+' s)')}
/* not caught through the fence */
{const c=LUL.chaseMake(0,-19.8),p={x:0,z:-18.0};c.st='run';const ev=LUL.chaseTick(c,1/60,p,()=>false);ok(ev=='','chase: no catch across the fence line without a gap')}
/* beep gets faster when close */
ok(LUL.beepGap(2)<LUL.beepGap(10)&&LUL.beepGap(0)>=LUC.CH.gap&&LUL.beepGap(99)<=LUC.CH.gapMax,'beep: gap shrinks with distance, within limits');
{const c=LUL.chaseMake(0,0);c.st='run';let n=0;for(let i=0;i<600;i++)if(LUL.chaseBeep(c,1/60,2))n++;const d=LUL.chaseMake(0,0);d.st='run';let m=0;for(let i=0;i<600;i++)if(LUL.chaseBeep(d,1/60,15))m++;ok(n>m&&LUL.chaseBeep(LUL.chaseMake(0,0),1,1)===false,'beep: more beeps when close, none when not running')}
/* wiring */
const L=R('js/luar.js'),S=R('js/story.js'),W=R('js/world.js');
ok(/flow=='exit'/.test(L)&&/chaseStart\(CHS\)/.test(L)&&/function caught\(\)/.test(L)&&/cur\.caught=\(cur\.caught\|\|0\)\+1/.test(L),'luar.js: exit flow, chase start, caught counter (old saves read ||0)');
ok(/chRing/.test(L)&&/chBub/.test(L)&&/#e02424/.test(L),'luar.js: ring, bubble and minimap triangle markers');
ok(/window\.exitGo/.test(S)&&/window\.exitHint/.test(S)&&/ret\.exit/.test(S)&&/day\.free/.test(S)&&/st=='late'/.test(S),'story.js: exit hooks, restore, free state, late blocked');
ok(/exitGo\(\)/.test(W)&&/exitHint\(\)/.test(W),'world.js: two small hooks (E and hint)');
/* the papers: own depth, rows do not overlap */
ok(/z\+\.135\+i\*\.006/.test(L)&&/\(i\/3\|0\)\?1\.5:2\.2/.test(L)&&(1.5+.275<=2.2-.275),'notice board: papers have their own depth and the rows do not overlap');
/* outside door same parts as inside (world-build.js) */
const WB=R('js/world-build.js');ok(/pn\(2\.9,3\.1,'#f5f5f5'/.test(WB)&&/pn\(2\.9,3\.1,'#f5f5f5'/.test(L)&&/'#7a5236'/.test(L)&&/'#a9d8f0'/.test(L)&&/'#e8c53a'/.test(L)&&/PINTU MASUK/.test(L),'outside door: frame, brown doors, blue windows, handles, PINTU MASUK sign');
/* new global names do not clash with the names listed in the handover */
const taken='STORY ren sc cam dl cols DYNS hitS hit colBox flat bxm pn sgn glass bushes mkTree bench picnic cafe nboard stallEmpty SGS PED CLM sigVis sigBeep roofM GRS STU WLK CARS WCAR BG bus BU P cp mode flow act nearAct enter board say SRA SANC SAND SANL SAP SAMC SAMD SAML SAM SAMA SAMALT samArt SAEC SAED SAEL SAEA SAEALT saeArt SAEI saeIcon SAE SA_O SA_C SA_D SA_P SA_B SXB HASL SPCFG SPL'.split(' ');
['CHS','GDY','chRing','chBub','chFree','caught'].forEach(n=>ok(!taken.includes(n),'name free: '+n));
ok(!/id="chb"|\.chb\b/.test(R('css/style.css'))&&!/id="chb"/.test(R('luar.html'))&&!/\bCHS\b|\bchRing\b|\bchBub\b|function caught\b/.test(S+W+R('js/core.js')+R('js/ui.js')+R('js/chars.js')+R('js/audio.js')),'names and root id chb are not used by the other scripts or css');
ok(!/\bEXN\b|\bEXOK\b|exitHint|exitGo/.test(R('js/core.js')+R('js/ui.js')+R('js/world-build.js')+R('js/chars.js')),'story.js names (EXN, EXOK, exitHint, exitGo) are free in the other world scripts');
console.log(f?f+' FAILED':'all passed');process.exit(f?1:0);
