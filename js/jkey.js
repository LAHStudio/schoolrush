/* Round 20a/20b: side quest "Kunci Hilang" (Janitor's Lost Key) (global JK). World page only.
   Story: a student hid the janitor's key and tore a photo of the hiding place into 6 pieces, hidden on 6 of the 8 hallway notice boards (JKB, world-build.js).
   Boards (20a): E near a board (CFG.reach m). A board that still holds a piece gives it with chance CFG.chance, always on the CFG.pity-th reading. Other readings = a notice or a joke. A piece is counted once (JK.collect is idempotent).
   Photo (20b): at 6/6 the photo opens by itself and can be opened again from the bag. It is a snapshot of the real 3D scene taken from a fixed camera at the hiding place (hallway/toilet props, no player, no NPCs, walls solid) with a red marker circle,
   cut into the 6 torn pieces. If the snapshot fails the photo is a grey card with the place name, so the quest never blocks.
   Search (20b): 5 hiding places (SPOTS), each with the same hint "Siasat" and nothing visible. The key is at SPOTS[cur.jk.loc] (random per quest); the other 4 answer "Tiada apa-apa". The photo shows the right one, or the player searches all five.
   Spot 4 is the far-wall gap beside the sink cabinet of the player's OWN gender toilet (boys west room, girls east room; TOIL[n].jk in world-build.js), so searching never needs the wrong-toilet chase.
   Found: cur.jk.key=1, bag row "Kunci Tandas" (it opens the locked cubicle in 20c). Spots go quiet once the key is found.
   Janitor (20b): the NPC with role 'cuci' (one of the 11, chars.js) mumbles about the lost key now and then when the player is near (jkTick), until the key is found.
   Save: cur.jk = {f:[6 x 0/1] pieces, ass:[6 board ids], rd:[8 reading counts], loc:0..4 hiding place, key:0/1, done:0/1 both chests taken, lt:[0/1,0/1], th:0..2}. Lives in the slot profile (Padam / new slot = fresh quest). Old saves have no jk: nothing is created until the first board is read or spot searched. 20a saves (loc 0) stay valid: SPOTS[0] is still the east plant.
   Mop Terbang (20d): the girls' chest reward is ridden from the bag (js/mop.js). Locked cubicle (20c): with the key, E on the locked (red) cubicle door of EITHER toilet (toilet.js asks window.jkDoor first, so the wrong-gender rule does not stop it) runs a short script (door opens, the player steps in, the chest lid opens,
   the reward is granted the instant it opens, a card shows it, the player steps out; ~3 s, CFG.q): boys' chest = Rompi Tukang Cuci, girls' chest = Mop Terbang. It is refused while a prefect already chases (lockPf). The wrong-toilet chase itself is the existing toilet rule
   (entering the other room starts the 3 s countdown), that is the gamble. A looted cubicle becomes a normal usable one (green door, chest open and empty). The key stays in the bag until both chests are taken. Janitor thanks once (th 0..2) when the key is found.
   cur.jk also has lt:[boys chest taken, girls chest taken] (vest = lt[0], mop = lt[1]), th:0..2 (janitor thanks said), done = both. Old saves get lt [0,0], th 0.
   Not blocked by Mod Kelas: reading and searching do not stop the game. Both are refused while a prefect chases (lockBusy), each with its own line. The photo screen holds the game still (halt) like the bag does.
   Dev: JK.preview(i,'m'|'f') opens the photo of hiding place i (0..4) without touching the save.
   Global names: JK, jkGo, jkHint, jkTick, jkDoor, jkDoorHint; ids/classes jkxcss, jkxv, jkxc, jkxp. Tune everything in CFG / SPOTS. Pure logic is tested in tools/test-jkey.js. */
const JK=(()=>{
 const CFG={n:6,boards:8,chance:.5,pity:3,reach:1.8,popMs:2800,doneMs:2600,pw:100,ph:100,cols:3,rows:2,pad:8,amp:7,sw:564,sh:322,fov:50,ix:9,iy:9,iw:282,ih:161,jRange:6.5,jGap:[12,22],
  found:'Eh, cebisan apa ini?',all:'Eh... cebisan ini bersambung jadi gambar!',allToast:'Semua cebisan dah jumpa! Tengok gambar tu.',
  busy:'Pengawas tengah kejar! Mana sempat baca papan!',busy2:'Pengawas tengah kejar! Mana sempat siasat!',busy3:'Pengawas tengah kejar! Mana sempat buka pintu!',q:{walk:2.2,chest:.5,hold:1.1,lid:.5},keySay:'Eh... ada kunci!',seg:6,tape:'rgba(255,224,120,.75)'};
 /* the 5 hiding places. px,py = trigger spot in map pixels (world-build.js), ox/oz = metres added; r = reach (m); ty = height the photo camera looks at; tx,ty2: photo target if not the trigger spot;
    cam = [dx,dy,dz] photo camera offset from the target in metres (x east, z south; the toilet one is mirrored for the room side); f = found line; d = "nothing here" lines; n = name (fallback photo, tests).
    0 and 1 are plants, 2 the corner gap, 3 the bench, 4 the sink cabinet gap (t:1 = the player's own toilet, TOIL[n].jk). Index 0 = the east plant stays as it was in 20a. */
 const SPOTS=[
  {id:'pasu-timur',n:'pasu bunga di sudut timur',px:575.5,py:357.5,ty:.55,r:1.5,cam:[-4.4,5.4,-2.6],f:'Jumpa! Kunci tersorok di bawah pasu bunga!',d:['Tiada apa-apa di bawah pasu ini.','Cuma tanah dan daun. Tiada kunci.','Pasu ini... kosong.']},
  {id:'pasu-timurlaut',n:'pasu bunga di sudut timur laut',px:575.5,py:154.5,ty:.55,r:1.5,cam:[-5,5.4,1.6],f:'Jumpa! Kunci tersorok di bawah pasu bunga!',d:['Tiada apa-apa di bawah pasu ini.','Hanya sehelai daun kering. Tiada kunci.','Pasu ini pun kosong.']},
  {id:'celah-loker',n:'celah loker di penjuru barat daya',px:102,py:527.4,tx:102,ty2:534.5,ty:.9,r:1,cam:[2.4,5.6,-4.6],f:'Jumpa! Kunci terselit di celah loker!',d:['Celah sempit. Cuma habuk dan sehelai kertas.','Gelap dan sempit. Tiada apa-apa.']},
  {id:'bangku',n:'bawah bangku',px:215,py:362,oz:-.35,ty:.4,r:1.5,cam:[5.4,5.2,-1.4],f:'Jumpa! Kunci tersorok di bawah bangku!',d:['Bawah bangku ini cuma gula-gula getah. Euw.','Tiada apa-apa di bawah bangku.','Hanya habuk di bawah bangku ini.']},
  {id:'sinki',n:'celah kabinet sinki',t:1,ty:.6,r:1.15,cam:[3,5.2,-3.2],f:'Jumpa! Kunci terselit di tepi kabinet sinki!',d:['Di celah ini cuma paip dan lopak air.','Tiada apa-apa di tepi kabinet ini.']}];
 const LINES=[
  ['Pengumuman: Kantin jual nasi lemak istimewa hari ini.','Notis: Sila simpan basikal di tempat letak basikal.','Awas! Lantai licin selepas hujan.'],
  ['Kelab Sains: Esok kita buat gunung berapi! Bawa baking soda.','Jawatankuasa Kebersihan: Buang sampah dalam tong yang betul.','Ada murid hilang pen biru. Pen itu rindu kamu.'],
  ['Peringatan: Pengawas sentiasa memerhati. Sentiasa.','Cikgu bertanya siapa makan bekal kawan. Semua senyap.','Ingat: berjalan, bukan berlari, di koridor.'],
  ['Pejabat sekolah buka pukul 7.30 pagi hingga 2.30 petang.','Notis: Sila ketuk pintu Pejabat dahulu. Jangan ketuk kuat sangat.','Barang tercicir: sebiji kasut. Seseorang pulang dengan sebelah kaki.'],
  ['Pertandingan mewarna bertema Sekolah Bersih. Sertai sekarang!','Joke: Kenapa buku Matematik sedih? Terlalu banyak masalah.','Jangan lupa minum air. Badan kamu banyak air!'],
  ['Hari Sukan akan tiba. Latih kaki dari sekarang.','Kerja rumah tak boleh dimakan anjing. Cikgu tak percaya.','Perpustakaan: sila senyap. Buku sedang tidur.'],
  ['Notis: Tandas perlu dijaga bersih. Tolong siram!','Joke: Apa jam kata kepada murid? Tepat masa!','Kantin: sila beratur dengan sabar.'],
  ['Jawatankuasa pengawas mencari ahli baharu.','Joke: Kenapa pensel kena marah? Sebab tak tajam.','Selamat datang ke SK Hero Kampus!']];
 const C=()=>typeof cur!=='undefined'?cur:null;
 const isI=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
 const okS=s=>!!s&&typeof s=='object'&&Array.isArray(s.f)&&s.f.length==CFG.n&&s.f.every(v=>v===0||v===1)&&Array.isArray(s.ass)&&s.ass.length==CFG.n&&s.ass.every(v=>isI(v,0,CFG.boards-1))&&new Set(s.ass).size==CFG.n&&Array.isArray(s.rd)&&s.rd.length==CFG.boards&&s.rd.every(v=>isI(v,0,999))&&isI(s.loc,0,SPOTS.length-1);
 const shuf=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a};
 function fresh(r){r=r||Math.random;return{f:new Array(CFG.n).fill(0),ass:shuf(Array.from({length:CFG.boards},(_,i)=>i),r).slice(0,CFG.n),rd:new Array(CFG.boards).fill(0),loc:Math.floor(r()*SPOTS.length),key:0,done:0,lt:[0,0],th:0}}
 /* the quest state of the current slot. make = create it when missing or broken (a broken one is replaced by a fresh quest) */
 function st(make,r){const c=C();if(!c)return null;if(okS(c.jk)){const j=c.jk;j.key=j.key?1:0;j.lt=Array.isArray(j.lt)&&j.lt.length==2?j.lt.map(v=>v?1:0):[0,0];j.th=isI(j.th,0,2)?j.th:0;j.done=j.lt[0]&&j.lt[1]?1:0;return j}if(!make)return null;c.jk=fresh(r);return c.jk}
 const persist=()=>{if(typeof save=='function'&&C())save()};
 const count=s=>s?s.f.reduce((a,b)=>a+b,0):0;
 /* a piece is counted once; true only the first time */
 function collect(k,r){if(!isI(k,0,CFG.n-1))return false;const s=st(true,r);if(s.f[k])return false;s.f[k]=1;persist();return true}
 /* one reading of board b: {k:'piece',frag,n,all} or {k:'flav',line} (null for a bad board id) */
 function read(b,r){if(!isI(b,0,CFG.boards-1))return null;r=r||Math.random;const s=st(true,r);s.rd[b]=Math.min(999,s.rd[b]+1);const k=s.ass.indexOf(b);
  if(k>=0&&!s.f[k]&&(s.rd[b]>=CFG.pity||r()<CFG.chance)){s.f[k]=1;persist();const n=count(s);return{k:'piece',frag:k,n,all:n>=CFG.n}}
  persist();const L=LINES[b];return{k:'flav',line:L[(s.rd[b]-1)%L.length]}}
 /* ---- where a hiding place is (world metres), for the player's own gender g ('m' boys / 'f' girls) ---- */
 const G=()=>typeof gen!=='undefined'&&gen=='f'?'f':'m';
 function pos(i,g){const sp=SPOTS[i];if(!sp)return null;g=g||G();
  if(sp.t){if(typeof TOIL=='undefined')return null;const r=TOIL[g=='f'?1:0];return r&&r.jk?{x:r.jk.x,z:r.jk.z,tx:r.jk.x,tz:r.jk.z,ty:sp.ty,r:sp.r,s:r.jk.s}:null}
  if(typeof X=='undefined'||typeof Z=='undefined')return null;const o=sp.oz||0;
  return{x:X(sp.px),z:Z(sp.py)+o,tx:X(sp.tx!=null?sp.tx:sp.px),tz:Z(sp.ty2!=null?sp.ty2:sp.py)+(sp.ty2!=null?0:o),ty:sp.ty,r:sp.r,s:0}}
 /* the photo camera for hiding place i: a point above and to the side of the target, looking at it (the toilet one is mirrored for the room side) */
 function camPose(i,g){const p=pos(i,g),sp=SPOTS[i];if(!p)return null;const m=sp.t?-p.s:1;return{x:p.tx+sp.cam[0]*m,y:p.ty+sp.cam[1],z:p.tz+sp.cam[2],tx:p.tx,ty:p.ty,tz:p.tz}}
 /* ---- the photo: a snapshot of the real scene (WebGL render target, once). The player and NPCs are hidden and every fading wall is made solid for that one render, then everything is put back. null if anything fails ---- */
 function snap(i,g){if(typeof T=='undefined'||typeof ren=='undefined'||typeof sc=='undefined'||typeof FDS=='undefined'||typeof document=='undefined')return null;
  const cp=camPose(i,g);if(!cp)return null;const W=CFG.sw,H=CFG.sh,cx=new T.PerspectiveCamera(CFG.fov,W/H,.3,150);cx.position.set(cp.x,cp.y,cp.z);cx.lookAt(cp.tx,cp.ty,cp.tz);cx.updateMatrixWorld(true);
  let rt=null,ok=false;const hid=[],sv=[],buf=new Uint8Array(W*H*4);
  try{[typeof pm!='undefined'?pm:null,typeof ar!='undefined'?ar:null].concat(typeof ns!='undefined'?ns.map(n=>n.m):[]).forEach(o=>{if(o&&o.visible){o.visible=false;hid.push(o)}});
   FDS.forEach(f=>f.m.forEach(m=>{sv.push([m.mt,m.mt.opacity,m.mt.transparent,m.mt.depthWrite]);m.mt.opacity=m.b;if(m.mt.transparent!==m.tr){m.mt.transparent=m.tr;m.mt.needsUpdate=true}m.mt.depthWrite=m.dw}));
   rt=new T.WebGLRenderTarget(W,H);ren.setRenderTarget(rt);ren.render(sc,cx);ren.readRenderTargetPixels(rt,0,0,W,H,buf);ok=true}catch(e){ok=false}
  finally{try{ren.setRenderTarget(null)}catch(e){}sv.forEach(a=>{a[0].opacity=a[1];if(a[0].transparent!==a[2]){a[0].transparent=a[2];a[0].needsUpdate=true}a[0].depthWrite=a[3]});hid.forEach(o=>{o.visible=true});if(rt)try{rt.dispose()}catch(e){}}
  if(!ok)return null;let lo=255,hi=0;for(let k=0;k<buf.length;k+=97){const v=buf[k];if(v<lo)lo=v;if(v>hi)hi=v}if(hi-lo<12)return null;   /* blank frame: not a photo */
  const c=cvs(W,H),g2=c.getContext('2d'),im=g2.createImageData(W,H);for(let y=0;y<H;y++)im.data.set(buf.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4);g2.putImageData(im,0,0);
  const v=new T.Vector3(cp.tx,cp.ty,cp.tz).project(cx);return{cv:c,cx:(v.x*.5+.5)*W,cy:(-v.y*.5+.5)*H}}
 /* the whole photo (300 x 200): paper border, the snapshot, a red marker circle round the spot, a caption. Cached per spot and gender. Fallback = grey card with the place name */
 function buildMaster(){const s=pv?null:st(false),i=pv?pv.loc:s?s.loc:0,g=pv&&pv.g||G(),key=i+':'+g;if(master&&mkey==key)return master;pieces={};mkey=key;
  const W=CFG.cols*CFG.pw,H=CFG.rows*CFG.ph,m=cvs(W,H),c=m.getContext('2d'),{ix,iy,iw,ih}=CFG,sn=snap(i,g);
  c.fillStyle='#f6f2e8';c.fillRect(0,0,W,H);
  if(sn){c.drawImage(sn.cv,0,0,sn.cv.width,sn.cv.height,ix,iy,iw,ih);c.strokeStyle='#e0242b';c.lineWidth=3.5;c.setLineDash([10,5]);c.beginPath();c.ellipse(ix+sn.cx*iw/sn.cv.width,iy+sn.cy*ih/sn.cv.height,32,27,.05,0,7);c.stroke();c.setLineDash([])}
  else{c.fillStyle='#c9ccd2';c.fillRect(ix,iy,iw,ih);c.fillStyle='#4a4a52';c.font='bold 15px Fredoka,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('Gambar kabur...',W/2,iy+ih/2-12);c.fillText(SPOTS[i].n,W/2,iy+ih/2+12)}
  c.fillStyle='#6b5a3a';c.font='bold 13px Fredoka,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('rahsia kita \u263A',W/2,H-10);
  c.strokeStyle='rgba(120,100,60,.45)';c.lineWidth=1;c.strokeRect(.5,.5,W-1,H-1);return master=m}
 /* ---- the 6 torn pieces (3 x 2 of 100 x 100). A shared edge is the same jagged line for both neighbours; the 4 outer sides are straight and the corners stay on the grid ---- */
 function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
 function edge(ax,ay,bx,by){const W=CFG.cols*CFG.pw,H=CFG.rows*CFG.ph;
  if((ax==0&&bx==0)||(ax==W&&bx==W)||(ay==0&&by==0)||(ay==H&&by==H))return[[ax,ay],[bx,by]];
  const sw=ax>bx||(ax==bx&&ay>by),x0=sw?bx:ax,y0=sw?by:ay,x1=sw?ax:bx,y1=sw?ay:by,len=Math.hypot(x1-x0,y1-y0),nx=-(y1-y0)/len,ny=(x1-x0)/len,r=rng(hash(x0+','+y0+'>'+x1+','+y1)),P=[[x0,y0]];
  for(let i=1;i<CFG.seg;i++){const t=i/CFG.seg,j=(r()*2-1)*CFG.amp*Math.sin(Math.PI*t);P.push([x0+(x1-x0)*t+nx*j,y0+(y1-y0)*t+ny*j])}
  P.push([x1,y1]);return sw?P.reverse():P}
 /* outline of piece k (0..5: column = k%3, row = k div 3), clockwise, as a list of [x,y] in photo pixels */
 function poly(k){const c=k%CFG.cols,r=Math.floor(k/CFG.cols),x0=c*CFG.pw,y0=r*CFG.ph,x1=x0+CFG.pw,y1=y0+CFG.ph,out=[];
  [[x0,y0,x1,y0],[x1,y0,x1,y1],[x1,y1,x0,y1],[x0,y1,x0,y0]].forEach(s=>{const e=edge(s[0],s[1],s[2],s[3]);e.pop();out.push(...e)});return out}
 const cvs=(w,h)=>{const e=document.createElement('canvas');e.width=w;e.height=h;return e};
 let master=null,mkey='',pieces={},pv=null;   /* pv = dev preview {loc,g} (JK.preview) */
 const getMaster=()=>buildMaster();
 const path=(g,pl,dx,dy)=>{g.beginPath();pl.forEach((p,i)=>i?g.lineTo(p[0]+dx,p[1]+dy):g.moveTo(p[0]+dx,p[1]+dy));g.closePath()};
 /* one piece as its own small canvas (with a torn paper rim); cached */
 function pieceCanvas(k){getMaster();if(pieces[k])return pieces[k];const c=k%CFG.cols,r=Math.floor(k/CFG.cols),pd=CFG.pad,e=cvs(CFG.pw+pd*2,CFG.ph+pd*2),g=e.getContext('2d'),pl=poly(k),dx=pd-c*CFG.pw,dy=pd-r*CFG.ph;
  g.save();path(g,pl,dx,dy);g.clip();g.drawImage(getMaster(),dx,dy);g.restore();
  path(g,pl,dx,dy);g.lineJoin='round';g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=3;g.stroke();g.strokeStyle='rgba(90,70,40,.55)';g.lineWidth=1;g.stroke();return pieces[k]=e}
 /* the table with the pieces laid where they belong; missing ones are dashed outlines. */
 function paintTable(cv,f){const g=cv.getContext('2d'),pd=CFG.pad,W=CFG.cols*CFG.pw,H=CFG.rows*CFG.ph,all=f.every(v=>v);
  g.fillStyle='#3b3128';g.fillRect(0,0,cv.width,cv.height);g.save();g.translate(pd,pd);
  for(let k=0;k<CFG.n;k++){if(f[k]){g.drawImage(pieceCanvas(k),-pd+(k%CFG.cols)*CFG.pw,-pd+Math.floor(k/CFG.cols)*CFG.ph)}
   else{path(g,poly(k),0,0);g.fillStyle='rgba(255,255,255,.06)';g.fill();g.setLineDash([6,5]);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=1.5;g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(255,255,255,.55)';g.font='bold 30px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',(k%CFG.cols)*CFG.pw+CFG.pw/2,Math.floor(k/CFG.cols)*CFG.ph+CFG.ph/2)}}
  if(all){g.fillStyle=CFG.tape;g.save();g.translate(W/2,2);g.rotate(-.05);g.fillRect(-22,-8,44,16);g.restore();g.save();g.translate(W-4,H-4);g.rotate(.7);g.fillRect(-20,-7,40,14);g.restore()}
  g.restore()}
 /* ---- screens ---- */
 const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const hasUI=()=>typeof document!=='undefined'&&document.body;
 function css(){if(document.getElementById('jkxcss'))return;const s=document.createElement('style');s.id='jkxcss';
  s.textContent='#jkxv{position:fixed;inset:0;z-index:18;display:flex;align-items:center;justify-content:center;background:rgba(10,20,50,.6);padding:3vmin}'+
  '.jkxc{width:min(94vw,25em);background:#fff8e1;color:#1c2f6b;border-radius:1em;padding:.8em .9em;box-shadow:0 8px 28px rgba(0,0,0,.5);font-weight:600;text-align:center}'+
  '.jkxc h3{margin:0 0 .4em;font-size:1.2em}.jkxc canvas{position:static;inset:auto;width:100%;height:auto;border-radius:.5em;display:block;background:#3b3128}.jkxc p{margin:.5em 0 0}'+
  '.jkxc button{font:inherit;font-weight:700;border:0;border-radius:.7em;padding:.5em 1.2em;background:#1c2f6b;color:#fff;cursor:pointer;min-height:2.4em;margin-top:.6em}'+
  '#jkxp{position:fixed;left:50%;top:15%;z-index:17;transform:translate(-50%,0);display:flex;align-items:center;gap:.6em;background:#fff8e1;color:#1c2f6b;border-radius:.9em;padding:.4em .8em .4em .4em;box-shadow:0 6px 20px rgba(0,0,0,.45);font-weight:700;pointer-events:none;animation:jkxin .35s ease-out}'+
  '#jkxp canvas{position:static;inset:auto;width:4.2em;height:4.2em;display:block;flex:none}@keyframes jkxin{from{opacity:0;transform:translate(-50%,-.8em)}to{opacity:1;transform:translate(-50%,0)}}';
  document.head.appendChild(s)}
 let pop=null,popT=0,vw=null,vHalt=false,vKey=null;
 function unpop(){if(pop&&pop.parentNode)pop.parentNode.removeChild(pop);pop=null;clearTimeout(popT)}
 /* a piece was found: small card at the top, the game keeps running */
 function popup(k,n){if(!hasUI())return;css();unpop();pop=el('div');pop.id='jkxp';pop.append(pieceCanvas(k),el('span',null,'Cebisan Gambar '+n+'/'+CFG.n));document.body.append(pop);popT=setTimeout(unpop,CFG.popMs)}
 function closeView(){if(vw){if(vKey)removeEventListener('keydown',vKey);vKey=null;vw.remove();vw=null}if(vHalt){vHalt=false;if(typeof halt!=='undefined')halt=false}pv=null}
 /* the photo screen (from the bag, or by itself when the 6th piece is found). false when the game is busy */
 function view(){if(!hasUI())return false;if(vw)return true;if(typeof halt!=='undefined'&&halt)return false;const s=pv?{f:[1,1,1,1,1,1]}:st(false);if(!s||!count(s))return false;css();
  const n=count(s),all=n>=CFG.n,cv=cvs(CFG.cols*CFG.pw+CFG.pad*2,CFG.rows*CFG.ph+CFG.pad*2);paintTable(cv,s.f);
  vHalt=true;if(typeof halt!=='undefined')halt=true;vw=el('div');vw.id='jkxv';vw.setAttribute('role','dialog');vw.addEventListener('pointerdown',e=>{if(e.target===vw)closeView()});
  const card=el('div','jkxc');card.append(el('h3',null,all?'Gambar yang koyak':'Cebisan Gambar '+n+'/'+CFG.n),cv,el('p',null,all?'Hmm... tempat ni macam pernah nampak.':'Masih ada cebisan lain di papan kenyataan.'));
  const b=el('button',null,'Tutup');b.onclick=closeView;card.append(b);vw.append(card);document.body.append(vw);
  vKey=e=>{if(e.code=='Escape'||e.code=='KeyE'||e.code=='Enter'){e.preventDefault();closeView()}};addEventListener('keydown',vKey);return true}
 /* ---- game side: E at a board or a hiding place (called by act() in world.js, like toiGo) ---- */
 function near(){if(typeof JKB==='undefined'||typeof P==='undefined')return -1;let bi=-1,bd=CFG.reach;JKB.forEach((b,i)=>{const d=Math.hypot(P.x-b.x,P.z-b.z);if(d<bd){bd=d;bi=i}});return bi}
 function nearSpot(){if(typeof P==='undefined')return -1;let bi=-1,bd=1e9;SPOTS.forEach((sp,i)=>{const p=pos(i);if(!p)return;const d=Math.hypot(P.x-p.x,P.z-p.z);if(d<sp.r&&d<bd){bd=d;bi=i}});return bi}
 const busy=()=>typeof window!=='undefined'&&!!window.lockBusy&&window.lockBusy();
 const dc=[];   /* how often each spot said "nothing here" (not saved), to rotate the lines */
 /* search hiding place i: {k:'key',line} the first time at the right one, {k:'none',line} at the others, null once the key is found or for a bad id */
 function search(i){if(!isI(i,0,SPOTS.length-1))return null;const s=st(true);if(s.key)return null;const sp=SPOTS[i];
  if(i===s.loc){s.key=1;persist();return{k:'key',line:sp.f}}
  dc[i]=(dc[i]||0)+1;return{k:'none',line:sp.d[(dc[i]-1)%sp.d.length]}}
 function go(){if(typeof halt!=='undefined'&&halt)return false;const b=near(),q=b<0?nearSpot():-1;if(b<0&&q<0)return false;
  const s0=st(false);if(b<0&&s0&&s0.key)return false;   /* key found: the hiding places are quiet */
  if(busy()){if(typeof say=='function')say(b>=0?CFG.busy:CFG.busy2);return true}
  if(b<0){const r=search(q);if(!r)return false;
   if(r.k=='key'){try{tone(660,0,.08,'triangle',.1);tone(880,.09,.08,'triangle',.1);tone(1100,.18,.14,'triangle',.1)}catch(e){}if(typeof say=='function')say(CFG.keySay);if(typeof toast=='function')toast(r.line,3200)}
   else if(typeof toast=='function')toast(r.line,2600);
   return true}
  const r=read(b);if(!r)return false;
  if(r.k=='piece'){try{tone(740,0,.05,'triangle',.08);tone(520,.06,.08,'triangle',.08)}catch(e){}
   if(typeof say=='function')say(CFG.found);popup(r.frag,r.n);
   if(r.all)setTimeout(()=>{if(typeof toast=='function')toast(CFG.allToast,CFG.doneMs);setTimeout(view,300)},CFG.popMs-400)}
  else if(typeof toast=='function')toast(r.line,2800);
  return true}
 function hint(){if(typeof halt!=='undefined'&&halt)return '';if(busy())return '';if(near()>=0)return 'Baca papan';if(nearSpot()>=0){const s=st(false);if(!s||!s.key)return 'Siasat'}return ''}
 /* ---- the locked cubicle and its chest (20c) ---- */
 const RW=[{i:'\uD83E\uDDBA',n:'Rompi Tukang Cuci',say:'Wah! Rompi tukang cuci!',sub:'Pakaian baharu! Tengok dalam beg.',d:'Hadiah tandas lelaki. Belum boleh dipakai lagi.',b:'Pakai'},
  {i:'\uD83E\uDDF9',n:'Mop Terbang',say:'Eh, mop ni bergetar-getar!',sub:'Mop ajaib! Tengok dalam beg.',d:'Hadiah tandas perempuan. Terbang pada kelajuan berjalan, tiada kelebihan.',b:'Naik'}];
 const doorI=q=>typeof TOIL!=='undefined'&&q&&q.r?TOIL.indexOf(q.r):-1;
 /* is q (a door from toilet.js) the quest cubicle that the key opens now? locked, key in the bag, chest not taken yet */
 function doorOk(q){if(!q||!q.d||q.d.use)return false;const s=st(false);if(!s||!s.key)return false;const i=doorI(q);return i>=0&&!s.lt[i]}
 let seq=null;
 function walk(o,tx,tz,sp,dt){const dx=tx-o.x,dz=tz-o.z,l=Math.hypot(dx,dz),k=sp*dt;if(l<=k+.03){o.x=tx;o.z=tz;return true}o.x+=dx/l*k;o.z+=dz/l*k;o.f=Math.atan2(dx,dz);return false}
 /* E on the locked door with the key (called by toilet.js go()): true = handled */
 function door(q){if(!doorOk(q))return false;if(seq)return true;if(typeof halt!=='undefined'&&halt)return false;
  if(typeof window!=='undefined'&&window.lockPf&&window.lockPf()){if(typeof say=='function')say(CFG.busy3);return true}
  seq={q,i:doorI(q),ph:0,t:0,a:0};if(typeof halt!=='undefined')halt=true;q.d.kt=1;return true}
 const doorHint=q=>!seq&&doorOk(q)?'Buka dengan kunci':'';
 /* take chest i (0 boys = vest, 1 girls = mop): true only the first time */
 function loot(i){const s=st(false);if(!s||!isI(i,0,1)||s.lt[i])return false;s.lt[i]=1;s.done=s.lt[0]&&s.lt[1]?1:0;persist();return true}
 function rewardCard(w){if(!hasUI())return;css();unpop();pop=el('div');pop.id='jkxp';const ic=el('span',null,w.i);ic.style.fontSize='2.4em';pop.append(ic,el('span',null,w.n+' \u2013 '+w.sub));document.body.append(pop);popT=setTimeout(unpop,CFG.popMs+1500)}
 function reward(i){const w=RW[i];try{tone(523,0,.1,'triangle',.1);tone(659,.1,.1,'triangle',.1);tone(784,.2,.1,'triangle',.1);tone(1046,.32,.25,'triangle',.1)}catch(e){}if(typeof say=='function')say(w.say);rewardCard(w)}
 /* the script after E on the door: phase 0 walk to the door then into the cubicle, 1 the chest opens (reward at the end of it), 2 a short pause, 3 walk out */
 function seqStep(dt){const u=seq;if(!u)return;const d=u.q.d,Q=CFG.q;u.t+=dt;P.sx=P.sz=0;P.vy=0;P.y=0;if(typeof halt!=='undefined')halt=true;
  if(u.ph==0){if(!u.a){if(walk(P,d.x,d.z,Q.walk,dt))u.a=1}else if(walk(P,d.inn.x,d.inn.z,Q.walk,dt)){P.f=Math.PI;u.ph=1;u.t=0}}
  else if(u.ph==1){if(u.t>=Q.chest){u.ph=2;u.t=0;if(loot(u.i))reward(u.i)}}
  else if(u.ph==2){if(u.t>=Q.hold){u.ph=3;u.t=0}}
  else if(walk(P,d.x,d.z,Q.walk,dt)){P.f=0;d.kt=0;seq=null;if(typeof halt!=='undefined')halt=false}}
 /* every frame: the chest lids follow the state, and a looted cubicle becomes a normal green one (usable) */
 function syncWorld(dt){if(typeof TOIL=='undefined')return;const s=st(false);
  TOIL.forEach((r,i)=>{const d=r.doors&&r.doors[2];if(!d||!d.chest)return;const got=!!(s&&s.lt[i]),want=got||(seq&&seq.i==i&&seq.ph>=1)?1:0,c=d.chest;
   if(!d.jki){d.jki=1;c.k=got?1:0;c.lid.rotation.x=-1.9*c.k}
   if(c.k!==want){const st2=(dt||0)/CFG.q.lid;c.k=c.k<want?Math.min(want,c.k+st2):Math.max(want,c.k-st2);c.lid.rotation.x=-1.9*c.k}
   if(got&&!d.jkd){d.jkd=1;d.use=1;if(d.leaf&&d.leaf.material&&d.leaf.material.clone){d.leaf.material=d.leaf.material.clone();d.leaf.material.color.set('#4fa86b')}}})}
 /* ---- the janitor (NPC role 'cuci'): mumbles about the lost key when the player is near, until the key is found ---- */
 const JL=['Manalah saya letak kunci tu?','Rasanya hari tu atas meja...','Siapa pula yang sorok kunci ni?','Aduh... kunci tandas tu hilang lagi.','Esok nak mop tandas macam mana ni...','Budak mana yang nakal ni...'];
 let jcd=8,jlast=-1;
 const TH=['Eh, itu kunci tandas saya! Awak jumpa rupanya!','Buka bilik yang berkunci tu. Ada sesuatu di dalam!'];
 function tick(dt,r){dt=dt||0;seqStep(dt);syncWorld(dt);if(typeof ns=='undefined'||typeof P=='undefined'||typeof window=='undefined'||!window.jkSay)return;if(typeof halt!=='undefined'&&halt)return;jcd-=dt;if(jcd>0)return;r=r||Math.random;
  const j=ns.find(n=>n.role=='cuci'&&n.m&&n.m.visible!==false);if(!j){jcd=5;return}
  const s=st(false);if(s&&s.key&&(s.done||s.th>=2)){jcd=30;return}
  if(Math.hypot(j.x-P.x,j.z-P.z)>CFG.jRange||(window.jkSayBusy&&window.jkSayBusy())){jcd=2;return}
  if(s&&s.key){window.jkSay(j,TH[s.th],3);s.th++;persist();jcd=4;return}   /* the key is in the bag: he thanks you once and points at the locked cubicle */
  let k;do{k=Math.floor(r()*JL.length)}while(k==jlast&&JL.length>1);jlast=k;window.jkSay(j,JL[k],3);jcd=CFG.jGap[0]+r()*(CFG.jGap[1]-CFG.jGap[0])}
 /* dev: the photo of hiding place i (0..4) for gender g, without touching the save */
 function preview(i,g){if(!isI(i,0,SPOTS.length-1))return false;closeView();pv={loc:i,g:g=='f'?'f':'m'};const ok=view();if(!ok)pv=null;return ok}
 /* the Mop Terbang row (20d): js/mop.js does the riding; without it (other pages) the row is greyed out */
 function mopRow(){const w=typeof window!=='undefined'?window:{},rw=RW[1];return{i:rw.i,n:rw.n,d:rw.d,q:'1',b:w.mopOn&&w.mopOn()?'Turun':'Naik',off:!w.mopToggle,go:()=>w.mopToggle?w.mopToggle():null}}
 /* rows for the bag (js/bag.js): once a piece, the key or a reward has been found */
 function rows(){const s=st(false);if(!s)return[];const n=count(s),any=s.lt[0]||s.lt[1];if(!n&&!s.key&&!any)return[];const R=[];
  if(!s.done&&(n||s.key)){R.push({h:'Kunci Hilang'});
   if(s.key)R.push({i:'\uD83D\uDD11',n:'Kunci Tandas',d:'Kunci bilik tandas yang hilang. Buka bilik yang berkunci di tandas.',q:'1',b:'Simpan',off:true});
   if(n)R.push({i:'\uD83E\uDDE9',n:'Cebisan Gambar',d:n>=CFG.n?'Gambar sudah lengkap. Lihat semula.':'Jumpa '+n+' daripada '+CFG.n+' cebisan di papan kenyataan.',q:n+'/'+CFG.n,b:'Lihat',go:()=>{setTimeout(view,0);return{close:true}}})}
  if(any){R.push({h:'Hadiah Tandas'});[1,0].forEach(i=>{if(s.lt[i])R.push(i==1?mopRow():{i:RW[i].i,n:RW[i].n,d:RW[i].d,q:'1',b:RW[i].b,off:true})})}
  return R}
 if(typeof window!=='undefined'){window.jkGo=go;window.jkHint=hint;window.jkTick=tick;window.jkDoor=door;window.jkDoorHint=doorHint}
 return{CFG,SPOTS,LINES,JL,TH,RW,door,doorHint,doorOk,loot,seqStep,syncWorld,seqState:()=>seq,st,fresh,okS,read,collect,count,search,rows,view,preview,poly,edge,pieceCanvas,paintTable,near,nearSpot,pos,camPose,snap,go,hint,tick,popup}
})();
