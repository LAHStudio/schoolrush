/* Round 14b + 14c: prefect chaser markers (ring, "!" bubble, minimap triangle, beep) and the patrol prefects joining the chase after 10 game minutes. Run: node tools/test-prefmark.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const st=rd('js/story.js'),wd=rd('js/world.js'),lg=rd('js/luar-logic.js'),wh=rd('world.html');
const i=st.indexOf('let pfM=[]'),j=st.indexOf('window.storyMM=');const jend=st.indexOf('\n',j);
ok(i>0&&j>i&&jend>j,'marker block found in js/story.js');
/* ---- markers against stubs ---- */
const els=[];const doc={createElement(){const e={style:{},textContent:'',id:''};els.push(e);return e},body:{appendChild(){}}};
class V3{set(x,y,z){this.x=x;this.y=y;this.z=z;return this}project(){this.x=this._px;this.y=this._py||0;this.z=this._pz;return this}}
const meshes=[];class Mesh{constructor(){this.position={x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z}};this.rotation={};this.scale={v:0,setScalar(v){this.v=v}};this.visible=false;meshes.push(this)}}
const T={Mesh,RingGeometry:function(){},MeshBasicMaterial:function(){},DoubleSide:2,Vector3:class extends V3{}};
const added=[];const sc={add(m){added.push(m)}},cam={},cv={clientWidth:400,clientHeight:800};
const win={};
const code=st.slice(i,jend)+';return{pfOn,pfOff,set(s,p,e){st=s;ph=p;ex=e||[]},vec(){return pfV}}';
const mod=new Function('T','sc','cam','cv','document','MODE','window','let st="late",ph={x:3,z:4,m:{visible:true}},ex=[];'+code)(T,sc,cam,cv,doc,'story',win);
const c0={x:3,z:4};mod.pfOn(1,c0,0);const ring=meshes[0],bub=els[0];
ok(meshes.length===1&&added.length===1&&ring.visible&&ring.position.x===3&&ring.position.z===4&&ring.position.y===.06,'ring created once, under the prefect feet');
ok(bub.id==='pfb'&&bub.textContent==='!','first bubble has id pfb and shows "!"');
mod.vec()._px=0;mod.vec()._py=0;mod.vec()._pz=.5;mod.pfOn(1,c0,0);ok(bub.style.display==='block'&&bub.style.left==='200px'&&bub.style.top==='400px','bubble placed at the projected spot');
mod.vec()._pz=1.2;mod.pfOn(1,c0,0);ok(bub.style.display==='none','bubble hidden when the prefect is behind the camera');
mod.pfOn(1,c0,0);ok(meshes.length===1,'no second ring on later frames');
mod.pfOn(1,{x:9,z:9},1);mod.pfOn(1,{x:-5,z:2},2);ok(meshes.length===3&&els[1].id==='pfb1'&&els[2].id==='pfb2'&&meshes[1].position.x===9&&meshes[2].position.x===-5,'one ring and bubble per chaser (ids pfb, pfb1, pfb2)');
mod.pfOff();ok(meshes.every(m=>!m.visible)&&els.every(e=>e.style.display==='none'),'pfOff hides every ring and bubble');
const log=[];const mg={fillStyle:'',strokeStyle:'',lineWidth:0,beginPath(){log.push('b')},moveTo(){log.push('m')},lineTo(){log.push('l')},closePath(){},fill(){log.push('f')},stroke(){log.push('s')}};
const ident=(x,z)=>[x*10,z*10];
mod.set('late',{x:1,z:1,m:{visible:true}});win.storyMM(mg,ident);ok(log.join('')==='bmllfs'&&mg.fillStyle==='#e02424','minimap: one red triangle while late and the prefect is visible');
log.length=0;mod.set('late',{x:1,z:1,m:{visible:true}},[{x:2,z:2},{x:3,z:3}]);win.storyMM(mg,ident);ok(log.join('')==='bmllfs'.repeat(3),'minimap: one triangle per chaser (3 with the patrol prefects)');
log.length=0;mod.set('idle',{x:1,z:1,m:{visible:true}});win.storyMM(mg,ident);ok(log.length===0,'minimap: no triangle when not chasing');
mod.set('late',{x:1,z:1,m:{visible:false}});win.storyMM(mg,ident);ok(log.length===0,'minimap: no triangle when the prefect is hidden');
mod.set('late',null);win.storyMM(mg,ident);ok(log.length===0,'minimap: no triangle before the prefect exists');
/* ---- beep gap = same numbers as the outside guard ---- */
const LUC=new Function(lg+';return LUC')();const cf=st.match(/PGAP:([\d.]+),PGAPMAX:([\d.]+),PGAPK:([\d.]+)/);
ok(!!cf&&+cf[1]===LUC.CH.gap&&+cf[2]===LUC.CH.gapMax&&+cf[3]===.045,'beep gap constants equal the outside guard');
ok(/CFG\.PGAPK\)/.test(st)&&/tone\(740,0,\.07,'square',\.07\)/.test(st)&&/dm\*CFG\.PGAPK/.test(st),'beep uses the distance to the nearest running prefect and the same tone as the guard');
/* ---- Round 14c: join / release / speed ramp ---- */
const a=st.indexOf('function joinEx'),b=st.indexOf('\n',st.indexOf('function pSpd'));
ok(a>0&&b>a,'joinEx / releaseEx / pSpd found');
const cfgM=st.match(/PSPD:4,[^]*?JNEAR:6(?=[,}])/);ok(!!cfgM,'CFG chase numbers found');
const CFG=new Function('const CFG={'+cfgM[0].replace(/^PSPD:4/,'PSPD:4').replace(/\}$/,'')+'};return CFG')();
const rate=+st.match(/RATE:([\d.]+)/)[1];ok(CFG.JOIN*rate===10,'JOIN = 10 game minutes ('+CFG.JOIN+' real s at RATE '+rate+')');
const log2=[];const SRA={whistle(){log2.push('w')}},toast=(m)=>log2.push(m);
function mk(role,x,z,extra){return Object.assign({role,x,z,ch:0,hid:0,mv:1,w:2,tx:7,tz:7,m:{visible:true}},extra||{})}
const ns=[mk('murid',0,0),mk('pengawas',3,0),mk('pengawas',20,0,{hid:2,m:{visible:false}}),mk('guru',1,1)];
const P={x:0,z:0};
const lib=new Function('CFG','ns','P','SRA','toast',"let ex=[],joined=false;"+st.slice(a,b+1)+';return{joinEx,releaseEx,pSpd,ex(){return ex},joined(){return joined}}')(CFG,ns,P,SRA,toast);
lib.joinEx();
ok(lib.ex().length===2&&ns[1].ch===1&&ns[2].ch===1&&ns[0].ch===0&&ns[3].ch===0,'only the two patrol prefects join (not students or teachers)');
ok(ns[1].d===CFG.JDELAY2&&ns[2].d===CFG.JDELAY,'a prefect closer than '+CFG.JNEAR+' waits longer ('+CFG.JDELAY2+' s) than a far one ('+CFG.JDELAY+' s)');
ok(ns[2].hid===0&&ns[2].m.visible===true,'a prefect hidden behind a door is shown when it joins');
ok(log2[0]==='w'&&/Pengawas lain datang/.test(log2[1]),'whistle and toast "Pengawas lain datang!"');
lib.joinEx();ok(lib.ex().length===2,'joining twice does not add the same prefect twice');
lib.releaseEx();ok(lib.ex().length===0&&ns[1].ch===0&&ns[2].ch===0&&ns[1].tx===ns[1].x&&ns[1].tz===ns[1].z&&ns[1].w>=.3&&ns[1].w<=1,'release sends them back to patrol from where they stand');
ok(lib.pSpd(0)===4&&lib.pSpd(60)===5.5&&lib.pSpd(600)===5.5&&Math.abs(lib.pSpd(30)-4.75)<1e-9&&lib.pSpd(-5)===4,'main prefect speed ramps 4 to 5.5 over 60 s and is capped');
ok(5.5>5&&4<5,'ramp ends a little above the player walking speed (5), extra prefects stay below it (4)');

/* ---- simulate the real chase() body: markers, join after JOIN seconds, speeds, catch ---- */
{const ci=st.indexOf('function chase(dt,t,calm)'),ce=st.indexOf('enterRoom(cls,true)}}',ci)+'enterRoom(cls,true)}}'.length;
 ok(ci>0&&ce>ci,'chase() found');
 const rec={enter:0,tones:0,whistles:0,bfs:0,toasts:[],marks:0};
 const mkc=(x,z)=>({x,z,f:0,mv:0,d:0,m:{visible:true,position:{set(){}},rotation:{}}});
 const world=[mkc(50,50),mkc(-40,-40)].map(o=>Object.assign(o,{role:'pengawas',ch:0,hid:0,w:1,tx:0,tz:0}));
 const P={x:1e4,z:1e4};
 const env={CFG:Object.assign({},CFG),P,ns:world.concat([Object.assign(mkc(5,5),{role:'murid'})]),
  SRA:{whistle(){rec.whistles++}},toast:m=>rec.toasts.push(m),say(){},tone(){rec.tones++},anim(){},la:(a,b)=>b,cell:()=>[-1,-1],GW:10,GH:10,N8:[],bk:[],GX:0,GZ:0,GC:1,bfs(){rec.bfs++},enterRoom(){rec.enter++},pfOn(){rec.marks++}};
 const PHm=mkc(30,0);PHm.d=CFG.PDELAY;
 const inst=new Function(...Object.keys(env),'PH','let ph=PH,ex=[],lateT=0,mainT=0,joined=false,bd=null,bt=0,pfBt=0,score=100,cls=0;'+st.slice(a,b+1)+';'+st.slice(ci,ce)+';return{chase,get ex(){return ex},get joined(){return joined},get mainT(){return mainT},ph:()=>ph}')(...Object.values(env),PHm);
 let t=0;const dt=.05;
 for(;t<CFG.JOIN-.1;t+=dt)inst.chase(dt,t);
 ok(!inst.joined&&inst.ex.length===0,'before '+CFG.JOIN+' s only the main prefect chases');
 ok(rec.marks>0&&rec.bfs>0&&rec.tones>0,'main chase draws its marker, refreshes the path field and beeps');
 ok(PHm.x>30,'main prefect moves towards the player after its short delay');
 for(;t<CFG.JOIN+.6;t+=dt)inst.chase(dt,t);
 ok(inst.joined&&inst.ex.length===2&&world[0].ch===1&&world[1].ch===1&&env.ns[2].ch===undefined,'at '+CFG.JOIN+' s late the two patrol prefects join (students stay put)');
 ok(rec.toasts.some(m=>/Pengawas lain datang/.test(m)),'the toast was shown');
 const x0=[world[0].x,world[0].z],m0=rec.marks;
 for(let k=0;k<20;k++){t+=dt;inst.chase(dt,t)}
 ok(rec.marks-m0===60,'3 markers per frame once everyone chases');
 ok(Math.hypot(world[0].x-x0[0],world[0].z-x0[1])>0,'joined prefects run towards the player');
 for(let k=0;k<1500;k++){t+=dt;inst.chase(dt,t)}
 const speed=o=>{const a0=[o.x,o.z];inst.chase(.1,t+=.1);return Math.hypot(o.x-a0[0],o.z-a0[1])/.1};
 const mainSp=speed(PHm),exSp=speed(world[0]);
 ok(Math.abs(mainSp-CFG.PSPD2)<.2,'main prefect reached about '+CFG.PSPD2+' (measured '+mainSp.toFixed(2)+')');
 ok(Math.abs(exSp-CFG.PSPD)<.2,'patrol prefects keep speed '+CFG.PSPD+' (measured '+exSp.toFixed(2)+')');
 P.x=world[1].x+.2;P.z=world[1].z;const e0=rec.enter;inst.chase(.05,t+=.05);
 ok(rec.enter===e0+1,'a joined prefect reaching you ends the chase (sent to class)');
}
/* ---- wiring ---- */
ok(/bt=0;releaseEx\(\);lateT=0;mainT=0;joined=false\}/.test(st),'a new chase resets the timers and releases old extras');
ok(/function hidePref\(\)\{if\(ph\)ph\.m\.visible=false;releaseEx\(\);pfOff\(\);sayOff\(\)\}/.test(st),'hidePref releases the patrol prefects and hides the markers');
ok(/lateT\+=dt;if\(!joined&&lateT>=CFG\.JOIN\)joinEx\(\)/.test(st),'the patrol prefects join once, after JOIN seconds of being late');
ok(/sp=calm\?CFG\.RSPD:i==0\?pSpd\(mainT\):CFG\.PSPD/.test(st),'ramp only for the main prefect');
ok(/if\(!calm&&dm<CFG\.CATCH\)\{SRA\.whistle\(\);say\('Kena tangkap! Jom ke kelas!'\)/.test(st),'any prefect catching you ends the chase the same way');
ok(/storyTick=function\(dt,t\)\{if\(MODE!='story'\)return;if\(halt\)\{pfOff\(\);sayOff\(\);return\}/.test(st),'markers hidden while the game is halted');
ok(/n=\{m,role:r,x:/.test(wd)&&/ns\.forEach\(n=>\{if\(n\.ch\)return;if\(n\.hid>0\)/.test(wd),'world.js: patrol NPCs know their role and stand still while n.ch is set');
ok(/if\(window\.storyMM\)storyMM\(mg,f\);[^\n]*\nconst a=f\(P\.x,P\.z\)/.test(wd),'world.js drawMM calls storyMM before the player arrow');
ok(!/id=.pfb/.test(wh),'ids pfb, pfb1, pfb2 are unused in world.html');
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
