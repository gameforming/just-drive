const S=32,$=i=>document.getElementById(i),SL=['body','engine','tires','aero'];
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const RAR=[['Common','#9aa5a8'],['Rare','#4aa8ff'],['Epic','#c065ff'],['Legendary','#ffb82e']];
const CRATES=[['Bronze',100,[80,18,2,0],'#c8763a'],['Silver',400,[45,38,14,3],'#cfd8dc'],['Gold',1500,[15,40,33,12],'#ffc933'],['Diamond',5000,[0,20,50,30],'#6ef0ff']];
const NM={body:['Falcon','Viper','Comet','Bulldog','Phantom','Racer'],engine:['V6','V8','Turbo','Boxer','V10','W12'],tires:['Street','Sport','Slick','Rally','Semi','Pro'],aero:['Lip','Wing','Diffuser','Splitter','GT-Wing','F1-Wing']};
// onderdeel: kwaliteit groeit met zeldzaamheid (r), stats krijgen een seeded random roll
function part(slot,r,seed){const R=rng(seed),q=1+r*.35,v=()=>q*(.85+R()*.3),n=NM[slot][R()*6|0];let s={};
 if(slot=='engine')s={pow:10*v(),top:10*v()};if(slot=='body')s={mass:10/v()};
 if(slot=='tires')s={grip:6*v()};if(slot=='aero')s={down:2*v()};
 return{slot,r,s,hue:R()*360|0,name:n+' '+['I','II','III','IV'][r]}}
function stats(P){const e=P.engine.s,b=P.body.s,t=P.tires.s,a=P.aero.s;
 return{acc:e.pow*14/Math.sqrt(b.mass/10),max:(250+e.top*12)*(1-.01*a.down),grip:t.grip,down:a.down,mass:b.mass}}
// ---- sprites: alles 32x32 ----
const mk=f=>{const c=document.createElement('canvas');c.width=c.height=S;f(c.getContext('2d'));return c};
const fr=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const tex=(b,seed,pal)=>mk(g=>{const R=rng(seed);fr(g,b,0,0,S,S);for(let i=0;i<50;i++)fr(g,pal[R()*pal.length|0],(R()*16|0)*2,(R()*16|0)*2,2,2)});
const TL={road:[1,2].map(i=>tex('#4a4d55',i,['#40434b','#555962'])),grass:[3,4].map(i=>tex('#3b8a3e',i,['#337a36','#47a04a'])),
 curb:[0,1].map(i=>mk(g=>{for(let k=0;k<4;k++)fr(g,(k+i)%2?'#e33':'#eee',0,k*8,S,8)})),
 start:mk(g=>{for(let i=0;i<16;i++)fr(g,(i+(i>>2))%2?'#fff':'#111',(i%4)*8,(i>>2)*8,8,8)}),
 wall:[mk(g=>{fr(g,'#6a5a7a',0,0,S,S);for(let x=3;x<S;x+=8)for(let y=3;y<S;y+=8)fr(g,(x*y)%3?'#ffd86b':'#2a2f45',x,y,4,5)}),
  tex('#222',7,['#d33','#eee','#444'])]};
const cc={};
function carSprite(h,ar){const k=h+'_'+ar;return cc[k]||(cc[k]=mk(g=>{
 [[7,5],[21,5],[7,21],[21,21]].forEach(([x,y])=>fr(g,'#111',x,y,4,6));
 fr(g,`hsl(${h},75%,50%)`,10,2,12,26);fr(g,`hsl(${h},75%,50%)`,8,11,16,11);fr(g,`hsl(${h},75%,32%)`,14,2,4,26);
 fr(g,'#9df',12,10,8,5);const w=12+ar*4;fr(g,'#222',16-w/2,27,w,3)}))}
function icon(p){return mk(g=>{const c=RAR[p.r][1];
 if(p.slot=='body')g.drawImage(carSprite(p.hue,0),0,0);
 if(p.slot=='engine'){fr(g,'#555',4,8,24,16);for(let i=0;i<4;i++)fr(g,c,6+i*6,5,4,8)}
 if(p.slot=='tires'){g.fillStyle='#111';g.beginPath();g.arc(16,16,13,0,7);g.fill();g.fillStyle=c;g.beginPath();g.arc(16,16,6,0,7);g.fill()}
 if(p.slot=='aero'){fr(g,'#333',4,8,24,5);fr(g,c,4,8,24,2);fr(g,'#333',8,13,3,10);fr(g,'#333',21,13,3,10)}})}
const crateIcon=c=>mk(g=>{fr(g,c,4,8,24,20);fr(g,'#0006',4,16,24,3);fr(g,'#fff8',14,8,4,20);fr(g,'#0004',4,8,24,3)});
