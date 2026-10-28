// Tesseract (Night Watch, original, CC0): 16 vertices, 32 edges, rotated in the XW, YW and ZW planes,
// projected 4D -> 3D with perspective; plus the unfolded net of 8 cubes (the Dali cross).
(function(){
const V=[];for(let i=0;i<16;i++)V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1,i&8?1:-1]);
const E=[];for(let i=0;i<16;i++)for(let b=0;b<4;b++){const j=i^(1<<b);if(j>i)E.push([i,j]);}
console.assert(V.length===16&&E.length===32);
// Dali cross: 8 unit cubes (side 2) in 3D: a column of 4 plus 4 around the second from top
const CUBES=[[0,3,0],[0,1,0],[0,-1,0],[0,-3,0],[2,1,0],[-2,1,0],[0,1,2],[0,1,-2]];
const CE=[];for(let i=0;i<8;i++)for(let b=0;b<3;b++){const j=i^(1<<b);if(j>i)CE.push([i,j]);}
const card=document.getElementById('card');const show=h=>{card.innerHTML='<button onclick="this.parentNode.style.display=\'none\'">✕</button>'+h;card.style.display='block';};
const ABOUT='<b>🧊 A shadow of the fourth dimension</b><p>A cube drawn on paper is a 2D shadow of a 3D thing. In <i>Cosmos</i> (1980), Carl Sagan used the same idea for the tesseract: we can\'t see a 4D cube, but we can watch its 3D shadow. A line often quoted from that episode: <q>I cannot show you a tesseract because I, and you, are trapped in three dimensions.</q></p><p>What you see: 16 corners and 32 edges of a 4D cube turning in the XW, YW and ZW planes, then projected into 3D with perspective, which is why one cube seems to sit inside another. <b>Unfold</b> lays its 8 cubic cells out flat in 3D, the cross Salvador Dalí painted in <i>Corpus Hypercubus</i>.</p>';
function start(){
 const world=document.getElementById('world').object3D,sc=document.querySelector('a-scene');
 // neon grid echoes
 const gm=(c,o)=>{const g=new THREE.GridHelper(40,40,c,c);g.material.transparent=true;g.material.opacity=o;return g;};
 const floor=gm(0x1aff4a,.22);world.add(floor);const back=gm(0x1aff4a,.1);back.rotation.x=Math.PI/2;back.position.set(0,6,-16);world.add(back);
 const T=new THREE.Group();world.add(T);
 const lp=new Float32Array(E.length*6),lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(lp,3));
 const lc=new Float32Array(E.length*6);lg.setAttribute('color',new THREE.BufferAttribute(lc,3));
 const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));T.add(lines);
 // glow halo copy
 const halo=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x1aff4a,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.setScalar(1.015);T.add(halo);
 const vp=new Float32Array(16*3),vg=new THREE.BufferGeometry();vg.setAttribute('position',new THREE.BufferAttribute(vp,3));
 const tc=document.createElement('canvas');tc.width=tc.height=32;const x=tc.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'rgba(120,255,150,.8)');gr.addColorStop(1,'rgba(0,255,60,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);
 const dots=new THREE.Points(vg,new THREE.PointsMaterial({size:.16,map:new THREE.CanvasTexture(tc),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));T.add(dots);
 // net
 const net=new THREE.Group();const nm=new THREE.LineBasicMaterial({color:0x3fff6a,transparent:true,opacity:.9,blending:THREE.AdditiveBlending});
 CUBES.forEach(c=>{const p=[];CE.forEach(([a,b])=>{[a,b].forEach(i=>p.push(c[0]+(i&1?1:-1)*.97,c[1]+(i&2?1:-1)*.97,c[2]+(i&4?1:-1)*.97));});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));net.add(new THREE.LineSegments(g,nm));
  const f=new THREE.Mesh(new THREE.BoxGeometry(1.94,1.94,1.94),new THREE.MeshBasicMaterial({color:0x0aff3a,transparent:true,opacity:.06,depthWrite:false}));f.position.set(...c);net.add(f);});
 net.visible=false;T.add(net);
 const sp={xw:0,yw:0,zw:0};const sl=k=>{const e=document.getElementById('s'+k),v=document.getElementById('v'+k);const u=()=>{sp[k]=+e.value;v.textContent=(+e.value).toFixed(2);};e.oninput=u;u();};['xw','yw','zw'].forEach(sl);
 let mode='tess',paused=false,a={xw:0,yw:0,zw:0},spin=0;
 const bm=document.getElementById('bmode');bm.onclick=()=>{mode=mode==='tess'?'net':'tess';net.visible=mode==='net';lines.visible=halo.visible=dots.visible=mode==='tess';bm.textContent=mode==='tess'?'🔀 Unfold (Dalí cross)':'🔀 Cube in a cube';frame();};
 const bp=document.getElementById('bpause');bp.onclick=()=>{paused=!paused;bp.textContent=paused?'▶':'⏸';};
 const D=3.2,c3=new THREE.Color();
 function proj(){const cx=Math.cos(a.xw),sx=Math.sin(a.xw),cy=Math.cos(a.yw),sy=Math.sin(a.yw),cz=Math.cos(a.zw),sz=Math.sin(a.zw);const P=[],W=[];
  V.forEach(v=>{let [X,Y,Z,w]=v,t;
   t=cx*X-sx*w;w=sx*X+cx*w;X=t; t=cy*Y-sy*w;w=sy*Y+cy*w;Y=t; t=cz*Z-sz*w;w=sz*Z+cz*w;Z=t;
   const k=D/(D-w)*0.85;P.push([X*k,Y*k,Z*k]);W.push(w);});
  E.forEach(([i,j],e)=>{lp.set(P[i],e*6);lp.set(P[j],e*6+3);[i,j].forEach((q,h)=>{const b=(W[q]+2)/4;c3.setHSL(0.36,1,0.25+0.45*b);lc.set([c3.r,c3.g,c3.b],e*6+h*3);});});
  P.forEach((p,i)=>vp.set(p,i*3));lg.attributes.position.needsUpdate=true;lg.attributes.color.needsUpdate=true;vg.attributes.position.needsUpdate=true;}
 // framing: fit the object into the area below the control panel, any aspect ratio
 const camEl=document.querySelector('a-camera'),ov=document.getElementById('ov'),ui=document.getElementById('ui');
 function frame(){const cam=sc.camera;if(!cam)return;const asp=innerWidth/innerHeight,tanV=Math.tan(THREE.MathUtils.degToRad(cam.fov/2)),tanH=tanV*asp;
  const top=(ov.getBoundingClientRect().bottom+6)/innerHeight,bot=(innerHeight-ui.getBoundingClientRect().top+6)/innerHeight;const avail=Math.max(.3,1-top-bot);
  const R=mode==='tess'?2.1:4.2,RW=mode==='tess'?2.1:3.2;const d=Math.max(R/(avail*tanV*.95),RW/(tanH*.92))+1.5;
  const cp=new THREE.Vector3();camEl.object3D.getWorldPosition(cp);const off=(bot-top)*tanV*d;T.position.set(cp.x,cp.y+off,cp.z-d);
  floor.position.set(0,Math.min(0,cp.y+off-R-0.6),0);}
 frame();setTimeout(frame,300);addEventListener('resize',()=>setTimeout(frame,150));addEventListener('orientationchange',()=>setTimeout(frame,300));
 let last=performance.now();
 (function loop(){requestAnimationFrame(loop);const now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;
  if(!paused){for(const k in a)a[k]+=sp[k]*dt;spin+=dt*.15;}
  if(mode==='tess')proj();T.rotation.y=spin;T.rotation.x=mode==='tess'?0.25:0.2;})();
 window.TS_INFO=()=>({vertices:V.length,edges:E.length,cubes:CUBES.length});
}
const s=document.querySelector('a-scene');if(s.hasLoaded)start();else s.addEventListener('loaded',start);
document.getElementById('babout').onclick=()=>show(ABOUT);
document.getElementById('portal').addEventListener('click',()=>{location.href='../lantern-grove/'+location.search;});
})();
