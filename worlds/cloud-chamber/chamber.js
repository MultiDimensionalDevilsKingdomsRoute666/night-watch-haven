// Cloud Chamber simulation (Night Watch, original, CC0). Pooled THREE.Points droplets, capped at 4000.
(function(){
const N=4000,CX=0,CZ=-3,Y0=0.18,Y1=0.6,HALF=1.9;
const KINDS={
 alpha:{name:'Alpha',line:'Alpha particles are heavy helium nuclei, so they leave short, thick, straight tracks that start at the source.',fam:'#ffb347'},
 beta:{name:'Beta',line:'Beta particles are fast, light electrons, so they leave thin, longer tracks that wander and curl.',fam:'#7fd6ff'},
 gamma:{name:'Gamma',line:'Gamma rays are light and rarely touch the vapor, so you only catch a faint, sparse kink now and then.',fam:'#6dff8a'},
 muon:{name:'Muon',line:'Muons rain down from cosmic rays high in the sky, leaving long, thin, straight tracks across the whole chamber.',fam:'#ff9be0'}};
const GUIDE='<button onclick="this.parentNode.style.display=\'none\'">✕</button><b>☁️ What the tracks mean</b>'+Object.values(KINDS).map(k=>'<p style="margin:.45em 0"><b>'+k.name+':</b> '+k.line+'</p>').join('')+'<small>A playful simulation inspired by real cloud chambers, not live data.</small>';
const card=document.getElementById('card');function show(h){card.innerHTML=h;card.style.display='block';}
window.CC_GUIDE=()=>show(GUIDE);
let family=false,snd=false,ac=null;
function tick(k){if(!snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=k==='alpha'?180:k==='muon'?520:320;g.gain.setValueAtTime(0.03,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+0.12);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+0.13);}catch(e){}}
function sign(){const c=document.createElement('canvas');c.width=512;c.height=460;const x=c.getContext('2d');x.textAlign='center';x.fillStyle='#dfe8ff';x.shadowColor='#000';x.shadowBlur=6;
 x.font='bold 46px sans-serif';x.fillText('Cloud Chamber',256,60);x.font='30px sans-serif';
 [['Alpha · short, thick, straight','#fff'],['Beta · thin, long, winding','#fff'],['Gamma · faint, rare kinks','#ccc'],['Muon · long line, edge to edge','#fff']].forEach((l,i)=>{x.fillStyle=family?Object.values(KINDS)[i].fam:l[1];x.fillText(l[0],256,140+i*70);});
 x.fillStyle='#9fb0e0';x.font='24px sans-serif';x.fillText('tap for the guide',256,430);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const el=document.getElementById('signtext');
 el.setObject3D('mesh',new THREE.Mesh(new THREE.PlaneGeometry(1.32,1.19),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,fog:false})));}
function start(){
 const sc=document.querySelector('a-scene').object3D;
 const pos=new Float32Array(N*3),col=new Float32Array(N*3),base=new Float32Array(N*3),life=new Float32Array(N),max=new Float32Array(N),drift=new Float32Array(N*3);
 for(let i=0;i<N;i++)pos[i*3+1]=-99;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const tc=document.createElement('canvas');tc.width=tc.height=32;const x=tc.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);
 const tex=new THREE.CanvasTexture(tc);
 const mk=s=>{const m=new THREE.Points(g,new THREE.PointsMaterial({size:s,map:tex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));m.frustumCulled=false;sc.add(m);return m;};
 mk(0.045);
 // mist: a few soft layered sprites
 const mc=document.createElement('canvas');mc.width=mc.height=128;const mx=mc.getContext('2d'),mg=mx.createRadialGradient(64,64,0,64,64,64);mg.addColorStop(0,'rgba(200,215,255,.35)');mg.addColorStop(1,'rgba(200,215,255,0)');mx.fillStyle=mg;mx.fillRect(0,0,128,128);
 const mt=new THREE.CanvasTexture(mc),mists=[];for(let i=0;i<14;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:mt,transparent:true,depthWrite:false,opacity:.5,fog:false}));s.position.set(CX+(Math.random()-.5)*3.4,Y0+Math.random()*.15,CZ+(Math.random()-.5)*3.4);const k=1.2+Math.random();s.scale.set(k,k*.35,1);s.userData.p=Math.random()*6;sc.add(s);mists.push(s);}
 let head=0;const c3=new THREE.Color();
 function drop(px,py,pz,hex,l,b){const i=head;head=(head+1)%N;const j=i*3;pos[j]=px;pos[j+1]=py;pos[j+2]=pz;c3.set(hex);base[j]=c3.r*b;base[j+1]=c3.g*b;base[j+2]=c3.b*b;life[i]=0;max[i]=l;drift[j]=(Math.random()-.5)*.03;drift[j+1]=.01+Math.random()*.02;drift[j+2]=(Math.random()-.5)*.03;}
 const clampIn=(p)=>Math.abs(p.x-CX)<HALF&&Math.abs(p.z-CZ)<HALF;
 const pend=[];// growing tracks
 function track(kind){const hex=family?KINDS[kind].fam:'#f2f6ff';tick(kind);
  const p=new THREE.Vector3(),d=new THREE.Vector3();let n,step,thick,bright,wob=0;
  if(kind==='alpha'){p.set(CX,0.36,CZ);const a=Math.random()*6.283;d.set(Math.cos(a),(Math.random()-.3)*.15,Math.sin(a));n=40;step=0.012;thick=3;bright=1;}
  else if(kind==='beta'){p.set(CX,0.36,CZ);const a=Math.random()*6.283;d.set(Math.cos(a),(Math.random()-.3)*.1,Math.sin(a));n=110;step=0.012;thick=1;bright=.7;wob=.35;}
  else if(kind==='muon'){const a=Math.random()*6.283;p.set(CX+Math.cos(a)*HALF*.98,Y0+0.08+Math.random()*.25,CZ+Math.sin(a)*HALF*.98);const b=a+Math.PI+(Math.random()-.5)*.8;d.set(Math.cos(b),0,Math.sin(b));n=160;step=0.024;thick=1;bright=.75;}
  else {p.set(CX+(Math.random()-.5)*3,Y0+.1+Math.random()*.25,CZ+(Math.random()-.5)*3);const a=Math.random()*6.283;d.set(Math.cos(a),0,Math.sin(a));n=12;step=.02;thick=1;bright=.35;wob=1.2;}
  d.normalize();pend.push({p,d,n,step,thick,bright,wob,hex,kind,k:0});}
 window.CC_RECOLOR=()=>{family=!family;sign();};
 let last=performance.now(),acc={alpha:0,beta:0,gamma:0,muon:0};const RATE={alpha:1.1,beta:0.9,gamma:0.25,muon:0.35};
 (function loop(){requestAnimationFrame(loop);const now=performance.now(),dt=Math.min((now-last)/1000,.05),t=now/1000;last=now;
  for(const k in RATE){acc[k]+=dt*RATE[k]*(0.5+Math.random());if(acc[k]>1){acc[k]=0;track(k);}}
  for(let q=pend.length-1;q>=0;q--){const s=pend[q];for(let r=0;r<6&&s.k<s.n;r++,s.k++){
    if(s.wob){s.d.x+=(Math.random()-.5)*s.wob*.4;s.d.z+=(Math.random()-.5)*s.wob*.4;s.d.normalize();}
    s.p.addScaledVector(s.d,s.step);if(!clampIn(s.p)||s.p.y<Y0){s.k=s.n;break;}
    if(s.kind==='gamma'&&Math.random()<.5)continue;
    for(let h=0;h<s.thick;h++)drop(s.p.x+(Math.random()-.5)*.012*s.thick,s.p.y+(Math.random()-.5)*.01*s.thick,s.p.z+(Math.random()-.5)*.012*s.thick,s.hex,2.2+Math.random()*1.2,s.bright);}
   if(s.k>=s.n)pend.splice(q,1);}
  for(let i=0;i<N;i++){const j=i*3;if(pos[j+1]<-50)continue;life[i]+=dt;const u=life[i]/max[i];if(u>=1){pos[j+1]=-99;col[j]=col[j+1]=col[j+2]=0;continue;}
   const a=u<.08?u/.08:Math.pow(1-(u-.08)/.92,1.6);col[j]=base[j]*a;col[j+1]=base[j+1]*a;col[j+2]=base[j+2]*a;pos[j]+=drift[j]*dt;pos[j+1]+=drift[j+1]*dt;pos[j+2]+=drift[j+2]*dt;}
  g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;
  mists.forEach(s=>{s.material.opacity=.35+.15*Math.sin(t*.4+s.userData.p);s.position.x+=Math.sin(t*.2+s.userData.p)*.0008;});})();
 sign();
}
const s=document.querySelector('a-scene');if(s.hasLoaded)start();else s.addEventListener('loaded',start);
document.getElementById('sign').addEventListener('click',()=>show(GUIDE));
document.getElementById('bguide').onclick=()=>show(GUIDE);
document.getElementById('src').addEventListener('click',()=>show('<button onclick="this.parentNode.style.display=\'none\'">✕</button><b>✨ The source</b><p>A tiny pretend radioactive speck. Alpha and beta tracks start here; muons come from the sky and gamma flickers anywhere.</p>'));
document.getElementById('portal').addEventListener('click',()=>{location.href='../lantern-grove/'+location.search;});
const bc=document.getElementById('bcol');bc.onclick=()=>{window.CC_RECOLOR&&window.CC_RECOLOR();bc.textContent=bc.textContent.includes('White')?'🎨 Family colors':'🎨 White trails';};
const bs=document.getElementById('bsnd');bs.onclick=()=>{snd=!snd;bs.textContent=snd?'🔈':'🔇';};
})();
