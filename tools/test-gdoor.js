/* Round 10g: Node stub check of gdoor() in js/chars.js (no browser). Run: node tools/test-gdoor.js */
const fs=require('fs');let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.position=new V();this.rotation=new V()}}
global.T={Mesh,PlaneGeometry:function(w,h){this.type='PlaneGeometry';this.w=w;this.h=h},MeshBasicMaterial:function(o){this.type='MeshBasicMaterial';this.color=o.color;this.transparent=false;this.opacity=1}};
const src=fs.readFileSync('js/chars.js','utf8'),m=src.match(/function gdoor[\s\S]*$/);t('gdoor exists in chars.js',!!m);
eval(m[0].replace('function gdoor','global.gdoor=function gdoor'));
const FR='#3d3578';
[[0,0,0,0,.05],[1,2,Math.PI,2.2,-.1],[3,-4,Math.PI/2,2.2,.05],[-5,6,-Math.PI/2,3.2,.05]].forEach(([x,z,ry,_,g0])=>{
 const W=2.2,H=2.3,added=[],p={add:o=>added.push(o)},out=gdoor(p,x,z,ry,W,H,FR,g0),nx=Math.sin(ry),nz=Math.cos(ry),tx=nz,tz=-nx,tag='ry='+ry.toFixed(2)+' ';
 t(tag+'returns an array of meshes',Array.isArray(out)&&out.length>8&&out.every(o=>o instanceof Mesh));
 t(tag+'all added to the parent',added.length==out.length);
 t(tag+'only flat planes with MeshBasicMaterial',out.every(o=>o.geometry.type=='PlaneGeometry'&&o.material.type=='MeshBasicMaterial'));
 t(tag+'all opaque (wall fade sets opacity itself)',out.every(o=>o.material.transparent===false&&o.material.opacity===1));
 const gl=out.filter(o=>o.material.color=='#9fcde2'),hd=out.filter(o=>o.material.color=='#c98a5a'),fr=out.filter(o=>o.material.color==FR);
 t(tag+'exactly one glass plane, full size',gl.length==1&&gl[0].geometry.w==W&&gl[0].geometry.h==H);
 t(tag+'2 copper handles',hd.length==2);
 t(tag+'only glass, frame and handle colours',gl.length+hd.length+fr.length==out.length);
 /* frame: 4 outer bars + centre stile + 2 leaves x (1 vertical + 2 horizontal muntins) = 11 */
 t(tag+'11 frame pieces (4 outer, 1 centre stile, 2 leaves x 3 muntins)',fr.length==11);
 t(tag+'one full-height centre stile at the middle',fr.filter(o=>o.geometry.h==H&&o.geometry.w<.15&&Math.abs((o.position.x-x)*tx+(o.position.z-z)*tz)<1e-9).length==1);
 t(tag+'each leaf has 2 horizontal muntins (4 in total, inner width)',fr.filter(o=>o.geometry.w<W/2&&o.geometry.w>.5&&o.geometry.h<.1).length==4);
 const loc=o=>({o:(o.position.x-x)*tx+(o.position.z-z)*tz,e:(o.position.x-x)*nx+(o.position.z-z)*nz,y:o.position.y,w:o.geometry.w,h:o.geometry.h});
 const L=out.map(loc);
 t(tag+'every piece inside the door rectangle',L.every(q=>q.o-q.w/2>=-W/2-1e-9&&q.o+q.w/2<=W/2+1e-9&&q.y-q.h/2>=-1e-9&&q.y+q.h/2<=H+1e-9));
 t(tag+'glass sits at g0, everything else in front of it',Math.abs(L[0].e-g0)<1e-9&&L.slice(1).every(q=>q.e>g0+.005));
 t(tag+'handles in front of the frame',L.filter((q,i)=>out[i].material.color=='#c98a5a').every(q=>q.e>g0+.03));
 t(tag+'rotation faces the normal',out.every(o=>o.rotation.y===ry));
 let zf=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(Math.abs(a.e-b.e)<1e-9&&Math.abs(a.o-b.o)<(a.w+b.w)/2-1e-9&&Math.abs(a.y-b.y)<(a.h+b.h)/2-1e-9)zf++}
 t(tag+'no two overlapping pieces on the same depth (z-fighting) -> found '+zf,zf==0);
 t(tag+'handles clear of the centre stile and muntins',L.filter((q,i)=>out[i].material.color=='#c98a5a').every(q=>Math.abs(q.o)>.1+.01));
});
/* wider door (Kantin/kelas formula) still scales */
{const o=gdoor({add(){}},0,0,Math.PI,3.2,2.5,'#7a5236',-.1);t('wide door: glass 3.2 x 2.5',o[0].geometry.w==3.2&&o[0].geometry.h==2.5)}

/* Round 10i3: the Makmal Sains gets the glass double door too, inside (js/kelas.js) and outside (js/world-build.js), same frame colour; wooden doors stay for Math and English */
{const kj=fs.readFileSync('js/kelas.js','utf8'),wb=fs.readFileSync('js/world-build.js','utf8');
 const ik=kj.match(/if\(LIB\|\|LAB\)FG\.front\.push\(\.\.\.gdoor\(sc,DX,RZ1,Math\.PI,2\*DW-\.2,2\.5,LAB\?'(#[0-9a-f]{6})':'(#[0-9a-f]{6})',-\.1\)\)/);
 t('kelas.js: glass door for LIB and LAB',!!ik);
 t('kelas.js: the Perpustakaan frame is still #3d3578',!!ik&&ik[2]=='#3d3578');
 t('kelas.js: the wooden door branch is still there for Matematik and English',/ else\{FG\.front\.push\(pn\(2\*DW-\.2,2\.5,'#d9b184'/.test(kj));
 const gd=wb.match(/const GDC=\{([^}]*)\}/),map={};gd&&gd[1].replace(/'?([A-Z ]+)'?:'(#[0-9a-f]{6})'/g,(_,n,c)=>{map[n]=c});
 t('world-build.js: GDC lists the 4 glass doors',Object.keys(map).sort().join()=='KANTIN,MAKMAL SAINS,PEJABAT,PERPUSTAKAAN');
 t('world-build.js: MATH, ENGLISH and PADANG are not glass doors',!map.MATH&&!map.ENGLISH&&!map['PADANG BALAPAN']);
 t('inside and outside Makmal Sains doors use the same frame colour',!!ik&&map['MAKMAL SAINS']==ik[1]);
 t('the other three outside frame colours are unchanged',map.PERPUSTAKAAN=='#3d3578'&&map.PEJABAT=='#5a1f2e'&&map.KANTIN=='#7a2e24');
 const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]};
 const ct=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 t('lab frame stands out from the glass (#9fcde2) and the lab wall (#d6dadf): contrast >= 3',!!ik&&ct(ik[1],'#9fcde2')>=3&&ct(ik[1],'#d6dadf')>=3);
 t('the lab door still has the wooden-door DR entry (index 0) in the world',/\['MAKMAL SAINS','#6f63c7',452,362,0,-1,'Makmal Sains'\]/.test(wb))}
console.log('gdoor: '+ok+' checks passed'+(bad?', '+bad+' FAILED':''));process.exit(bad?1:0);
