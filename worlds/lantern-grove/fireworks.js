// Lantern Grove fireworks (Night Watch, original, CC0). THREE.Points, additive, pooled 3000 sparks.
(function(){
const N=3000,G=-3.2;let pend=false;
window.KIN_ON_FX=fx=>{if(fx!=='fireworks')return;if(window.NW_FIREWORKS)window.NW_FIREWORKS(true);else pend=true;};
const COLS=['#c9b8ff','#ffb347','#7fd6ff','#ff9be0','#2a3cff','#ffd24a','#e6ecff','#6dff8a'];
function start(){
 const sc=document.querySelector('a-scene').object3D;
 const pos=new Float32Array(N*3),col=new Float32Array(N*3),vel=new Float32Array(N*3),life=new Float32Array(N),base=new Float32Array(N*3);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 for(let i=0;i<N;i++)pos[i*3+1]=-99;
 const tc=document.createElement('canvas');tc.width=tc.height=32;const x=tc.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(.3,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);
 const m=new THREE.PointsMaterial({size:0.28,map:new THREE.CanvasTexture(tc),vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;sc.add(pts);
 const flash=new THREE.PointLight(0xffffff,0,40);flash.position.set(0,9,-8);sc.add(flash);
 let head=0;const rockets=[],c3=new THREE.Color();
 function spawn(px,py,pz,vx,vy,vz,hex,l){const i=head;head=(head+1)%N;pos.set([px,py,pz],i*3);vel.set([vx,vy,vz],i*3);c3.set(hex);base.set([c3.r,c3.g,c3.b],i*3);life[i]=l;}
 const shapes={
  sphere:k=>{const u=Math.random()*2-1,a=Math.random()*6.283,r=Math.sqrt(1-u*u);return[r*Math.cos(a),u,r*Math.sin(a)];},
  ring:k=>{const a=k/160*6.283;return[Math.cos(a),Math.sin(a)*.25,Math.sin(a)];},
  heart:k=>{const t=k/160*6.283;return[(16*Math.sin(t)**3)/17,(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17,0];},
  moon:k=>{const a=(k/160)*6.283;let px=Math.cos(a),py=Math.sin(a);if(k%2){px=0.55+Math.cos(a)*0.85;py=Math.sin(a)*0.85;}return[px,py,0];}};
 function burst(p,shape,cols,n,sp){n=n||170;sp=sp||4.2;for(let k=0;k<n;k++){let d=shapes[shape](k);
   if(shape==='moon'){const a=(k/n)*6.283,ox=Math.cos(a),oy=Math.sin(a);if(Math.hypot(ox-0.45,oy-0.15)<0.85)continue;d=[ox,oy,0];}
   const s=sp*(shape==='sphere'?0.7+Math.random()*.3:1);spawn(p.x,p.y,p.z,d[0]*s,d[1]*s,d[2]*s,cols[k%cols.length],1.6+Math.random()*.8);}
  flash.color.set(cols[0]);flash.position.copy(p);flash.intensity=2.5;}
 function rocket(o){rockets.push({p:new THREE.Vector3(o.x,0.5,o.z),v:new THREE.Vector3((Math.random()-.5)*.6,o.vy||8.5,(Math.random()-.5)*.6),shape:o.shape||'sphere',cols:o.cols,n:o.n,sp:o.sp});}
 function rnd(){return COLS[Math.random()*COLS.length|0];}
 let show=null,t0=0;
 const PLAN=[];// [time, opts]
 const fam=[['#c9b8ff','#ffffff'],['#ffb347','#ffe2a0'],['#7fd6ff','#e6f8ff'],['#ff9be0','#ffd0f0'],['#2a3cff','#ffd24a','#e6ecff'],['#6dff8a','#d8ffd0']];
 for(let i=0;i<22;i++)PLAN.push([i*0.75,{x:(Math.random()-.5)*14,z:-6-Math.random()*8,cols:fam[i%6]}]);
 PLAN.push([5,{x:-4,z:-10,shape:'ring',cols:fam[2]}],[9,{x:4,z:-10,shape:'heart',cols:fam[3],sp:3.4}],[12,{x:0,z:-11,shape:'ring',cols:fam[4]}],[14.5,{x:-3,z:-9,shape:'heart',cols:['#ff9be0','#ffb347'],sp:3.4}]);
 PLAN.push([17.5,{x:0,z:-12,shape:'moon',cols:['#ffe9a0','#c9b8ff'],n:260,sp:3.6,vy:9}]);
 for(let i=0;i<10;i++)PLAN.push([18.2+i*.15,{x:(Math.random()-.5)*16,z:-7-Math.random()*8,cols:fam[i%6],n:120}]);
 window.NW_FIREWORKS=(remote)=>{show={plan:PLAN.map(a=>a.slice()),i:0};show.plan.sort((a,b)=>a[0]-b[0]);t0=performance.now()/1000;if(!remote&&window.KIN_FX)window.KIN_FX('fireworks');if(audioOn)whoosh();};
 if(pend)window.NW_FIREWORKS(true);
 window.NW_SMALLBURST=()=>rocket({x:2,z:-9,cols:fam[0],n:120});
 // optional soft whoosh (off by default)
 let audioOn=false,ac=null;function whoosh(){try{ac=ac||new AudioContext();const b=ac.createBuffer(1,ac.sampleRate*.6,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(i/d.length*Math.PI)*.15;const s=ac.createBufferSource(),f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=900;s.buffer=b;s.connect(f);f.connect(ac.destination);s.start();}catch(e){}}
 window.NW_SOUND=on=>{audioOn=on;if(on)whoosh();};
 let last=performance.now();
 (function loop(){requestAnimationFrame(loop);const now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;
  if(show){const t=now/1000-t0;while(show.i<show.plan.length&&show.plan[show.i][0]<=t){rocket(show.plan[show.i][1]);if(audioOn&&Math.random()<.4)whoosh();show.i++;}if(show.i>=show.plan.length)show=null;}
  for(let r=rockets.length-1;r>=0;r--){const k=rockets[r];k.v.y-=5*dt;k.p.addScaledVector(k.v,dt);spawn(k.p.x,k.p.y,k.p.z,0,-.5,0,'#ffe9c0',0.35);if(k.v.y<2.5){burst(k.p,k.shape,k.cols,k.n,k.sp);rockets.splice(r,1);}}
  for(let i=0;i<N;i++){if(life[i]<=0)continue;life[i]-=dt;const j=i*3;vel[j+1]+=G*0.45*dt;vel[j]*=.985;vel[j+1]*=.985;vel[j+2]*=.985;pos[j]+=vel[j]*dt;pos[j+1]+=vel[j+1]*dt;pos[j+2]+=vel[j+2]*dt;
   const a=Math.max(0,Math.min(1,life[i]/1.2));col[j]=base[j]*a;col[j+1]=base[j+1]*a;col[j+2]=base[j+2]*a;if(life[i]<=0)pos[j+1]=-99;}
  g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;flash.intensity*=0.9;})();
 setTimeout(window.NW_SMALLBURST,1500);
 if(new URLSearchParams(location.search).has('fireworks'))setTimeout(()=>window.NW_FIREWORKS(true),500);
}
const s=document.querySelector('a-scene');if(s.hasLoaded)start();else s.addEventListener('loaded',start);
// UI
const b=document.createElement('button');b.textContent='🎆 Fireworks';b.style.cssText='position:fixed;right:10px;bottom:64px;z-index:12;background:#1a1640dd;color:#ffe9a0;border:1px solid #8f7cff;border-radius:10px;padding:8px 12px;font:15px system-ui';b.onclick=()=>window.NW_FIREWORKS&&window.NW_FIREWORKS();document.body.appendChild(b);
const a=document.createElement('button');a.textContent='🔇';a.title='soft whoosh';a.style.cssText=b.style.cssText+';right:132px;padding:8px 10px';let on=false;a.onclick=()=>{on=!on;a.textContent=on?'🔈':'🔇';window.NW_SOUND&&window.NW_SOUND(on);};document.body.appendChild(a);
})();
