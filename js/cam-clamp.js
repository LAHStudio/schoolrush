/* Round 14: pure camera clamp for the walkable maps (world, luar, kantin, padang). No three.js, no globals besides these two.
   camRect(r,m): shrink a rectangle [x0,x1,z0,z1] by margin m on every side (never inverted).
   camClamp(px,pz,sx,sz,D,R): the wanted camera spot is the player + (sx,sz)*D; return the nearest point inside the union of the rectangles R.
   Open space = exactly the wanted spot, near a wall the camera slides along it. The camera height is not touched here. */
function camRect(r,m){const cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2;return[Math.min(r[0]+m,cx),Math.max(r[1]-m,cx),Math.min(r[2]+m,cz),Math.max(r[3]-m,cz)]}
function camClamp(px,pz,sx,sz,D,R){const wx=px+sx*D,wz=pz+sz*D;let bx=wx,bz=wz,bd=Infinity;for(let i=0;i<R.length;i++){const r=R[i],x=Math.max(r[0],Math.min(r[1],wx)),z=Math.max(r[2],Math.min(r[3],wz)),d=(x-wx)*(x-wx)+(z-wz)*(z-wz);if(d<bd){bd=d;bx=x;bz=z;if(d==0)break}}return[bx,bz]}
