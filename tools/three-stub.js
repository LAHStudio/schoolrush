/* Round 23: tiny THREE stand-in for Node tests. Builds real vertex arrays for custom geometry and counts triangles for the built-in shapes. Not a renderer. */
function mk(){
 class V3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}copy(v){return this.set(v.x,v.y,v.z)}setScalar(v){this.x=this.y=this.z=v;return this}add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}multiplyScalar(k){this.x*=k;this.y*=k;this.z*=k;return this}length(){return Math.hypot(this.x,this.y,this.z)}normalize(){const l=this.length()||1;return this.multiplyScalar(1/l)}clone(){return new V3(this.x,this.y,this.z)}}
 class V2{constructor(x=0,y=0){this.x=x;this.y=y}}
 class Obj{constructor(){this.children=[];this.parent=null;this.position=new V3();this.rotation=new V3();this.scale=new V3(1,1,1);this.visible=true;this.userData={};this.castShadow=false;this.receiveShadow=false;this.quaternion={setFromUnitVectors(){return this}}}
  add(...a){a.forEach(c=>{c.parent=this;this.children.push(c)});return this}remove(c){this.children=this.children.filter(x=>x!==c)}
  traverse(f){f(this);this.children.forEach(c=>c.traverse(f))}}
 class Group extends Obj{constructor(){super();this.isGroup=true}}
 class Mesh extends Obj{constructor(g,m){super();this.isMesh=true;this.geometry=g;this.material=m}}
 class Attr{constructor(a,n){this.array=a;this.itemSize=n;this.count=a.length/n}getX(i){return this.array[i*this.itemSize]}getY(i){return this.array[i*this.itemSize+1]}getZ(i){return this.array[i*this.itemSize+2]}setX(i,v){this.array[i*this.itemSize]=v}setY(i,v){this.array[i*this.itemSize+1]=v}setZ(i,v){this.array[i*this.itemSize+2]=v}}
 class BG{constructor(){this.attributes={};this.index=null;this.tris=0}setAttribute(n,a){this.attributes[n]=a;return this}setIndex(i){this.index=i;return this}computeVertexNormals(){}translate(){return this}rotateX(){return this}
  get triCount(){return this.index?this.index.length/3:(this.attributes.position?this.attributes.position.count/3:this.tris)}}
 const sh=(tris)=>function(){const g=new BG();g.tris=tris;Object.defineProperty(g,'triCount',{get:()=>tris});this.attributes=g.attributes;this.triCount=tris;this.translate=()=>this;this.rotateX=()=>this;this.computeVertexNormals=()=>{}};
 const mat=function(o){Object.assign(this,o||{});this.clone=()=>Object.assign(new mat(),this);this.userData={}};
 const ctx=()=>new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='canvas'?{}:()=>({addColorStop(){}}) ),set:(t,k,v)=>{t[k]=v;return true}});
 const T={Group,Mesh,Vector2:V2,Vector3:V3,BufferGeometry:BG,Float32BufferAttribute:Attr,BufferAttribute:Attr,
  BoxGeometry:sh(12),TorusGeometry:function(r,t,rs,ts){return new (sh((rs||6)*(ts||8)*2))()},CircleGeometry:function(r,s){return new (sh(s||8))()},PlaneGeometry:sh(2),SphereGeometry:function(r,w,h){return new (sh((w||8)*(h||6)*2))()},CylinderGeometry:function(a,b,h,s){return new (sh((s||8)*4))()},ConeGeometry:function(r,h,s){return new (sh((s||8)*2))()},OctahedronGeometry:sh(8),DodecahedronGeometry:sh(36),LatheGeometry:sh(40),
  MeshPhongMaterial:mat,MeshLambertMaterial:mat,MeshBasicMaterial:mat,CanvasTexture:function(c){this.image=c},Color:function(c){this.set=()=>this;this.r=this.g=this.b=.5;this.c=c},DoubleSide:2,FrontSide:0};
 T.CylinderGeometry.prototype=Object.create(BG.prototype);
 const doc={createElement:tag=>tag==='canvas'?{width:0,height:0,getContext:()=>ctx()}:{}};
 return {T,doc};
}
const tri=g=>g.index?g.index.length/3:(g.attributes&&g.attributes.position&&g.attributes.position.count?g.attributes.position.count/3:(g.triCount||0));
function stats(root){let m=0,t=0;const mats=new Set();root.traverse(o=>{if(o.isMesh){m++;t+=tri(o.geometry);mats.add(o.material)}});return{meshes:m,tris:t,mats:mats.size}}
module.exports={mk,stats};
