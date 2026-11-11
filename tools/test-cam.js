/* Round 13b: Node stub test for camIn() in js/kelas.js (camera stays inside the classroom). Not a browser, no three.js. Run: node tools/test-cam.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const src=fs.readFileSync(path.join(__dirname,'..','js','kelas.js'),'utf8');
const m=src.match(/function camIn\([^)]*\)\{[^\n]*\}\n/);ok(!!m,'camIn() exists in js/kelas.js');
const camIn=new Function(m[0]+';return camIn')();
ok(/const cc=camIn\(cp\.x,cp\.z,sx,sz,D,RX,RZ0,RZ1,\.3\)/.test(src)&&/CAMP\.x=cc\[0\]/.test(src)&&/CAMP\.z=cc\[1\]/.test(src)&&/CAMP\.y=CM\[1\]\+D\*CM\[2\]/.test(src),'the main loop uses camIn for x and z, camera height unchanged');
for(const RX of [8.5,9.75]){const RZ0=-7,RZ1=7,D=4.8,mg=.3;let out=0,n=0,moved=0,same=0;
 for(let px=-RX+.4;px<=RX-.4+1e-9;px+=.35)for(let pz=RZ0+.4;pz<=RZ1-.4+1e-9;pz+=.35)for(let a=0;a<360;a+=3){const r=a*Math.PI/180,sx=Math.sin(r),sz=Math.cos(r),c=camIn(px,pz,sx,sz,D,RX,RZ0,RZ1,mg);n++;
  if(c[0]<-RX||c[0]>RX||c[1]<RZ0||c[1]>RZ1)out++;const free=Math.abs(c[0]-(px+sx*D))<1e-9&&Math.abs(c[1]-(pz+sz*D))<1e-9;if(free)same++;else moved++}
 ok(out==0,'RX '+RX+': camera never leaves the room (checked '+n+' player positions x yaw angles, outside='+out+')');
 ok(same>0&&moved>0,'RX '+RX+': in open space the camera is exactly where it was before ('+same+' cases), near walls it is pulled in ('+moved+')');
 const c0=camIn(0,0,0,1,D,RX,RZ0,RZ1,mg);ok(c0[0]==0&&Math.abs(c0[1]-D)<1e-9,'RX '+RX+': room centre, camera 4.8 behind');
}
{let prev=null,maxJump=0;for(const [px,pz] of [[8.1,0],[8.1,6.6],[-8.1,-6.6],[0,6.6]])for(let a=0;a<=360;a++){const r=a*Math.PI/180,c=camIn(px,pz,Math.sin(r),Math.cos(r),4.8,8.5,-7,7,.3);if(prev&&a)maxJump=Math.max(maxJump,Math.hypot(c[0]-prev[0],c[1]-prev[1]));prev=c}
 ok(maxJump<=4.8*Math.PI/180+1e-6,'a full swing around a player at a wall or corner moves the camera smoothly (largest step '+maxJump.toFixed(3)+' per degree, never more than the unclamped orbit)')}

/* ---- Round 14: camClamp / camRect (js/cam-clamp.js), shared by world, luar, kantin and padang ---- */
{const cs=fs.readFileSync(path.join(__dirname,'..','js','cam-clamp.js'),'utf8');const {camRect,camClamp}=new Function(cs+';return{camRect,camClamp}')();
 const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
 const inU=(c,R)=>R.some(r=>c[0]>=r[0]-1e-9&&c[0]<=r[1]+1e-9&&c[1]>=r[2]-1e-9&&c[1]<=r[3]+1e-9);
 const K=.112,X=x=>(x-340)*K,Z=y=>(y-344)*K;
 const worldR=[[X(100),X(580),Z(150),Z(538)]].map(r=>camRect(r,.3));
 const cases=[['world hall',worldR,[[-26.5,-21.4,26.5,21.4],[-18.9,-25.5,-18.9,-21],[15.6,-24.8,15.6,-21]],6],['luar map',[camRect([-35,35,-34,17],.3)],[[-34.5,-33.5,34.5,16.5]],6],['kantin room',[camRect([-16.6,16.6,-22.1,9.35],.3)],[[-16.2,-21.7,16.2,9]],6],['padang fence',[camRect([-31,42,-19,19],.3)],[[-30.5,-18.5,41.5,18.5]],7]];
 for(const [nm,R,pts,D] of cases){let n=0,out=0,same=0,moved=0;
  const xs=R.reduce((a,r)=>[Math.min(a[0],r[0]),Math.max(a[1],r[1]),Math.min(a[2],r[2]),Math.max(a[3],r[3])],[1e9,-1e9,1e9,-1e9]);
  for(let px=xs[0];px<=xs[1]+1e-9;px+=(xs[1]-xs[0])/40)for(let pz=xs[2];pz<=xs[3]+1e-9;pz+=(xs[3]-xs[2])/30){if(!inU([px,pz],R))continue;for(let a=0;a<360;a+=5){const r=a*Math.PI/180,sx=Math.sin(r),sz=Math.cos(r),c=camClamp(px,pz,sx,sz,D,R);n++;if(!inU(c,R))out++;if(Math.abs(c[0]-(px+sx*D))<1e-9&&Math.abs(c[1]-(pz+sz*D))<1e-9)same++;else moved++}}
  ok(out==0,nm+': camera never outside the clamp area ('+n+' cases, outside='+out+')');ok(same>0&&moved>0,nm+': open space unchanged ('+same+'), pulled in near edges ('+moved+')');
  for(const [x0,z0,x1,z1] of pts){let prev=null,mj=0;for(const [px,pz] of [[x0,z0],[x1,z1],[x0,z1],[x1,z0]]){prev=null;for(let a=0;a<=360;a++){const r=a*Math.PI/180,c=camClamp(px,pz,Math.sin(r),Math.cos(r),D,R);if(prev)mj=Math.max(mj,Math.hypot(c[0]-prev[0],c[1]-prev[1]));prev=c}}
   ok(mj<=D*Math.PI/180+1e-6,nm+': swing at edges and corners is smooth (largest step '+mj.toFixed(3)+' per degree)')}}
 {const r=camRect([0,.4,0,.4],.3);ok(r[0]<=r[1]&&r[2]<=r[3],'camRect never inverts a tiny rectangle')}
 const w=rd('js/world.js'),lu=rd('js/luar.js'),ka=rd('js/kantin.js'),pa=rd('js/padang.js');
 ok(/camClamp\(cp\.x,cp\.z,sx,sz,cd,WCR\)/.test(w)&&/cam\.position\.set\(cc\[0\],CM\[1\]\+cd\*CM\[2\],cc\[1\]\)/.test(w)&&/const WCR=\[\[X\(100\),X\(580\),Z\(150\),Z\(538\)\]\]\.map/.test(w),'world.js uses camClamp with the main hall floor (camera height unchanged)');
 ok(/camClamp\(cp\.x,cp\.z,sx,sz,D,LCR\)/.test(lu)&&/camRect\(\[LUC\.BX0,LUC\.BX1,LUC\.BZ0,LUC\.BZ1\],\.3\)/.test(lu)&&/CAMW\.h\+D\*CAMW\.k/.test(lu),'luar.js walk camera uses camClamp with the map rectangle');
 ok(/camClamp\(cp\.x,cp\.z,sx,sz,D,KCR\)/.test(ka)&&/CAMP\.y=CM\[1\]\+D\*CM\[2\]/.test(ka)&&/KCR=\[camRect\(\[-RX,RX,RZ0,RZ1\],\.3\)\]/.test(ka),'kantin.js uses camClamp with the room');
 ok(/camClamp\(cp\.x,cp\.z,sx,sz,D,PCR\)/.test(pa)&&/camRect\(\[BX0,BX1,BZ0,BZ1\],\.3\)/.test(pa)&&/function sideCam/.test(pa)&&!/camClamp[^;]*sideCam/.test(pa),'padang.js walk camera uses camClamp with the fence box, the 2.5D side camera is untouched');
 for(const f of ['world','luar','kantin','padang'])ok(/"js\/audio\.js", ("js\/hud\.js", )?("js\/wallet\.js", "js\/spot\.js", )?"js\/cam-clamp\.js"/.test(rd(f+'.html')),f+'.html loads js/cam-clamp.js');
 ok(rd('sw.js').includes("'js/cam-clamp.js'"),'sw.js pre-caches js/cam-clamp.js');
 const wb=rd('js/world-build.js');ok(/Round 14 backdrop/.test(wb)&&/sc\.fog=new T\.Fog/.test(wb)&&(wb.match(/BoxGeometry\(w,h,d\)/g)||[]).length>=1,'world-build.js has the hedge ring, the darker floor and the fog');
 ok(/new T\.PlaneGeometry\(300,300\),mat\('#8fc27a'\)/.test(wb)&&/new T\.PerspectiveCamera\(55,1,\.5,150\)/.test(wb),'ground plane and camera far are unchanged');
}
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
