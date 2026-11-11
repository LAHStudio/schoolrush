/* Round 11 (11b: no crowd chatter in the Kantin; only the Padang has an ambience, the cheer): music and sound effects, all made in the browser with Web Audio (no audio files, no licences).
   One global name: SRA. It uses core.js (au, actx, SET.snd / vol / mus / mvol, SS) and only READS the scene's P, halt and mode.
   Music is picked from the page (index = menu, world = hall, kantin, padang, kelas = mat / eng / bm / sains) and
   follows the Tetapan sliders live. Footsteps, jump and landing are found by watching P, so the scenes need no per-frame hooks. */
const SRA=(function(){
const SCL={pen:[0,2,4,7,9],lyd:[0,2,4,6,7,9,11]};
/* bpm, root (Hz), scale, 4 chords [semitone, minor?], dens = melody density, lead voice, bs = bass pattern (8 steps), ar = arpeggio level,
   sh = shaker level, ki = kick pattern, sw = swing, seed, amb = ambience */
const TR={
 menu:{bpm:84,root:261.63,sc:'pen',ch:[[0,0],[9,1],[5,0],[7,0]],dens:.5,lead:'mar',bs:'x...x...',ar:.06,sh:0,ki:'',sw:0,seed:11},
 hall:{bpm:96,root:246.94,sc:'pen',ch:[[0,0],[7,0],[9,1],[5,0]],dens:.55,lead:'mar',bs:'x.x.x.x.',ar:0,sh:.02,ki:'',sw:.08,seed:23},
 mat:{bpm:88,root:220,sc:'pen',ch:[[0,0],[5,0],[7,0],[0,0]],dens:.45,lead:'bell',bs:'x...x...',ar:.05,sh:0,ki:'',sw:0,seed:37},
 eng:{bpm:92,root:233.08,sc:'pen',ch:[[0,0],[9,1],[2,1],[7,0]],dens:.5,lead:'pluck',bs:'x...x.x.',ar:.04,sh:.015,ki:'',sw:.06,seed:41},
 bm:{bpm:66,root:196,sc:'pen',ch:[[0,0],[5,0],[0,0],[7,0]],dens:.28,lead:'bell',bs:'x.......',ar:.07,sh:0,ki:'',sw:0,seed:53},
 sains:{bpm:110,root:261.63,sc:'lyd',ch:[[0,0],[2,0],[0,0],[9,1]],dens:.6,lead:'blip',bs:'x..x..x.',ar:0,sh:.02,ki:'',sw:.12,seed:67},
 kantin:{bpm:118,root:293.66,sc:'pen',ch:[[0,0],[5,0],[7,0],[0,0]],dens:.62,lead:'mar',bs:'x.x.x.xx',ar:0,sh:.04,ki:'x...x...',sw:.22,seed:71},
 padang:{bpm:128,root:329.63,sc:'pen',ch:[[0,0],[7,0],[9,1],[5,0]],dens:.7,lead:'pluck',bs:'x.x.x.x.',ar:0,sh:.05,ki:'x...x...',sw:0,seed:89,amb:'cheer'},
 luar:{bpm:100,root:277.18,sc:'pen',ch:[[0,0],[5,0],[7,0],[9,1]],dens:.5,lead:'pluck',bs:'x.x.x.x.',ar:.03,sh:.02,ki:'',sw:.1,seed:97,amb:'road'} /* Round 12: Luar Sekolah, with a soft car whoosh now and then */
};
let bus=null,noise=null,trk=null,tn='',bp=[],wi=0,stp=0,nx=0,dk=0,ambT=0,lastTone=0,lastPop=0,lp=null,acc=0,air=0,gnd=true,alt=0;
const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const safe=f=>function(){try{return f.apply(this,arguments)}catch(e){}};
const A=()=>(typeof au!='undefined'&&au)||null;
const sfxV=()=>(SET.snd||0)*(SET.vol||0);
const paused=()=>{const m=document.getElementById('menu');return !!(m&&m.classList.contains('pz')&&m.style.display!='none')};
function sceneName(){const p=(location.pathname.split('/').pop()||'').replace('.html','');
 if(document.body.classList.contains('idx')||p==''||p=='index')return'menu';
 if(p=='world')return'hall';if(p=='kantin')return'kantin';if(p=='padang')return'padang';if(p=='luar')return'luar';
 if(p=='kelas'){let s='mat';try{s=SS.get('sk_kelas')||'mat'}catch(e){}return TR[s]?s:'mat'}
 return''}
function nz(a){if(!noise||noise.sampleRate!=a.sampleRate){const n=a.sampleRate;noise=a.createBuffer(1,n,n);const d=noise.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}return noise}
/* one oscillator note with a quick attack and an exponential fade; dest defaults to the music bus */
function nt(a,t,f,d,ty,v,dest){const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest||bus);o.start(t);o.stop(t+d+.02)}
/* oscillator that glides from f0 to f1 */
function gl(a,t,f0,f1,d,ty,v,dest){const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest||a.destination);o.start(t);o.stop(t+d+.02)}
/* filtered noise burst */
function hit(a,t,d,ty,f,q,v,dest){const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=nz(a);fl.type=ty;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(Math.max(.0002,v),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(dest||a.destination);s.start(t,Math.random()*.8);s.stop(t+d+.02)}
function leadNote(a,T,t,f){const L=T.lead;
 if(L=='mar'){nt(a,t,f,.45,'sine',.22);nt(a,t,f*4,.08,'sine',.07)}
 else if(L=='blip'){nt(a,t,f,.16,'triangle',.2);nt(a,t,f*2,.06,'square',.03)}
 else if(L=='bell'){nt(a,t,f,.9,'sine',.2);nt(a,t,f*2.76,.25,'sine',.04)}
 else{nt(a,t,f,.22,'triangle',.22);nt(a,t,f*2,.1,'sine',.06)}}
/* melody of one bar (8 steps): form A B A C, loops every 4 bars exactly; -1 = rest */
function mkBar(T,b){const form=[0,1,0,2][b%4],r=mul(T.seed*31+form*977),n=SCL[T.sc].length,o=[];
 if(b%4==0)wi=n;
 for(let s=0;s<8;s++){if(r()<T.dens*(s%2==0?1.1:.7)){wi=Math.max(0,Math.min(n*2-1,wi+[-2,-1,-1,0,1,1,2][Math.floor(r()*7)]));o.push(wi)}else o.push(-1)}
 return o}
const semi=(T,i)=>{const n=SCL[T.sc].length;return SCL[T.sc][i%n]+12*Math.floor(i/n)};
function sched(a,T,t,s){const bar=Math.floor(s/8),k=s%8,ch=T.ch[bar%4],sd=60/T.bpm/2,tt=t+(k%2?T.sw*sd:0);
 if(k==0)bp=mkBar(T,bar);
 if(bp[k]>=0)leadNote(a,T,tt,T.root*Math.pow(2,semi(T,bp[k])/12));
 if(T.bs[k]=='x')nt(a,tt,T.root/2*Math.pow(2,ch[0]/12),sd*2.6,'triangle',.3);
 if(T.ar){const ct=[0,ch[1]?3:4,7,ch[1]?3:4][k%4];nt(a,tt,T.root*Math.pow(2,(ch[0]+ct)/12),.3,'sine',T.ar)}
 if(T.sh)hit(a,tt,.05,'highpass',6000,.7,k%2?T.sh:T.sh*.6,bus);
 if(T.ki[k]=='x')gl(a,tt,130,45,.14,'sine',.15,bus)}
/* music level: 0 when off, hidden tab or Pause menu; ducked while the bell rings, a quiz or a mini game is open */
function lvl(ms){if(!SET.snd||!SET.mus||document.hidden||paused())return 0;
 let f=1;if(ms<dk)f=.3;else if(tn!='menu'&&document.body.classList.contains('mn'))f=.45;
 return SET.snd*SET.mus*(SET.mvol||0)*.4*f}
/* footsteps, jump and landing found by watching the player */
function mvPoll(now){let p=null,h=true,md='walk';try{p=P;h=halt;if(typeof mode!='undefined')md=mode}catch(e){}
 if(!p||typeof p.x!='number'){lp=null;return}
 if(!lp){lp={x:p.x,z:p.z,t:now};return}
 const dt=now-lp.t;if(dt<.04)return;const d=Math.hypot(p.x-lp.x,p.z-lp.z),sp=d/dt;lp={x:p.x,z:p.z,t:now};
 if(h||md!='walk'){acc=0;return}
 const up=p.y>.08;
 if(gnd&&up&&(p.vy||0)>0){gnd=false;air=0;jump()}else if(!gnd){air+=dt;if(!up){gnd=true;if(air>.2)land()}}
 if(up||sp<.9||sp>18){if(sp<.9)acc=.3;return}
 acc+=dt;const iv=Math.max(.17,Math.min(.5,1.9/sp));if(acc>=iv){acc=0;foot()}}
function amb(ms){if(!trk||!trk.amb||ms<ambT||paused()||document.hidden)return;const a=A(),v=sfxV();if(!a||v<=0)return;const t=a.currentTime+.01;
 if(trk.amb=='cheer'){ambT=ms+9000+Math.random()*7000;const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=nz(a);fl.type='bandpass';fl.frequency.value=1400;fl.Q.value=.7;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.35*v,t+.25);g.gain.setValueAtTime(.35*v,t+.7);g.gain.exponentialRampToValueAtTime(.0001,t+1.5);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t,Math.random()*.4);s.stop(t+1.6)}
 if(trk.amb=='road'){ambT=ms+6000+Math.random()*5000;const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=nz(a);fl.type='lowpass';fl.frequency.value=700;fl.Q.value=.5;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.16*v,t+.9);g.gain.exponentialRampToValueAtTime(.0001,t+2.2);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t,Math.random()*.4);s.stop(t+2.3)}}
function step(ms){const a=A();if(!a||a.state!='running')return;
 mvPoll(ms/1000);amb(ms);
 const L=lvl(ms);if(!bus){bus=a.createGain();bus.gain.value=0;bus.connect(a.destination)}
 bus.gain.setTargetAtTime(L,a.currentTime,.12);
 if(L<=.001||!trk){nx=0;return}
 if(!nx||nx<a.currentTime)nx=a.currentTime+.06;
 const sd=60/trk.bpm/2;while(nx<a.currentTime+.5){sched(a,trk,nx,stp);nx+=sd;stp++}}
function sx(){if(sfxV()<=0)return null;try{return actx()}catch(e){return null}}
/* ---- sound effects ---- */
const foot=safe(()=>{const a=sx();if(!a)return;const v=sfxV(),t=a.currentTime+.005,s=(alt^=1)?1:.85;
 if(tn=='padang')hit(a,t,.07,'lowpass',500+Math.random()*200,.7,.3*v*s);else hit(a,t,.05,'bandpass',1400+Math.random()*350,.8,.25*v*s)});
const jump=safe(()=>{const a=sx();if(a)gl(a,a.currentTime+.005,280,480,.1,'sine',.1*sfxV())});
const land=safe(()=>{const a=sx();if(!a)return;const t=a.currentTime+.005,v=sfxV();hit(a,t,.07,'lowpass',350,.7,.5*v);gl(a,t,120,70,.09,'sine',.1*v)});
const click=safe(()=>{const a=sx();if(a)gl(a,a.currentTime+.005,900,600,.04,'triangle',.08*sfxV())});
const pop=safe(()=>{const n=Date.now();if(n-lastPop<250)return;lastPop=n;const a=sx();if(a)gl(a,a.currentTime+.005,600,900,.07,'sine',.07*sfxV())});
const door=safe(()=>{const a=sx();if(!a)return;const t=a.currentTime+.02,v=sfxV();
 hit(a,t,.03,'bandpass',2600,3,.5*v);
 const o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o.frequency.setValueAtTime(150,t+.04);o.frequency.linearRampToValueAtTime(230,t+.44);f.type='lowpass';f.frequency.value=500;
 g.gain.setValueAtTime(.0001,t+.04);g.gain.linearRampToValueAtTime(.06*v,t+.12);g.gain.exponentialRampToValueAtTime(.0001,t+.46);o.connect(f);f.connect(g);g.connect(a.destination);o.start(t+.04);o.stop(t+.5);
 hit(a,t+.45,.1,'lowpass',300,.7,.7*v);gl(a,t+.45,110,60,.12,'sine',.12*v)});
const sip=safe(()=>{const a=sx();if(!a)return;const v=sfxV();for(let i=0;i<3;i++){const t=a.currentTime+.01+i*.24;gl(a,t,320,170,.14,'sine',.16*v);hit(a,t,.12,'lowpass',500,.8,.3*v)}});
const bin=safe(()=>{const a=sx();if(!a)return;const t=a.currentTime+.01,v=sfxV();gl(a,t,170,60,.13,'sine',.2*v);hit(a,t,.14,'bandpass',2800,1,.12*v)});
const whistle=safe(()=>{const a=sx();if(!a)return;const v=sfxV();[0,.3].forEach(d=>{const t=a.currentTime+.02+d,o=a.createOscillator(),l=a.createOscillator(),lg=a.createGain(),g=a.createGain();
 o.type='sine';o.frequency.value=2850;l.frequency.value=28;lg.gain.value=.03*v;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.06*v,t+.02);g.gain.setValueAtTime(.06*v,t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+.24);
 l.connect(lg);lg.connect(g.gain);o.connect(g);g.connect(a.destination);o.start(t);l.start(t);o.stop(t+.26);l.stop(t+.26)})});
const duckFor=secs=>{dk=Date.now()+(secs||2)*1000};
function play(name){trk=TR[name]||null;tn=name||'';stp=0;nx=0;wi=0;bp=[]}
/* ---- hooks: wrap core.js functions so the scenes need no edits ---- */
function wrap(n,f){const o=window[n];if(typeof o!='function'||o.__sra)return;const w=function(){try{f.apply(this,arguments)}catch(e){}return o.apply(this,arguments)};w.__sra=1;window[n]=w}
wrap('tone',()=>{lastTone=Date.now()});
wrap('bellSound',a=>{duckFor((a||2.2)+.4)});
wrap('loading',fn=>{if(/nav\(/.test(String(fn)))door()});
if(typeof document!='undefined'&&document.addEventListener){
 document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('button');if(!b||b.disabled)return;setTimeout(()=>{if(Date.now()-lastTone>120)click()},0)});
 const start=()=>{play(sceneName());
  const bb=document.getElementById('bub');if(bb&&window.MutationObserver)new MutationObserver(()=>pop()).observe(bb,{childList:true});
  setInterval(()=>step(Date.now()),50)};
 if(document.readyState=='loading')document.addEventListener('DOMContentLoaded',start);else start()}
return{play,door,click,pop,sip,bin,whistle,jump,land,foot,duckFor,
 _t:{TR,SCL,sceneName,step,mvPoll,lvl,mkBar,semi,reset:()=>{bus=null;lp=null;acc=0;air=0;gnd=true;ambT=0;dk=0;stp=0;nx=0;bp=[];wi=0},state:()=>({tn,stp,nx,trk})}}})();
