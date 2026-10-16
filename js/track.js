// Procedurele baan: seed -> gesloten spline -> tilemap (0 weg,1 curb,2 gras,3 muur) -> 32px tiles
function genTrack(seed,street){
 const R=rng(seed),W=100,H=75,n=street?18:11,pts=[],path=[];
 for(let i=0;i<n;i++){const t=i/n*6.283,k=(street?.5:.6)+R()*(street?.5:.4);pts.push([W/2+Math.cos(t)*W*.4*k,H/2+Math.sin(t)*H*.4*k])}
 for(let i=0;i<n;i++){const a=pts[(i+n-1)%n],b=pts[i],c=pts[(i+1)%n],d=pts[(i+2)%n];
  for(let s=0;s<10;s++){const t=s/10,t2=t*t,t3=t2*t;path.push([0,1].map(j=>.5*(2*b[j]+(c[j]-a[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(3*b[j]-a[j]-3*c[j]+d[j])*t3)))}}
 const N=path.length,hw=street?2.2:3.2,T=new Uint8Array(W*H),F=new Uint8Array(W*H);
 const d0=[path[1][0]-path[0][0],path[1][1]-path[0][1]],dl=Math.hypot(...d0);d0[0]/=dl;d0[1]/=dl;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let m=1e9;const px=x+.5,py=y+.5;
  for(let i=0;i<N;i++){const a=path[i],b=path[(i+1)%N],dx=b[0]-a[0],dy=b[1]-a[1];
   const t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy)));m=Math.min(m,Math.hypot(px-a[0]-dx*t,py-a[1]-dy*t))}
  const o=y*W+x;T[o]=m<hw?0:m<hw+.7?1:street?3:m<hw+5?2:3;
  if(!T[o]&&Math.abs((px-path[0][0])*d0[0]+(py-path[0][1])*d0[1])<.6)F[o]=1}
 const cv=document.createElement('canvas');cv.width=W*S;cv.height=H*S;const g=cv.getContext('2d');
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const o=y*W+x,v=(x*7+y*13)&1,t=T[o];
  g.drawImage(F[o]?TL.start:t==0?TL.road[v]:t==1?TL.curb[(x+y)&1]:t==2?TL.grass[v]:TL.wall[street?0:1],x*S,y*S)}
 return{W,H,N,path,T,cv,street}}
const tileAt=(K,x,y)=>{x=x/S|0;y=y/S|0;return x<0||y<0||x>=K.W||y>=K.H?3:K.T[y*K.W+x]};
