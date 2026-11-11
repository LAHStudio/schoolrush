/* Round 19h: people in the hallway are solid and steer around each other (js/npc-nav.js, wired in js/world.js). Node only.
   npc-nav.js runs for real; world.js is checked as source (three.js is not reachable here). Run: node tools/test-solid.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const NNAV=new Function(rd('js/npc-nav.js')+';return NNAV')(),N=NNAV;
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const mkN=(x,z,sp)=>({m:{visible:true},x,z,sp:sp||2,f:0,mv:0,hid:0});
const mkX=(ns,P,o)=>{o=o||{};const r=o.r||rng(1);return{ns,P,gst:!!o.gst,hit:o.hit||(()=>false),la:(a,b,t)=>b,rnd:(a,b)=>a+r()*(b-a),now:()=>o.t||1e6,say:(n,t)=>{(o.says=o.says||[]).push(t)}}};
const C=N.C;
/* ---- the player is blocked by people ---- */
{const a=mkN(0,0);
 ok(N.blocks([a],.5,0,.35,2,0)===true,'a step into a person (0.5 m away, closer than before) is blocked');
 ok(N.blocks([a],.5,0,.35,.4,0)===false,'a step that leaves the person is allowed even when overlapping (never trapped)');
 ok(N.blocks([a],1.2,0,.35,2,0)===false,'1.2 m away is free (radius 0.35 + 0.4)');
 ok(N.blocks([a],.74,0,.35,3,0)===true&&N.blocks([a],.76,0,.35,3,0)===false,'the edge is at r + 0.4 = 0.75 m');
 a.m.visible=false;ok(N.blocks([a],.3,0,.35,2,0)===false,'a hidden person is not solid');a.m.visible=true;a.hid=2;ok(N.blocks([a],.3,0,.35,2,0)===false,'a person hidden by the old timer is not solid');
 ok(N.blocks([],0,0,.35,1,1)===false,'no people: no block');
 const b=mkN(5,5),c=mkN(0,0);ok(N.blocks([b,c],.5,0,.35,2,0)===true,'any of the people can block');}
/* ---- walking ---- */
{const n=mkN(0,0),X=mkX([n],{x:50,z:50});const r=N.walk(n,0,1,.1,X);ok(r===true&&Math.abs(n.z-.2)<1e-9&&n.x===0&&n.mv===1,'free path: straight step of speed x dt');
 const m=mkN(0,0),o=mkN(0,.8,0),Xm=mkX([m,o],{x:50,z:50});N.walk(m,0,1,.1,Xm);ok(m.x>0&&m.z>0,'a person ahead: the NPC steers to its RIGHT and keeps going');
 const m2=mkN(0,0);m2.sd=-1;const o2=mkN(0,.8,0);N.walk(m2,0,1,.1,mkX([m2,o2],{x:50,z:50}));ok(m2.x<0,'sd -1 steers to the other side');
 const m3=mkN(0,0),o3=mkN(0,-.8,0);N.walk(m3,0,1,.1,mkX([m3,o3],{x:50,z:50}));ok(m3.x===0,'a person BEHIND is ignored');
 const w=mkN(0,0),o4=mkN(0,.8,0),Xw=mkX([w,o4],{x:50,z:50},{hit:()=>true});Xw.hit=()=>true;N.walk(w,0,1,.1,Xw);ok(w.x===0,'a steer that would enter a wall or prop is dropped (goes straight)');}
/* ---- two NPCs head-on: pass each other, never overlap ---- */
{const a=mkN(0,-6,1.8),b=mkN(0,6,1.8),ns=[a,b],X=mkX(ns,{x:99,z:99});let min=9,dn=0;
 for(let i=0;i<1500;i++){[[a,1],[b,-1]].forEach(([n,d])=>{const dz=d*6-n.z;if(Math.abs(dz)>.3){N.walk(n,0,Math.sign(dz),.016,X)}else dn|=d>0?1:2;if(n.w>0)n.w-=.016});min=Math.min(min,Math.hypot(a.x-b.x,a.z-b.z))}
 ok(min>=C.gap-.05,'head-on pair never closer than the gap: '+min.toFixed(2));ok(a.z>5&&b.z<-5,'they pass each other and arrive: '+a.z.toFixed(1)+' '+b.z.toFixed(1));}
/* ---- the player is not steered around: the NPC waits, speaks, then pauses ---- */
{const n=mkN(0,0,2),P={x:0,z:3},o={t:1e6,says:[]},X=mkX([n],P,o);let moved=0;
 for(let i=0;i<120;i++)if(N.walk(n,0,1,.016,X))moved=1;
 ok(moved===1&&n.z<3-C.pgap+.1&&Math.hypot(n.x-P.x,n.z-P.z)>=C.pgap-.05,'NPC walks up to the player and stops short: '+n.z.toFixed(2));
 ok(n.x===0,'the NPC does NOT steer around the player');
 for(let i=0;i<60;i++)N.walk(n,0,1,.016,X);
 ok(o.says.length==1&&C.L.includes(o.says[0]),'it says one of the lines once (cooldown): '+o.says.join('|'));
 ok(C.L.join()=='Tepi sikit!,Tumpang lalu!,Excuse me!','the three lines');
 let paused=0;for(let i=0;i<200;i++){N.walk(n,0,1,.016,X);if(n.w>0){paused=1;break}}
 ok(paused===1&&n.sd===-1,'after about 2 s blocked it pauses and tries the other side next time');
 const n2=mkN(0,0,2),X2=mkX([n2],{x:0,z:3},{gst:true});for(let i=0;i<200;i++)N.walk(n2,0,1,.016,X2);ok(n2.z>3.5,'with the Epal Fuji ghost effect the NPC walks through the player');
 const o5={t:1e6,says:[]};const n3=mkN(0,0,2),X3=mkX([n3],{x:0,z:3},o5);for(let i=0;i<60;i++)N.walk(n3,0,1,.016,X3);o5.t+=6000;for(let i=0;i<60;i++)N.walk(n3,0,1,.016,X3);ok(o5.says.length>=1,'a new line after the 5 s cooldown is allowed');}
/* ---- a crowd of 11 in a corridor: no overlaps, no NaN, nobody stuck for ever ---- */
{const r=rng(7),ns=[];for(let i=0;i<11;i++)ns.push(mkN(-14+i*2.6,(i%2?-.6:.6),rnd=1.4+r()*.9));
 const tg=ns.map(()=>1);const X=mkX(ns,{x:0,z:40},{r});let min=9,bad=0,gsamp=0,prog=ns.map(()=>0);
 for(let i=0;i<6000;i++){ns.forEach((n,k)=>{if(n.w>0){n.w-=.016;n.mv=0;return}const gx=tg[k]>0?15:-15,dx=gx-n.x;if(Math.abs(dx)<.4){tg[k]*=-1;prog[k]++;return}const x0=n.x;N.walk(n,Math.sign(dx),0,.016,X);if(!isFinite(n.x)||!isFinite(n.z))bad++});
  if(i%10==0)for(let a=0;a<ns.length;a++)for(let b=a+1;b<ns.length;b++){if(ns[a].gh>0||ns[b].gh>0){gsamp++;continue}min=Math.min(min,Math.hypot(ns[a].x-ns[b].x,ns[a].z-ns[b].z))}}
 ok(bad==0,'no NaN positions');ok(min>=.45,'11 people in a corridor never overlap unless one is on its 1.5 s last-resort release (closest '+min.toFixed(2)+' m)');ok(gsamp<ns.length*ns.length*600*.02,'the last-resort release is rare: '+gsamp+' pair samples of '+(55*600));ok(prog.every(p=>p>=1),'everybody finishes at least one crossing (no permanent jam): '+prog.join());}

/* ---- Round 19i: the pocket from the video (wall behind the player, one person each side, slightly in front) ---- */
{const SP=5,dt=.016;
 /* a tiny world: a wall at z=0 (north), optional closet walls behind the people (z > zb), people walk with the REAL walk()/back()/stuck() */
 function sim(o){const r=rng(o.seed||3),P={x:0,z:.45},ns=o.ns,wall=(x,z,rr)=>z-rr<0||(o.zb!==undefined&&rr<.3&&z+rr>o.zb); /* closet walls only stop people (radius .25), not the player */
  const X=mkX(ns,P,{r,hit:wall,says:o.says}),S={t:0,f:0,x:P.x,z:P.z,say:X.say,rnd:X.rnd};
  const blocked=(x,z)=>wall(x,z,.35)||NNAV.blocks(ns,x,z,.35,P.x,P.z);let t=0,escaped=-1,pr=0,yl=0;
  for(let i=0;i<400&&escaped<0;i++){t+=dt;
   const dx=0,dz=SP*dt; /* the player holds SOUTH (+z): into the people's side */
   const ox=P.x,oz=P.z;if(!blocked(P.x+dx,P.z))P.x+=dx;if(!blocked(P.x,P.z+dz))P.z+=dz;
   ns.forEach(n=>{if(n.ch)return;if(n.yl>0){yl++;NNAV.back(n,dt,X)}else if(n.w>0){n.w-=dt}else NNAV.walk(n,0,-1,dt,X)}); /* they want to go NORTH, through the player */
   NNAV.stuck(ns,P,true,Math.hypot(P.x-S.x,P.z-S.z)>.15*SP*dt,dt,S);S.x=P.x;S.z=P.z;
   if(ns.some(n=>n.pr>0))pr++;
   if(P.z>1.6)escaped=t}
  return{escaped,pr,yl,P,t}}
 const mk2=(zb,ch)=>{const a=mkN(-.5,.95),b=mkN(.5,.95);if(ch){a.ch=1;b.ch=1}return[a,b]};
 {const ns=mk2(),P={x:0,z:.45},wall=(x,z,rr)=>z-rr<0,bl=(x,z)=>wall(x,z,.35)||NNAV.blocks(ns,x,z,.35,P.x,P.z);
  ok(bl(0,.45+.1)&&bl(-.1,.45)&&bl(.1,.45)&&bl(0,.45-.15),'the pocket: wall behind, people each side: every direction is blocked at the start (the bug)')}
 {const r=sim({ns:mk2(),says:[]});ok(r.escaped>0&&r.escaped<=1.6,'open space behind the people: they TURN BACK and the player is free in '+(r.escaped||0).toFixed(2)+' s');
  ok(r.pr==0&&r.yl>0,'..without the safety net (nobody went non-solid), turning back did it')}
 {const says=[],r=sim({ns:mk2(),says});ok(says.length>=1&&says.every(t=>NNAV.C.T.includes(t)),'a turning person says "Eh, sabar!" or "Oi!": '+says.join('|'))}
 {const r=sim({ns:mk2(),zb:.9});ok(r.escaped>0&&r.escaped<=2.8&&r.pr>0,'a closet (people cannot step back): the safety net frees the player in '+(r.escaped||0).toFixed(2)+' s, after the turn-back failed')}
 {const r=sim({ns:mk2(undefined,1)});ok(r.escaped>0&&r.escaped<=2.8&&r.pr>0&&r.yl==0,'scripted people (toilet visit, chasing prefect: n.ch) are never turned, the safety net frees the player in '+(r.escaped||0).toFixed(2)+' s')}
 let worst=0,bad=0;for(let k=0;k<40;k++){const q=rng(100+k),a=mkN(-.45-q()*.25,.8+q()*.35),b=mkN(.45+q()*.25,.8+q()*.35),r=sim({ns:[a,b],seed:k+1,zb:k%3==0?.9:undefined});if(!(r.escaped>0))bad++;worst=Math.max(worst,r.escaped||9)}
 ok(bad==0&&worst<=2.8,'40 random pockets (a third with a closet): the player always gets out, worst '+worst.toFixed(2)+' s');
 /* pressing into a plain wall next to a person does not make anybody turn */
 {const n=mkN(1,.6),P={x:0,z:.45},S={t:0,f:0,say(){bad2=1},rnd:()=>0};let bad2=0;for(let i=0;i<200;i++)NNAV.stuck([n],P,true,false,.016,S);ok(!(n.yl>0)&&!(n.pr>0)&&!bad2,'pressing into a wall with a person nearby (no person refused the move): nobody turns, nobody is released')}
 /* back(): walks away from the player, stops at C.far, then pauses and picks a side */
 {const n=mkN(.8,0,2),P={x:0,z:0},X=mkX([n],P);n.yl=NNAV.C.yield;let i=0;while(n.yl>0&&i++<400)NNAV.back(n,.016,X);
  ok(n.x>=NNAV.C.far-.05&&Math.abs(n.z)<1e-6&&n.yl===0&&n.w>=.4&&n.w<=.9&&(n.sd===1||n.sd===-1),'back(): straight away from the player to '+NNAV.C.far+' m, then a 0.4 to 0.9 s pause and a side chosen')
  const m=mkN(.8,0,2),X2=mkX([m],P,{hit:(x,z)=>z===0&&x>.81});m.yl=1.4;NNAV.back(m,.016,X2);ok(m.z!==0&&m.x>.8,'back(): a blocked straight line falls back to 45 degrees')
  const q=mkN(.8,0,2),X3=mkX([q],P,{hit:()=>true});q.yl=1.4;ok(NNAV.back(q,.016,X3)===false&&q.x===.8&&q.mv===0,'back(): nowhere to go = stays (the safety net takes over)')}
 /* the player is not blocked by a person who is in the safety net window (o.pr) */
 {const a=mkN(0,0);a.pr=1;ok(N.blocks([a],.3,0,.35,2,0)===false,'a person in the release window does not block');a.pr=0;ok(N.blocks([a],.3,0,.35,2,0)===true,'..and blocks again afterwards')}
}

/* ---- Round 19i: the four bins on the far wall of the central corridor ---- */
{const WB=rd('js/world-build.js'),K=.112,X=x=>(x-340)*K,Z=y=>(y-344)*K;
 ok(/\[\['#3b7fd0',324\],\['#e8923a',332\],\['#7a5236',340\]\]\.forEach\(a=>rb\(a\[1\],150,0,1,a\[0\]\)\);bin\(348,150,0,1\);/.test(WB),'3 recycle bins (blue, orange, brown) and the trash bin in one row on the far wall y=150, facing south, in the order KERTAS PLASTIK KACA BIASA');
 ok(!/rb\(318,/.test(WB)&&!/\[354,225,-1,0\]/.test(WB),'the west-wall recycle set and the east-wall trash bin are gone');
 ok(/rb\(354,a\[1\],-1,0,a\[0\]\)/.test(WB)&&/\[\[200,186,0,-1\],\[420,326,0,1\],\[150,362,0,-1\]\]\.forEach\(a=>bin\(\.\.\.a\)\)/.test(WB),'the south recycle set and the other three trash bins stay');
 const xs=[324,332,340,348],lk=[[104,154],[188,312],[360,464],[496,560]];
 ok(xs.every((x,i)=>i==0||x-xs[i-1]==8)&&8*K>.85&&8*K<.95,'bins are 8 units (0.9 m) apart');
 ok(xs.every(x=>lk.every(([a,c])=>x+3<a||x-3>c)),'no bin is in front of a locker row (the lockers stop at x=312 and start again at x=360)');
 ok(Math.abs((xs[0]+xs[3])/2-336)<1e-9,'the row is centred on the corridor axis x=336');
 const TS=[336,168],near=Math.min(...xs.map(x=>Math.hypot(X(x)-X(TS[0]),Z(150)+.4-Z(TS[1]))));ok(near>1.2,'the nearest bin is '+near.toFixed(2)+' m from the junction node TS where people turn');
 ok(xs.every((x,i)=>i==0||(x-xs[i-1])*K>.28*2+.05),'the bin colliders (radius .28 to .3) do not touch each other');
 ok(/\[\['KERTAS','#3b7fd0',324\],\['PLASTIK','#e8923a',332\],\['KACA','#7a5236',340\],\['BIASA','#4d6a58',348\]\]\.forEach\(a=>tx\(\[a\[0\]\],a\[1\],'#ffffff',\.8,\.3,22,X\(a\[2\]\),1\.15,Z\(150\)\+\.1,0\)\)/.test(WB),'4 signs (KERTAS, PLASTIK, KACA and the new BIASA) above the bins on the far wall, facing south');
 const kinds=(WB.match(/rb\(/g)||[]).length;ok(kinds==3,'rb() has its definition and exactly two calls (south set, new far-wall row): '+kinds)}
/* ---- wiring in world.js ---- */
const W=rd('js/world.js'),H=rd('world.html'),SW=rd('sw.js');
ok(/:\(BAG\.jmp\(\)>1&&P\.y>\.75\)\?hitNS\(x,z,r\):\(hit\(x,z,r\)\|\|NNAV\.blocks\(ns,x,z,r,P\.x,P\.z\)\)/.test(W)&&/BAG\.inv\(\)\?hitG\(x,z,r\)/.test(W),'hitP: people block only in the normal branch (ghost effect and a high jump pass)');
ok((W.match(/const ns=\[\];\[([^\]]*)\]/)[1].match(/'/g).length/2)==11&&/'guru','guru'\]\.forEach/.test(W)&&(W.match(/'pengawas'/g)||[]).length>=2,'11 people: 7 murid, 2 pengawas, 2 guru');
ok(/else NNAV\.walk\(n,dx\/d,dz\/d,dt,NX\)\}/.test(W)&&/if\(n\.ch\)return;/.test(W),'the hallway loop walks with NNAV.walk and still skips scripted NPCs (n.ch)');
ok(/NNAV\.stuck\(ns,P,mv,Math\.hypot\(P\.x-NSTK\.x,P\.z-NSTK\.z\)>\.15\*SP\*dt,dt,NSTK\);NSTK\.x=P\.x;NSTK\.z=P\.z;nsayTick\(dt\);caneTick\(dt,t\)/.test(W)&&/if\(n\.yl>0\)NNAV\.back\(n,dt,NX\);else if\(n\.w>0\)/.test(W)&&W.includes("e.id='nsyx'"),'one NPC bubble, updated every frame');
ok(/"js\/toilet\.js", "js\/npc-nav\.js", "js\/world\.js", "js\/cheat\.js"\]/.test(H)&&/'js\/npc-nav\.js','js\/world\.js','js\/cheat\.js'/.test(SW),'world.html loads npc-nav.js before world.js; sw.js caches npc-nav.js and cheat.js');
const others=fs.readdirSync(path.join(__dirname,'..','js')).filter(f=>f.endsWith('.js')&&!['world.js','npc-nav.js'].includes(f)).map(f=>[f,rd('js/'+f)]);
for(const n of['NNAV','NSAY','nsyx','nsayTick'])ok(!others.some(([f,s])=>new RegExp('\\b'+n+'\\b').test(s)),'name '+n+' is not used by other scripts');
ok(/\bNX\b/.test(W)&&!others.some(([f,s])=>/\bNX\b/.test(s)),'NX is only used in world.js');
ok(fs.readFileSync(path.join(__dirname,'..','js/toilet.js'),'utf8').split("\n  if(!q.d.use&&window.jkDoor&&window.jkDoor(q))return true; /* Round 20c: the quest cubicle opens with the key, in either toilet (js/jkey.js) */").join('').split("if(q&&!q.d.use&&window.jkDoorHint){const h=window.jkDoorHint(q);if(h)return h}").join('')==fs.readFileSync(path.join(__dirname,'..','_backup_round20c/js/toilet.js'),'utf8'),'toilet.js: the only changes since 19h are the two 20c quest hooks (jkDoor, jkDoorHint)');
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
