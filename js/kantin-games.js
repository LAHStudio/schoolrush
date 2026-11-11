/* Kantin mini games (Round 7), ported from Atan & Atin : Misi Sihat.
   KG.start(i, level, cb): i = stall 0-4, level = 'mudah'|'sederhana'|'sukar' (not used yet, see kantin-data.js).
   cb({exit:true}) if the player quits, or cb({i,wr,sec,lim,score,stars}) when the game is finished.
   Stars come from mistakes AND time: score = 100 - mistakes - slowness (see stallScore in core.js).
   All sounds go through KG.snd, so the audio round can replace them in one place. */
(function(){
const Q=s=>document.querySelector(s),shf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
let ov=null,cb=null,gst=null,lvl='sederhana',cur0=0,t0=0;
const data=k=>((KD.lv&&KD.lv[lvl]&&KD.lv[lvl][k])||KD[k]);
const snd={
 ok(){tone(780,0,.1,'square',.05)},
 bad(){tone(200,0,.2,'sawtooth',.04)},
 star(n){for(let i=0;i<n;i++)tone(600+i*160,i*.14,.18,'triangle',.12)},
 munch(){const v=SET.snd*SET.vol;if(v<=0)return;try{const AC=actx();for(let i=0;i<8;i++){const t=AC.currentTime+i*.22,b=AC.createBuffer(1,AC.sampleRate*.1,AC.sampleRate),d=b.getChannelData(0);for(let j=0;j<d.length;j++)d[j]=(Math.random()*2-1)*(1-j/d.length);const q=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();q.buffer=b;f.type='bandpass';f.frequency.value=500+Math.random()*700;g.gain.value=.5*v;q.connect(f);f.connect(g);g.connect(AC.destination);q.start(t)}}catch(e){}},
 burp(){const v=SET.snd*SET.vol;if(v<=0)return;try{const AC=actx(),t=AC.currentTime,o=AC.createOscillator(),l=AC.createOscillator(),lg=AC.createGain(),g=AC.createGain(),f=AC.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(55,t+.8);l.frequency.value=28;lg.gain.value=30;l.connect(lg);lg.connect(o.frequency);f.type='lowpass';f.frequency.value=600;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35*v,t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+.85);o.connect(f);f.connect(g);g.connect(AC.destination);o.start(t);l.start(t);o.stop(t+.9);l.stop(t+.9)}catch(e){}}
};
function show(h,wide){if(!ov){ov=document.createElement('div');ov.id='kov';document.body.appendChild(ov)}ov.innerHTML='<div class="kcd'+(wide?' wd':'')+'">'+h+'</div>';ov.style.display='flex'}
function close(){if(gst){gst();gst=null}if(ov)ov.style.display='none'}
const fb=t=>{const e=Q('#kfb');if(e)e.textContent=t};
const XB='<button class="kx" onclick="KGF.exit()">Keluar</button>';
function dnd(root,drop){let sel=null,g=null,st=null;
 root.querySelectorAll('.it').forEach(el=>{el.onpointerdown=e=>{e.preventDefault();st={el,x:e.clientX,y:e.clientY,mv:0};el.setPointerCapture(e.pointerId)};
  el.onpointermove=e=>{if(!st||st.el!==el)return;if(!st.mv&&Math.hypot(e.clientX-st.x,e.clientY-st.y)>8){st.mv=1;g=el.cloneNode(true);g.className='gh it';document.body.appendChild(g)}if(g){g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'}};
  el.onpointerup=e=>{if(!st||st.el!==el)return;const m=st.mv;st=null;if(g){g.remove();g=null}
   if(m){const t=document.elementFromPoint(e.clientX,e.clientY),sl=t&&t.closest('[data-slot]');if(sl)drop(+el.dataset.i,sl)}
   else{root.querySelectorAll('.it').forEach(x=>x.classList.remove('s'));if(sel===el)sel=null;else{sel=el;el.classList.add('s')}}};
  el.onpointercancel=()=>{st=null;if(g){g.remove();g=null}}});
 root.querySelectorAll('[data-slot]').forEach(sl=>sl.onclick=()=>{if(sel){const i=+sel.dataset.i;sel=null;drop(i,sl)}})}
/* ---- result card: stars from mistakes and time ---- */
function fin(wr,sec){const i=cur0,lim=KD.stalls[i].lim,score=stallScore(wr,sec,lim),stars=starsOf(score),slow=sec>lim;
 gst=null;snd.star(stars);window.KGF.res={i,wr,sec,lim,score,stars};
 show('<h2>'+'⭐'.repeat(stars)+'☆'.repeat(3-stars)+'</h2><p>'+(wr?'Kesilapan: '+wr+'. ':'Tiada kesilapan! ')+'Masa: '+Math.round(sec)+' saat.</p><p class="kh">'+(slow?'Cuba siap dalam '+lim+' saat untuk bintang penuh.':(wr?'Cuba tanpa kesilapan untuk bintang penuh.':'Pantas dan tepat! Hebat!'))+'</p><button onclick="KGF.next()">Teruskan ▶</button>');
}
const sec0=()=>(performance.now()-t0)/1000;
/* ---- 1. Piramid Makanan ---- */
const PZ=[[[[180,10],[221.7,85],[138.3,85]],[180,38],[[180,78]]],[[[138.3,85],[180,85],[180,155],[99.4,155]],[142,100],[[150,142]]],[[[180,85],[221.7,85],[260.6,155],[180,155]],[218,100],[[210,142]]],[[[99.4,155],[180,155],[180,220],[63.3,220]],[135,170],[[137,208]]],[[[180,155],[260.6,155],[296.7,220],[180,220]],[225,170],[[223,208]]],[[[63.3,220],[296.7,220],[330,280],[30,280]],[110,238],[[150,268]]]];
function gPy(){const PP=data('PP'),ZN=data('ZN'),ZC=data('ZC'),ZF=data('ZF'),all=PP.flatMap((L,z)=>shf(L).slice(0,2).map(x=>[x[0],x[1],z])),ord=shf(all.map((_,i)=>i));let left=ord,put=[[],[],[],[],[],[]],bad={},wr=0,msg='Seret makanan ke tempat yang betul pada piramid (atau pilih makanan, kemudian pilih tempat).';
 const svg=()=>`<svg viewBox="0 0 360 290" class="py2">${PZ.map((q,z)=>`<polygon data-slot="${z}" points="${q[0].map(v=>v.join(',')).join(' ')}" fill="${ZC[z]}" stroke="#fff" stroke-width="3"/>`).join('')}<polygon points="180,10 330,280 30,280" fill="none" stroke="#222" stroke-width="4"/>${put.map((L,z)=>L.map((e,j)=>`<text x="${PZ[z][2][0][0]+(j?16:-16)}" y="${PZ[z][2][0][1]}" font-size="${z==5?28:24}" text-anchor="middle" class="pp">${e}</text>`).join('')).join('')}</svg>`;
 const r=()=>{show(`<h3>1. Piramid Makanan Malaysia</h3><div class="gm"><div>${svg()}<div class="lg2">${ZN.map((n,z)=>`<div>${['🟣','🟠','🔵','🟢','🔴','🟡'][z]} ${['Ungu','Jingga','Biru','Hijau','Merah','Kuning'][z]} : ${n}</div>`).join('')}</div></div><div class="inv">${left.map(i=>`<button class="it" data-i="${i}">${all[i][1]}<br><small>${all[i][0]}</small></button>`).join('')}</div></div><p id="kfb">${msg}</p>${XB}`,1);
  dnd(Q('#kov .kcd'),(i,sl)=>{const z=+sl.dataset.slot,it=all[i];if(it[2]==z){left=left.filter(x=>x!=i);put[z].push(it[1]);msg='Betul! ✅ '+it[0]+' '+ZF[z]+'.';snd.ok();if(!left.length)return fin(wr,sec0());r()}
   else{wr++;bad[i]=(bad[i]||0)+1;msg=bad[i]>1?'Belum tepat 🤔 Petunjuk: '+it[0]+' '+ZF[it[2]]+'.':'Belum tepat 🤔 Cuba lagi!';snd.bad();r();document.querySelectorAll('#kov [data-slot="'+z+'"]').forEach(e=>e.classList.add('sk'))}})};r()}
/* ---- 2. Sarapan Seimbang ---- */
const QP=['M150,150 L150,10 A140,140 0 0 0 10,150 Z','M150,150 L290,150 A140,140 0 0 0 150,10 Z','M150,150 L10,150 A140,140 0 0 0 150,290 Z','M150,150 L150,290 A140,140 0 0 0 290,150 Z'],QX=[[80,80],[220,80],[80,220],[220,220]];
function gSa(){const PG=data('PG'),PB=data('PB'),PN=data('PN'),PC=data('PC'),all=PG.flatMap((L,k)=>[...shf(L).slice(0,2).map(x=>[x[0],x[1],k,1]),(x=>[x[0],x[1],k,0,x[2]])(shf(PB[k])[0])]),ord=shf(all.map((_,i)=>i));let wr=0,fl=[null,null,null,null],msg='Seret makanan sihat ke setiap bahagian pinggan (atau pilih makanan, kemudian pilih bahagian).';
 const plate=f=>`<svg viewBox="0 0 300 300" class="pl"><circle cx="150" cy="150" r="148" fill="#fff" stroke="#999" stroke-width="6"/>${QP.map((d,k)=>`<path data-slot="${k}" d="${d}" fill="${PC[k]}" stroke="#fff" stroke-width="4"/>`).join('')}${QX.map((c,k)=>f[k]!==null?`<text x="${c[0]}" y="${c[1]+16}" font-size="56" text-anchor="middle" class="pp">${all[f[k]][1]}</text>`:`<text x="${c[0]}" y="${c[1]+5}" font-size="17" font-weight="bold" text-anchor="middle" fill="#222">${PN[k]}</text>`).join('')}</svg>`;
 const r=()=>{const ok=fl.every(x=>x!==null),left=ord.filter(i=>!fl.includes(i));
  show(`<h3>2. Sarapan Seimbang</h3><div class="gm"><div>${plate(fl)}${ok?'<button class="kgo" onclick="KGF.eat()">😋 Makan Sarapan Sekarang!</button>':''}</div><div class="inv inv2">${left.map(i=>`<button class="it" data-i="${i}">${all[i][1]}<br><small>${all[i][0]}</small></button>`).join('')}</div></div><p id="kfb">${msg}</p>${XB}`,1);
  dnd(Q('#kov .kcd'),(i,sl)=>{const k=+sl.dataset.slot,it=all[i];if(fl[k]!==null){msg='Bahagian ini sudah ada makanan.';return r()}
   if(it[2]!=k){wr++;msg='Belum tepat 🤔 '+it[0]+' bukan untuk bahagian '+PN[k]+'.';snd.bad();return r()}
   if(!it[3]){wr++;msg='Tidak sihat 🙅 '+it[0]+' '+it[4]+'.';snd.bad();return r()}
   fl[k]=i;msg='Bagus! ✅ '+it[0]+' pilihan sihat.';snd.ok();r()})};
 KGF.eat=()=>{const sec=sec0();let dead=0,f2=fl.slice();gst=()=>{dead=1};
  const sh=(face,m)=>{if(dead)return;show(`<h3>2. Sarapan Seimbang</h3><div style="font-size:44px">${face}</div>${plate(f2)}<p id="kfb">${m}</p>`,1)};
  sh('😋','Nyam nyam nyam...');snd.munch();
  [0,1,2,3].forEach(k=>setTimeout(()=>{f2[k]=null;sh(k%2?'😋':'😛','Nyam nyam nyam...')},450*(k+1)));
  setTimeout(()=>{if(dead)return;snd.burp();sh('🥴','Sendawaaa! 🤭 Maaf ya... Kenyang dan sihat!')},2400);
  setTimeout(()=>{if(dead)return;gst=null;fin(wr,sec)},3900)};r()}
/* ---- 3. Snek Sihat (catch healthy snacks with the trolley) ---- */
function gSn(){const SH=data('SH'),SU=data('SU'),W=480,H=300,GOAL=8;let got=0,wr=0,cartX=W/2,tgt=W/2,its=[],spw=0,lt=performance.now(),fl=0,fx=[],done=0,raf;const kk={};
 const kd=e=>{kk[e.code]=1},ku=e=>{kk[e.code]=0};addEventListener('keydown',kd);addEventListener('keyup',ku);
 show(`<h3>3. Snek Sihat</h3><p id="kfb">Tangkap snek sihat! Elak snek tidak sihat. Gerak troli dengan tetikus, sentuhan atau anak panah.</p><canvas id="gc" width="${W}" height="${H}"></canvas><p id="sc2">🛒 0/${GOAL}</p>${XB}`,1);
 const cv=Q('#gc'),g=cv.getContext('2d');cv.style.width=Math.min(560,innerWidth*.9,Math.max(180,innerHeight-125)*1.6)+'px';
 const mvc=e=>{const r=cv.getBoundingClientRect();tgt=(e.clientX-r.left)/r.width*W};cv.onpointerdown=e=>{try{cv.setPointerCapture(e.pointerId)}catch(x){}mvc(e)};cv.onpointermove=mvc; /* finger or mouse keeps steering even if it leaves the canvas */
 const step=ts=>{if(done)return;raf=requestAnimationFrame(step);const dt=Math.min(.05,(ts-lt)/1000);lt=ts;
  if(kk.ArrowLeft||kk.KeyA)tgt-=260*dt;if(kk.ArrowRight||kk.KeyD)tgt+=260*dt;tgt=Math.max(45,Math.min(W-45,tgt));cartX+=(tgt-cartX)*Math.min(1,dt*14);
  spw-=dt;if(spw<=0){spw=.75;const h=Math.random()<.62,L=h?SH:SU,it=L[Math.random()*L.length|0];its.push({x:30+Math.random()*(W-60),y:-20,e:it[1],h,n:it[0],r:it[2],v:90+Math.random()*60+got*6})}
  its.forEach(o=>o.y+=o.v*dt);
  its=its.filter(o=>{if(o.y>H-52&&o.y<H-20&&Math.abs(o.x-cartX)<48){if(o.h){got++;snd.ok();fx.push({x:o.x,y:o.y,t:'+1',c:'#1e9e4a',l:.8})}else{wr++;fl=.4;snd.bad();fb('Aduh! '+o.n+' '+o.r+'. Elak snek ini!');fx.push({x:o.x,y:o.y,t:'✖',c:'#e74c3c',l:.8})}return false}return o.y<H+30});
  Q('#sc2').textContent='🛒 '+got+'/'+GOAL;
  g.fillStyle='#9ad7ff';g.fillRect(0,0,W,H);g.fillStyle='#5a8f3c';g.fillRect(0,H-20,W,20);g.font='30px serif';g.textAlign='center';its.forEach(o=>g.fillText(o.e,o.x,o.y));
  g.fillStyle='#555';g.fillRect(cartX-42,H-50,84,28);g.fillStyle='#8b8b8b';g.fillRect(cartX-38,H-46,76,20);g.fillStyle='#222';g.fillRect(cartX-34,H-22,14,12);g.fillRect(cartX+20,H-22,14,12);
  g.font='bold 22px monospace';fx=fx.filter(o=>{o.y-=40*dt;o.l-=dt;g.fillStyle=o.c;g.fillText(o.t,o.x,o.y);return o.l>0});
  if(fl>0){g.fillStyle='rgba(255,0,0,'+fl+')';g.fillRect(0,0,W,H);fl-=dt}
  if(got>=GOAL){done=1;gst=null;removeEventListener('keydown',kd);removeEventListener('keyup',ku);fin(wr,sec0())}};
 gst=()=>{done=1;cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku)};raf=requestAnimationFrame(step)}
/* ---- 4. Minuman Sihat (count sugar cubes) ---- */
const cubes=n=>'<div class="cb">'+'<i></i>'.repeat(n)+(n?'':'<small>Tiada gula</small>')+'</div>';
function gMi(){const DR=data('DR'),DK=data('DK');let r=0,wr=0,msg='Kira ketul gula pada gambar.';
 const sh=()=>{if(r<3){const d=DR[r],op=[d[2]-2,d[2],d[2]+2];for(let i=0;i<r;i++)op.push(op.shift());
   show(`<h3>4. Minuman Sihat</h3><p>Soalan ${r+1}/4: Berapa ketul gula (kira-kira) dalam <b>${d[0]}</b> ${d[1]}?</p>${cubes(d[2])}<div class="rw">${op.map(x=>`<button onclick="KGF.mq(${x})">${x} ketul</button>`).join('')}</div><p id="kfb">${msg}</p>${XB}`,1)}
  else{const dk=DK.slice();for(let i=0;i<wr%3;i++)dk.push(dk.shift());show(`<h3>4. Minuman Sihat</h3><p>Soalan 4/4: Pilih minuman yang paling sihat.</p><div class="tl">${dk.map(d=>`<button onclick="KGF.mh(${d[2]})"><span style="font-size:26px">${d[1]}</span><br>${d[0]}${cubes(d[2])}</button>`).join('')}</div><p id="kfb">${msg}</p>${XB}`,1)}};
 KGF.mq=x=>{const d=DR[r];if(x==d[2]){msg='Betul! ✅ '+d[0]+' ada kira-kira '+d[2]+' ketul gula. Terlalu banyak, hadkan minuman manis!';snd.ok();r++}else{wr++;msg='Belum tepat 🔍 Kira semula ketul gula itu.';snd.bad()}sh()};
 KGF.mh=n=>{if(n==0)return fin(wr,sec0());wr++;const d=DK.find(x=>x[2]==n);msg='Belum tepat 🤔 '+d[0]+' ada kira-kira '+n+' ketul gula. Cuba lagi!';snd.bad();sh()};sh()}
/* ---- 5. Kebersihan Makanan (hand washing order, then spot the mistakes) ---- */
function gKe(){const HW=data('HW'),TL=data('TL');let wr=0,st=0,found=[],msg='';const order=[2,0,4,1,5,3];
 const B=()=>show(`<h3>5. Kebersihan Makanan</h3><p>Bahagian 2: Pilih semua 4 kesilapan kebersihan! (${found.length}/4)</p><div class="tl">${TL.map((t,i)=>`<button class="${found.includes(i)?'s':''}" onclick="KGF.tp(${i})"><span style="font-size:24px">${t[0]}</span><br><small>${t[1]}</small></button>`).join('')}</div><p id="kfb">${msg}</p>${XB}`,1);
 const A=()=>show(`<h3>5. Kebersihan Makanan</h3><p>Bahagian 1: Susun langkah cuci tangan. Pilih langkah ke-${st+1}.</p><ol class="hw">${HW.slice(0,st).map(h=>`<li>${h[1]} ${h[0]}</li>`).join('')}</ol><div class="rw">${order.filter(i=>i>=st).map(i=>`<button onclick="KGF.hk(${i})">${HW[i][1]} ${HW[i][0]}</button>`).join('')}</div><p id="kfb">${msg}</p>${XB}`,1);
 KGF.hk=i=>{if(i==st){st++;msg='Betul! ✅';snd.ok();if(st==6){msg='Hebat! Sekarang cari kesilapan.';return B()}}else{wr++;msg='Belum tepat 🤔 Apa yang dibuat dahulu?';snd.bad()}A()};
 KGF.tp=i=>{if(found.includes(i))return;if(TL[i][2]){found.push(i);msg='Betul! ✅ '+TL[i][1]+' tidak bersih.';snd.ok();if(found.length==4)return fin(wr,sec0())}else{wr++;msg='Itu amalan yang baik, bukan kesilapan 🙂';snd.bad()}B()};A()}
const GM=[gPy,gSa,gSn,gMi,gKe];
window.KGF={res:null,exit(){close();const f=cb;cb=null;if(f)f({exit:true})},next(){close();const f=cb,r=KGF.res;cb=null;if(f)f(r)}};
window.KG={snd,start(i,level,fn){lvl=level||'sederhana';cur0=i;cb=fn;t0=performance.now();GM[i]()},close(){close();cb=null},open:()=>!!(ov&&ov.style.display=='flex'),show,exit:()=>KGF.exit()};
})();
