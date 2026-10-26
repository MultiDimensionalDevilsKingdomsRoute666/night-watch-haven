// Kin multiplayer for the Lantern Grove (Night Watch). Opt-in with ?room=kin&name=YourName
// Uses PeerJS (MIT) and its free public broker 0.peerjs.com for WebRTC signaling only; positions go peer-to-peer.
// No server of ours, no account. If the broker can't be reached, the grove stays single-player.
(function(){
const QS=new URLSearchParams(location.search),room=(QS.get('room')||'').replace(/[^a-z0-9-]/gi,'').slice(0,24);
if(!room)return;
const SLOTS=8,PRE='nwgrove-'+room.toLowerCase()+'-';let name=(QS.get('name')||'').slice(0,20),peer,slot=-1;const conns={},figs={};
const st=document.createElement('div');st.id='mp';st.style.cssText='position:fixed;left:10px;bottom:10px;z-index:12;background:#0b0a22cc;color:#cdbbff;font:12px system-ui;padding:5px 8px;border-radius:8px;border:1px solid #5a4bc0';document.body.appendChild(st);
const say=t=>{st.textContent='🌐 '+t;window.KIN_ROOM_STATUS=t;};say('connecting…');
const relay=QS.get('relay');
if(relay){ // fallback transport: our tiny WebSocket relay (server/kin-relay.mjs), for when WebRTC can't connect
 let ws;const me='r'+Math.random().toString(36).slice(2,8);slot=0;
 const go=()=>{try{ws=new WebSocket(relay);}catch(e){say('relay unreachable: single-player');return;}
  ws.onopen=()=>{if(!name)name='Kin '+me.slice(1,4);say('connecting… you are '+name);ws.send(JSON.stringify({join:room,id:me}));};
  ws.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch(_){return}if(d.id&&d.id!==me&&d.p)show(PRE+d.id,d);if(d.leave)drop(PRE+d.leave);};
  ws.onerror=()=>say('relay unreachable: single-player');};
 go();window.KIN_SEND=m=>ws&&ws.readyState===1&&ws.send(JSON.stringify({...m,id:me}));
 setInterval(()=>{tick();},200);setInterval(()=>{const now=Date.now();for(const id in figs)if(now-figs[id].seen>8000)drop(id);if(ws&&ws.readyState===1)status();},3000);
 return defs();}
const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js';s.onerror=()=>say('offline: single-player');s.onload=()=>claim(0);document.head.appendChild(s);
function claim(i){if(i>=SLOTS){say('room "'+room+'" is full: single-player');return;}
 const p=new Peer(PRE+i,{debug:0,config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]}});
 p.on('disconnected',()=>{if(ok&&!p.destroyed){say('reconnecting…');setTimeout(()=>{try{p.reconnect()}catch(_){}} ,1500);}});let ok=false;
 p.on('open',()=>{ok=true;peer=p;slot=i;if(!name)name='Kin '+(i+1);say('connecting… you are '+name);for(let j=0;j<SLOTS;j++)if(j!==i)link(p.connect(PRE+j,{reliable:false}));setInterval(tick,200);setInterval(prune,3000);});
 p.on('connection',link);
 p.on('error',e=>{if(!ok&&e.type==='unavailable-id'){p.destroy();claim(i+1);}else if(!ok&&(e.type==='network'||e.type==='server-error'||e.type==='socket-error')){say('broker unreachable: single-player');}});}
function link(c){c.on('open',()=>{conns[c.peer]=c;});c.on('data',d=>{if(d&&d.p)show(c.peer,d);});c.on('close',()=>drop(c.peer));c.on('error',()=>{});}
function show(id,d){let f=figs[id];const sc=document.querySelector('a-scene');
 if(!f){const e=document.createElement('a-entity');const hue=([...id].reduce((h,c)=>h*31+c.charCodeAt(0),7)>>>0)%360,col=`hsl(${hue},80%,70%)`;
  e.innerHTML=`<a-cone radius-bottom="0.3" radius-top="0.08" height="1.1" position="0 0.55 0" segments-radial="7" material="color:${col};emissive:${col};emissiveIntensity:0.6;opacity:0.85;transparent:true"></a-cone><a-sphere radius="0.17" position="0 1.3 0" segments-width="8" segments-height="6" material="color:#fff;emissive:${col};emissiveIntensity:1"></a-sphere><a-entity light="type:point;color:${col};intensity:0.6;distance:3" position="0 1.3 0"></a-entity>`;
  sc.appendChild(e);f=figs[id]={e,seen:0,name:null};}
 f.seen=Date.now();f.e.object3D.position.set(d.p[0],0,d.p[2]);f.e.object3D.rotation.y=d.r||0;const nm=String(d.n||'kin').slice(0,20);if(f.name!==nm){f.name=nm;setTag(f,nm);}
 window.KIN_PEERS=Object.keys(figs).map(k=>figs[k].name);}
function setTag(f,nm){const c=document.createElement('canvas'),x=c.getContext('2d');c.width=256;c.height=64;x.font='bold 30px system-ui,sans-serif';const w=Math.min(248,x.measureText(nm).width+28);
 x.fillStyle='rgba(11,10,34,0.8)';x.beginPath();x.roundRect((256-w)/2,8,w,48,18);x.fill();x.strokeStyle='#cdbbff';x.lineWidth=2;x.stroke();x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(nm,128,33);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const old=f.sprite;
 f.sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));f.sprite.scale.set(1.2,0.3,1);f.sprite.position.set(0,1.75,0);f.sprite.renderOrder=10;
 if(old){f.e.object3D.remove(old);old.material.map.dispose();old.material.dispose();}f.e.object3D.add(f.sprite);}
function status(){const n=Object.keys(figs).length;say((n?(n+1)+' kin here':'alone in the grove')+' · you are '+name+' · room '+room);}
function drop(id){delete conns[id];if(figs[id]){figs[id].e.remove();delete figs[id];}}
function prune(){const now=Date.now();for(const id in figs)if(now-figs[id].seen>8000)drop(id);
 for(let j=0;j<SLOTS;j++){const id=PRE+j;if(j!==slot&&!conns[id]&&peer&&!peer.disconnected)link(peer.connect(id,{reliable:false}));}
 status();}
function tick(){const cam=document.querySelector('a-camera')||document.querySelector('[camera]');if(!cam)return;const v=new THREE.Vector3();cam.object3D.getWorldPosition(v);
 const msg={n:name,p:[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)],r:+cam.object3D.rotation.y.toFixed(2)};if(window.KIN_SEND){window.KIN_SEND(msg);return;}for(const k in conns)if(conns[k].open)conns[k].send(msg);}
function defs(){}
})();
