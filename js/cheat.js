/* Round 19h: private keyboard codes for the owner (PC or laptop only). Nothing is shown on screen apart from one short toast.
   The codes are NOT in the source: only their length and a hash. Keys are never swallowed (E and WASD still work while typing).
   A pause of 3 s empties the typed letters. Not started at all on a device whose main pointer is a finger (phones, tablets). Global name: CHT. */
const CHT=(()=>{
 const h=s=>{let a=0xdeadbeef^7,b=0x41c6ce57^7;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}
  a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return 4294967296*(2097151&b)+(a>>>0)};
 const TB=[[12,507177868547299,'m'],[12,1044047511888964,'r']];
 const ACT={
  m:()=>{WALLET.add(1000)},
  r:()=>{if(typeof cur!=='undefined'&&cur){cur.off=0;if(typeof save==='function')save()}if(window.lockClear)window.lockClear()}};
 const S={b:'',t:0,n:0};
 function feed(c,t){if(t-S.t>3000)S.b='';S.t=t;S.b=(S.b+c).slice(-30);
  for(const q of TB){if(S.b.length>=q[0]&&h(S.b.slice(-q[0]))===q[1]){S.b='';try{ACT[q[2]]()}catch(e){return ''}S.n++;if(typeof toast==='function')toast('Kod diterima',1400);return q[2]}}return ''}
 const kb=()=>{try{return !!(window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches)}catch(e){return false}};
 function key(e){if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;if(typeof k!=='string'||k.length!==1||!/[a-z]/i.test(k))return;const g=e.target&&e.target.tagName;if(g==='INPUT'||g==='TEXTAREA')return;feed(k.toUpperCase(),Date.now())}
 if(typeof document!=='undefined'&&kb())document.addEventListener('keydown',key);
 return{h,feed,key,kb,TB,S}})();
