const mat=c=>new T.MeshPhongMaterial({color:c,flatShading:true,shininess:0,specular:0});
function bx(p,w,h,d,c,x,y,z){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m}
const cosHas=(o,k)=>!!(o&&o.cos&&o.cos.indexOf(k)>=0); /* Round 17: worn cosmetics (cap, eye, beard, mos; Round 20e: vest) come in o.cos */
function faceMat(o){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
[40,88].forEach(x=>{g.fillStyle='#111';g.beginPath();g.ellipse(x,68,9*o.es,13*o.es,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+3,62,3.2,0,7);g.fill()});
g.strokeStyle='#1a1008';g.lineWidth=o.bw;g.lineCap='round';
[[26,46,52,42],[76,42,102,46]].forEach(b=>{g.beginPath();g.moveTo(b[0],b[1]);g.lineTo(b[2],b[3]);g.stroke()});
if(cosHas(o,'beard')){const c2=document.createElement('canvas');c2.width=c2.height=128;const h=c2.getContext('2d');h.fillStyle=o.hc||'#14161d';h.beginPath();h.moveTo(14,86);h.lineTo(114,86);h.lineTo(108,114);h.quadraticCurveTo(64,142,20,114);h.closePath();h.fill();h.globalCompositeOperation='destination-out';h.beginPath();h.ellipse(64,94,23,11,0,0,7);h.fill();g.drawImage(c2,0,0)} /* the mouth is cut out of the beard on its own layer */
g.strokeStyle='#5a2a1a';g.lineWidth=4;g.beginPath();
if(o.mouth==0)g.arc(64,88,14,.2,Math.PI-.2);else if(o.mouth==1){g.moveTo(50,94);g.quadraticCurveTo(64,102,78,94)}else g.ellipse(64,94,8,6,0,0,7);g.stroke();
if(o.stache){g.fillStyle='#14110e';g.fillRect(46,80,36,6)}
if(cosHas(o,'mos')){g.fillStyle=o.hc||'#14161d';[[50,-.25],[78,.25]].forEach(a=>{g.beginPath();g.ellipse(a[0],87,15,4.5,a[1],0,7);g.fill()})}
if(o.glasses){g.strokeStyle='#222';g.lineWidth=4;g.strokeRect(22,52,38,32);g.strokeRect(68,52,38,32);g.beginPath();g.moveTo(60,66);g.lineTo(68,66);g.stroke()}
return new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})}
function hair(p,st,c){const a=(w,h,d,x,y,z)=>bx(p,w,h,d,c,x,y,z);if(!st||st=='bald')return;
if(st=='cap'){a(.56,.14,.56,0,1.5,0);a(.4,.04,.22,0,1.46,.36);return}
if(st=='crew'){a(.52,.08,.52,0,1.49,0);a(.52,.2,.06,0,1.38,-.24);return}
a(.54,.14,.54,0,1.5,0);
if(st=='bob'){a(.6,.45,.12,0,1.28,-.26);a(.07,.4,.4,-.29,1.28,-.02);a(.07,.4,.4,.29,1.28,-.02);a(.5,.1,.08,0,1.42,.26);return}
a(.54,.3,.1,0,1.36,-.22);a(.06,.2,.3,-.28,1.38,-.05);a(.06,.2,.3,.28,1.38,-.05);
if(st=='fringe')a(.5,.1,.08,0,1.42,.26);
if(st=='spiky')for(let i=-2;i<=2;i++)a(.1,.14,.1,i*.1,1.6,rnd(-.1,.1));
if(st=='bun'){const m=new T.Mesh(new T.SphereGeometry(.14,6,5),mat(c));m.position.set(0,1.66,-.1);p.add(m)}
if(st=='pony'){a(.12,.35,.12,0,1.3,-.34);a(.5,.1,.08,0,1.42,.26)}
if(st=='pigtails'){a(.14,.42,.14,-.34,1.18,-.05);a(.14,.42,.14,.34,1.18,-.05);a(.5,.1,.08,0,1.42,.26)}
if(st=='braid'){a(.12,.16,.1,0,1.2,-.3);a(.1,.14,.1,0,1.06,-.32);a(.09,.12,.09,0,.94,-.33);a(.5,.1,.08,0,1.42,.26)}
if(st=='side')a(.3,.1,.08,-.12,1.42,.26)}
function build(o){const G=new T.Group(),B=new T.Group(),ot=o.o,W=o.w||1,legs=[],arms=[];G.add(B);
[-1,1].forEach(i=>{const l=new T.Group();l.position.set(i*.11*W,.46,0);
bx(l,.17*W,.4,.19,ot.skirt?(ot.sock||'#f4f4f4'):ot.bot,0,-.2,0);if(ot.stripe)bx(l,.02,.4,.2,'#fff',i*.09*W,-.2,0);
bx(l,.19*W,.1,.3,ot.shoe,0,-.41,.05);B.add(l);legs.push(l)});
if(ot.skirt)bx(B,.5*W,ot.skirt,.3,ot.bot,0,.66-ot.skirt/2,0);
const lh=ot.long?.72:.5;bx(B,.46*W,lh,.27,ot.top,0,ot.long?.6:.71,0);
if(ot.collar)bx(B,.22,.05,.285,ot.collar,0,.955,0);
if(ot.tie)bx(B,.07,.3,.02,ot.tie,0,.8,.145);
if(ot.badge)bx(B,.06,.06,.02,'#e8c53a',.12,.86,.145);
if(ot.ap)bx(B,.4*W,.48,.03,ot.ap,0,.56,.15);
if(cosHas(o,'vest')){bx(B,.5*W,.44,.34,'#f28c1c',0,.72,0);bx(B,.51*W,.045,.345,'#f1f3c4',0,.62,0);bx(B,.51*W,.045,.345,'#f1f3c4',0,.8,0);bx(B,.02,.42,.345,'#b86412',0,.72,0);bx(B,.2,.12,.02,'#d9dcc0',0,.74,-.18)} /* Round 20e: Rompi Tukang Cuci: orange vest with 2 reflective stripes, a zip line and a back panel, a little proud of the torso so it covers the tie, badge and apron */
[-1,1].forEach(i=>{const a=new T.Group();a.position.set(i*.3*W,.93,0);const L=ot.ls?.36:.2;
bx(a,.13,L,.13,ot.sl||ot.top,0,-L/2,0);bx(a,.1,.44-L,.1,o.skin,0,-L-(.44-L)/2,0);
if(ot.cuff)bx(a,.135,.04,.135,ot.cuff,0,-L+.02,0);B.add(a);arms.push(a)});
const tud=o.noTud?null:(o.tud||ot.tud),fm=faceMat(o);
bx(B,.5,.5,.5,o.skin,0,1.22,0);const f=new T.Mesh(new T.PlaneGeometry(.42,.42),fm);f.position.set(0,1.2,.252);B.add(f);
if(tud){bx(B,.55,.07,.55,tud,0,1.5,0);bx(B,.55,.62,.06,tud,0,1.2,-.27);bx(B,.05,.62,.52,tud,-.275,1.2,-.01);bx(B,.05,.62,.52,tud,.275,1.2,-.01);
bx(B,.5,.08,.05,tud,0,1.44,.265);bx(B,.05,.52,.04,tud,-.26,1.19,.27);bx(B,.05,.52,.04,tud,.26,1.19,.27);bx(B,.56,.09,.1,tud,0,.97,.24);bx(B,.56,.16,.32,tud,0,.9,0)}
else{bx(B,.06,.12,.08,o.skin,-.28,1.2,0);bx(B,.06,.12,.08,o.skin,.28,1.2,0);hair(B,cosHas(o,'cap')&&(o.hs=='spiky'||o.hs=='bun')?'fringe':o.hs,o.hc);if(o.rib){bx(B,.1,.09,.07,o.rib,.14,1.56,.22);bx(B,.1,.09,.07,o.rib,.3,1.56,.22);bx(B,.06,.06,.08,o.rib,.22,1.56,.23)}}
if(o.mask){const mc='#a8d8ea';bx(B,.52,.17,.06,mc,0,1.085,.275);bx(B,.024,.17,.24,mc,-.262,1.085,.14);bx(B,.024,.17,.24,mc,.262,1.085,.14)} /* 7c: no face shares a surface with the head or the face plane any more (that caused the flicker) */
if(cosHas(o,'cap')){bx(B,.62,.21,.62,'#c8293a',0,1.575,0);bx(B,.44,.04,.28,'#a01c2c',0,1.5,.44);bx(B,.1,.05,.1,'#8a1a28',0,1.7,0)}
if(cosHas(o,'eye')){const k='#15151a';bx(B,.13,.11,.02,k,-.08,1.185,.272);bx(B,.12,.025,.02,k,-.2,1.235,.27);if(!tud){bx(B,.03,.03,.5,k,-.255,1.235,0);bx(B,.03,.03,.5,k,.255,1.235,0);bx(B,.52,.03,.03,k,0,1.235,-.255)}}
G.scale.setScalar(o.h||1);G.userData={legs,arms,B,ph:Math.random()*6};G.traverse(m=>{if(m.isMesh)m.castShadow=true});return G}
const OUT={uni:{m:{top:'#f4f6fa',bot:'#1c2650',shoe:'#f4f4f4'},f:{top:'#f4f6fa',bot:'#1c2650',shoe:'#f4f4f4',skirt:.3,ls:1,tud:'#f6f7fb'}},
pe:{m:{top:'#2a58c8',bot:'#2150c4',shoe:'#9a9ea6',collar:'#c8293a',cuff:'#c8293a',stripe:1},f:{top:'#f6f7fb',sl:'#2a58c8',cuff:'#c8293a',bot:'#2150c4',shoe:'#f4f4f4',stripe:1,ls:1,tud:'#f6f7fb'}},
pre:{m:{top:'#4f8ad0',bot:'#1c2650',shoe:'#15151a',tie:'#243b8a',badge:1,ls:1},f:{top:'#4f8ad0',bot:'#1c2650',shoe:'#15151a',skirt:.3,sock:'#15151a',ls:1,badge:1,tud:'#3f78c4'}}};
function player(g,out,L){L=L||{};return build({o:OUT[out][g],skin:L.sk||'#b87a50',hc:L.hc||'#14161d',hs:L.hs||(g=='f'?'bob':'fringe'),tud:L.tud,noTud:L.nt,rib:L.rib,es:L.es||1,bw:4,mouth:L.mo||0,mask:L.mask,cos:typeof BAG!=='undefined'&&BAG.worn?BAG.worn():null})} /* Round 17: the menu page has no BAG, so the setup preview never shows cosmetics */
function npc(role,g){g=g||R(['m','f']);const f=g=='f',o={skin:R(SK),hc:R(HC),h:rnd(.9,1.1),w:rnd(.92,1.15),mouth:R([0,0,1,2]),es:rnd(.8,1.2),bw:rnd(3,6)};
if(role=='murid'||role=='pengawas'){o.o=Object.assign({},OUT[role=='murid'?(Math.random()<.2?'pe':'uni'):'pre'][g]);o.hs=f?null:R(['short','fringe','spiky','side','crew','short']);if(f&&Math.random()<.4){o.noTud=true;o.hs=R(['bob','pony','bun','pigtails','braid']);o.rib=Math.random()<.4?R(CL):null}if(role=='murid')o.mask=Math.random()<.2}
else if(role=='cuci'){o.h=rnd(1.2,1.26);o.o={top:'#6b8f71',bot:'#3a4a40',shoe:'#1a1a1e',ls:1};o.hs='short';o.glasses=true;o.stache=true;o.cos=['vest']} /* Round 20b: the janitor (js/jkey.js); Round 20e: he wears the same vest */
else{o.h=rnd(1.2,1.32);const c=R(CL);
if(f){o.o={top:c,bot:c,long:1,shoe:'#2a2a30',ls:1};if(Math.random()<.7)o.tud=R(['#f6f7fb','#2a2a46',c,'#e8d6c0','#7a4a8a']);else o.hs=R(['bun','bob','pony']);o.glasses=Math.random()<.4}
else{o.o={top:R(['#f4f6fa','#8ab6e8','#e8dcc0','#9ad0b0']),bot:R(['#222633','#3a3a40']),shoe:'#1a1a1e',tie:Math.random()<.7?R(CL):null,ls:1};o.hs=R(['short','fringe','bald']);o.stache=Math.random()<.3;o.glasses=Math.random()<.4}}
const G=build(o);G.userData.g=g;return G}
function anim(G,t,mv){const u=G.userData,w=Math.sin(t*8+u.ph);if(mv){u.legs[0].rotation.x=w*.6;u.legs[1].rotation.x=-w*.6;u.arms[0].rotation.x=-w*.5;u.arms[1].rotation.x=w*.5;u.B.position.y=Math.abs(w)*.03}else{u.legs.forEach(l=>l.rotation.x=0);u.arms.forEach(a=>a.rotation.x=0);u.B.position.y=0}}

/* Round 10b3: the easter egg vase. Low-poly faceted white vase (8 sides, shaded flat, edges nudged so the facets are uneven) with 6 bamboo sticks leaning out of it.
   Same look in every room (world, Kantin, Padang, classrooms). Built from code only. Size: about 1 m tall, 0.33 m radius, sticks up to 2 m. Callers add their own collision. */
function mkVase(p,x,z){const g=new T.Group(),pts=[[0,0],[.2,0],[.27,.12],[.32,.3],[.28,.5],[.33,.68],[.28,.86],[.24,.98],[.2,1],[.17,.96]].map(a=>new T.Vector2(a[0],a[1])),lg=new T.LatheGeometry(pts,8),pa=lg.attributes.position;
 for(let i=0;i<pa.count;i++){const px=pa.getX(i),py=pa.getY(i),pz=pa.getZ(i),j=1+.07*Math.sin(px*37.1+py*23.7+pz*51.3);pa.setX(i,px*j);pa.setZ(i,pz*j)}
 const v=new T.Mesh(lg,mat('#ecebe6'));v.material.side=T.DoubleSide;v.castShadow=true;g.add(v);
 const m0=new T.Mesh(new T.CylinderGeometry(.19,.19,.02,8),mat('#2e2a28'));m0.position.y=.93;g.add(m0);
 [[-.1,.05,.1,-.18,1.9],[.08,-.06,-.22,.1,1.65],[.02,.1,.05,.28,1.8],[-.05,-.09,.3,.05,1.5],[.1,.08,-.12,-.3,1.7],[-.02,-.02,-.05,.02,2]].forEach(a=>{const s=new T.Group(),L=a[4],c=new T.CylinderGeometry(.034,.04,L,6);c.translate(0,L/2,0);s.add(new T.Mesh(c,mat('#e0b060')));
  [.3,.58,.82].forEach(f=>{const r=new T.Mesh(new T.CylinderGeometry(.05,.05,.03,6),mat('#b98a3e'));r.position.y=L*f;s.add(r)});s.position.set(a[0],.95,a[1]);s.rotation.x=a[2];s.rotation.z=a[3];g.add(s)});
 g.position.set(x,0,z);p.add(g);return g}

/* Round 10g: glass double door (black-framed glass look). Flat MeshBasicMaterial planes only, all opaque: the wall fade in the world, Kantin and classrooms sets opacity directly.
   p = parent, (x,z) = centre of the door foot, ry = facing (normal = sin ry, cos ry), w x h = size, frame = frame colour, g0 = offset of the glass along the normal (layers sit in front of it).
   Glass #9fcde2, frame bars, centre stile, 2 leaves of 2 columns x 3 rows, copper handles. Returns the meshes (callers push them into their fade lists). */
function gdoor(p,x,z,ry,w,h,frame,g0){const nx=Math.sin(ry),nz=Math.cos(ry),tx=nz,tz=-nx,out=[],b=.07,kb=.16,st=.1;
 const pe=(pw,ph,c,o,y,e)=>{const m=new T.Mesh(new T.PlaneGeometry(pw,ph),new T.MeshBasicMaterial({color:c}));m.position.set(x+nx*(g0+e)+tx*o,y,z+nz*(g0+e)+tz*o);m.rotation.y=ry;p.add(m);out.push(m);return m};
 pe(w,h,'#9fcde2',0,h/2,0);
 pe(b,h,frame,-(w/2-b/2),h/2,.02);pe(b,h,frame,w/2-b/2,h/2,.02);pe(w,b,frame,0,h-b/2,.022);pe(w,kb,frame,0,kb/2,.022);pe(st,h,frame,0,h/2,.024); /* frame layers 2 mm apart so crossing bars never share a depth */
 const ih=h-kb-b,lw=w/2-b-st/2;
 [-1,1].forEach(s=>{const oc=s*(st/2+lw/2);pe(.045,ih,frame,oc,kb+ih/2,.026);[1,2].forEach(k=>pe(lw,.045,frame,oc,kb+ih*k/3,.028))});
 [-1,1].forEach(s=>pe(.05,.45,'#c98a5a',s*.2,1.05,.04));
 return out}
