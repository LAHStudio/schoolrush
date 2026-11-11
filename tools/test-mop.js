/* Round 20d: Mop Terbang (js/mop.js): riding is a look only (no speed, no jump, no obstacle change), droplets, getting off, bag row, hooks. Node only; mop.js runs for real in a vm with a fake THREE.
   Run: node tools/test-mop.js */
const fs=require('fs'),path=require('path'),vm=require('vm');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ex=f=>fs.existsSync(path.join(__dirname,'..',f));
const SRC=rd('js/mop.js'),WJ=rd('js/world.js').replace(/\r/g,''),HTML=rd('world.html'),SW=rd('sw.js'),JKS=rd('js/jkey.js');
const lcg=s=>()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};

/* ---- 1. files and hooks ---- */
ok(/function act\(\)\{if\(halt\)return;if\(window\.mopAct\)mopAct\(\);if\(window\.exitGo&&exitGo\(\)\)return;/.test(WJ),'world.js: act() calls mopAct first (after the halt check), before the door, locker and toilet actions');
ok(/if\(window\.toiTick\)toiTick\(dt,t\);if\(window\.jkTick\)jkTick\(dt\);if\(window\.mopTick\)mopTick\(dt,t\);drawMM\(\);/.test(WJ),'world.js: mopTick runs every frame after the player mesh is placed and animated');
ok(/"js\/jkey\.js", "js\/mop\.js", "js\/world-build\.js"/.test(HTML)&&/'js\/jkey\.js','js\/mop\.js'/.test(SW)&&/CACHE='sr-r20d'/.test(SW),'world.html loads js/mop.js, sw.js caches it (cache sr-r20d)');
ok(ex('_backup_round20d/js/world.js')&&ex('_backup_round20d/js/jkey.js')&&!ex('_backup_round20d/js/mop.js'),'20d backup holds the files changed (mop.js is new)');
/* a look only: the file never writes the walking state (position, velocity, slow, boost, speed) */
ok(!/\bP\.(x|z|sx|sz|slow|boost|stun|f)\s*([+\-*\/]?=)(?!=)/.test(SRC),'mop.js never writes P.x, P.z, P.sx, P.sz, P.slow, P.boost, P.stun or P.f (speed and collisions stay exactly the walking ones)');
ok(!/\bSP\b|\bhit\(|\bhitG\b|\bhitNS\b|\bcols\b/.test(SRC),'mop.js does not touch the speed constant or the collision code');
ok(/P\.y=0;P\.vy=0;/.test(SRC)&&/pm\.position\.y=CFG\.hover/.test(SRC),'it only keeps P.y and P.vy at 0 (no jump) and lifts the drawn mesh');
ok(!/localStorage|sessionStorage|save\(\)|cur\./.test(SRC.replace(/\/\*[\s\S]*?\*\//g,'')),'riding is not saved (the new page starts on foot); mop.js has no save code');
ok(!/(?<![.\w])(NSAY|NX|NNAV|CHT)\b/.test(SRC),'mop.js does not touch names that belong to other files');

/* ---- 2. a world for mop.js ---- */
class V3{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
class Obj{constructor(){this.children=[];this.parent=null;this.position=Object.assign(new V3(),{});this.rotation={x:0,y:0,z:0};this.scale={v:1,setScalar(v){this.v=v}};this.visible=true;this.userData={};this.castShadow=true}
 add(c){if(c.parent)c.parent.children=c.parent.children.filter(x=>x!==c);c.parent=this;this.children.push(c);return this}
 updateMatrixWorld(){}localToWorld(v){v.x+=this.position.x;v.y+=this.position.y;v.z+=this.position.z;return v}}
class Mesh extends Obj{constructor(g,m){super();this.geometry=g;this.material=m}}
const geo=n=>class{constructor(...a){this.n=n;this.a=a}};
const fakeT={Group:Obj,Mesh,Vector3:V3,CylinderGeometry:geo('cyl'),BoxGeometry:geo('box'),SphereGeometry:geo('sph'),MeshBasicMaterial:class{constructor(o){Object.assign(this,o)}},MeshLambertMaterial:class{constructor(o){Object.assign(this,o)}}};
function world(o){o=o||{};const sc={children:[],add(c){this.children.push(c)}},pm=new Obj(),leg=()=>({rotation:{x:0}}),toasts=[],says=[],
 ctx={T:fakeT,sc,pm,P:{x:0,y:0,z:0,vy:0,sx:0,sz:0,slow:0,boost:0,stun:0,f:0},TOIL:o.TOIL||[],toast:t=>toasts.push(t),say:t=>says.push(t),window:{},console,drink:0,carry:-1,
  JK:{st:()=>o.own===false?{lt:[0,0]}:{lt:[0,1]}}};
 pm.userData={legs:[leg(),leg()],arms:[leg(),leg()]};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(SRC+';globalThis.MOP=MOP',ctx);ctx.MOP.setRnd(o.rnd||lcg(5));return{ctx,M:ctx.MOP,sc,pm,toasts,says,P:ctx.P}}
const step=(w,n,dt,mv)=>{for(let i=0;i<n;i++){if(mv){w.P.x+=.05;w.P.z+=.02}w.ctx.window.mopTick(dt,i*dt)}};

/* ---- 3. getting on and off ---- */
{const w=world({own:false}),r=w.M.toggle();ok(r.msg==w.M.CFG.no&&!r.close&&!w.M.isOn()&&w.sc.children.length==0,'no mop owned: "Kamu belum ada Mop Terbang.", nothing is built');
 const o=world(),a=o.M.toggle();ok(a.close===true&&a.msg==o.M.CFG.on&&o.M.isOn()&&o.ctx.window.mopOn()===true,'owned: gets on, the bag closes');
 ok(o.sc.children.length==24&&o.sc.children.every(m=>m.visible===false&&m.castShadow===false),'24 droplet meshes are built once (hidden, no shadows)');
 const G=o.pm.children.find(c=>c.children&&c.children.length==4);ok(G&&G.visible&&G.parent===o.pm,'the mop is a child of the player mesh and visible');
 ok(G.children.length==4&&G.children[0].geometry.n=='cyl'&&Math.abs(G.children[0].rotation.x-Math.PI/2)<1e-9,'a handle along the facing direction, a ferrule, a head and a band');
 ok(G.children[2].position.z<0&&G.children[2].position.z==o.M.CFG.headZ,'the mop head trails behind the rider');
 ok(o.says.includes(o.M.CFG.wow),'"Wuuu! Terbang!"');
 const b=o.M.toggle();ok(b.close===true&&b.msg==o.M.CFG.off&&!o.M.isOn()&&G.visible===false&&o.pm.position.y==0&&o.P.y==0,'toggle again: gets off, the mop is hidden, the player is back on the ground');
 o.M.toggle();ok(o.M.isOn()&&o.sc.children.length==24&&o.pm.children.filter(c=>c===G).length==1,'getting on again reuses the same mesh and pool (nothing new is built)');
 /* refusals */
 const t=world({TOIL:[{x0:-5,x1:5,z0:-5,z1:5}]});t.P.x=0;t.P.z=0;ok(t.M.toggle().msg==t.M.CFG.wc&&!t.M.isOn(),'inside a toilet room: cannot get on');t.P.x=5.2;ok(t.M.toggle().msg==t.M.CFG.wc,'0.3 m outside the room edge counts as the toilet (the door)');t.P.x=6;ok(t.M.toggle().close===true,'6 m away is fine');
 const c=world();c.ctx.window.lockBusy=()=>true;ok(c.M.toggle().msg==c.M.CFG.chase&&!c.M.isOn()&&/pengawas/i.test(c.M.CFG.chase),'a prefect chases: cannot get on');
 const n=world();n.ctx.pm=null;ok(n.M.toggle().msg==n.M.CFG.no||!n.M.isOn(),'no player mesh: nothing breaks')}

/* ---- 4. riding is a look only ---- */
{const w=world();w.M.toggle();w.P.x=3;w.P.z=4;w.P.sx=1;w.P.sz=-1;w.P.slow=1.2;w.P.boost=3;w.P.f=1.3;w.P.y=.9;w.P.vy=6;
 w.ctx.window.mopTick(.016,0);
 ok(w.P.x==3&&w.P.z==4&&w.P.sx==1&&w.P.sz==-1&&w.P.slow==1.2&&w.P.boost==3&&w.P.f==1.3,'position, velocity, slow, boost and heading are not touched by the mop (same speed as walking)');
 ok(w.P.y==0&&w.P.vy==0,'a jump is cancelled every frame: no jump while riding, so obstacles that a jump clears stay as hard as walking');
 const hs=[];for(let i=0;i<120;i++){w.ctx.window.mopTick(.016,i*.016);hs.push(w.pm.position.y)}
 ok(Math.min(...hs)>=w.M.CFG.hover-w.M.CFG.bob-1e-9&&Math.max(...hs)<=w.M.CFG.hover+w.M.CFG.bob+1e-9&&Math.max(...hs)-Math.min(...hs)>.02,'the mesh hovers 0.45 m with a small bob (+-0.04)');
 ok(w.pm.userData.legs.every(l=>l.rotation.x==-1)&&w.pm.userData.arms.every(a=>a.rotation.x==-1),'riding pose: legs and both arms forward');
 w.ctx.drink=1;w.pm.userData.arms[1].rotation.x=-2.4;w.ctx.window.mopTick(.016,0);ok(w.pm.userData.arms[1].rotation.x==-2.4&&w.pm.userData.arms[0].rotation.x==-1,'a drink in hand keeps its own arm pose');
 w.ctx.drink=0;w.ctx.carry=3;w.pm.userData.arms[1].rotation.x=-.9;w.ctx.window.mopTick(.016,0);ok(w.pm.userData.arms[1].rotation.x==-.9,'carrying something keeps its own arm pose');
 const old=w.pm.children.find(c=>c.children.length==4),pm2=new Obj();pm2.userData={legs:[{rotation:{x:0}},{rotation:{x:0}}],arms:[{rotation:{x:0}},{rotation:{x:0}}]};w.ctx.pm=pm2;w.ctx.window.mopTick(.016,0);ok(old.parent===pm2&&pm2.children.includes(old)&&!w.pm.children.includes(old),'when the player mesh is rebuilt (new outfit) the mop moves to the new one')}
{const w=world();w.pm.position.y=.3;w.ctx.window.mopTick(.5,0);ok(w.pm.position.y==.3&&w.sc.children.length==0,'not riding: mopTick does nothing at all')}

/* ---- 5. droplets ---- */
{const w=world();w.M.toggle();const pool=w.M.pool(),act=()=>pool.filter(m=>m.visible).length;
 step(w,1,.016,true);ok(act()==0||act()==1,'no flood on the first frame');
 step(w,70,.016,true);const a1=act();ok(a1>=5&&a1<=24,'moving: about one droplet every 0.07 s ('+a1+' alive after ~1.1 s)');
 pool.filter(m=>m.visible).forEach(m=>ok(Math.abs(m.position.z-(w.pm.position.z+w.M.CFG.headZ))<2&&m.position.y<w.M.CFG.hover+.8,'a droplet starts at the mop head, not at the player'));
 const p0=pool.filter(m=>m.visible).map(m=>m.position.y);step(w,10,.016,true);ok(pool.filter(m=>m.visible&&m.position.y<.03).length==0,'a droplet that reaches the floor is gone');
 ok(pool.every(m=>m.userData.d.life<=m.userData.d.max&&m.scale.v<=1&&m.scale.v>=0),'droplets shrink as they age');
 step(w,300,.016,false);ok(act()<=Math.ceil(w.M.CFG.life[1]/w.M.CFG.idle)+1,'standing still: only a slow drip (every 0.4 s)');
 w.M.setRnd(()=>.5);for(let i=0;i<500;i++){w.P.x+=.05;w.ctx.window.mopTick(.005,i*.005)}ok(w.sc.children.length==24&&act()<=24,'even with tiny frames the pool never grows beyond 24 (the oldest is reused)');
 step(w,200,.016,true);let dead=pool.filter(m=>m.visible&&m.userData.d.life<=0).length;ok(dead==0,'a hidden droplet is never left visible');
 const f=world();f.M.toggle();step(f,100,.016,true);f.M.dismount(true);ok(f.M.pool().every(m=>!m.visible&&m.userData.d.life==0),'getting off clears every droplet')}

/* ---- 6. getting off by itself ---- */
{const w=world({TOIL:[{x0:10,x1:20,z0:-5,z1:5}]});w.M.toggle();w.P.x=9.8;w.ctx.window.mopTick(.016,0);ok(!w.M.isOn()&&w.toasts.pop()==w.M.CFG.wc&&w.pm.position.y==0&&w.P.y==0,'entering a toilet room (0.3 m margin): gets off with a line');
 const c=world();c.M.toggle();c.ctx.window.lockBusy=()=>true;c.ctx.window.mopTick(.016,0);ok(!c.M.isOn()&&c.toasts.pop()==c.M.CFG.chase,'a prefect starts chasing: gets off');
 const s=world();s.M.toggle();s.P.stun=1.1;s.ctx.window.mopTick(.016,0);ok(!s.M.isOn()&&s.toasts.pop()==s.M.CFG.fall,'a banana peel (stun): "Aduh! Jatuh dari mop!"');
 const a=world();a.M.toggle();a.ctx.window.mopAct();ok(a.M.isOn(),'E with nothing near: stays on (boards and hiding places can be used while riding)');
 [['exitHint',()=>'Keluar'],['lockHint',()=>'Buka loker'],['toiHint',()=>'Guna tandas'],['near',()=>({})]].forEach(h=>{const b=world();b.M.toggle();b.ctx.window[h[0]]=h[1];b.ctx.window.mopAct();ok(!b.M.isOn()&&b.toasts.length==0,'E at something that opens a '+h[0]+': gets off quietly first')});
 const d=world();d.ctx.window.mopAct();ok(!d.M.isOn(),'E while on foot: nothing');
 const e=world();e.M.toggle();e.ctx.window.near=()=>null;e.ctx.window.exitHint=()=>'';e.ctx.window.lockHint=()=>'';e.ctx.window.toiHint=()=>'';e.ctx.window.mopAct();ok(e.M.isOn(),'all hints empty: stays on')}

/* ---- 7. the bag row (js/jkey.js) ---- */
{const vmw=(o)=>{const ctx={cur:{jk:{f:[0,0,0,0,0,0],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0,0],loc:0,key:1,lt:o.lt||[0,1]}},save(){},window:o.window||{},console,JK:undefined};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(JKS+';globalThis.JK=JK',ctx);return ctx};
 const noMop=vmw({}),r0=noMop.JK.rows().find(r=>r.n=='Mop Terbang');ok(r0&&r0.off===true&&r0.b=='Naik'&&/kelajuan berjalan|tiada kelebihan/.test(r0.d),'bag: Mop Terbang row greyed out when mop.js is not loaded (other pages); it says it gives no advantage');
 let on=false;const calls=[];const ctx=vmw({window:{mopToggle:()=>{calls.push(1);on=!on;return{msg:on?'on':'off',close:true}},mopOn:()=>on}}),r=ctx.JK.rows().find(x=>x.n=='Mop Terbang');
 ok(r.off===false&&r.b=='Naik'&&r.go().close===true&&calls.length==1,'bag: "Naik" calls mopToggle and closes the bag');ok(ctx.JK.rows().find(x=>x.n=='Mop Terbang').b=='Turun'&&ctx.JK.rows().find(x=>x.n=='Mop Terbang').go().msg=='off','bag: the label becomes "Turun" while riding');
 const girlsOnly=vmw({lt:[1,0],window:{mopToggle:()=>({}),mopOn:()=>false}});ok(!girlsOnly.JK.rows().some(x=>x.n=='Mop Terbang')&&girlsOnly.JK.rows().some(x=>x.n=='Rompi Tukang Cuci'&&x.off===true),'bag: no mop row until the girls chest is taken; the vest row stays greyed out (20e)')}
console.log(pass+' pass, '+fail+' fail');process.exit(fail?1:0);
