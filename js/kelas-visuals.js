/* Round 10c: the 14 quiz pictures, all drawn as inline SVG from code (no images, no outside files, nothing marks the right answer).
   qvisual(visualId) returns an SVG string. Charts: bars(...) draws exact bar heights, a whole-number scale, value labels and category labels. */
const QV_INK='#16204a',QV_C=['#6fa8e8','#ffd23f','#ff9a76','#7bd389','#b39ddb'];
const sv=(w,h,b,al)=>'<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+al+'" font-family="Fredoka,sans-serif">'+b+'</svg>';
const tx=(x,y,t,s,a,c)=>'<text x="'+x+'" y="'+y+'" font-size="'+(s||12)+'" text-anchor="'+(a||'middle')+'" fill="'+(c||QV_INK)+'" font-weight="600">'+t+'</text>';
const ln=(x1,y1,x2,y2,c,w,d)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(c||QV_INK)+'" stroke-width="'+(w||2)+'"'+(d?' stroke-dasharray="'+d+'"':'')+' stroke-linecap="round"/>';
const poly=(p,f)=>'<polygon points="'+p+'" fill="'+f+'" stroke="'+QV_INK+'" stroke-width="2.5" stroke-linejoin="round"/>';
function bars(d,max,step,ylab,al){const W=420,H=240,L=58,R=14,T=22,B=44,pw=W-L-R,ph=H-T-B;let o='';
 for(let v=0;v<=max;v+=step){const y=T+ph-ph*v/max;o+=ln(L,y,W-R,y,v?'#d5deec':QV_INK,v?1:2)+tx(L-8,y+5,v,13,'end')}
 o+=ln(L,T,L,T+ph,QV_INK,2)+'<text transform="translate(14 '+(T+ph/2)+') rotate(-90)" font-size="13" text-anchor="middle" fill="'+QV_INK+'" font-weight="600">'+ylab+'</text>';
 const bw=pw/d.length;d.forEach((e,i)=>{const h=ph*e[1]/max,x=L+i*bw+bw*.2,w=bw*.6,y=T+ph-h;o+='<rect class="bar" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="'+QV_C[i%5]+'" stroke="'+QV_INK+'" stroke-width="2"/>'+tx(x+w/2,y-5,e[1],14)+tx(x+w/2,T+ph+17,e[0],e[0].length>9?12:13)});
 return sv(W,H,o,al)}
/* a cube seen from a corner. Vertices: top T0(130,30) T1(210,70) T2(130,110) T3(50,70); bottom B1(210,160) B2(130,200) B3(50,160); hidden back-bottom B0(130,120) */
function cube(mode){let o='';
 if(mode=='faces')o+=poly('130,30 210,70 130,110 50,70','#b9d6f7')+poly('50,70 130,110 130,200 50,160','#6fa8e8')+poly('210,70 130,110 130,200 210,160','#4a86c8')+ln(130,120,210,160,'#7b88a8',2,'6 6')+ln(130,120,50,160,'#7b88a8',2,'6 6')+ln(130,120,130,30,'#7b88a8',2,'6 6');
 else{o+=ln(130,120,210,160,'#7b88a8',2.5,'7 6')+ln(130,120,50,160,'#7b88a8',2.5,'7 6')+ln(130,120,130,30,'#7b88a8',2.5,'7 6');
  [[130,30,210,70],[210,70,130,110],[130,110,50,70],[50,70,130,30],[50,70,50,160],[130,110,130,200],[210,70,210,160],[50,160,130,200],[130,200,210,160]].forEach(e=>o+='<line class="edge" x1="'+e[0]+'" y1="'+e[1]+'" x2="'+e[2]+'" y2="'+e[3]+'" stroke="'+QV_INK+'" stroke-width="4" stroke-linecap="round"/>');
  [[130,30],[210,70],[130,110],[50,70],[210,160],[130,200],[50,160],[130,120]].forEach(p=>o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="#ffd23f" stroke="'+QV_INK+'" stroke-width="2"/>')}
 return sv(260,230,o,mode=='faces'?'Sebuah kubus':'Sebuah kubus dengan semua rusuk')}
function penBox(x){let o='<rect x="'+x+'" y="120" width="92" height="46" rx="9" fill="#f2dcae" stroke="'+QV_INK+'" stroke-width="2.5"/>';const cs=['#ff6b6b','#4dabf7','#ffd23f','#51cf66','#cc5de8'];
 for(let k=0;k<5;k++){const px=x+9+k*16;o+='<g class="pencil"><rect x="'+px+'" y="46" width="11" height="84" fill="'+cs[k]+'" stroke="'+QV_INK+'" stroke-width="1.8"/><polygon points="'+px+',46 '+(px+11)+',46 '+(px+5.5)+',28" fill="#f6d9a8" stroke="'+QV_INK+'" stroke-width="1.8" stroke-linejoin="round"/><polygon points="'+(px+3.5)+',34 '+(px+7.5)+',34 '+(px+5.5)+',28" fill="'+QV_INK+'"/></g>'}
 return o+'<rect x="'+x+'" y="132" width="92" height="34" rx="9" fill="#f2dcae" stroke="'+QV_INK+'" stroke-width="2.5"/>'}
const QVIS={
E03_SHAPES_2D(){const p=(cx,cy,r)=>[0,1,2,3,4].map(i=>(cx+r*Math.cos((-90+72*i)*Math.PI/180)).toFixed(1)+','+(cy+r*Math.sin((-90+72*i)*Math.PI/180)).toFixed(1)).join(' ');
 /* Round 10c2: labelled A to D in this order: bulatan, segi empat sama, segi tiga, segi lima */
 let o='<circle cx="56" cy="62" r="34" fill="'+QV_C[2]+'" stroke="'+QV_INK+'" stroke-width="2.5"/>'+'<rect x="126" y="31" width="62" height="62" fill="'+QV_C[1]+'" stroke="'+QV_INK+'" stroke-width="2.5"/>'+poly('263,26 298,96 228,96',QV_C[0])+'<polygon points="'+p(365,64,38)+'" fill="'+QV_C[3]+'" stroke="'+QV_INK+'" stroke-width="2.5" stroke-linejoin="round"/>';
 return sv(420,140,o+[56,157,263,365].map((x,i)=>tx(x,128,'ABCD'[i],16)).join(''),'Empat bentuk berlabel A hingga D')},
E04_SHAPES_3D(){let o='<defs><radialGradient id="sg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e3f0ff"/><stop offset="1" stop-color="#4a86c8"/></radialGradient></defs>';
 /* Round 10c2: labelled A to D in this order: kubus, sfera, kon, silinder */
 o+='<g transform="translate(-92 0)">'+poly('148,40 190,58 148,76 106,58','#b9d6f7')+poly('106,58 148,76 148,124 106,106','#6fa8e8')+poly('190,58 148,76 148,124 190,106','#4a86c8')+'</g>';
 o+='<g transform="translate(-112 0)"><circle cx="260" cy="82" r="40" fill="url(#sg)" stroke="'+QV_INK+'" stroke-width="2.5"/></g>';
 o+='<g transform="translate(-95 0)"><path d="M355 38 L318 112 A37 12 0 0 0 392 112 Z" fill="'+QV_C[2]+'" stroke="'+QV_INK+'" stroke-width="2.5" stroke-linejoin="round"/></g>';
 o+='<g transform="translate(299 0)"><path d="M24 52 L24 112 A32 11 0 0 0 88 112 L88 52 Z" fill="'+QV_C[1]+'" stroke="'+QV_INK+'" stroke-width="2.5"/><ellipse cx="56" cy="52" rx="32" ry="11" fill="#ffe680" stroke="'+QV_INK+'" stroke-width="2.5"/></g>';
 return sv(420,170,o+[56,148,260,355].map((x,i)=>tx(x,152,'ABCD'[i],16)).join(''),'Empat bentuk tiga dimensi berlabel A hingga D')},
E07_PENCIL_BOXES(){return sv(420,190,[8,108,208,308].map(penBox).join(''),'Empat kotak pensel, setiap kotak ada lima batang pensel')},
E09_FRUIT_PICTOGRAPH(){let o='';const row=(y,name,n,ic)=>{o+=tx(14,y+6,name,15,'start')+ln(96,y+26,408,y+26,'#d5deec',1);for(let i=0;i<n;i++)o+='<g class="ic" transform="translate('+(122+i*50)+' '+y+')">'+ic+'</g>'};
 row(40,'Epal',5,'<circle r="17" fill="#ff5d5d" stroke="'+QV_INK+'" stroke-width="2.2"/><path d="M0 -17 Q4 -26 12 -24 Q6 -17 0 -17Z" fill="#51cf66" stroke="'+QV_INK+'" stroke-width="1.6"/>');
 row(100,'Pisang',3,'<path d="M-17 -6 Q0 18 20 -12 Q6 22 -17 -6Z" fill="#ffd23f" stroke="'+QV_INK+'" stroke-width="2.2" stroke-linejoin="round"/><rect x="17" y="-17" width="4" height="8" fill="#8a5a3a"/>');
 row(160,'Oren',4,'<circle r="17" fill="#ff9f1c" stroke="'+QV_INK+'" stroke-width="2.2"/><circle cx="-6" cy="-6" r="4" fill="#ffd9a0"/>');
 return sv(420,230,o+tx(210,218,'1 ikon = 1 biji buah',13),'Piktograf buah')},
E10_BOOKS_CHART(){return bars([['Isnin',6],['Selasa',8],['Rabu',5]],10,1,'Bilangan buku','Carta bilangan buku yang dibaca')},
M03_CUBE_FACES(){return cube('faces')},
M04_CYLINDER(){let o='<defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stop-color="#8dbbef"/><stop offset=".55" stop-color="#6fa8e8"/><stop offset="1" stop-color="#4a86c8"/></linearGradient></defs>';
 o+='<path d="M50 52 L50 172 A70 22 0 0 0 190 172 L190 52 Z" fill="url(#cg)" stroke="'+QV_INK+'" stroke-width="2.5"/><ellipse cx="120" cy="52" rx="70" ry="22" fill="#d6e8fb" stroke="'+QV_INK+'" stroke-width="2.5"/>';
 return sv(240,215,o,'Sebuah silinder')},
M09_SALES_CHART(){return bars([['Isnin',12],['Selasa',18],['Rabu',15],['Khamis',20]],25,5,'Unit jualan','Carta jualan')},
M10_SPORTS_CHART(){return bars([['Bola sepak',12],['Badminton',9],['Bola jaring',7],['Olahraga',8]],15,5,'Bilangan murid','Carta murid aktiviti sukan')},
H03_CUBE_EDGES(){return cube('edges')},
H04_RECTANGLE_PERIMETER(){const ar=(x1,y1,x2,y2)=>ln(x1,y1,x2,y2,QV_INK,2)+ln(x1,y1,x1+(x2>x1?9:x2<x1?-9:0),y1+(y2>y1?9:y2<y1?-9:0),QV_INK,2)+ln(x2,y2,x2-(x2>x1?9:x2<x1?-9:0),y2-(y2>y1?9:y2<y1?-9:0),QV_INK,2);
 let o='<rect x="60" y="56" width="240" height="140" fill="'+QV_C[0]+'" stroke="'+QV_INK+'" stroke-width="3"/>';
 o+=ln(60,40,300,40,QV_INK,2)+'<polygon points="60,40 72,35 72,45" fill="'+QV_INK+'"/><polygon points="300,40 288,35 288,45" fill="'+QV_INK+'"/>'+tx(180,30,'12 cm',16);
 o+=ln(326,56,326,196,QV_INK,2)+'<polygon points="326,56 321,68 331,68" fill="'+QV_INK+'"/><polygon points="326,196 321,184 331,184" fill="'+QV_INK+'"/>'+tx(334,132,'7 cm',16,'start');
 return sv(390,215,o,'Segi empat tepat panjang 12 cm lebar 7 cm')},
H06_WATER_JUG(){let o='<rect x="50" y="140" width="100" height="90" fill="#7cc4f5" opacity=".9"/>';
 o+='<path d="M40 40 L40 232 Q40 240 48 240 L152 240 Q160 240 160 232 L160 40" fill="none" stroke="'+QV_INK+'" stroke-width="3.5" stroke-linejoin="round"/><path d="M160 80 Q196 80 196 118 Q196 156 160 156" fill="none" stroke="'+QV_INK+'" stroke-width="3.5"/>';
 for(let k=0;k<=6;k++){const y=230-30*k;o+=ln(150,y,k%2?136:128,y,QV_INK,2);if(k%2==0)o+=tx(120,y-4,(k/2)+' L',11,'end')}
 o+=ln(40,140,160,140,'#1c6fb0',2.5)+tx(100,22,'Jag',15)+tx(100,134,'1.5 L',13,'middle','#0f4c81');
 o+='<rect x="262" y="170" width="76" height="64" fill="#7cc4f5" opacity=".9"/><path d="M252 110 L252 232 Q252 240 260 240 L340 240 Q348 240 348 232 L348 110" fill="none" stroke="'+QV_INK+'" stroke-width="3.5" stroke-linejoin="round"/>'+ln(262,170,338,170,'#1c6fb0',2.5)+tx(300,22,'Bekas',15)+tx(300,98,'750 mL',15);
 return sv(380,255,o,'Sebuah jag 1.5 liter air dan sebuah bekas 750 mililiter')},
H09_LIBRARY_CHART(){return bars([['Isnin',24],['Selasa',35],['Rabu',28],['Khamis',41]],50,10,'Bilangan buku','Carta buku dipinjam')},
H10_GROUP_BOOKS_CHART(){return bars([['Kumpulan A',8],['Kumpulan B',12],['Kumpulan C',9],['Kumpulan D',11]],15,5,'Bilangan buku','Carta buku dibaca oleh kumpulan')}
};
const qvisual=id=>QVIS[id]?QVIS[id]():'';
