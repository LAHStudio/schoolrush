/* Round 23: chibi characters (js/chars.js merged from the player, student, teacher and NPC design viewers). Node only, no browser.
   Run: node tools/test-chars.js  (check the exit code) */
const fs=require('fs'),path=require('path'),{mk,stats}=require('./three-stub.js');
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ex=f=>fs.existsSync(path.join(__dirname,'..',f));
const CS=rd('js/chars.js'),OLD=rd('_backup_round23/js/chars.js');
/* ---- file layout ---- */
{const L=CS.split('\n'),O=OLD.split('\n');
 ok(L[0]===O[0]&&L[1]===O[1]&&L[2]===O[2],'lines 1-3 (mat, bx, cosHas) are the game globals, unchanged (test-kelas-lib and test-kelas-lab eval the first two)');
 const t=s=>s.slice(s.indexOf('/* Round 10b3: the easter egg vase'));ok(t(CS)===t(OLD)&&t(CS).includes('function mkVase')&&t(CS).includes('function gdoor'),'mkVase and gdoor (the end of the file) are unchanged');
 ok(/const CHR=\(function\(\)\{/.test(CS)&&/\n\}\)\(\);\nfunction build\(o\)/.test(CS)&&/const OUT = CHR\.OUT;|const OUT=CHR\.OUT;/.test(CS),'the engine lives in a closure, the old globals are thin wrappers (no name clash with mat, bx, R, SK, HC)');
 ok(!/new Function|eval\(|localStorage|fetch\(/.test(CS),'no eval, storage or network in chars.js');
 ok(/const CH_S = 1\.2, CH_A = 1\.08;/.test(CS)&&/G\.scale\.setScalar\(\(o\.h \|\| 1\) \* \(o\.ad \? CH_A : CH_S\)\)/.test(CS),'two size knobs (Round 25): CH_S = player and students 1.2, CH_A = adults 1.08');
 ok(CS.length<80000,'chars.js stays small ('+CS.length+' bytes)');}
/* ---- load it with the stub ---- */
const SK=['#b87a50','#8d5a3b','#a8693f','#c68a5a','#6e4328','#d9a57a','#f0c9a0'],HC=['#14161d','#14161d','#2a1d16','#3b2a1e','#5a3a22'];
const R=a=>a[Math.floor(Math.random()*a.length)],rnd=(a,b)=>a+Math.random()*(b-a);
const load=()=>{const m=mk();return new Function('T','document','R','rnd','SK','HC','BAG',CS+';return{player,npc,anim,build,OUT,headY}')(m.T,m.doc,R,rnd,SK,HC,undefined)};
const G=load();
ok(typeof G.player==='function'&&typeof G.npc==='function'&&typeof G.anim==='function'&&typeof G.build==='function'&&G.OUT.uni&&G.OUT.pe&&G.OUT.pre,'player, npc, anim, build and OUT are all there');
/* ---- looks from old saves ---- */
{const bad=['cap','xyz',undefined,null,'bun'];let okh=true;bad.forEach(h=>{try{G.player('m','uni',{hs:h});G.player('f','uni',{hs:h,nt:true});G.player('m','pe',{hs:h});G.player('f','pre',{hs:h,nt:true,rib:'#e24b4b'})}catch(e){okh=false;console.log(h,e.message)}});
 ok(okh,'old or unknown hair names and the old rib field never break the build (hair falls back to fringe or bob)');
 ok((()=>{try{G.player('m','uni');G.player('f','uni',{});return true}catch(e){return false}})(),'player() with no look at all builds');
 let okc=true;['#14161d','#5a3a22','#aa5500'].forEach(c=>['short','fringe','spiky','side','crew','bald'].forEach(h=>{try{G.player('m','uni',{hc:c,hs:h,sk:'#f0c9a0',es:.8,mo:2})}catch(e){okc=false}}));['bob','pony','bun','pigtails','braid'].forEach(h=>{try{G.player('f','uni',{hs:h,nt:true,hc:'#3b2a1e',mask:true})}catch(e){okc=false}});
 ok(okc,'every hair style the menu offers builds, with masks, eye sizes and mouths');
 let tg=true;['#f6f7fb','#4f8ad0','#1c2f6b'].forEach(t=>{try{G.player('f','uni',{tud:t});G.player('f','pe',{tud:t});G.player('f','pre',{})}catch(e){tg=false}});ok(tg,'the three tudung colours of the menu build in all three outfits');}
/* ---- rig contract used by about nine files ---- */
{const p=G.player('f','uni',{}),u=p.userData;
 ok(u.legs.length==2&&u.arms.length==2&&u.B&&u.g=='f'&&typeof u.ph=='number','userData {legs[2], arms[2], B, ph, g}');
 G.anim(p,1.3,true);const moving=u.legs[0].rotation.x!=0&&u.arms[0].rotation.x!=0&&u.B.position.y>=0;G.anim(p,1.3,false);ok(moving&&u.legs[0].rotation.x==0&&u.arms[1].rotation.x==0&&u.B.position.y==0,'anim walks and returns to standing');
 ok(u.arms.every(a=>typeof a.rotation.z=='number')&&u.arms[0].userData.z0<0&&u.arms[1].userData.z0>0,'arms are in a mirrored A-pose');
 const n=G.npc('murid','m');ok(n.userData.g=='m'&&n.userData.legs&&n.scale.x>1.13&&n.scale.x<1.27,'murid scale about 1.2 (1.14-1.26)');
 const t=G.npc('guru','f');ok(t.scale.x>1.33&&t.scale.x<1.44&&t.userData.g=='f','teacher scale about 1.34-1.43 (1.24-1.32 x 1.08)');}
/* ---- Round 24: bubbles near the head, Padang in PJ only ---- */
{const hy=G.headY,pl=G.player('m','uni',{}),tc=G.npc('guru','m'),cp=G.player('m','uni',{});
 ok(typeof hy==='function'&&Math.abs(hy(pl)-1.45*1.2)<1e-9&&hy(tc)>1.9&&hy(tc)<2.1,'headY: player head top 1.74, an adult teacher about 2.0 ('+hy(tc).toFixed(2)+')');
 ok(hy({userData:{},scale:{y:1}})===1.45&&hy(null)===1.45,'headY has a safe default');
 let allpe=true,anyUni=false;const col=(g,c)=>{let n=0;g.traverse(o=>{if(o.isMesh&&o.material.color==c)n++});return n};
 for(let i=0;i<200;i++){const g=['m','f'][i%2],n=G.npc('murid',g,{out:'pe'});if(!col(n,'#1f4ec2'))allpe=false;if(col(n,'#1c2650'))anyUni=true}
 ok(allpe&&!anyUni,'npc(murid, g, {out:"pe"}): always the PJ outfit (blue PE trousers), never the uniform bottoms, 200 of 200');
 let mixed=0;for(let i=0;i<300;i++){if(col(G.npc('murid','m'),'#1c2650'))mixed++}ok(mixed>150,'without the option most students still wear the uniform');
 const PA=rd('js/padang.js');ok((PA.match(/npc\('murid',undefined,\{out:'pe'\}\)/g)||[]).length==3&&!/npc\('murid'\)/.test(PA),'Padang: all three places that make students (seated, standing at the goals, joggers) use the PJ outfit');
 const pages=['world','kantin','kelas','padang','luar'].map(f=>rd('js/'+f+'.js')).join('\n')+rd('js/story.js')+rd('js/toilet.js');
 ok(!/bv\.set\(P\.x,P\.y\+2\.3|P\.gy\+2\.3|set\(c\.x,2\.[46],c\.z\)|set\(NSAY\.n\.x,2\.3|Vector3\(o\.x,2\.3,o\.z\)|set\(CHS\.x,2\.4/.test(pages),'no fixed 2.3 / 2.4 / 2.6 bubble heights are left');
 ok(/headY\(pm\)/.test(rd('js/world.js'))&&/headY\(pm\)/.test(rd('js/kantin.js'))&&/headY\(pm\)/.test(rd('js/kelas.js'))&&/headY\(pm\)/.test(PA)&&/headY\(TCH\)/.test(rd('js/kelas.js'))&&/headY\(guard\)/.test(rd('js/luar.js')),'player, teacher and guard bubbles use headY');
 const LU=rd('js/luar.js');
 ok(/function say\(t,w\)\{[^\n]*bw=w\|\|null/.test(LU)&&/bw\?bv\.set\(bw\.position\.x,bw\.position\.y\+headY\(bw\)\+\.14,bw\.position\.z\)/.test(LU),'luar say(text, speaker): the bubble follows the speaker, the player when none is given');
 ok(/ya\.',guard\)/.test(LU)&&/sebungkus!',seller\)/.test(LU)&&/jagung\.',iceMan\)/.test(LU)&&/kedai runcit!',keeper\)/.test(LU),'guard, makcik nasi lemak, pakcik aiskrim and kedai runcit speak from their own head');
 ok((LU.match(/,guard\)/g)||[]).length==5,'every line the guard says (greeting, chase, caught) comes from the guard: '+(LU.match(/,guard\)/g)||[]).length+' places');
 ok(/say\('Tengok kir/.test(LU)&&!/say\('Tengok kir[^)]*,guard\)/.test(LU),'player lines (look both ways, bump) stay on the player');}
/* ---- Round 25: size against the world (doors 2.3, lockers 2.0, hips on the seat) ---- */
{const hy=G.headY,DOOR=2.3,LOCK=2.0;let mn=9,mx=0,tmin=9,tmax=0;
 for(let i=0;i<300;i++){const s=G.npc('murid',['m','f'][i%2]),t=G.npc(['guru','cuci','guard'][i%3],'m');mn=Math.min(mn,hy(s));mx=Math.max(mx,hy(s));tmin=Math.min(tmin,hy(t));tmax=Math.max(tmax,hy(t))}
 ok(mn>=1.65&&mx<=1.85,'students: head top between 1.65 and 1.85 ('+mn.toFixed(2)+'-'+mx.toFixed(2)+'), 72-80% of a door');
 ok(tmin>=1.9&&tmax<=2.2&&tmax<DOOR*.96,'teachers and staff: head top 1.9-2.2 (the capped guard is the tallest), under 96% of the door ('+tmin.toFixed(2)+'-'+tmax.toFixed(2)+')');
 const pp=G.player('m','uni',{});ok(hy(pp)/LOCK>.8&&hy(pp)/DOOR>.7,'the player is above 80% of a locker and 70% of a door');
 const sy=new Function('return '+CS.match(/function seatY\(G\)[^\n]*/)[0].replace('function seatY','function'))();
 ok(Math.abs(sy(pp)+.39*pp.scale.y-.5)<1e-9&&sy(pp)>0&&sy(pp)<.1&&Math.abs(sy(null)-.11)<1e-9,'seatY: hips land on the seat top (.50); '+sy(pp).toFixed(3)+' for the player, .11 at scale 1');
 ok(/const CHSZ = CHR\.sz;/.test(CS)&&/G\.scale\.setScalar\(\(on\?1\.12:\.95\)\*CHSZ\.s\)/.test(rd('js/menu.js')),'CHSZ is exported and the menu preview keeps the in-game ratio');}
/* ---- budget over many random characters ---- */
{let mx=0,mm=0,bad=0;const roles=['murid','pengawas','guru','cuci','guard','canteen','icecream','runcit','nasilemak','penjual'];
 for(let i=0;i<600;i++){try{const s=stats(G.npc(roles[i%roles.length],[ 'm','f',undefined][i%3]));mx=Math.max(mx,s.tris);mm=Math.max(mm,s.meshes)}catch(e){bad++}}
 ok(bad==0,'600 random characters: no exception');ok(mx<2000&&mm<55,'budget over 600 random characters: at most 2000 triangles and 55 meshes each (worst '+mx+' tris, '+mm+' meshes)');}
/* ---- game files that depend on the rig ---- */
{const K=rd('js/kantin.js'),W=rd('js/world-build.js'),KE=rd('js/kelas.js'),KL=rd('js/kelas-lib.js'),PA=rd('js/padang.js'),LU=rd('js/luar.js'),MO=rd('js/mop.js');
 ok(/function mkSeller\(i\)\{return npc\('canteen',i%2==0\?'f':'m',\{apronCol:KD\.stalls\[i\]\.c,h:1\.95\}\)\}/.test(K),'Kantin sellers are canteen staff with an apron in the stall colour');
 ok(K.includes("m.position.set(x+a[0],seatY(m),z+a[1]*1.2)")&&W.includes("m.position.set(x+tx_*o+nx*.05,seatY(m),z+tz*o")&&PA.includes("m.position.set(x+a,seatY(m),z)")&&KE.includes("m.position.set(s[0],seatY(m),")&&KL.includes("m.position.set(s[0],seatY(m),")&&KE.includes("sitting?seatY(pm):P.y"),'seated characters sit at seatY(scale): hips on the seat top (Round 25)');
 ok(!/\.04,z\+a\[1\]\*1\.2|nx\*\.05,\.04,|x\+a,\.04,z\)|m\.position\.set\(s\[0\],\.04,|sitting\?\.04|\.11,z\+a\[1\]\*1\.2|nx\*\.05,\.11,|x\+a,\.11,z\)|m\.position\.set\(s\[0\],\.11,|sitting\?\.11/.test(K+W+PA+KE+KL),'no fixed seat height is left');
 ok(K.includes('g.scale.setScalar(.96);g.position.set(0,-.37,.1)')&&W.includes('g.scale.setScalar(.96);g.position.set(0,-.37,.1)')&&W.includes('CANE.position.set(0,-.64,.04)'),'held item (scale .96 inside the 1.2 arm) and cane sit at the hand');
 ok(/function mkGuard\(\)\{return npc\('guard','m'\)\}/.test(LU)&&LU.includes("const keeper=npc('runcit','m');"),'outdoor guard and runcit keeper use the new roles');
 ok(/seat:\.45,/.test(MO)&&/hip:\.39\}/.test(MO)&&MO.includes('a.userData.z0'),'mop pole sits at the new hip height and unpose restores the A-pose');
 }
ok(ex('_backup_round23/js/chars.js')&&ex('_backup_round23/js/menu.js')&&ex('_backup_round23/js/mop.js')&&ex('_backup_round23/js/kantin.js')&&!ex('_backup_round23/js/core.js')&&!ex('_backup_round23/js/ui.js'),'backup _backup_round23 holds the changed files, never core.js or ui.js');
console.log(fail?fail+' FAILED, '+pass+' passed':pass+' pass, 0 fail');process.exit(fail?1:0);
