/* Round 26: Lencana viewer (js/lencana.js): slot switcher SLV, badge cards, entry points (#mL and pause #pL), halt, close paths. Run: node tools/test-lencana.js (check the exit code) */
const fs=require('fs'),path=require('path'),vm=require('vm');const R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'),X=p=>fs.existsSync(path.join(__dirname,'..',p));let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok  ',m)};
class E{constructor(t){this.t=t;this.ch=[];this.className='';this.style={};this.attr={};this._tx='';this.id='';this.dataset={};this.p=null;this.disabled=false}
 set textContent(v){this._tx=v;if(v==='')this.ch.forEach(c=>c.p=null),this.ch=[]}get textContent(){return this._tx}get parentNode(){return this.p}get classList(){const o=this;return{toggle:(c,f)=>{const a=o.className.split(' ').filter(x=>x&&x!=c);if(f)a.push(c);o.className=a.join(' ')}}}
 appendChild(c){if(c.p)c.remove();c.p=this;this.ch.push(c);return c}append(...a){a.forEach(c=>this.appendChild(c))}insertBefore(c,r){if(c.p)c.remove();c.p=this;const i=this.ch.indexOf(r);i<0?this.ch.push(c):this.ch.splice(i,0,c);return c}
 remove(){if(this.p)this.p.ch=this.p.ch.filter(x=>x!==this);this.p=null}setAttribute(k,v){this.attr[k]=v}all(){return this.ch.reduce((a,c)=>a.concat([c],c.all()),[])}
 querySelectorAll(s){const m=s.match(/^\.(\w+) (\w+)$/);return this.all().filter(x=>x.t==m[2]&&x.p&&(' '+x.p.className+' ').includes(' '+m[1]+' '))}
 querySelector(s){const c=s[0]=='.'?s.slice(1):null;return this.all().find(x=>c&&(' '+x.className+' ').includes(' '+c+' '))||null}
 text(){return this._tx+this.ch.map(c=>c.text()).join('|')}}
const MID=Date.UTC(2026,10,16,12);
const P0=()=>({s1:{name:'Ali',gen:'m',mode:'story',lp:300,rooms:{mat:{g:'A',best:90},sains:{g:'C',best:60},kantin:{g:'D',best:20}},drinks:3,s:[1,2,0,1],slip:0,gem:5,gol:0,badges:{gem5:MID}},s2:{name:'Siti',gen:'f',mode:'roam',lp:900,drinks:8,s:[0,0,0,0],slip:2,gem:0,gol:4,badges:{air8:MID,gol5:true}},s4:{name:'Zul',gen:'m',lp:0,badges:{}}});
function mk(o){o=o||{};const body=new E('body'),head=new E('head'),ids={};const doc={body,head,createElement:t=>new E(t),getElementById:i=>ids[i]||body.all().concat(head.all()).find(x=>x.id===i)||null};
 const reg=(i,t,par)=>{const e=new E(t||'div');e.id=i;ids[i]=e;(par||body).appendChild(e);return e};
 if(o.menu!==false)reg('mL','button');let vp=null,col=null;if(o.pause){vp=reg('vp');col=new E('div');col.className='r2';vp.appendChild(col);['pS','pH','pT','pQ'].forEach(i=>{const b=new E('button');b.id=i;ids[i]=b;col.appendChild(b)})}
 const ev={},hist=[];const ctx={setInterval:()=>0,document:doc,history:{pushState:s=>hist.push(s),back:()=>{hist.pop();(ev.popstate||[]).forEach(f=>f())}},addEventListener:(n,f)=>{(ev[n]=ev[n]||[]).push(f)},console};ctx.window=ctx;vm.createContext(ctx);
 vm.runInContext('var halt='+(o.halt?'true':'false')+';let SR_TRAP='+(o.trap?1:0)+';const BD='+JSON.stringify([['air8','Tabiat Sihat','Minum air 8 kali'],['sampah12','Pelajar Prihatin','Buang 12 sampah dengan betul'],['slip5','Kaki Licin','Terpijak kulit pisang 5 kali'],['gem5','Laju Kilat','Ambil 5 gem laju'],['gol5','Penjaring','Jaring 5 gol di padang']])+';const GRD=[[98,"A+"],[85,"A"],[70,"B"],[55,"C"],[0,"D"]],RM=[["mat","Matematik"],["sains","Sains"],["eng","English"],["bm","Bahasa Melayu"],["pj","Pendidikan Jasmani"],["kantin","Kantin (Waktu Rehat)"]],gradeOf=s=>(GRD.find(g=>s>=g[0])||GRD[GRD.length-1])[1],gcls=g=>"gd g"+({"A+":"AP",A:"A",B:"B",C:"C",D:"D"}[g]||"N");let PF='+JSON.stringify(o.PF===undefined?P0():o.PF)+';',ctx);
 vm.runInContext(R('js/lencana.js'),ctx);const key=k=>{(ev.keydown||[]).forEach(f=>f({key:k}))};return{ctx,doc,body,head,ids,col,ev,hist,key,ov:()=>doc.getElementById('lenxv'),L:()=>ctx.LNC}}
ok(X('js/lencana.js'),'js/lencana.js exists');
/* cards */
{const w=mk(),p=JSON.parse(JSON.stringify({name:'A',drinks:3,s:[1,2,0,1],slip:2,gem:5,gol:9,badges:{gem5:MID}})),cs=w.L().cards(p),by=i=>cs.find(x=>x.id==i);
 ok(cs.length==24&&cs[0].id=='air8'&&cs[4].id=='gol5'&&cs[5].id=='fashion','24 cards: the 5 from BD first, then the 19 of Round 27');
 ok(by('gem5').on&&by('gem5').date=='16 Nov 2026'&&by('gem5').c==5,'unlocked: on, date "16 Nov 2026", progress full');
 ok(!by('air8').on&&by('air8').c==3&&by('air8').n==8&&by('air8').how=='Minum air 8 kali','locked: progress 3/8 and the how-to text');
 ok(by('sampah12').c==4&&by('sampah12').n==12,'sampah12 progress = sum of the four bins');
 ok(by('gol5').c==5&&!by('gol5').on,'progress is capped at the target');
 ok(w.L().cards({badges:{air8:true}})[0].on&&w.L().cards({badges:{air8:true}})[0].date==='','an old non-date badge value is still "on", no date');
 ok(w.L().cards(null).every(x=>!x.on&&x.c==0)&&w.L().cards({}).length==24,'empty or missing slot: all locked, no crash')}
/* slots */
{const w=mk(),S=w.ctx.SLV.slots(JSON.parse(JSON.stringify(P0())));ok(S.map(s=>s.k).join()=='s2,s1,s4','slots: existing only, last played first (s2,s1,s4)');
 ok(w.ctx.SLV.slots({s3:{lp:5},s1:{lp:5},s6:{lp:5}}).map(s=>s.k).join()=='s1,s3,s6','equal lp: by slot number');ok(w.ctx.SLV.slots(null).length==0&&w.ctx.SLV.slots({s9:{}}).length==0,'null or unknown keys: empty');
 ok(w.ctx.SLV.label(S[0])=='Slot 2 · 👧 Siti'&&w.ctx.SLV.label({i:1,p:{gen:'m'}})=='Slot 1 · 👦 ?','slot label with gender icon and name')}
/* overlay */
{const w=mk();ok(typeof w.ids.mL.onclick=='function','start screen: #mL is bound');w.ids.mL.onclick();const o=w.ov();ok(!!o&&w.L().isOpen()&&w.ctx.halt===true,'opens, holds the game');
 ok(w.L().selected()=='s2','opens on the LAST PLAYED slot (s2)');ok(o.text().includes('Slot 2 · 👧 Siti')&&o.text().includes('Mod Jalan-jalan'),'switcher shows slot name and mode');
 ok(o.querySelector('.lenxp').text()=='Lencana 2/24','progress line "Lencana 2/5" (air8 + gol5)');
 const cs=o.querySelector('.lenxg').ch;ok(cs.length==24&&cs[0].className.includes('on')&&!cs[1].className.includes('on')&&cs[4].className.includes('on'),'cards: unlocked ones marked on');
 ok(cs[0].text().includes('Diperoleh: 16 Nov 2026')&&cs[4].text().includes('Diperoleh')&&!cs[4].text().includes(':'),'unlocked card shows the date (or just "Diperoleh" when none stored)');
 ok(cs[2].text().includes('Terpijak kulit pisang 5 kali')&&cs[2].text().includes('2/5')&&cs[1].text().includes('0/12'),'locked card: how to earn and progress count');
 ok(cs[2].ch.some(x=>x.className=='lenxr'&&x.ch[0].style.width=='40%'),'locked card: progress bar 2/5 = 40%');
 w.ctx.lenOpen();ok(w.body.ch.filter(x=>x.id=='lenxv').length==1&&w.head.ch.filter(x=>x.id=='lenxcss').length==1,'opening twice does not stack; css added once');
 const bar=o.querySelector('.lenxb'),next=bar.ch[2],prev=bar.ch[0];next.onclick();ok(w.L().selected()=='s1'&&o.querySelector('.lenxp').text()=='Lencana 1/24'&&o.text().includes('Slot 1 · 👦 Ali')&&o.text().includes('Mod Kelas'),'▶ goes to the next slot (s1): name, mode, count change');
 next.onclick();ok(w.L().selected()=='s4'&&o.text().includes('Mod belum dipilih')&&o.querySelector('.lenxp').text()=='Lencana 0/24','third slot: no mode chosen, 0/5');
 next.onclick();ok(w.L().selected()=='s2','▶ wraps around to the first');prev.onclick();ok(w.L().selected()=='s4','◀ wraps the other way');
 w.key('ArrowRight');ok(w.L().selected()=='s2','ArrowRight key switches slot');w.key('ArrowLeft');ok(w.L().selected()=='s4','ArrowLeft key switches slot');
 w.key('Escape');ok(!w.ov()&&w.ctx.halt===false&&w.hist.length==0,'Escape closes, releases the halt, history cleaned')}
{const w=mk();w.ctx.lenOpen('s4');ok(w.L().selected()=='s4','open(key) starts on a given slot');w.L().close();w.ctx.lenOpen('s9');ok(w.L().selected()=='s2','unknown key falls back to last played');w.L().close();
 w.ctx.lenOpen();w.ov().ch[0].ch.find(x=>x.t=='button'&&x.text()=='Tutup').onclick();ok(!w.ov()&&w.ctx.halt===false,'Tutup closes');
 w.ctx.lenOpen();w.ov().onclick({target:{}});ok(!!w.ov(),'tapping inside the card does not close');w.ov().onclick({target:w.ov()});ok(!w.ov(),'tapping the dark background closes');
 w.ctx.lenOpen();w.ev.popstate.forEach(f=>f());ok(!w.ov()&&w.hist.length==1,'Back (popstate) closes without a second history.back()');}
{const w=mk({halt:true});w.ctx.lenOpen();ok(w.ctx.halt===true,'already halted (pause menu): stays halted');w.L().close();ok(w.ctx.halt===true,'already halted: close does not release it')}
{const w=mk({trap:true});w.ctx.lenOpen();ok(w.hist.length==0,'game page with SR_TRAP: no extra history entry');w.L().close();ok(!w.ov(),'closes')}
{const w=mk({PF:{}});w.ctx.lenOpen();ok(!!w.ov()&&w.L().selected()==null&&w.ov().text().includes('Belum ada slot simpanan'),'no slots: friendly empty state');w.key('ArrowRight');w.L().close();ok(!w.ov(),'empty state closes, arrow keys do not crash')}
{const w=mk({PF:{s3:{name:'Solo',gen:'m',badges:{slip5:MID}}}});w.ctx.lenOpen();const b=w.ov().querySelector('.lenxb');ok(w.L().selected()=='s3'&&b.ch[0].disabled&&b.ch[2].disabled,'one slot: arrows disabled');b.ch[2].onclick();ok(w.L().selected()=='s3','one slot: arrow does nothing')}
/* Gred Kelas (Round 26b): replaces the grade tab of the old #vl */
{const w=mk(),Gs=w.L().grades(JSON.parse(JSON.stringify(P0().s1)));
 ok(Gs.rows.length==6&&Gs.rows[0].g=='A'&&Gs.rows[0].sub=='Terbaik 90/100'&&Gs.rows[2].g=='—'&&Gs.rows[2].sub=='Belum dimainkan','grades(): per class best grade and "Terbaik n/100", "Belum dimainkan" for unplayed');
 ok(Gs.all.g==vm.runInContext('gradeOf((90+60+20)/3)',w.ctx)&&Gs.all.sub=='3 daripada 6 kelas','overall grade = gradeOf(average of best), "3 daripada 6 kelas"');
 const e=w.L().grades({name:'N'});ok(e.n==0&&e.all.g=='—'&&e.all.sub=='Main Mod Kelas dahulu','no class played yet: "—" and "Main Mod Kelas dahulu"');
 ok(w.L().grades({mode:'roam'}).all.sub=='Gred hanya untuk Mod Kelas'&&w.L().grades(null).rows.length==6,'roam slot: "Gred hanya untuk Mod Kelas"; null slot does not crash')}
{const w=mk();w.ctx.lenOpen();const o=w.ov(),tb=o.querySelector('.lenxt').ch;ok(tb.length==2&&tb[0].text()=='Lencana'&&tb[1].text()=='Gred Kelas'&&w.L().tab()=='b'&&tb[0].className.includes('on'),'two tabs, Lencana is the default');
 tb[1].onclick();const gr=o.querySelector('.lenxg');ok(w.L().tab()=='g'&&tb[1].className.includes('on')&&!tb[0].className.includes('on'),'tapping Gred Kelas switches tab');
 ok(o.querySelector('.lenxp').text()=='Pencapaian Mod Kelas'&&gr.ch.length==7&&gr.ch[0].className.includes('big')&&gr.ch[0].text().includes('Gred keseluruhan'),'grade list: overall row first, then 6 classes (slot s2 = roam, no grades)');
 ok(gr.ch[0].text().includes('Gred hanya untuk Mod Kelas')&&gr.ch[0].ch[1].className=='gd gN','roam slot s2: overall "—" with the neutral grade class');
 o.querySelector('.lenxb').ch[2].onclick();ok(w.L().selected()=='s1'&&w.L().tab()=='g','switching slot keeps the Gred tab');const g1=o.querySelector('.lenxg');
 ok(g1.ch[1].text().includes('Matematik')&&g1.ch[1].ch[1].text()=='A'&&g1.ch[1].ch[1].className=='gd gA'&&g1.ch[2].ch[1].className=='gd gC','slot s1: Matematik A (class gd gA), Sains C');
 ok(g1.ch[0].ch[1].text()==vm.runInContext('gradeOf((90+60+20)/3)',w.ctx)&&g1.ch[0].text().includes('3 daripada 6 kelas'),'slot s1: overall grade and "3 daripada 6 kelas"');
 tb[0].onclick();ok(w.L().tab()=='b'&&o.querySelector('.lenxp').text()=='Lencana 1/24','back to Lencana tab keeps the slot');w.L().close();
 w.ctx.lenOpen(undefined,'g');ok(w.L().tab()=='g'&&w.L().selected()=='s2','open(key,"g") starts on the Gred tab');w.L().close();w.ctx.lenOpen();ok(w.L().tab()=='b','the tab resets to Lencana on each open')}
{const w=mk({PF:{}});w.ctx.lenOpen(undefined,'g');ok(w.ov().text().includes('lencana dan gred'),'no slots on the Gred tab: friendly empty state')}
/* pause menu entry */
{const w=mk({pause:true,menu:false});const pl=w.doc.getElementById('pL');ok(!!pl&&pl.textContent=='Lencana'&&pl.p===w.col,'pause menu: "Lencana" button added');ok(w.col.ch.map(x=>x.id).join()=='pS,pH,pT,pL,pQ','pause menu: it sits before "Halaman Utama" (pQ)');
 const before=w.col.ch.length;vm.runInContext(R('js/lencana.js'),w.ctx);ok(w.col.ch.length==before,'loading again does not add a second button');pl.onclick();ok(!!w.ov(),'pause button opens the overlay over the pause menu');w.L().close()}
{const w=mk({pause:true,menu:false,halt:true});w.doc.getElementById('pL').onclick();w.L().close();ok(w.ctx.halt===true,'from pause: the game stays halted after closing, back on the pause menu')}
/* wiring */
{const H=f=>R(f+'.html'),SW=R('sw.js');['index','world','kantin','kelas','luar','padang'].forEach(f=>ok(/"js\/lencana\.js"\]/.test(H(f)),f+'.html loads js/lencana.js (last in its script list)'));
 ok(/"js\/menu\.js", "js\/sokong\.js", "js\/lencana\.js"\]/.test(H('index')),'index.html: after menu.js, so #mL is bound after menu.js set the old handler');
 ok(SW.includes("'js/lencana.js'")&&/CACHE='sr-r27'/.test(SW),'sw.js: cache sr-r27, lencana.js pre-cached');
 const md=R('js/menu.js'),ui=R('js/ui.js');ok(/\$\('mL'\)\.onclick=\(\)=>\{drawBd\(\)/.test(md)&&/id=\\"vl\\"/.test(ui),'menu.js and ui.js still carry the old viewer (unused, not touched)');
 ok(/Pusingan 26/.test(R('README.md')),'README has a Pusingan 26 entry');
 ok(!/\bLEN\b/.test(R('js/lencana.js').replace(/\/\*[\s\S]*?\*\//,'')),'no global called LEN (padang-games.js has a const LEN)')}
process.exit(bad?1:0);
