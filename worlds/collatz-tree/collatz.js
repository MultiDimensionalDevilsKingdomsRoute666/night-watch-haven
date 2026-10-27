// Collatz Tree (Night Watch, original, CC0). Coral-style tree: walk each path from root 1 outward,
// bending one way on even steps and the other on odd steps. All values computed here, nothing hard-coded.
(function(){
const MAXN=2000,SEG=0.05,EV=0.14,OD=-0.26,TW=0.5,FIT=4.2;
const next=n=>n%2?3*n+1:n/2;
const nb=n=>n%2n?3n*n+1n:n/2n,K=v=>v<=9007199254740991n?Number(v):v.toString();
function pathB(n){const p=[n];while(n!==1n){n=nb(n);p.push(n);}return p;}
function path(n){const p=[n];while(n!==1){n=next(n);p.push(n);}return p;}
const card=document.getElementById('card');const show=h=>{card.innerHTML='<button onclick="this.parentNode.style.display=\'none\'">✕</button>'+h;card.style.display='block';};
const RULE='<b>🌱 The Collatz rule</b><p>Pick any positive whole number. If it is odd, triple it and add 1. If it is even, halve it. Repeat. Every number anyone has tried ends up at 1.</p><p>Nobody has proven it always happens. Computers have checked every number up to about 2<sup>68</sup> (Barina, 2020), but it is still an open problem: the Collatz conjecture.</p><p>In this tree each branch is one number\'s journey, drawn backwards from root 1: even steps bend one way, odd steps the other.</p>';
function start(){
 const root=document.getElementById('tree').object3D;
 // node placement memo: value -> {p:Vector3, q:Quaternion}
 const M=new Map(),up=new THREE.Vector3(0,1,0),ax=new THREE.Vector3(1,0,0),az=new THREE.Vector3(0,0,1),ay=new THREE.Vector3(0,1,0);
 const qE=new THREE.Quaternion().setFromAxisAngle(ax,EV).multiply(new THREE.Quaternion().setFromAxisAngle(ay,TW));
 const qO=new THREE.Quaternion().setFromAxisAngle(az,OD).multiply(new THREE.Quaternion().setFromAxisAngle(ay,-TW));
 M.set(1,{p:new THREE.Vector3(),q:new THREE.Quaternion(),d:0});
 function place(n){if(M.has(n))return M.get(n);const chain=[];let v=n;while(!M.has(v)){chain.push(v);v=next(v);}
  for(let i=chain.length-1;i>=0;i--){const c=chain[i],par=M.get(next(c));const q=par.q.clone().multiply(c%2?qO:qE);const p=par.p.clone().add(up.clone().applyQuaternion(q).multiplyScalar(SEG));M.set(c,{p,q,d:par.d+1});}
  return M.get(n);}
 function placeB(n){const chain=[];let v=n;while(!M.has(K(v))){chain.push(v);v=nb(v);}
  for(let i=chain.length-1;i>=0;i--){const c=chain[i],par=M.get(K(nb(c)));const q=par.q.clone().multiply(c%2n?qO:qE);const p=par.p.clone().add(up.clone().applyQuaternion(q).multiplyScalar(SEG));M.set(K(c),{p,q,d:par.d+1});}}
 for(let n=1;n<=MAXN;n++)place(n);
 // fit into the room
 const box=new THREE.Box3();M.forEach(o=>box.expandByPoint(o.p));const sz=box.getSize(new THREE.Vector3()),ctr=box.getCenter(new THREE.Vector3());
 const S=FIT/Math.max(sz.x,sz.y,sz.z);const g=new THREE.Group();g.scale.setScalar(S);g.position.set(-ctr.x*S,-box.min.y*S,-ctr.z*S);root.add(g);
 // merged branches
 const pos=[],col=[],c=new THREE.Color();let maxD=0;M.forEach(o=>maxD=Math.max(maxD,o.d));
 M.forEach((o,v)=>{if(v===1)return;const pa=M.get(next(v));pos.push(pa.p.x,pa.p.y,pa.p.z,o.p.x,o.p.y,o.p.z);
  c.setHSL(0.42-0.25*(o.d/maxD),0.8,0.35+0.25*(o.d/maxD));col.push(c.r*.6,c.g*.6,c.b*.6,c.r,c.g,c.b);});
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.add(new THREE.LineSegments(bg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})));
 // root glow
 const rs=new THREE.Mesh(new THREE.SphereGeometry(0.06,12,8),new THREE.MeshBasicMaterial({color:0xfff2b0}));root.add(rs);rs.position.set(g.position.x,g.position.y,g.position.z);
 // highlight
 let hl=null,dots=null;const tc=document.createElement('canvas');tc.width=tc.height=32;const x=tc.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);const dt=new THREE.CanvasTexture(tc);
 const info=document.getElementById('info');
 window.CZ_LIGHT=n=>{n=BigInt(n);const p=pathB(n);placeB(n);const pts=p.map(v=>M.get(K(v)).p);
  if(hl){g.remove(hl);g.remove(dots);hl.geometry.dispose();dots.geometry.dispose();}
  const lg=new THREE.BufferGeometry().setFromPoints(pts);hl=new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xff9a1a,linewidth:2,fog:false,depthTest:false}));hl.renderOrder=5;g.add(hl);
  dots=new THREE.Points(lg.clone(),new THREE.PointsMaterial({color:0xffc04a,size:0.07,map:dt,transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,fog:false}));dots.renderOrder=6;g.add(dots);
  let peak=0n;p.forEach(v=>{if(v>peak)peak=v;});const marks=[322n,754n].filter(v=>p.includes(v));
  info.innerHTML='<b>'+n+'</b>: '+(p.length-1).toLocaleString()+' steps to 1 · peak '+peak.toLocaleString()+(n===27n&&marks.length?' · passes '+marks.join(' and '):'')+(n>BigInt(MAXN)?' <small>(grown just now, beyond the 2000 shown)</small>':'');
  return {steps:p.length-1,peak:peak.toString(),passes:marks.map(String)};};
 window.CZ_LIGHT(27);
 // sign
 const sc=document.createElement('canvas');sc.width=512;sc.height=354;const s=sc.getContext('2d');s.textAlign='center';s.fillStyle='#e6fff2';s.font='bold 44px sans-serif';s.fillText('The Collatz rule',256,60);
 s.font='32px sans-serif';s.fillText('odd → triple it, add 1',256,135);s.fillText('even → halve it',256,185);s.fillText('repeat until 1',256,235);s.fillStyle='#9dffc8';s.font='24px sans-serif';s.fillText('unproven · tap to read more',256,310);
 const st=new THREE.CanvasTexture(sc);st.colorSpace=THREE.SRGBColorSpace;document.getElementById('signtext').setObject3D('mesh',new THREE.Mesh(new THREE.PlaneGeometry(1.22,0.84),new THREE.MeshBasicMaterial({map:st,transparent:true,depthWrite:false,fog:false})));
 // slow turn
 (function spin(){requestAnimationFrame(spin);root.rotation.y+=0.0012;})();
}
const sc=document.querySelector('a-scene');if(sc.hasLoaded)start();else sc.addEventListener('loaded',start);
document.getElementById('f').addEventListener('submit',e=>{e.preventDefault();const v=document.getElementById('num').value.trim();
 if(!/^\d+$/.test(v)||BigInt(v)<1n||v.length>40){document.getElementById('info').textContent='Type a whole number from 1 (up to 40 digits).';return;}window.CZ_LIGHT&&window.CZ_LIGHT(v);});
document.getElementById('brule').onclick=()=>show(RULE);document.getElementById('sign').addEventListener('click',()=>show(RULE));
document.getElementById('portal').addEventListener('click',()=>{location.href='../lantern-grove/'+location.search;});
})();
