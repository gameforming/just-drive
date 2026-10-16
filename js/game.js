let G=JSON.parse(localStorage.rg||'null');
function newGame(){const P=SL.map((s,i)=>({id:i,...part(s,0,i+1)}));return{coins:300,next:4,parts:P,eq:{body:0,engine:1,tires:2,aero:3},hue:0}}
if(!G)G=newGame();const save=()=>{localStorage.rg=JSON.stringify(G);$('coins').textContent='💰 '+G.coins};
const eqP=()=>{const o={};SL.forEach(s=>o[s]=G.parts.find(p=>p.id==G.eq[s]));return o};
const card=(p,eq)=>{const d=document.createElement('div');d.className='card'+(eq?' eq':'');d.style.borderColor=RAR[p.r][1];
 d.append(icon(p));d.append(`${p.name}\n${p.slot}\n`+Object.entries(p.s).map(([k,v])=>k+' '+v.toFixed(1)).join(' · '));return d};
function garage(){const P=eqP(),s=stats(P);$('st').innerHTML=`<h3>Jouw auto</h3>Acceleratie ${s.acc|0} · Topsnelheid ${s.max|0} · Grip ${s.grip.toFixed(1)} · Downforce ${s.down.toFixed(1)} · Gewicht ${s.mass.toFixed(1)}<br><small>Tip: downforce = meer grip in bochten (stratencircuit), maar lagere topsnelheid.</small>`;
 const g=$('pv').getContext('2d');g.clearRect(0,0,128,128);g.imageSmoothingEnabled=false;g.drawImage(carSprite(P.body.hue,P.aero.r),0,0,128,128);
 $('inv').innerHTML='';SL.forEach(sl=>{$('inv').append(document.createElement('hr'));G.parts.filter(p=>p.slot==sl).sort((a,b)=>b.r-a.r).forEach(p=>{
  const c=card(p,G.eq[sl]==p.id);c.onclick=()=>{G.eq[sl]=p.id;save();garage()};
  if(G.eq[sl]!=p.id){const b=document.createElement('button');b.textContent='Verkoop +'+(20*(p.r+1)**2);b.onclick=e=>{e.stopPropagation();G.coins+=20*(p.r+1)**2;G.parts=G.parts.filter(x=>x!=p);save();garage()};c.append(b)}
  $('inv').append(c)})})}
function shop(){$('cr').innerHTML='';CRATES.forEach(([n,pr,w,c])=>{const d=document.createElement('div');d.className='card';d.style.borderColor=c;d.append(crateIcon(c),`${n} crate\n💰 ${pr}\n`+w.map((x,i)=>RAR[i][0][0]+x+'%').join(' '));
 d.onclick=()=>{if(G.coins<pr)return alert('Te weinig coins!');G.coins-=pr;let r=Math.random()*100,k=0;while(k<3&&r>=w[k])r-=w[k++];
  const p={id:G.next++,...part(SL[Math.random()*4|0],k,Math.random()*1e9|0)};G.parts.push(p);save();
  $('rev').innerHTML='';const cr=crateIcon(c);cr.className='shake';cr.style.width='64px';$('rev').append(cr);
  setTimeout(()=>{$('rev').innerHTML='Je kreeg:<br>';$('rev').append(card(p))},700)};$('cr').append(d)})}
document.querySelectorAll('#bar [data-t]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.p').forEach(p=>p.classList.remove('on'));$(b.dataset.t).classList.add('on');garage();shop()});
$('rs').onclick=()=>{if(confirm('Alles wissen?')){G=newGame();save();garage()}};$('rnd').onclick=()=>$('seed').value=Math.random()*1e5|0;
// ---- race ----
const keys={};onkeydown=e=>{keys[e.key.toLowerCase()]=1;if(e.key=='Escape')stop()};onkeyup=e=>keys[e.key.toLowerCase()]=0;
let R=null;const cv=$('cv'),ctx=cv.getContext('2d');
$('go').onclick=()=>{const K=genTrack(+$('seed').value||1,+$('tt').value),s=stats(eqP()),f=+$('df').value,cars=[];
 for(let i=0;i<5;i++){const pl=i==0,idx=(K.N-4*(i+1)+K.N)%K.N,a=K.path[idx],b=K.path[(idx+1)%K.N],an=Math.atan2(b[1]-a[1],b[0]-a[0]),o=(i%2?.9:-.9);
  const k=pl?1:f*(.85+Math.random()*.2),ts=pl?s:{acc:s.acc*k,max:s.max*k,grip:s.grip*k,down:s.down*k};
  cars.push({pl,x:(a[0]-Math.sin(an)*o)*S,y:(a[1]+Math.cos(an)*o)*S,a:an,vx:0,vy:0,st:0,idx,lap:0,s:ts,hue:pl?eqP().body.hue:Math.random()*360|0,ar:pl?eqP().aero.r:1,fin:0})}
 R={K,cars,t:-3.5,laps:3,order:[],last:performance.now()};$('race').style.display='block';cv.width=innerWidth;cv.height=innerHeight;requestAnimationFrame(loop)};
const stop=()=>{R=null;$('race').style.display='none';$('res').style.display='none'};
function step(c,thr,dt,K){const co=Math.cos(c.a),si=Math.sin(c.a),k=tileAt(K,c.x,c.y),off=k==2?.45:1,s=c.s;
 let vf=c.vx*co+c.vy*si,vs=-c.vx*si+c.vy*co;
 vf+=thr>0?s.acc*thr*Math.max(0,1-vf/(s.max*off))*dt:thr*(vf>0?500:150)*dt;
 if(vf>s.max*off)vf-=(vf-s.max*off)*2*dt;vf-=vf*.3*dt;
 c.a+=c.st*2.8/(1+Math.abs(vf)/450)*Math.max(-1,Math.min(1,vf/100))*dt;
 vs*=Math.exp(-(2+s.grip*.9+s.down*Math.abs(vf)/300*.8)*dt);
 const co2=Math.cos(c.a),si2=Math.sin(c.a);c.vx=vf*co2-vs*si2;c.vy=vf*si2+vs*co2;c.sp=Math.abs(vf);
 const nx=c.x+c.vx*dt,ny=c.y+c.vy*dt;if(tileAt(K,nx,ny)==3){c.vx*=-.3;c.vy*=-.3}else{c.x=nx;c.y=ny}}
function loop(now){if(!R)return;const dt=Math.min(.033,(now-R.last)/1e3);R.last=now;R.t+=dt;const{K,cars}=R,go=R.t>0;
 cars.forEach(c=>{let best=1e9,bi=c.idx;for(let j=-8;j<=20;j++){const i=(c.idx+j+K.N)%K.N,p=K.path[i],d=Math.hypot(p[0]*S-c.x,p[1]*S-c.y);if(d<best){best=d;bi=i}}
  if(c.idx>K.N*.8&&bi<K.N*.2)c.lap++;if(c.idx<K.N*.2&&bi>K.N*.8)c.lap--;c.idx=bi;
  if(c.lap>R.laps&&!c.fin){c.fin=1;R.order.push(c)}
  c.prog=c.lap*K.N+c.idx;let thr=0;c.st=0;
  if(c.pl){thr=(keys.arrowup||keys.w?1:0)-(keys.arrowdown||keys.s?1:0);c.st=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0)}
  else{const t=K.path[(c.idx+7)%K.N];let df=Math.atan2(t[1]*S-c.y,t[0]*S-c.x)-c.a;df=Math.atan2(Math.sin(df),Math.cos(df));c.st=Math.max(-1,Math.min(1,df*3));
   const cap=c.s.max*(1-Math.min(.55,Math.abs(df)*.7));thr=(c.sp||0)>cap?-.4:1}
  if(c.fin&&c.pl)thr=0;step(c,go?thr:0,dt,K)});
 for(const a of cars)for(const b of cars)if(a!=b){const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<22&&d>0){a.x+=dx/d*(22-d)/2;a.y+=dy/d*(22-d)/2}}
 const p=cars[0];ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);ctx.save();ctx.translate(cv.width/2-p.x|0,cv.height/2-p.y|0);ctx.drawImage(K.cv,0,0);
 cars.forEach(c=>{ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.a+Math.PI/2);ctx.drawImage(carSprite(c.hue,c.ar),-16,-16);ctx.restore()});ctx.restore();
 const rank=[...cars].sort((a,b)=>b.prog-a.prog).indexOf(p)+1;ctx.fillStyle='#fff';ctx.font='20px monospace';
 ctx.fillText(`Ronde ${Math.min(Math.max(p.lap,1),R.laps)}/${R.laps}   Positie ${rank}/5   ${p.sp|0} px/s`,12,28);
 if(R.t<0){ctx.font='80px monospace';ctx.fillText(Math.ceil(-R.t)||'',cv.width/2-20,cv.height/2)}
 if(p.fin){const o=[...R.order,...[...cars].filter(c=>!c.fin).sort((a,b)=>b.prog-a.prog)],pos=o.indexOf(p),rw=Math.round([300,200,130,80,40][pos]*(K.street?1.25:1));
  G.coins+=rw;save();$('rt').innerHTML=`<h1>Plek ${pos+1}</h1>+💰 ${rw}<br><br><button onclick="stop()">Terug</button>`;$('res').style.display='grid';R=null;return}
 requestAnimationFrame(loop)}
save();garage();shop();
