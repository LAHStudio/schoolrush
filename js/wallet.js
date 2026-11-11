/* Round 15b: coin wallet. The ONLY place that changes money. Whole sen in cur.w.c (RM1.00 = 100). Old saves without cur.w read as 0.
   Needs core.js (cur, save); HUD is optional (HUD.set({}) repaints the money row). One wallet per save slot, shared by Mod Kelas and Mod Jalan-jalan.
   Prices are all in CFG: earn = by rubbish type (0 kertas, 1 plastik, 2 kaca, 3 biasa), stall = by stall order, ice and nasi are for later rounds. Round 16: shop = kedai runcit prices by item (gula, pisang, iso, epal). Global name: WALLET. */
const WALLET=(()=>{
 const CFG={pocket:300,earn:[30,40,50,10],stall:[100,150,100,100,100],ice:100,nasi:150,shop:{gula:50,pisang:150,iso:300,epal:300,cap:400,eye:400,beard:400,mos:400}};
 const C=()=>typeof cur!='undefined'?cur:null,fix=v=>Math.max(0,Math.floor(+v||0));
 const get=()=>{const c=C();return c&&c.w&&typeof c.w=='object'?fix(c.w.c):0};
 function put(n){const c=C();if(!c)return 0;if(!c.w||typeof c.w!='object')c.w={};c.w.c=fix(n);if(typeof save=='function')save();if(typeof HUD!='undefined'&&HUD&&HUD.set)HUD.set({});return c.w.c}
 const add=n=>{n=fix(n);return n?put(get()+n):get()};
 const spend=n=>{n=fix(n);if(n>get())return false;if(n)put(get()-n);return true};
 const topUp=lv=>{lv=fix(lv);const g=get();if(g>=lv)return 0;put(lv);return lv-g};
 const earn=t=>{const n=CFG.earn[t]||0;add(n);return n};
 const fmt=c=>'RM'+(fix(c)/100).toFixed(2);
 return{CFG,get,add,spend,topUp,earn,fmt}
})();
