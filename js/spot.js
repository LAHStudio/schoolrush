/* Round 15b: random rubbish (sampah) spots. Pure logic, no THREE.
   SPOT.pool(o)  lists floor spots the player can really walk to (flood fill from the start, margin from walls, so never inside a wall or a classroom).
   SPOT.pick(pool,avoid,rnd)  picks one spot that keeps away from every avoid circle {x,z,r}.
   SPOT.make(cfg)  ties it to a page's SM list: init() (first placement, or restore), respawn(s), save().
   Tune everything in CFG below. Global names: SPOT. */
const SPOT=(()=>{
 const CFG={gap:60,step:.75,walk:.4,clear:1.1,keep:true}; /* gap = seconds before a picked item comes back (somewhere else); keep = remember the items for this session so leaving and re-entering a page does not refill them */
 function pool(o){const st=o.step||CFG.step,wk=o.walk||CFG.walk,cl=o.clear||CFG.clear,nx=Math.floor((o.x1-o.x0)/st)+1,nz=Math.floor((o.z1-o.z0)/st)+1;
  const si=Math.round((o.sx-o.x0)/st),sj=Math.round((o.sz-o.z0)/st);if(!(si>=0&&sj>=0&&si<nx&&sj<nz))return[];
  const seen=new Uint8Array(nx*nz),q=[si+sj*nx];seen[q[0]]=1;
  for(let h=0;h<q.length;h++){const i=q[h]%nx,j=(q[h]-i)/nx;
   [[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{const a=i+d[0],b=j+d[1];if(a<0||b<0||a>=nx||b>=nz)return;const k=a+b*nx;if(seen[k])return;if(o.hit(o.x0+a*st,o.z0+b*st,wk))return;seen[k]=1;q.push(k)})}
  const r=[];q.forEach(k=>{const i=k%nx,j=(k-i)/nx,x=o.x0+i*st,z=o.z0+j*st;if(!o.hit(x,z,cl))r.push({x,z})});return r}
 function pick(pl,avoid,rnd){rnd=rnd||Math.random;if(!pl||!pl.length)return null;
  const ok=(p,list)=>list.every(a=>Math.hypot(p.x-a.x,p.z-a.z)>=a.r),good=pl.filter(p=>ok(p,avoid));
  if(good.length)return good[Math.floor(rnd()*good.length)];
  const hard=avoid.filter(a=>a.hard),g2=pl.filter(p=>ok(p,hard));return g2.length?g2[Math.floor(rnd()*g2.length)]:null}
 /* cfg: {SM, pool (array), avoid()->[{x,z,r,hard?}] (fixed props and the player), key (session key), now()} */
 function make(c){const now=c.now||Date.now,rnd=c.rnd||Math.random;
  const show=s=>{s.k.forEach((g,i)=>g.visible=s.cd<=0&&i==s.ty)};
  const put=(s,p)=>{s.x=p.x;s.z=p.z;s.k.forEach(g=>{g.position.x=p.x;g.position.z=p.z})};
  const near=(s)=>c.SM.filter(u=>u!==s).map(u=>({x:u.x,z:u.z,r:4}));
  function relocate(s){const p=pick(c.pool,c.avoid().concat(near(s),[{x:s.x,z:s.z,r:5}]),rnd);if(p)put(s,p)}
  function save(){if(!CFG.keep||!c.key)return;try{const t=now();c.SS.set(c.key,c.SM.map(s=>({x:s.x,z:s.z,ty:s.ty,w:s.cd>0?1:0,t:t+Math.max(0,s.cd)*1000})))}catch(e){}}
  function respawn(s){s.cd=0;s.ty=(s.ty+1)%4;relocate(s);show(s);save()}
  function init(){const a=CFG.keep&&c.key?c.SS.get(c.key):null;
   if(Array.isArray(a)&&a.length==c.SM.length&&a.every(r=>r&&Number.isFinite(r.x)&&Number.isFinite(r.z))){
    a.forEach((r,i)=>{const s=c.SM[i];s.ty=((r.ty|0)%4+4)%4;put(s,r);const left=r.w?(r.t-now())/1000:0;if(r.w&&left<=0){respawn(s)}else{s.cd=r.w?left:0;show(s)}});save();return true}
   c.SM.forEach(s=>{s.cd=0;relocate(s);show(s)});save();return false}
  return{init,respawn,save,relocate,show}}
 return{CFG,pool,pick,make,GAP:()=>CFG.gap}
})();
