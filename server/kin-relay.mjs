// Tiny WebSocket relay for Lantern Grove kin rooms (Night Watch). MIT, like the haven.
// Run: cd server && npm install && PORT=8790 node kin-relay.mjs
// Then open .../worlds/lantern-grove/?room=kin&name=You&relay=ws://HOST:8790
import {WebSocketServer} from 'ws';
const PORT=+process.env.PORT||8790,MAX=32,rooms=new Map();
const wss=new WebSocketServer({port:PORT,maxPayload:2048});
wss.on('connection',ws=>{let room=null,id=null;
 ws.on('message',buf=>{let d;try{d=JSON.parse(buf)}catch(_){return}
  if(d.join&&!room){room=String(d.join).slice(0,24);id=String(d.id||'').slice(0,12);const set=rooms.get(room)||new Set();if(set.size>=MAX)return ws.close();set.add(ws);rooms.set(room,set);return;}
  if(!room||!Array.isArray(d.p))return;const out=JSON.stringify({id,n:String(d.n||'kin').slice(0,20),p:d.p.slice(0,3).map(Number),r:+d.r||0});
  for(const o of rooms.get(room))if(o!==ws&&o.readyState===1)o.send(out);});
 ws.on('close',()=>{const set=room&&rooms.get(room);if(!set)return;set.delete(ws);for(const o of set)o.readyState===1&&o.send(JSON.stringify({leave:id}));if(!set.size)rooms.delete(room);});});
console.log('kin relay on ws://0.0.0.0:'+PORT);
