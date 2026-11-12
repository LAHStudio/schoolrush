/* Round 12: Node stub test (NOT a real browser, nothing is rendered) for the outdoor map logic in js/luar-logic.js
   (flow, cars and the zebra crossing, bump rule, bus timeline) plus the wiring in the files.
   Run: node tools/test-luar.js */
const fs=require('fs'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const {LUC,LUL}=require('../js/luar-logic.js');
let f=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)f++};
/* flow */
ok(LUL.flow({story:true,out:'home',hasDay:true,savedDay:true})=='home','flow: finished day goes home');
ok(LUL.flow({story:true,out:'home',hasDay:false,savedDay:false})=='arrive','flow: home without day data falls back to the morning bus');
ok(LUL.flow({story:true,savedDay:true})=='skip','flow: Mod Kelas with a saved day skips the second bus ride');
ok(LUL.flow({story:false,savedDay:true})=='arrive'&&LUL.flow({story:true,savedDay:false})=='arrive','flow: Jalan-jalan and a fresh Mod Kelas day take the bus');
/* sizes and lanes */
ok(LUC.RZ1-LUC.RZ0==8&&LUC.CAR.len==4.3&&LUC.BUS.len==10&&LUC.ZW*2==3,'sizes: road 8, car 4.3, bus 10, zebra 3 wide');
ok(LUC.LE<LUC.LW&&LUC.DOOR.z>LUC.RZ1,'left-hand traffic: east-bound lane north, west-bound south; the bus door opens onto the far pavement');
ok(LUC.DOOR.x>LUC.ZX+LUC.ZW+2,'the zebra is clear of the bus nose');
/* zones */
const zx=LUC.ZX;
ok(LUL.pedZone({x:zx,z:2})&&!LUL.pedZone({x:zx+6,z:2})&&!LUL.pedZone({x:zx,z:-6}),'pedZone: only on or at the edge of the crossing');
ok(LUL.safeZone({x:zx,z:2})&&!LUL.safeZone({x:zx+5,z:2}),'safeZone: only on the zebra');
/* a car stops before the zebra for a walker, from any start distance, and goes again when the walker leaves */
for(const d of[8,14,25,40]){const c=LUL.makeCar(1,zx-LUC.ZW-.8-LUC.CAR.len/2-d,9);c.v=9;let maxFront=-1e9;for(let i=0;i<1200;i++){LUL.carTick(c,.016,true,null,()=>.5);maxFront=Math.max(maxFront,c.x+c.len/2)}
 ok(maxFront<=zx-LUC.ZW-.5&&c.v<.05,'east-bound car '+d+' away stops before the zebra (front '+maxFront.toFixed(2)+')')}
for(const d of[8,25]){const c=LUL.makeCar(-1,zx+LUC.ZW+.8+LUC.CAR.len/2+d,9);c.v=9;let minFront=1e9;for(let i=0;i<1200;i++){LUL.carTick(c,.016,true,null,()=>.5);minFront=Math.min(minFront,c.x-c.len/2)}
 ok(minFront>=zx+LUC.ZW+.5&&c.v<.05,'west-bound car '+d+' away stops before the zebra (rear-front '+minFront.toFixed(2)+')')}
{const c=LUL.makeCar(1,zx-20,9);c.v=0;for(let i=0;i<400;i++)LUL.carTick(c,.016,false,null,()=>.5);ok(c.v>8&&c.x>zx-20+10,'car speeds up again when nobody is on the crossing')}
/* cars do not drive through each other */
{const a=LUL.makeCar(1,-30,9),b=LUL.makeCar(1,-50,9);b.v=9;a.v=0;const all=[a,b];let min=1e9;for(let i=0;i<1500;i++){a.v=0;a.x=-30;LUL.carTick(b,.016,false,LUL.leaderOf(b,all),()=>.5);min=Math.min(min,(a.x-a.len/2)-(b.x+b.len/2))}ok(min>0.5,'a car behind another keeps a gap ('+min.toFixed(2)+')')}
/* wrap-around and the bus hold */
{const c=LUL.makeCar(1,55,9);c.v=9;for(let i=0;i<110;i++)LUL.carTick(c,.016,false,null,()=>.5);ok(!c.on&&c.wait>=2,'a car leaving the map waits 2 to 8 s');
 c.hold=true;for(let i=0;i<2000;i++)LUL.carTick(c,.05,false,null,()=>.5);ok(!c.on,'hold keeps the lane empty (bus lane)');c.hold=false;for(let i=0;i<10;i++)LUL.carTick(c,.05,false,null,()=>.5);ok(c.on&&c.x<-50,'after hold the car comes back from the far end')}
/* bump rule */
{const c=LUL.makeCar(1,0,9);c.v=9;ok(LUL.hitCar({x:0,z:LUC.LE,y:0},c),'a moving car hits a walker in its lane');
 ok(!LUL.hitCar({x:0,z:LUC.LE,y:2},c),'a jump over the car is no hit');
 {const zc=Object.assign(LUL.makeCar(1,zx,9),{v:9});ok(!LUL.hitCar({x:zx,z:LUC.LE,y:0},zc,{carsStop:true}),'no hit on the zebra while the signal holds the cars');ok(LUL.hitCar({x:zx,z:LUC.LE,y:0},zc,{carsStop:false})&&LUL.hitCar({x:zx,z:LUC.LE,y:0},zc),'crossing on red is not safe (Round 12b)')}
 c.v=0;ok(!LUL.hitCar({x:0,z:LUC.LE,y:0},c),'a stopped car does not hit');
 ok(LUL.kerbZ({z:1})<LUC.RZ0&&LUL.kerbZ({z:4})>LUC.RZ1,'a bumped player goes back to the nearer pavement')}
/* Round 12b: pedestrian signal with push button and countdown */
{const G=LUC.SIG,sg=LUL.makeSig();ok(sg.st=='idle'&&sg.carL=='g'&&sg.ped=='r'&&!sg.carsStop&&sg.n==0,'signal: idle = cars green, red man, no countdown');
 ok(LUL.sigPress(sg)&&sg.st=='amber'&&sg.carL=='a'&&!sg.carsStop&&!LUL.sigPress(sg),'signal: the button starts amber once, cars still allowed');
 let t=0,hist=[],ns=[],fl=0,last='';while(sg.st!='idle'||t<.1){LUL.sigTick(sg,.016,{clear:true,empty:true});t+=.016;if(sg.st!=last){hist.push([sg.st,+t.toFixed(2)]);last=sg.st}if(sg.st=='walk'){if(ns[ns.length-1]!==sg.n)ns.push(sg.n);if(sg.flash)fl+=.016}if(t>40)break}
 const tm=n=>(hist.find(h=>h[0]==n)||[0,-1])[1];
 ok(hist.map(h=>h[0]).join()=='amber,red,walk,clear,idle','signal: amber, red, walk, clear, idle in order ('+hist.map(h=>h[0]+'@'+h[1]).join(' ')+')');
 ok(Math.abs(tm('red')-G.amber)<.05&&Math.abs(tm('walk')-(G.amber+G.redMin))<.05&&Math.abs(tm('idle')-(G.amber+G.redMin+G.walk+G.clear))<.06,'signal: timings follow LUC.SIG (total '+tm('idle')+' s)');
 ok(ns[0]==G.walk&&ns[ns.length-1]==1&&ns.length==G.walk&&ns.every((v,i)=>!i||v==ns[i-1]-1),'signal: the countdown shows '+G.walk+' down to 1, once each');
 ok(Math.abs(fl-G.flash)<.1,'signal: the green man flashes for the last '+G.flash+' s ('+fl.toFixed(1)+')');
 ok(sg.carL=='g'&&!sg.carsStop&&sg.ped=='r'&&sg.n==0,'signal: back to cars green');
 const s2=LUL.makeSig();LUL.sigPress(s2);const st=[];for(let i=0;i<3000;i++){LUL.sigTick(s2,.016,{clear:true,empty:true});st.push(s2.st+(s2.carsStop?'S':'-'))}
 ok(st.every((x,i)=>/^(amber-|idle-)/.test(x)||/S$/.test(x)),'signal: cars are held (carsStop) in every state except idle and amber');
 const s3=LUL.makeSig();LUL.sigPress(s3);let w=0;while(s3.st!='walk'&&w<20){LUL.sigTick(s3,.016,{clear:false,empty:true});w+=.016}ok(Math.abs(w-(G.amber+G.redMax))<.1,'signal: walk waits for the cars to clear the zebra, but not longer than '+G.redMax+' s');
 const s4=LUL.makeSig();LUL.sigPress(s4);while(s4.st!='clear')LUL.sigTick(s4,.016,{clear:true,empty:false});let c4=0;while(s4.st=='clear'&&c4<20){LUL.sigTick(s4,.016,{clear:true,empty:false});c4+=.016}ok(Math.abs(c4-(G.clear+G.clearMax))<.1&&s4.st=='idle','signal: cars wait while somebody is still on the zebra (up to '+G.clearMax+' s extra)');
 /* the whole thing with traffic: nobody is on the zebra with a moving car while the man is green; traffic starts again afterwards */
 {const cars=[LUL.makeCar(1,-60,9),LUL.makeCar(1,-90,8.2),LUL.makeCar(-1,60,8.6),LUL.makeCar(-1,90,9)],sg=LUL.makeSig();let bad=0,walkT=0,went=0,after=0,seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<9000;i++){const T=i*.016;if(sg.st=='idle'&&T>5&&(Math.floor(T)%23==0))LUL.sigPress(sg);LUL.sigTick(sg,.016,{clear:LUL.zoneClear(cars),empty:true});cars.forEach(c=>LUL.carTick(c,.016,sg.carsStop,LUL.leaderOf(c,cars),rnd));
   if(sg.st=='walk'){walkT+=.016;if(!LUL.zoneClear(cars))bad++}if(sg.st=='idle'&&walkT>0){after+=.016;if(cars.some(c=>c.on&&c.v>5))went=1}}
  ok(bad==0&&walkT>20,'traffic sim (144 s, 4 cars, several button presses): no moving car on the zebra during green ('+bad+' bad frames, '+walkT.toFixed(0)+' s of green)');ok(went==1,'traffic sim: cars drive again after the signal returns to green')}
 ok(LUL.nearBtn({x:LUC.BTN[0].x,z:LUC.BTN[0].z+1})&&LUL.nearBtn({x:LUC.BTN[1].x,z:LUC.BTN[1].z-1})&&!LUL.nearBtn({x:0,z:0}),'signal: the push button works near either pole')}
/* Round 12c: ground layers do not flicker, benches are off the walkers' lanes, walkers turn round instead of ghosting */
{const L=LUC.LAY;let bad=[];for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j],ox=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),oz=Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0);if(ox>0&&oz>0&&Math.abs(a.y-b.y)<.004)bad.push(a.n+'/'+b.n)}
 ok(bad.length==0,'ground layers: no two overlapping layers share a height ('+(bad.join(' ')||'none')+')');
 ok(L.every(l=>l.x1>l.x0&&l.z1>l.z0)&&L.find(l=>l.n=='path').z1<=L.find(l=>l.n=='near').z0,'ground layers: the path stops at the near pavement');
 const lane=LUC.WALK.every(w=>LUC.BENCH.every(b=>{const nx=Math.abs(b[2])<1?1.05:.45,nz=Math.abs(b[2])<1?.45:1.05,dz=Math.abs(w.z-b[1])-nz-.4;return dz>.1||b[0]+nx<w.x0-.4||b[0]-nx>w.x1+.4}));
 ok(lane,'walkers: no bench stands in a walking lane (LUC.WALK vs LUC.BENCH)')}
{const wk={x:-14,z:LUC.WALK[0].z,x0:-14,x1:14,v:1.2,dir:1,cool:0},box={x0:0,x1:2.1,z0:wk.z-.5,z1:wk.z+.5},bl=(x,z)=>x+.4>box.x0&&x-.4<box.x1&&z+.4>box.z0&&z-.4<box.z1;let over=0,turns=0,pd=1;
 for(let i=0;i<9000;i++){LUL.walkTick(wk,.016,bl,null);if(bl(wk.x,wk.z))over++;if(wk.dir!=pd){turns++;pd=wk.dir}}
 ok(over==0&&turns>=4,'walker: turns back before a solid thing in his lane (overlaps '+over+', turns '+turns+')')}
{const wk={x:-5,z:0,x0:-14,x1:14,v:1.2,dir:1,cool:0},pl={x:3,z:.2};let near=1e9;for(let i=0;i<3000;i++){LUL.walkTick(wk,.016,null,pl);near=Math.min(near,Math.hypot(wk.x-pl.x,wk.z-pl.z))}
 ok(near>.95,'walker: turns round when the player stands in his way (closest '+near.toFixed(2)+')')}
{const wk={x:5,z:0,x0:-14,x1:14,v:1.2,dir:1,cool:0},pl={x:-3,z:0};let t=0;for(let i=0;i<400;i++){LUL.walkTick(wk,.016,null,pl);t++}ok(wk.x>5,'walker: a player behind him does not stop him')}
/* bus timeline */
{const b=LUL.makeBus();ok(b.st=='idle'&&LUL.busCall(b)&&b.st=='arr'&&!LUL.busCall(b),'bus: call once');
 let t=0,prev=b.x,mono=true;while(b.st=='arr'&&t<20){LUL.busTick(b,.016);t+=.016;if(b.x>prev+1e-9)mono=false;prev=b.x}
 ok(mono&&Math.abs(t-LUC.BUS.ta)<.05&&b.x==LUC.BUS.xs&&b.st=='stop','bus: rolls in, slows down, stops at the bus stop in '+t.toFixed(1)+' s');
 ok(!b.door,'bus: door still closed at the stop');
 let o=0;while(!LUL.outReady(b)&&o<10){LUL.busTick(b,.016);o+=.016}ok(b.door&&Math.abs(o-(LUC.BUS.door+LUC.BUS.out))<.05,'bus: door opens, player steps out after '+o.toFixed(1)+' s');
 ok(LUL.busLeave(b)&&!b.door&&b.st=='leave'&&!LUL.busLeave(b),'bus: leaves once');
 let l=0;while(b.st=='leave'&&l<30){LUL.busTick(b,.016);l+=.016}ok(b.st=='idle'&&l<8,'bus: drives off west and is gone in '+l.toFixed(1)+' s');
 const k=LUL.makeBus();LUL.busCall(k);LUL.busSkip(k);ok(k.st=='stop'&&k.door&&k.x==LUC.BUS.xs&&LUL.outReady(Object.assign(k,{t:5})),'bus: tap to skip puts it at the stop with the door open');
 ok(LUL.nearDoor({x:LUC.DOOR.x+1,z:LUC.DOOR.z})&&!LUL.nearDoor({x:0,z:0}),'bus: boarding only near the door')}
/* wiring */
const wh=R('world.html'),st=R('js/story.js'),mn=R('js/menu.js'),lh=R('luar.html'),lj=R('js/luar.js'),sw=R('sw.js'),rd=R('README.md');
ok(wh.includes("location.replace('luar.html')")&&wh.includes("sk_in"),'world.html: a new session goes to the outdoor map first');
ok(mn.includes("SS.del('sk_in');inMenu=false"),'menu.js: a new start clears the "already inside" flag (index to world launch unchanged)');
ok(st.includes('goHome()')&&st.includes("SS.set('sk_out','home')")&&st.includes('ret.home')&&st.includes('endDay()'),'story.js: the balik bell goes outside, the end card shows after the bus');
ok(st.includes("else if(!arr)posRestore()"),'story.js: Mod Jalan-jalan starts at the school entrance after the outdoor map, saved position kept in the save');
ok(/const L=\["js\/core.js", "js\/chars.js", "js\/ui.js", "js\/audio.js", "js\/hud.js", "js\/cam-clamp.js", "js\/wallet.js", "js\/bag.js", "js\/luar-logic.js", "js\/luar.js"\]/.test(lh),'luar.html: loads core, chars, ui, audio, hud, cam-clamp, wallet, bag, luar-logic, luar in order');
ok(sw.includes("CACHE='sr-r21c'")&&sw.includes("'luar.html'")&&sw.includes("'js/luar.js'")&&sw.includes("'js/luar-logic.js'"),'sw.js: cache sr-r14 with the outdoor files');
ok(/Round 12\b/.test(rd)&&/Round 12b/.test(rd)&&/Round 12c/.test(rd)&&/Luar Sekolah/.test(rd),'README has Round 12, 12b and 12c entries');
ok(/LUC\.LAY\.forEach/.test(lj)&&/W\*\.92/.test(lj)&&/LUC\.ICE\.z\+\.75/.test(lj)&&/walkTick/.test(lj)&&/DYNS\.some/.test(lj)&&/bold 22px/.test(lj)&&/fillText\('PERHENTIAN',96,62,150\)/.test(lj),'luar.js: layered ground, sign text fits (80%, squeeze guard), ice man in front of the cart, solid people, walker logic');
ok(/PERHENTIAN/.test(lj)&&/LALUAN BAS/.test(lj)&&/KEDAI RUNCIT/.test(lj)&&/PAPAN KENYATAAN/.test(lj),'luar.js: pole sign, route map, kedai runcit and notice boards exist');
ok(/sc\.remove\(m\);BG\.add\(m\)/.test(lj)&&!/setSig|sigOn/.test(lj),'luar.js: the bus board belongs to the bus (no floating sign); old signal code is gone');
ok(!/localStorage|cur\.save=|cur\.pos=/.test(lj),'luar.js writes no save data (saves untouched)');
const cu=R('js/core.js'),ui=R('js/ui.js'),bk=require('child_process').execSync('git --version 2>/dev/null || true').toString();
ok(fs.readFileSync(path.join(__dirname,'..','_backup_round20d/js/world.js'),'utf8').length>0&&cu.length>0&&ui.length>0,'backup _backup_round20d exists (older folders are no longer kept)');
console.log(f?f+' FAILED':'ALL PASSED');process.exit(f?1:0);
