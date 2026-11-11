/* Round 19h: people in the hallway are solid and steer around each other (world.js). Pure logic, no THREE, so tools/test-solid.js runs the real functions.
   - blocks(): is a player move into a person? Only a move that gets CLOSER is refused, so nobody can ever be trapped inside a person.
   - walk(): one walking step of a hallway NPC. It steers to its right around NPCs ahead (never into a wall or prop), never steps closer than C.gap to another NPC
     or C.pgap to the player (the player is not steered around: the NPC waits, says "Tepi sikit!" and after C.wait seconds it pauses and tries the other side). */
const NNAV=(()=>{
 const C={look:1.8,gap:.55,pgap:.75,rad:.4,wait:2,swap:1.5,jam:8,sayAt:.8,cool:5000,near:1.1,turn:.5,rel:2,relT:1.5,yield:1.4,far:1.7,bk:1.2,
  T:['Eh, sabar!','Oi!'],
  L:['Tepi sikit!','Tumpang lalu!','Excuse me!']};
 const ST={bh:false}; /* bh: a move of the player was refused by a person since the last stuck() call */
 const alive=o=>!!(o&&o.m&&o.m.visible!==false&&!(o.hid>0));
 function blocks(ns,x,z,r,px,pz){return ns.some(o=>{if(!alive(o)||o.pr>0)return false;const d=Math.hypot(x-o.x,z-o.z);if(d<r+C.rad&&d<Math.hypot(px-o.x,pz-o.z)-1e-6){ST.bh=true;return true}return false})}
 /* X: {ns,P,gst (true = the Epal Fuji effect is on),hit(x,z,r),la(a,b,t),say(n,text),rnd(a,b),now()} ; (ux,uz) = unit vector towards the target */
 function walk(n,ux,uz,dt,X){
  const sp=n.sp*dt,sd=n.sd||1;let vx=ux,vz=uz;
  for(const o of X.ns){if(o===n||!alive(o))continue;const ox=o.x-n.x,oz=o.z-n.z,dd=Math.hypot(ox,oz);
   if(dd<C.look&&ox*ux+oz*uz>0){const k=(1-dd/C.look)*2.2;vx+=uz*sd*k;vz-=ux*sd*k}}
  const m=Math.hypot(vx,vz)||1;vx/=m;vz/=m;
  let nx=n.x+vx*sp,nz=n.z+vz*sp;
  if((vx!==ux||vz!==uz)&&X.hit(nx,nz,.25)){vx=ux;vz=uz;nx=n.x+ux*sp;nz=n.z+uz*sp}
  const closer=(o,gap)=>{const a=Math.hypot(nx-o.x,nz-o.z);return a<gap&&a<Math.hypot(n.x-o.x,n.z-o.z)};
  const nBlk=!(n.gh>0)&&X.ns.some(o=>o!==n&&alive(o)&&closer(o,C.gap)),pBlk=!X.gst&&closer(X.P,C.pgap);
  if(n.gh>0)n.gh-=dt;
  if(nBlk||pBlk){n.mv=0;n.bk=(n.bk||0)+dt;if(nBlk)n.tb=(n.tb||0)+dt;
   if(pBlk&&n.bk>C.sayAt){const t=X.now();if(t-(n.sa||0)>=C.cool){n.sa=t;X.say(n,C.L[Math.floor(X.rnd(0,C.L.length))%C.L.length])}}
   if(nBlk&&n.tb>C.jam){n.tb=0;n.gh=1.5} /* last resort: after C.jam seconds of being boxed in by people (not the player) it may slip through for 1.5 s, so no jam can last */
   if(n.bk>(pBlk?C.wait:C.swap)){n.bk=0;n.w=X.rnd(.4,1.6);n.sd=pBlk?-sd:(X.rnd(0,1)<.5?-1:1)}
   return false}
  n.bk=0;n.tb=Math.max(0,(n.tb||0)-dt*.5);n.x=nx;n.z=nz;n.f=X.la(n.f,Math.atan2(vx,vz),Math.min(1,dt*8));n.mv=1;return true}
 /* Round 19i: a person turns back. Set by stuck() (o.yl seconds left); world.js calls back() instead of walk(). The person walks straight away from the player (or 45 degrees to either side if that is blocked by a wall, prop or person) until C.far metres away, then pauses and tries another side. */
 function back(n,dt,X){n.yl-=dt;const P=X.P;let ax=n.x-P.x,az=n.z-P.z;const d=Math.hypot(ax,az)||1;ax/=d;az/=d;
  if(d>=C.far||n.yl<=0){n.yl=0;n.w=X.rnd(.4,.9);n.sd=X.rnd(0,1)<.5?-1:1;n.mv=0;return false}
  const sp=n.sp*dt*C.bk,k=.7071;
  for(const v of[[ax,az],[(ax+az)*k,(az-ax)*k],[(ax-az)*k,(az+ax)*k]]){const nx=n.x+v[0]*sp,nz=n.z+v[1]*sp;
   if(X.hit(nx,nz,.25))continue;
   if(X.ns.some(o=>o!==n&&alive(o)&&Math.hypot(nx-o.x,nz-o.z)<C.gap&&Math.hypot(nx-o.x,nz-o.z)<Math.hypot(n.x-o.x,n.z-o.z)))continue;
   n.x=nx;n.z=nz;n.f=X.la(n.f,Math.atan2(v[0],v[1]),Math.min(1,dt*8));n.mv=1;return true}
  n.mv=0;return false}
 /* Round 19i: the player pressed a direction, did not move, and a person refused the move. S = {t,f,say,rnd} kept by world.js.
    After C.turn s every walking person within C.near m turns back (and says a line). People who cannot walk (toilet scripts, the chasing prefect) are not turned.
    Safety net: after C.rel s of the same standstill the people within C.near m stop being solid for the player for C.relT s (o.pr), so nobody stays pinned. */
 function stuck(ns,P,press,moved,dt,S){
  for(const o of ns)if(o.pr>0)o.pr-=dt;
  const hit=ST.bh;ST.bh=false;
  const near=ns.filter(o=>alive(o)&&Math.hypot(o.x-P.x,o.z-P.z)<C.near);
  if(moved){S.t=0;S.f=0;return 0}
  if(press&&hit&&near.length){S.t+=dt;S.f+=dt}else{S.t=Math.max(0,S.t-dt*2);S.f=Math.max(0,S.f-dt)}
  let r=0;
  if(S.t>=C.turn){S.t=0;let said=0;for(const o of near){if(o.ch||o.yl>0)continue;o.yl=C.yield;r=1;if(!said&&S.say){said=1;S.say(o,C.T[Math.floor(S.rnd(0,C.T.length))%C.T.length])}}}
  if(S.f>=C.rel){S.f=0;for(const o of near)o.pr=C.relT;r=2}
  return r}
 return{C,ST,alive,blocks,walk,back,stuck}})();
