/* Round 16: school bag, boosts, debuff carry and the shop menus (global BAG). Loaded on every page that has the HUD.
   State lives in the save slot (old saves without these fields read as empty):
     cur.inv = {nasi,gula,pisang,iso,epal: count 0..9}    cur.fx = {b: active boost key, t: seconds left, sl: slow debuff seconds left}
   Money is only ever changed by WALLET (js/wallet.js). Prices: WALLET.CFG.shop (gula, pisang, iso, epal), WALLET.CFG.nasi, WALLET.CFG.ice.
   Effects: gula-gula and isotonik = speed x1.5 (5 s / 10 s), pisang = jump x1.35 (5 s) and may jump over a wet-floor sign, epal pelangi = invisible
   (10 s): the player phases through every object (indoors: everything except the walls; outside: everything except the school building; people and
   cars too) and banana peel, rubbish and wet-floor signs do not affect the player. Prefects and the guard still chase and catch. When it ends inside
   an object the player is put back on the last free spot (BAG.track / BAG.unstick). Boosts run and apply on the school world and outside only
   (BAG.world = 1, set by world.js and luar.js) and their time is kept while you are on another page (Kantin, Padang, classrooms). The SLOW debuff (rotan, rubbish, car bump) is carried
   everywhere: each page mirrors its own slow timer into cur.fx.sl with BAG.sync() and reads it back with BAG.slow0() at boot.
   Nasi lemak (kept in the bag, used from it) and ice cream (eaten on the spot, never stored) remove the slow debuff.
   Round 17 cosmetics: cur.cos = {own:{cap,eye,beard,mos: 1}, on:{...: 1}} (old saves read as nothing owned). Bought once in the Kedai Runcit (WALLET.CFG.shop, RM4.00 each),
   worn and taken off only from the bag (Pakai / Tanggal), any combination. chars.js player() reads BAG.worn(); wear/doff rebuild the player with the page's own mkP(). */
const BAG=(()=>{
 const MAX=9,SAVE_MS=3000;
 const IT={nasi:{n:'Nasi Lemak',i:'\uD83C\uDF5B',k:'cure',d:'Buang kesan perlahan'},
  gula:{n:'Gula-gula',i:'\uD83C\uDF6C',k:'spd',t:5,m:1.5,d:'Laju 5 saat'},
  pisang:{n:'Pisang',i:'\uD83C\uDF4C',k:'jmp',t:5,m:1.35,d:'Lompat tinggi 5 saat, boleh lompat atas tanda lantai basah'},
  iso:{n:'Minuman Isotonik',i:'\uD83E\uDD64',k:'spd',t:10,m:1.5,d:'Laju 10 saat'},
  epal:{n:'Epal Fuji',i:'\uD83C\uDF4E',k:'inv',t:10,d:'Halimunan 10 saat, boleh tembus semua benda kecuali dinding'}};
 const ORDER=['nasi','gula','pisang','iso','epal'],RUNCIT=['gula','pisang','iso','epal'],FLAV=[['vanila','Vanila'],['coklat','Coklat'],['jagung','Jagung']];
 const ICE_I='\uD83C\uDF66',SNAIL='\uD83D\uDC22';
 const COS={cap:{n:'Topi',i:'\uD83E\uDDE2',d:'Topi merah untuk kepala'},eye:{n:'Penutup Mata',i:'\uD83C\uDFF4\u200D\u2620\uFE0F',d:'Penutup mata hitam'},beard:{n:'Janggut',i:'\uD83E\uDDD4',d:'Janggut ikut warna rambut'},mos:{n:'Misai',i:'\uD83E\uDD78',d:'Misai ikut warna rambut'}},COSORD=['cap','eye','beard','mos'];
 const C=()=>typeof cur!=='undefined'?cur:null,num=v=>Math.max(0,+v||0);
 const W=()=>typeof WALLET!=='undefined'?WALLET:null;
 const fxr=()=>{const c=C();return c&&c.fx&&typeof c.fx=='object'?c.fx:null};          /* read only, never creates */
 const fxw=()=>{const c=C();if(!c)return null;if(!c.fx||typeof c.fx!='object')c.fx={};return c.fx};
 const stw=()=>{const c=C();if(!c)return null;if(!c.inv||typeof c.inv!='object')c.inv={};return c.inv};
 const B={IT,ORDER,RUNCIT,MAX,COS,COSORD,world:0,onCure:null,onEat:null};let lastSave=0;
 const persist=()=>{lastSave=Date.now();if(typeof save=='function'&&C())save()};
 /* ---- bag ---- */
 B.cnt=k=>{const c=C(),n=c&&c.inv&&typeof c.inv=='object'?Math.floor(+c.inv[k]||0):0;return Math.max(0,Math.min(MAX,n))};
 B.add=k=>{if(!IT[k]||B.cnt(k)>=MAX)return false;stw()[k]=B.cnt(k)+1;persist();B.paint();return true};
 const take=k=>{if(B.cnt(k)<1)return false;stw()[k]=B.cnt(k)-1;return true};
 B.price=k=>{const w=W();if(!w)return 0;return k=='nasi'?w.CFG.nasi:k=='ice'?w.CFG.ice:(w.CFG.shop&&w.CFG.shop[k])||0};
 /* buy: 'ok' | 'poor' | 'full' | 'bad'. The bag is checked before any money is taken. */
 B.buy=k=>{const w=W();if(!w||!IT[k]||!B.price(k))return 'bad';if(B.cnt(k)>=MAX)return 'full';if(!w.spend(B.price(k)))return 'poor';B.add(k);return 'ok'};
 /* ---- effects ---- */
 B.slow0=()=>{const f=fxr();return f?num(f.sl):0};
 B.sync=v=>{v=num(v);const f=fxr();if(!f&&v<=0)return;if(f&&Math.abs(num(f.sl)-v)<1e-6)return;fxw().sl=v};
 B.debuff=()=>B.slow0()>0;
 const act=k=>{const f=fxr();return f&&f.b&&IT[f.b]&&IT[f.b].k==k&&num(f.t)>0};
 B.spd=()=>act('spd')?IT[fxr().b].m:1;
 B.jmp=()=>act('jmp')?IT[fxr().b].m:1;
 B.inv=()=>!!act('inv');
 B.left=()=>{const f=fxr();return f&&f.b&&num(f.t)>0?num(f.t):0};      /* seconds left of the active boost */
 /* last free spot, for when invisibility ends inside an object: pages call track(x,z,hit) every frame and unstick(P,hit) when it ends */
 let ls=null;
 B.track=(x,z,hitFn)=>{if(!hitFn(x,z,.35))ls={x,z}};
 B.unstick=(p,hitFn)=>{if(!hitFn(p.x,p.z,.35))return false;let t=ls&&!hitFn(ls.x,ls.z,.35)?ls:null;
  for(let r=.4;!t&&r<=6;r+=.4)for(let a=0;a<16&&!t;a++){const x=p.x+Math.cos(a*Math.PI/8)*r,z=p.z+Math.sin(a*Math.PI/8)*r;if(!hitFn(x,z,.35))t={x,z}}
  if(!t)return false;p.x=t.x;p.z=t.z;return true};
 /* see-through player: the player's meshes get their own copies of the materials once (other people share materials), then opacity is set; the original transparent/opacity of each copy is restored when it ends */
 B.ghost=(m,on,op)=>{if(!m||!m.traverse)return;m.traverse(o=>{if(o.isMesh&&o.material&&!Array.isArray(o.material)){if(!o.userData.gm){o.userData.gm=1;o.material=o.material.clone();const u=o.material.userData||(o.material.userData={});u.t0=!!o.material.transparent;u.o0=o.material.opacity==null?1:o.material.opacity}
   const mt=o.material,u=mt.userData||(mt.userData={}),o0=u.o0==null?1:u.o0;mt.transparent=on?true:!!u.t0;mt.opacity=on?op*o0:o0;mt.needsUpdate=true}})};   /* each copy remembers its own transparent/opacity: the face is a transparent overlay (chars.js faceMat) and must stay transparent when the effect ends, otherwise its clear pixels draw black */
 B.sl=()=>B.slow0()>0?.5:1;                       /* slow factor for pages that have no timer of their own */
 B.cure=()=>{const f=fxr();if(f&&num(f.sl)>0){f.sl=0;persist()}if(typeof B.onCure=='function')B.onCure();B.paint()};
 /* ext=1: the page keeps its own slow timer (and mirrors it with sync); only boosts count here, and only on the school world */
 B.tick=(dt,ext)=>{const f=fxr();if(!f){B.paint();return}dt=num(dt);
  if(B.world&&f.b&&dt>0){f.t=num(f.t)-dt;if(f.t<=0){delete f.b;delete f.t;persist()}}
  if(!ext&&num(f.sl)>0&&dt>0)f.sl=Math.max(0,f.sl-dt);
  if(Date.now()-lastSave>SAVE_MS&&(f.b||num(f.sl)>0))persist();B.paint()};
 /* use from the bag: {ok,msg}. Nasi lemak keeps if there is nothing to cure. Boosts only on the school world. */
 B.use=k=>{const d=IT[k];if(!d)return{ok:false,msg:''};if(B.cnt(k)<1)return{ok:false,msg:'Tiada '+d.n+' dalam beg.'};
  if(d.k=='cure'){if(!B.debuff())return{ok:false,msg:'Tiada kesan perlahan. Simpan dulu!'};take(k);B.cure();return{ok:true,msg:'Segar semula! Kesan perlahan hilang.'}}
  if(!B.world)return{ok:false,msg:'Guna ini di dalam sekolah atau di luar.'};
  take(k);const f=fxw();f.b=k;f.t=d.t;persist();B.paint();return{ok:true,msg:d.n+': '+d.d+'!'}};
 /* ice cream: eaten on the spot. 'ok' | 'poor' (ice cream is paid by WALLET, never stored) */
 B.ice=()=>{const w=W();if(!w)return'bad';if(!w.spend(w.CFG.ice))return'poor';const c=B.debuff();B.cure();return c?'cured':'ok'};
 /* ---- cosmetics (Round 17) ---- */
 const cr=()=>{const c=C();return c&&c.cos&&typeof c.cos=='object'?c.cos:null};          /* read only, never creates */
 const cw=()=>{const c=C();if(!c)return null;if(!c.cos||typeof c.cos!='object')c.cos={};if(!c.cos.own||typeof c.cos.own!='object')c.cos.own={};if(!c.cos.on||typeof c.cos.on!='object')c.cos.on={};return c.cos};
 B.owns=k=>{const s=cr();return !!(COS[k]&&s&&s.own&&typeof s.own=='object'&&s.own[k])};
 B.isOn=k=>{if(!B.owns(k))return false;const s=cr();return !!(s.on&&typeof s.on=='object'&&s.on[k])};
 B.worn=()=>COSORD.filter(B.isOn);
 /* buy once: 'ok' | 'own' | 'poor' | 'bad'. Money is only taken when it is not owned yet. */
 B.buyCos=k=>{const w=W();if(!w||!COS[k]||!B.price(k)||!cw())return 'bad';if(B.owns(k))return 'own';if(!w.spend(B.price(k)))return 'poor';cw().own[k]=1;persist();return 'ok'};
 /* the page rebuilds its own player (mkP) and keeps the position and facing; the HUD portrait is redrawn */
 B.rebuild=()=>{if(typeof mkP==='function'&&typeof pm!=='undefined'&&pm&&pm.position&&pm.rotation){const o=pm,x=o.position.x,y=o.position.y,z=o.position.z,ry=o.rotation.y;mkP();if(pm&&pm!==o){pm.position.set(x,y,z);pm.rotation.y=ry}}
  if(typeof HUD!=='undefined'&&HUD&&HUD.face)HUD.face()};
 B.wear=k=>{if(!B.owns(k))return{ok:false,msg:'Belum beli.'};cw().on[k]=1;persist();B.rebuild();return{ok:true,msg:COS[k].n+' dipakai.'}};
 B.doff=k=>{if(!B.owns(k))return{ok:false,msg:'Belum beli.'};delete cw().on[k];persist();B.rebuild();return{ok:true,msg:COS[k].n+' ditanggalkan.'}};
 /* ---- HUD chip next to the bag button ---- */
 let chip=null,ct='';
 B.chipText=()=>{const f=fxr(),p=[];if(f&&f.b&&IT[f.b]&&num(f.t)>0)p.push(IT[f.b].i+Math.ceil(f.t));if(f&&num(f.sl)>0)p.push(SNAIL+Math.ceil(f.sl));return p.join('\n')};
 B.paint=()=>{if(typeof document==='undefined')return;const s=B.chipText();if(s===ct&&chip)return;const b=document.getElementById('hdbag');if(!b)return;
  if(!chip||!chip.parentNode){chip=document.createElement('span');chip.id='bgxe';(b.parentNode||b).appendChild(chip)}ct=s;chip.textContent=s;chip.style.display=s?'block':'none'};
 /* ---- panel (bag list and shop menus) ---- */
 let panel=null,ownHalt=false,view=null,onClose=null;
 const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const money=()=>{const w=W();return w?'Duit: '+w.fmt(w.get()):''};
 function render(){if(!panel||!view)return;const s=view();panel.innerHTML='';const card=el('div','bgxc');card.append(el('h3',null,s.title));
  if(s.money)card.append(el('div','bgxm',money()));const list=el('div','bgxl');
  s.rows.forEach(r=>{if(r.h){list.append(el('div','bgxh',r.h));return}const row=el('div','bgxr'),t=el('span','bgxt');t.append(el('b',null,r.n),el('small',null,r.d||''));row.append(el('span','bgxi',r.i),t);if(r.q!=null)row.append(el('span','bgxq',r.q));
   const b=el('button',null,r.b);b.disabled=!!r.off;b.onclick=()=>{const m=r.go();if(m&&m.msg)note=m.msg;if(m&&m.close)B.close();else render()};row.append(b);list.append(row)});
  if(!s.rows.length)list.append(el('div','bgxn',s.empty||''));card.append(list);if(note)card.append(el('div','bgxn bgxs',note));
  const x=el('button','bgxx','Tutup');x.onclick=()=>B.close();card.append(x);panel.append(card)}
 let note='';
 function mount(v,after){if(typeof document==='undefined')return false;if(panel)B.close();
  if(typeof halt!=='undefined'&&halt){if(typeof toast=='function')toast('Tak boleh buka sekarang.',1600);return false}
  ownHalt=true;halt=true;view=v;onClose=after||null;note='';panel=el('div');panel.id='bgxp';panel.setAttribute('role','dialog');
  panel.addEventListener('pointerdown',e=>{if(e.target===panel)B.close()});document.body.append(panel);render();return true}
 B.close=()=>{if(panel){panel.remove();panel=null}if(ownHalt){ownHalt=false;if(typeof halt!=='undefined')halt=false}view=null;const f=onClose;onClose=null;if(f)f()};
 B.isOpen=()=>!!panel;
 B.open=()=>{if(panel){B.close();return}
  mount(()=>({title:'Beg Sekolah',empty:'Beg kosong. Beli di Kedai Runcit!',rows:ORDER.filter(k=>B.cnt(k)>0).map(k=>({i:IT[k].i,n:IT[k].n,d:IT[k].d,q:'x'+B.cnt(k),b:'Guna',go:()=>{const r=B.use(k);if(r.ok&&k=='nasi')B.pop(IT.nasi.i);return{msg:r.msg,close:r.ok&&k!='nasi'}}}))
   .concat(COSORD.some(B.owns)?[{h:'Barang Gaya'}].concat(COSORD.filter(B.owns).map(k=>({i:COS[k].i,n:COS[k].n,d:B.isOn(k)?'Sedang dipakai':'Belum dipakai',q:B.isOn(k)?'\u2713':'',b:B.isOn(k)?'Tanggal':'Pakai',go:()=>({msg:(B.isOn(k)?B.doff(k):B.wear(k)).msg})}))):[]).concat(typeof JK!=='undefined'&&JK.rows?JK.rows():[])}))}; /* Round 20a: quest rows from js/jkey.js (world page only) */
 B.openRuncit=()=>mount(()=>({title:'Kedai Runcit',money:1,rows:RUNCIT.map(k=>({i:IT[k].i,n:IT[k].n,d:IT[k].d+' \u00B7 dalam beg: '+B.cnt(k),q:W()?W().fmt(B.price(k)):'',b:'Beli',go:()=>{const r=B.buy(k);return{msg:r=='ok'?'Terima kasih! '+IT[k].n+' masuk beg.':r=='poor'?'Tak cukup duit.':r=='full'?'Beg penuh (maksimum '+MAX+').':'Tak boleh beli.'}}}))
  .concat([{h:'Barang Gaya'}],COSORD.map(k=>({i:COS[k].i,n:COS[k].n,d:COS[k].d+(B.owns(k)?' \u00B7 sudah dibeli, pakai dari beg':''),q:B.owns(k)?'Dimiliki':(W()?W().fmt(B.price(k)):''),b:B.owns(k)?'Dimiliki':'Beli',off:B.owns(k),go:()=>{const r=B.buyCos(k);return{msg:r=='ok'?'Terima kasih! '+COS[k].n+' masuk beg. Pakai dari beg.':r=='poor'?'Tak cukup duit.':r=='own'?'Sudah ada.':'Tak boleh beli.'}}})))}));
 B.openNasi=()=>mount(()=>({title:'Nasi Lemak',money:1,rows:[{i:IT.nasi.i,n:IT.nasi.n,d:'Simpan dalam beg. Makan untuk buang kesan perlahan. Dalam beg: '+B.cnt('nasi'),q:W()?W().fmt(B.price('nasi')):'',b:'Beli',go:()=>{const r=B.buy('nasi');return{msg:r=='ok'?'Terima kasih! Nasi lemak masuk beg.':r=='poor'?'Tak cukup duit.':r=='full'?'Beg penuh (maksimum '+MAX+').':'Tak boleh beli.'}}}]}));
 let ask='';
 B.openIce=()=>{ask='';mount(()=>({title:'Aiskrim',money:1,rows:FLAV.map(f=>({i:ICE_I,n:f[1],d:'Makan terus, tak boleh simpan',q:W()?W().fmt(B.price('ice')):'',b:'Pilih',go:()=>{
  if(!B.debuff()&&ask!=f[0]){ask=f[0];return{msg:'Kaki kamu okey. Pilih sekali lagi kalau nak beli juga.'}}
  const r=B.ice();if(r=='poor')return{msg:'Tak cukup duit.'};if(r=='bad')return{msg:'Tak boleh beli.'};
  const m=r=='cured'?'Sedap! Kaki segar semula.':'Sedap! Aiskrim '+f[1]+'.';setTimeout(()=>{B.pop(ICE_I);if(typeof B.onEat=='function')B.onEat(ICE_I,m)},0);return{close:true}}}))}))};
 /* little icon that pops up and bounces over the middle of the screen (food animation) */
 B.pop=ic=>{if(typeof document==='undefined')return;const e=el('div','bgxp2',ic);document.body.append(e);setTimeout(()=>e.remove(),2000)};
 if(typeof addEventListener==='function'){addEventListener('pagehide',()=>{if(C()&&fxr())persist()});if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden&&C()&&fxr())persist()})}
 return B})();
