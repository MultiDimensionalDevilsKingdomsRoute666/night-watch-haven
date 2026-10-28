// Tesseract room (Night Watch, original, CC0). Regular polytopes rotated in 4D (and 5D) and projected
// down to 3D with perspective, the Dali-cross net, a 3-sphere slice, and a walkable nested-cube maze.
(function(){
// ---- shapes: vertices in n-D, edges = all pairs at the minimum distance ----
const cube=n=>{const V=[];for(let i=0;i<1<<n;i++){const v=[];for(let b=0;b<n;b++)v.push(i>>b&1?1:-1);V.push(v);}return V;};
const s5=Math.sqrt(5);
const SH={
 tess:{name:'Tesseract',V:cube(4),planes:[[0,3],[1,3],[2,3]],lab:['XW','YW','ZW'],ex:'The 4D cube: 8 cubic cells. Its shadow looks like a cube inside a cube.'},
 cell5:{name:'5-cell',V:[[1,1,1,-1/s5],[1,-1,-1,-1/s5],[-1,1,-1,-1/s5],[-1,-1,1,-1/s5],[0,0,0,4/s5]],planes:[[0,3],[1,3],[2,3]],lab:['XW','YW','ZW'],ex:'The pentachoron, the 4D simplex: 5 corners all joined to each other, 5 tetrahedral cells.'},
 cell16:{name:'16-cell',V:[0,1,2,3].flatMap(i=>[1,-1].map(s=>{const v=[0,0,0,0];v[i]=s;return v;})),planes:[[0,3],[1,3],[2,3]],lab:['XW','YW','ZW'],ex:'The 4D cross-polytope: a corner on each side of each of 4 axes, 16 tetrahedral cells.'},
 pent:{name:'Penteract',V:cube(5),planes:[[0,3],[1,4],[3,4]],lab:['XW','YV','WV'],ex:'The 5D cube: 32 corners, 80 edges. Projected 5D → 4D → 3D, so you see a tesseract inside a tesseract.'}
};
for(const k in SH){const s=SH[k],V=s.V,d=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
 const r=Math.hypot(...V[0]);s.V=V.map(v=>v.map(x=>x*2/r));let m=1e9;for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++)m=Math.min(m,d(s.V[i],s.V[j]));
 s.E=[];for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++)if(d(s.V[i],s.V[j])<m*1.001)s.E.push([i,j]);}
const want={tess:[16,32],cell5:[5,10],cell16:[8,24],pent:[32,80]};for(const k in want)console.assert(SH[k].V.length===want[k][0]&&SH[k].E.length===want[k][1],k);
const CUBES=[[0,3,0],[0,1,0],[0,-1,0],[0,-3,0],[2,1,0],[-2,1,0],[0,1,2],[0,1,-2]];
const CE=[];for(let i=0;i<8;i++)for(let b=0;b<3;b++){const j=i^(1<<b);if(j>i)CE.push([i,j]);}
const $=id=>document.getElementById(id);
const card=$('card');const show=h=>{card.innerHTML='<button onclick="this.parentNode.style.display=\'none\'">✕</button>'+h;card.style.display='block';};
const ABOUT='<b>🧊 A shadow of the fourth dimension</b><p>A cube drawn on paper is a 2D shadow of a 3D thing. In <i>Cosmos</i> (1980), Carl Sagan used the same idea for the tesseract: we can\'t see a 4D cube, but we can watch its 3D shadow. A line often quoted from that episode: <q>I cannot show you a tesseract because I, and you, are trapped in three dimensions.</q></p><p>Each shape here turns in planes that include a 4th (or 5th) axis, then is projected into 3D with perspective. <b>Unfold</b> lays the tesseract\'s 8 cells out flat, the cross Salvador Dalí painted in <i>Corpus Hypercubus</i>. The <b>slice</b> is Flatland turned up one notch: a 4D ball passing through our space looks like a sphere that grows and shrinks.</p>';
function start(){
 const world=$('world').object3D,sc=document.querySelector('a-scene'),rig=$('rig').object3D,camEl=document.querySelector('a-camera');
 const gm=(c,o)=>{const g=new THREE.GridHelper(40,40,c,c);g.material.transparent=true;g.material.opacity=o;return g;};
 const floor=gm(0x1aff4a,.22);world.add(floor);const back=gm(0x1aff4a,.1);back.rotation.x=Math.PI/2;back.position.set(0,6,-16);world.add(back);
 const T=new THREE.Group();world.add(T);const add=THREE.AdditiveBlending;
 const MAXE=80,lp=new Float32Array(MAXE*6),lc=new Float32Array(MAXE*6),lg=new THREE.BufferGeometry();
 lg.setAttribute('position',new THREE.BufferAttribute(lp,3));lg.setAttribute('color',new THREE.BufferAttribute(lc,3));
 const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:add,depthWrite:false}));
 const halo=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x1aff4a,transparent:true,opacity:.3,blending:add,depthWrite:false}));halo.scale.setScalar(1.015);
 const vp=new Float32Array(32*3),vg=new THREE.BufferGeometry();vg.setAttribute('position',new THREE.BufferAttribute(vp,3));
 const tc=document.createElement('canvas');tc.width=tc.height=32;const x=tc.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'rgba(120,255,150,.8)');gr.addColorStop(1,'rgba(0,255,60,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);
 const dotTex=new THREE.CanvasTexture(tc);
 const dots=new THREE.Points(vg,new THREE.PointsMaterial({size:.16,map:dotTex,transparent:true,depthWrite:false,blending:add}));
 const poly=new THREE.Group();poly.add(lines,halo,dots);T.add(poly);
 // Dali net
 const net=new THREE.Group();const nm=new THREE.LineBasicMaterial({color:0x3fff6a,transparent:true,opacity:.9,blending:add});
 CUBES.forEach(c=>{const p=[];CE.forEach(([a,b])=>{[a,b].forEach(i=>p.push(c[0]+(i&1?1:-1)*.97,c[1]+(i&2?1:-1)*.97,c[2]+(i&4?1:-1)*.97));});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));net.add(new THREE.LineSegments(g,nm));
  const f=new THREE.Mesh(new THREE.BoxGeometry(1.94,1.94,1.94),new THREE.MeshBasicMaterial({color:0x0aff3a,transparent:true,opacity:.06,depthWrite:false}));f.position.set(...c);net.add(f);});
 net.visible=false;T.add(net);
 // hypersphere slice
 const sph=new THREE.Group();
 const core=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),new THREE.MeshBasicMaterial({color:0x2aff5a,transparent:true,opacity:.28,blending:add,depthWrite:false}));
 const wire=new THREE.Mesh(new THREE.SphereGeometry(1.002,24,14),new THREE.MeshBasicMaterial({color:0x8dffa8,wireframe:true,transparent:true,opacity:.45,blending:add,depthWrite:false}));
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:0x6dff8a,transparent:true,blending:add,depthWrite:false}));
 sph.add(core,wire,glow);sph.visible=false;T.add(sph);
 // maze: 7 rooms of nested wireframe cubes along -z, far from the main stage
 const MZ=new THREE.Vector3(200,0,0),maze=new THREE.Group();maze.position.copy(MZ);maze.visible=false;world.add(maze);
 const RS=4,NR=7,cubeEdges=(s,cx,cy,cz)=>{const p=[];CE.forEach(([a,b])=>[a,b].forEach(i=>p.push(cx+(i&1?1:-1)*s,cy+(i&2?1:-1)*s,cz+(i&4?1:-1)*s)));return p;};
 {const p=[],q=[];for(let r=0;r<NR;r++){const cz=-r*RS,cy=RS/2;p.push(...cubeEdges(RS/2,0,cy,cz));
   const s=RS/5;q.push(...cubeEdges(s,0,cy,cz));for(let i=0;i<8;i++){const sx=i&1?1:-1,sy=i&2?1:-1,sz=i&4?1:-1;q.push(sx*s,cy+sy*s,cz+sz*s,sx*RS/2,cy+sy*RS/2,cz+sz*RS/2);}}
  const g1=new THREE.BufferGeometry();g1.setAttribute('position',new THREE.Float32BufferAttribute(p,3));maze.add(new THREE.LineSegments(g1,new THREE.LineBasicMaterial({color:0x3fff6a,transparent:true,opacity:.85,blending:add})));
  const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(q,3));maze.add(new THREE.LineSegments(g2,new THREE.LineBasicMaterial({color:0x1aff4a,transparent:true,opacity:.4,blending:add})));}
 const exitZ=-(NR-1)*RS-1.2,exitEl=document.createElement('a-entity');
 exitEl.setAttribute('class','clickable');exitEl.setAttribute('geometry','primitive:torus;radius:0.55;radiusTubular:0.07');exitEl.setAttribute('material','color:#eaffee;emissive:#6dff8a;emissiveIntensity:1.5;shader:flat');
 exitEl.setAttribute('position',`${MZ.x} 1.6 ${exitZ}`);$('world').appendChild(exitEl);exitEl.object3D.visible=false;
 const exitGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:0x9dffb0,transparent:true,blending:add,depthWrite:false}));exitGlow.scale.setScalar(2.2);exitGlow.position.set(0,1.6,exitZ);maze.add(exitGlow);
 // UI
 const sp=[0,0,0];[0,1,2].forEach(i=>{const k=['xw','yw','zw'][i],e=$('s'+k),v=$('v'+k);const u=()=>{sp[i]=+e.value;v.textContent=(+e.value).toFixed(2);};e.oninput=u;u();});
 let shape='tess',view='tess',paused=false,ang=[0,0,0],spin=0,st=0,walkTo=null;
 const bm=$('bmode'),bp=$('bpause'),cnt=$('cnt'),cap=$('cap'),sl=$('sliders');
 bm.onclick=()=>{view=view==='tess'?'net':'tess';apply();};
 bp.onclick=()=>{paused=!paused;bp.textContent=paused?'▶':'⏸';};
 document.querySelectorAll('#pick button').forEach(b=>b.onclick=()=>pick(b.dataset.s));
 function pick(s){if(shape==='maze'&&s!=='maze')leaveMaze();shape=s;view='tess';ang=[0,0,0];st=0;if(s==="maze")enterMaze();apply();}
 function apply(){const isP=!!SH[shape];document.querySelectorAll('#pick button').forEach(b=>b.classList.toggle('on',b.dataset.s===shape));
  poly.visible=isP&&!(shape==='tess'&&view==='net');net.visible=shape==='tess'&&view==='net';sph.visible=shape==='sphere';
  bm.style.display=shape==='tess'?'':'none';bm.textContent=view==='tess'?'🔀 Unfold (Dalí cross)':'🔀 Cube in a cube';
  sl.style.display=isP?'':'none';
  if(isP){const S=SH[shape];S.lab.forEach((l,i)=>$('l'+i).textContent=l);lg.setDrawRange(0,S.E.length*2);vg.setDrawRange(0,S.V.length);
   cnt.textContent=`${S.V.length} vertices · ${S.E.length} edges`+(shape==='tess'&&view==='net'?' · 8 cubes':'');cap.textContent=S.ex;}
  else if(shape==='sphere'){cnt.textContent='3-sphere slice';cap.textContent='A 4D ball drifting through our 3D space: a point, a growing sphere, then gone, like Flatland\'s sphere visiting a square.';}
  else{cnt.textContent='walk the cells';cap.textContent='Drag to look, tap to step forward. Reach the glowing ring to return.';}
  frame();}
 function enterMaze(){T.visible=floor.visible=back.visible=false;maze.visible=true;exitEl.object3D.visible=true;$('portal').object3D.visible=false;rig.position.set(MZ.x,0,1.2);walkTo=null;}
 function leaveMaze(){T.visible=floor.visible=back.visible=true;maze.visible=false;exitEl.object3D.visible=false;$('portal').object3D.visible=true;rig.position.set(0,0,0);walkTo=null;}
 exitEl.addEventListener('click',()=>pick('tess'));
 // tap (not drag) on the scene steps forward one room in the look direction
 let down=null;sc.canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,t:performance.now()};});
 sc.canvas.addEventListener('pointerup',e=>{if(!down||shape!=='maze')return;const m=Math.hypot(e.clientX-down.x,e.clientY-down.y),dt=performance.now()-down.t;down=null;if(m>10||dt>400)return;
  const dir=new THREE.Vector3();camEl.object3D.getWorldDirection(dir);dir.y=0;if(dir.lengthSq()<1e-4)return;dir.normalize().multiplyScalar(-RS*.75);
  const t=(walkTo||rig.position).clone().add(dir);t.x=THREE.MathUtils.clamp(t.x,MZ.x-1.4,MZ.x+1.4);t.z=THREE.MathUtils.clamp(t.z,exitZ-.5,1.6);walkTo=t;});
 const D=3.2,c3=new THREE.Color();
 function proj(){const S=SH[shape],n=S.V[0].length,P=[],W=[];const cs=ang.map(Math.cos),sn=ang.map(Math.sin);
  S.V.forEach(v0=>{const v=v0.slice();S.planes.forEach(([i,j],q)=>{const a=v[i],b=v[j];v[i]=cs[q]*a-sn[q]*b;v[j]=sn[q]*a+cs[q]*b;});
   if(n===5){const k=D/(D-v[4]);for(let i=0;i<4;i++)v[i]*=k;}
   const k=D/(D-v[3])*(n===5?.62:.85);P.push([v[0]*k,v[1]*k,v[2]*k]);W.push(v[3]);});
  S.E.forEach(([i,j],e)=>{lp.set(P[i],e*6);lp.set(P[j],e*6+3);[i,j].forEach((q,h)=>{const b=Math.max(0,Math.min(1,(W[q]+2)/4));c3.setHSL(0.36,1,0.25+0.45*b);lc.set([c3.r,c3.g,c3.b],e*6+h*3);});});
  P.forEach((p,i)=>vp.set(p,i*3));lg.attributes.position.needsUpdate=lg.attributes.color.needsUpdate=vg.attributes.position.needsUpdate=true;}
 const ov=$('ov'),ui=$('ui');
 function frame(){const cam=sc.camera;if(!cam||shape==='maze')return;const asp=innerWidth/innerHeight,tanV=Math.tan(THREE.MathUtils.degToRad(cam.fov/2)),tanH=tanV*asp;
  const top=(ov.getBoundingClientRect().bottom+6)/innerHeight,bot=(innerHeight-ui.getBoundingClientRect().top+6)/innerHeight;const avail=Math.max(.3,1-top-bot);
  const net_=shape==='tess'&&view==='net',R=net_?4.2:shape==='pent'?2.3:2.1,RW=net_?3.2:R;const d=Math.max(R/(avail*tanV*.95),RW/(tanH*.92))+1.5;
  const cp=new THREE.Vector3();camEl.object3D.getWorldPosition(cp);const off=(bot-top)*tanV*d;T.position.set(cp.x,cp.y+off,cp.z-d);
  floor.position.set(0,Math.min(0,cp.y+off-R-0.6),0);}
 apply();setTimeout(frame,300);addEventListener('resize',()=>setTimeout(frame,150));addEventListener('orientationchange',()=>setTimeout(frame,300));
 let last=performance.now();
 (function loop(){requestAnimationFrame(loop);const now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;
  if(!paused){ang=ang.map((a,i)=>a+sp[i]*dt);spin+=dt*.15;st+=dt;}
  if(SH[shape]&&poly.visible)proj();
  if(shape==='sphere'){const c=Math.cos(st*.6),r=2*Math.sqrt(Math.max(0,1-c*c))+.001;core.scale.setScalar(r);wire.scale.setScalar(r);glow.scale.setScalar(r*2.6+.25);wire.rotation.y=st*.3;}
  if(shape==='maze'){if(walkTo){rig.position.lerp(walkTo,Math.min(1,dt*4));if(rig.position.distanceTo(walkTo)<.02)walkTo=null;}
   exitGlow.material.opacity=.6+.4*Math.sin(now/300);exitEl.object3D.rotation.y+=dt;if(rig.position.z<exitZ+.6)pick('tess');}
  T.rotation.y=spin;T.rotation.x=view==='net'?0.2:0.25;})();
 window.TS_INFO=()=>{const o={};for(const k in SH)o[k]={vertices:SH[k].V.length,edges:SH[k].E.length};o.cubes=CUBES.length;o.shape=shape;return o;};
 window.TS_PICK=pick;
}
const s=document.querySelector('a-scene');if(s.hasLoaded)start();else s.addEventListener('loaded',start);
$('babout').onclick=()=>show(ABOUT);
$('portal').addEventListener('click',()=>{location.href='../lantern-grove/'+location.search;});
})();
