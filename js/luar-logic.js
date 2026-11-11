/* Round 12: Luar Sekolah (outdoor map). Pure logic only (no THREE, no DOM) so tools/test-luar.js can run it in Node.
   Sizes are game units (1 unit is about 1 m). Axes: x east, z south (the school is at the top = small z). Malaysia drives on the LEFT:
   the east-bound lane is the north lane (z 0), the west-bound lane is the south lane (z 4), so the bus stops at the south (far) kerb with its door facing the pavement.
   Change the numbers in LUC to retune. */
const LUC={BX0:-35,BX1:35,BZ0:-34,BZ1:17,        /* map edges */
 RZ0:-2,RZ1:6,LE:0,LW:4,                          /* road: z from RZ0 to RZ1 (8 wide), lane centres east-bound / west-bound */
 ZX:-19,ZW:1.5,                                   /* zebra crossing: centre x and half width (3 wide) */
 CAR:{len:4.3,w:1.9,h:1.5,vmax:9,acc:4,dec:8,emg:20,gap:2,range:62}, /* cars: size, top speed, speeds in units per second */
 BUS:{len:10,w:2.6,h:3.2,xs:-9,x0:32,ta:5,door:.6,out:1.4,stay:2,la:4.4,end:-70,callIn:5}, /* bus: stop x, start x, seconds to arrive, door opens after, stays after the door, leave acceleration */
 SIG:{amber:1.5,redMin:.8,redMax:4,walk:12,flash:4,clear:2.5,clearMax:4}, /* zebra signal: seconds (amber for cars, min / max wait for cars to clear the zebra, green walk with countdown, last seconds flash, all-red) */
 DOOR:{x:-12.8,z:6.5},                            /* where the bus door meets the pavement (step off / board here) */
 BTN:[{x:-19+2.4,z:-2-.8},{x:-19+2.4,z:6+.8}], /* push buttons on the two signal poles */
 /* Round 12c: ground layers. Layers that overlap MUST have different y or they flicker (z-fighting); tools/test-luar.js checks this. Lane markings and the zebra sit above the road at y .02 / .025. */
 LAY:[{n:'forecourt',x0:-32,x1:32,z0:-27,z1:-19,y:.01,c:'#bdb6a4'},{n:'path',x0:-4,x1:4,z0:-27,z1:-5,y:.02,c:'#b3aa95'},{n:'near',x0:-35,x1:35,z0:-5,z1:-2,y:.01,c:'#9ea2ac'},{n:'road',x0:-35,x1:35,z0:-2,z1:6,y:.01,c:'#3b3f47'},{n:'far',x0:-35,x1:35,z0:6,z1:9,y:.01,c:'#9ea2ac'},{n:'plaza',x0:10,x1:34,z0:9,z1:14,y:.01,c:'#aaa493'},{n:'slab',x0:-12.3,x1:-5.7,z0:6.7,z1:9.9,y:.015,c:'#7d808a'}],
 BENCH:[[-27,-4.2,0],[8.5,-4.2,0],[28,-4.2,0],[-20,-22.2,0],[20,-22.2,0],[13.5,9.4,Math.PI],[30.5,9.4,Math.PI]], /* x, z, turn: benches along the pavements; a bench is 2.1 wide and .9 deep */
 WALK:[{g:'m',z:-2.75,x0:-14,x1:14,v:1.2,x:-4},{g:'f',z:7.6,x0:4,x1:18,v:1,x:10}], /* two students who walk to and fro along a pavement lane */
 FZ:-19,GATE:3,                                   /* Round 12d: fence line z and half width of the gate */
 CH:{wait:3,k:1.15,pspd:5,catch:.9,r:.35,gap:.25,gapMax:1.2}, /* Round 12d: chaser: seconds before it runs, speed factor over the player's speed (pspd), catch distance, body radius, beep gap range */
 SCHOOL:{x:0,z:-26},GUARD:{x:3.9,z:-20.6},NASI:{x:28.5,z:9.8},RUN:{x:18.75,z:9.8},ICE:{x:-25,z:-6.6}};
const LUL={
 /* what the page does on arrival: 'exit' = came out of the school door in the middle of the day (Round 12d), 'skip' = a Mod Kelas day is saved (carry on inside), 'home' = day finished (Mod Kelas, day data present), else 'arrive' (bus in the morning) */
 flow(o){if(o.out=='exit')return'exit';if(o.out=='home'&&o.hasDay)return'home';if(o.story&&o.savedDay)return'skip';return'arrive'},
 /* cars stop while a walker is on or at the edge of the crossing */
 pedZone(p){return p.x>=LUC.ZX-LUC.ZW-.3&&p.x<=LUC.ZX+LUC.ZW+.3&&p.z>=LUC.RZ0-.7&&p.z<=LUC.RZ1+.7},
 safeZone(p){return p.x>=LUC.ZX-LUC.ZW-.4&&p.x<=LUC.ZX+LUC.ZW+.4},
 makeCar(dir,x,vmax){return{dir,x,v:0,z:dir>0?LUC.LE:LUC.LW,len:LUC.CAR.len,w:LUC.CAR.w,vmax:vmax||LUC.CAR.vmax,on:true,wait:0,hold:false}},
 /* nearest car ahead in the same lane */
 leaderOf(c,all){let b=null,bd=1e9;all.forEach(o=>{if(o===c||!o.on||o.dir!=c.dir)return;const d=(o.x-c.x)*c.dir;if(d>0&&d<bd){bd=d;b=o}});return b},
 /* one step of a car: speed up to the target, brake for the crossing (only while ped is true) and for the car in front; wraps around with a random wait */
 carTick(c,dt,ped,leader,rand){const K=LUC.CAR;
  if(!c.on){c.wait-=dt;if(c.wait<=0&&!c.hold){c.on=true;c.x=-c.dir*K.range;c.v=c.vmax}return}
  const fr=c.x+c.dir*c.len/2;let vt=c.vmax,emg=false;
  if(ped){const gap=c.dir>0?(LUC.ZX-LUC.ZW-.8)-fr:fr-(LUC.ZX+LUC.ZW+.8);if(gap>=-.2){vt=Math.min(vt,Math.sqrt(2*K.dec*Math.max(gap,0)));if(gap<4.5)emg=true}}
  if(leader){const g=c.dir>0?(leader.x-leader.len/2)-fr:fr-(leader.x+leader.len/2);vt=Math.min(vt,Math.sqrt(2*K.dec*Math.max(0,g-K.gap)));if(g<K.gap+1)emg=true}
  if(c.v<vt)c.v=Math.min(vt,c.v+K.acc*dt);else c.v=Math.max(vt,c.v-(emg?K.emg:K.dec+1)*dt);
  c.x+=c.dir*c.v*dt;
  if(c.dir*c.x>K.range+4){c.on=false;c.v=0;c.wait=2+(rand?rand():.5)*6}},
 /* a car hits the player if it is moving, unless the player is on the zebra while the signal holds the cars (sg.carsStop) */
 hitCar(p,c,sg){if(!c.on||p.y>1.3||c.v<.8||(sg&&sg.carsStop&&LUL.safeZone(p)))return false;return Math.abs(p.x-c.x)<c.len/2+.3&&Math.abs(p.z-c.z)<c.w/2+.3},
 kerbZ(p){return p.z<(LUC.RZ0+LUC.RZ1)/2?LUC.RZ0-1.4:LUC.RZ1+1.2}, /* where a bumped player is put back: the nearer pavement */
 /* pedestrian signal with a push button, like a normal crosswalk: idle (cars go, red man) -> press -> amber (cars) -> red (cars stop, wait until the zebra is clear) -> walk (green man, countdown) -> clear (all red, wait until the zebra is empty) -> idle.
    Read: s.carL 'g'/'a'/'r' (car light), s.ped 'r'/'g' (man), s.n (countdown number, 0 = none), s.flash (green man is blinking), s.carsStop (cars hold at the line). */
 makeSig(){return{st:'idle',t:0,n:0,flash:false,ped:'r',carL:'g',carsStop:false}},
 sigPress(s){if(s.st!='idle')return false;s.st='amber';s.t=0;s.carL='a';return true},
 sigTick(s,dt,x){const G=LUC.SIG;x=x||{};
  if(s.st=='amber'){s.t+=dt;if(s.t>=G.amber){s.st='red';s.t=0;s.carL='r';s.carsStop=true}}
  else if(s.st=='red'){s.t+=dt;if((s.t>=G.redMin&&x.clear!==false)||s.t>=G.redMax){s.st='walk';s.t=0;s.ped='g';s.n=G.walk}}
  else if(s.st=='walk'){s.t+=dt;const left=G.walk-s.t;s.n=Math.max(1,Math.ceil(left));s.flash=left<=G.flash;if(s.t>=G.walk){s.st='clear';s.t=0;s.ped='r';s.n=0;s.flash=false}}
  else if(s.st=='clear'){s.t+=dt;if((s.t>=G.clear&&x.empty!==false)||s.t>=G.clear+G.clearMax){s.st='idle';s.t=0;s.carL='g';s.carsStop=false}}},
 /* no moving car on or over the zebra */
 zoneClear(cars){const a=LUC.ZX-LUC.ZW-.3,b=LUC.ZX+LUC.ZW+.3;return!cars.some(c=>c.on&&c.v>.3&&c.x+c.len/2>a&&c.x-c.len/2<b)},
 nearBtn(p){return LUC.BTN.some(b=>Math.hypot(p.x-b.x,p.z-b.z)<2.2)},
 /* bus: idle -> arr (rolls in, slows down) -> stop (door opens) -> leave (speeds up west) -> idle. st 'wait' = idle but the call timer is running */
 makeBus(){return{st:'idle',t:0,x:LUC.BUS.x0,door:false}},
 busCall(b){if(b.st!='idle')return false;b.st='arr';b.t=0;b.x=LUC.BUS.x0;b.door=false;return true},
 busLeave(b){if(b.st!='stop')return false;b.st='leave';b.t=0;b.door=false;return true},
 busTick(b,dt){const B=LUC.BUS;if(b.st=='arr'){b.t+=dt;const s=Math.max(0,1-b.t/B.ta);b.x=B.xs+(B.x0-B.xs)*s*s;if(b.t>=B.ta){b.st='stop';b.t=0;b.x=B.xs}}
  else if(b.st=='stop'){b.t+=dt;if(b.t>=B.door)b.door=true}
  else if(b.st=='leave'){b.t+=dt;b.x=B.xs-B.la*b.t*b.t;if(b.x<B.end){b.st='idle';b.t=0}}},
 /* skip the arrival: the bus is already at the stop with the door open */
 busSkip(b){b.st='stop';b.t=LUC.BUS.door;b.x=LUC.BUS.xs;b.door=true},
 /* arrival scene: the player steps out when the door has been open for BUS.out seconds */
 outReady(b){return b.st=='stop'&&b.t>=LUC.BUS.door+LUC.BUS.out},
 nearDoor(p){return Math.hypot(p.x-LUC.DOOR.x,p.z-LUC.DOOR.z)<2.8},
 /* ---- Round 12d: the guard chases a pupil who left school during lessons (Mod Kelas). Same object can later drive the prefect.
    c.st: 'off' -> 'wait' (alerted, whistle, gives the pupil CH.wait seconds) -> 'run' -> 'caught'. free(x,z) = true when a body of radius CH.r fits there. */
 chaseMake(x,z){return{st:'off',t:0,x,z,f:0,mv:0,bt:0,turn:1}},
 chaseStart(c){if(c.st!='off')return false;c.st='wait';c.t=LUC.CH.wait;c.bt=0;return true},
 sideOf(z){return z<LUC.FZ-.5?-1:z>LUC.FZ+.5?1:0},
 /* where the chaser heads: straight at the pupil, or through the gate when the fence is between them */
 chaseAim(c,p){const a=LUL.sideOf(c.z),b=LUL.sideOf(p.z);if(a!=0&&b!=0&&a!=b)return{x:Math.max(-1.5,Math.min(1.5,p.x*.2)),z:LUC.FZ+(a<0?.2:-.2)};return{x:p.x,z:p.z}},
 /* try the straight step, then slide along one axis, then steer round (+-45, +-90 degrees); c.turn remembers which way worked so it does not dither */
 chaseStep(c,dx,dz,free){if(free(c.x+dx,c.z+dz)){c.x+=dx;c.z+=dz;return true}
  const L0=Math.hypot(dx,dz),ax=Math.abs(dx)>.35*L0,az=Math.abs(dz)>.35*L0; /* slide only along a part that really moves, otherwise steer round */
  if(Math.abs(dx)>=Math.abs(dz)){if(ax&&free(c.x+dx,c.z)){c.x+=dx;return true}if(az&&free(c.x,c.z+dz)){c.z+=dz;return true}}else{if(az&&free(c.x,c.z+dz)){c.z+=dz;return true}if(ax&&free(c.x+dx,c.z)){c.x+=dx;return true}}
  const l=Math.hypot(dx,dz),a0=Math.atan2(dx,dz);for(const sg of[c.turn,-c.turn]){for(const k of[.8,1.57,2.4]){const a=a0+k*sg,nx=Math.sin(a)*l,nz=Math.cos(a)*l;if(free(c.x+nx,c.z+nz)){c.x+=nx;c.z+=nz;c.turn=sg;return true}}}
  return false},
 /* one frame. Returns 'alert' (the wait is over, it starts to run), 'caught' or ''. */
 chaseTick(c,dt,p,free){const H=LUC.CH;if(c.st=='off'||c.st=='caught'){c.mv=0;return''}
  c.f=Math.atan2(p.x-c.x,p.z-c.z);
  if(c.st=='wait'){c.mv=0;c.t-=dt;if(c.t<=0){c.st='run';return'alert'}return''}
  const q=LUL.chaseAim(c,p),dx=q.x-c.x,dz=q.z-c.z,l=Math.hypot(dx,dz),s=H.pspd*H.k*dt;
  if(l>.01){c.f=Math.atan2(dx,dz);c.mv=LUL.chaseStep(c,dx/l*Math.min(s,l),dz/l*Math.min(s,l),free)?1:0}
  if(Math.hypot(p.x-c.x,p.z-c.z)<H.catch&&Math.abs(LUL.sideOf(c.z)-LUL.sideOf(p.z))<2){c.st='caught';c.mv=0;return'caught'}
  return''},
 /* seconds between warning beeps: faster when the chaser is close */
 beepGap(d){const H=LUC.CH;return Math.max(H.gap,Math.min(H.gapMax,H.gap+d*.045))},
 chaseBeep(c,dt,d){if(c.st!='run')return false;c.bt-=dt;if(c.bt<=0){c.bt=LUL.beepGap(d);return true}return false},
 near(p,q,r){return Math.hypot(p.x-q.x,p.z-q.z)<r},
 /* a walking student: turns round at the ends, when something solid is ahead (blocked(x,z)) and when the player is in the way (pl); then walks away for a moment */
 walkTick(w,dt,blocked,pl){if(w.cool>0)w.cool-=dt;const nx=w.x+w.dir*w.v*dt;let stop=false;
  if(!(w.cool>0)){if(blocked&&blocked(nx,w.z))stop=true;else if(pl&&(pl.x-w.x)*w.dir>-.2&&Math.hypot(nx-pl.x,w.z-pl.z)<1.1)stop=true}
  if(stop){w.dir=-w.dir;w.cool=.8;return}
  w.x=nx;if(w.x>w.x1){w.x=w.x1;w.dir=-1}else if(w.x<w.x0){w.x=w.x0;w.dir=1}}
};
if(typeof module!='undefined')module.exports={LUC,LUL};
