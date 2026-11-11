/* Round 15: new HUD plate. One shared script for world, Kantin, Luar, Padang and the classrooms.
   Layout (top left): [portrait + name + points + pocket money] [school bag] [pause], then "MOD : Kelas / Jalan-jalan",
   then the Catatan notebook slot ("KELAS : Tiada"), then the old pills (#stm timer, #scr clock/progress, #wc water, #stt).
   The old element ids are kept and moved, so every other script that writes to them still works (pause handler, #scr, #stm).
   Global: HUD (pure helpers modeText, noteText, money, faceSvg, roomName + set/refresh). Money is whole sen in cur.w.c (the wallet comes in Round 15b). */
(function(g){
const ESC=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ROOM={mat:'Matematik',sains:'Sains',eng:'English',bm:'Bahasa Melayu',pj:'Pendidikan Jasmani',kantin:'Waktu Rehat'};
const modeText=m=>'MOD : '+(m=='story'?'Kelas':'Jalan-jalan');
const noteText=n=>'KELAS : '+(n||'Tiada');
const money=c=>'RM '+(Math.max(0,Math.round(+c||0))/100).toFixed(2);
const roomName=k=>ROOM[k]||null;
/* flat drawn face from the saved look (cur.L: sk skin, hc hair, tud tudung colour, nt = no tudung, es eye size, mo mouth) */
function faceSvg(gen,L,cos){L=L||{};const sk=L.sk||'#b87a50',hc=L.hc||'#14161d',es=L.es||1,f=gen=='f',mo=L.mo|0;
 const mouth=mo==1?'<path d="M42 66h16" stroke="#5a2a1a" stroke-width="2.5" stroke-linecap="round" fill="none"/>':mo==2?'<ellipse cx="50" cy="67" rx="5" ry="4" fill="#5a2a1a"/>':'<path d="M41 64q9 9 18 0" stroke="#5a2a1a" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
 const eyes='<ellipse cx="40" cy="55" rx="3" ry="'+(3.4*es).toFixed(2)+'" fill="#14161d"/><ellipse cx="60" cy="55" rx="3" ry="'+(3.4*es).toFixed(2)+'" fill="#14161d"/>';
 const cs=cos||[],cx=k=>cs.indexOf(k)>=0,tdn=f&&!L.nt;   /* Round 17: worn cosmetics, drawn flat */
 const bd=cx('beard')?'<path d="M29 58C28 78 38 84 50 84S72 78 71 58C68 64 64 74 50 74S32 64 29 58Z" fill="'+ESC(hc)+'"/>':'';
 const ov=(cx('mos')?'<ellipse cx="44" cy="62" rx="7" ry="2.6" fill="'+ESC(hc)+'"/><ellipse cx="56" cy="62" rx="7" ry="2.6" fill="'+ESC(hc)+'"/>':'')
  +(cx('eye')?'<path d="M26 47L74 43" stroke="#15151a" stroke-width="2" fill="none"/><ellipse cx="40" cy="55" rx="7" ry="6" fill="#15151a"/>':'')
  +(cx('cap')?'<g'+(tdn?' transform="translate(0,-12)"':'')+'><path d="M24 38C24 22 36 14 50 14S76 22 76 38Z" fill="#c8293a"/><rect x="22" y="34" width="56" height="5" rx="2.5" fill="#a01c2c"/></g>':'');
 let h='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="100" height="100" fill="#9fd0ee"/><path d="M8 100c2-20 18-28 42-28s40 8 42 28z" fill="#f6f7fb"/><path d="M40 72l10 12 10-12z" fill="#2f6fd0"/>';
 if(f&&!L.nt){const t=L.tud||'#f6f7fb';h+='<ellipse cx="50" cy="52" rx="33" ry="38" fill="'+ESC(t)+'"/><ellipse cx="50" cy="56" rx="22" ry="25" fill="'+ESC(sk)+'"/>'+bd+eyes+mouth+ov;if(L.rib)h+='<circle cx="76" cy="30" r="7" fill="'+ESC(L.rib)+'"/>'}
 else{h+='<rect x="43" y="64" width="14" height="14" fill="'+ESC(sk)+'"/>';if(f)h+='<path d="M18 62c-6-30 8-48 32-48s38 18 32 48c-3-14-8-22-14-26H32c-6 4-11 12-14 26z" fill="'+ESC(hc)+'"/>';
  h+='<ellipse cx="50" cy="52" rx="22" ry="25" fill="'+ESC(sk)+'"/>'+(f?'<path d="M28 44c4-14 14-20 22-20s18 6 22 20c-8-6-16-9-22-9s-14 3-22 9z" fill="'+ESC(hc)+'"/>':'<path d="M27 46c-2-18 8-28 23-28s25 10 23 28c-6-7-14-11-23-11s-17 4-23 11z" fill="'+ESC(hc)+'"/>')+bd+eyes+mouth+ov}
 return h+'</svg>'}
const S={pts:0,note:null,mode:'roam',el:null},C=()=>typeof cur!=='undefined'?cur:null; /* cur is a top-level let in core.js: shared by classic scripts, not a window property */
function curMode(){try{return LS.get('sk_mode','roam')=='story'?'story':'roam'}catch(e){return 'roam'}}
function pageNote(mode){if(mode!='story')return null;const p=(g.location&&g.location.pathname||'').split('/').pop();
 if(p=='kantin.html')return ROOM.kantin;if(p=='padang.html')return ROOM.pj;
 if(p=='kelas.html'){try{return roomName(SS.get('sk_kelas')||'mat')}catch(e){return null}}return null}
function dayPts(){try{const d=SS.get('sk_day');return d&&Number.isFinite(d.score)?d.score:0}catch(e){return 0}}
function paint(){const e=S.el;if(!e)return;e.pt.textContent=String(Math.round(S.pts));e.pr.hidden=S.mode!='story';
 const c=C();e.rm.textContent=money(c&&c.w&&c.w.c);e.nm.textContent=(c&&c.name)||'';e.nt.textContent=noteText(S.note);e.md.textContent=modeText(S.mode)}
function set(o){if(!o)return;if('pts' in o)S.pts=+o.pts||0;if('note' in o)S.note=o.note||null;paint()}
const worn=()=>typeof BAG!=='undefined'&&BAG&&BAG.worn?BAG.worn():null;
function face(){if(S.el){const c=C();S.el.av.innerHTML=faceSvg(c&&c.gen,c&&c.L,worn())}}   /* Round 17: only the portrait, called when a cosmetic is worn or removed */
function refresh(){S.mode=curMode();if(S.el){{const c=C();S.el.av.innerHTML=faceSvg(c&&c.gen,c&&c.L,worn())}}
 S.pts=S.mode=='story'?dayPts():0;S.note=pageNote(S.mode);paint()}
function build(){const d=g.document;if(!d)return;const H=d.getElementById('hud');if(!H||H.getAttribute('data-h15'))return;H.setAttribute('data-h15','1');
 const mk=(t,id,c,h)=>{const x=d.createElement(t);if(id)x.id=id;if(c)x.className=c;if(h!=null)x.innerHTML=h;return x};
 const ex=d.getElementById('ex'),md=d.getElementById('mdl');
 const r1=mk('div','hdr1'),pl=mk('div','hdp'),av=mk('div','hdav'),bd=mk('div','hdpl');
 const ic=(e,l)=>{const x=mk('i',null,'hdi');x.textContent=e;x.setAttribute('aria-label',l);return x};
 const nm=mk('b','hdnm'),pt=mk('b','hdpt'),mn=mk('b','hdmn'),pr=mk('span','hdpr'),rm=mk('span','hdrm');
 pt.textContent='0';mn.textContent='RM 0.00';pr.append(ic('\u2B50','Mata'),pt);rm.append(ic('\uD83E\uDE99','Duit poket'),mn);
 bd.append(nm,pr,rm);pl.append(av,bd);
 const bag=mk('button','hdbag','hp','<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 6V4.8a3 3 0 0 1 6 0V6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M5.5 12C5.5 8.4 8.4 6 12 6s6.5 2.4 6.5 6v7a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 19z" fill="currentColor"/><rect x="3.4" y="13" width="2.2" height="5.5" rx="1.1" fill="currentColor"/><rect x="18.4" y="13" width="2.2" height="5.5" rx="1.1" fill="currentColor"/><rect x="7.6" y="13.4" width="8.8" height="6" rx="2" fill="#fff" opacity=".88"/><path d="M9.2 15.4h5.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M8 9.6h8" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".55"/></svg>');
 bag.setAttribute('aria-label','Beg sekolah');bag.onclick=()=>{if(typeof BAG!=='undefined'&&BAG.open)BAG.open();else if(typeof g.toast=='function')g.toast('Beg sekolah: segera hadir',2000)}; /* Round 16: js/bag.js opens the bag list */
 const bt=mk('div','hdbt');bt.append(bag);if(ex)bt.append(ex);r1.append(pl,bt);
 const nt=mk('span','hdnt'),hh=mk('b',null,'hdnh'),note=mk('div','hdn');hh.textContent='CATATAN';nt.textContent='KELAS : Tiada';note.append(hh,nt);
 const rest=mk("div","hdx");['stm','scr','wc','stt'].forEach(i=>{const x=d.getElementById(i);if(x)rest.append(x)});
 if(md)md.className='hdmd';
 H.textContent='';H.append(r1);if(md)H.append(md);H.append(note,rest);
 S.el={av,nm,pt,pr,rm:mn,nt,md:md||mk('b')};refresh()}
g.HUD={modeText,noteText,money,faceSvg,roomName,pageNote,set,refresh,face,build};
if(g.document)build();
})(typeof window!=='undefined'?window:globalThis);
