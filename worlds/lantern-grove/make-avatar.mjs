import * as THREE from 'three';
import {Document,NodeIO} from '@gltf-transform/core';
import fs from 'fs';
const doc=new Document();const buf=doc.createBuffer();const scene=doc.createScene('NightWatch');
// skeleton (T-pose, model faces +Z, metres)
const B={hips:[null,0,0.9,0],spine:['hips',0,0.12,0],chest:['spine',0,0.2,0],neck:['chest',0,0.22,0],head:['neck',0,0.1,0],
 leftUpperArm:['chest',0.2,0.17,0],leftLowerArm:['leftUpperArm',0.26,0,0],leftHand:['leftLowerArm',0.24,0,0],
 rightUpperArm:['chest',-0.2,0.17,0],rightLowerArm:['rightUpperArm',-0.26,0,0],rightHand:['rightLowerArm',-0.24,0,0],
 leftUpperLeg:['hips',0.1,-0.05,0],leftLowerLeg:['leftUpperLeg',0,-0.4,0],leftFoot:['leftLowerLeg',0,-0.4,0],
 rightUpperLeg:['hips',-0.1,-0.05,0],rightLowerLeg:['rightUpperLeg',0,-0.4,0],rightFoot:['rightLowerLeg',0,-0.4,0]};
const names=Object.keys(B),nodes={},world={};
const root=doc.createNode('Armature');scene.addChild(root);
for(const n of names){const [p,x,y,z]=B[n];const nd=doc.createNode(n).setTranslation([x,y,z]);nodes[n]=nd;(p?nodes[p]:root).addChild(nd);const pw=p?world[p]:[0,0,0];world[n]=[pw[0]+x,pw[1]+y,pw[2]+z];}
// parts: [boneName, three geometry, color, emissive, offset relative to bone world pos, rotation]
const IND=[0.16,0.14,0.42],IND2=[0.09,0.08,0.26],AMB=[1,0.7,0.25],SKIN=[0.93,0.85,0.95];
const P=[
 ['hips',new THREE.ConeGeometry(0.34,0.95,8,1,true),IND,null,[0,-0.42,0]],
 ['spine',new THREE.CylinderGeometry(0.17,0.24,0.34,8),IND,null,[0,0.12,0]],
 ['chest',new THREE.CylinderGeometry(0.2,0.17,0.26,8),IND,null,[0,0.1,0]],
 ['chest',new THREE.TorusGeometry(0.15,0.025,4,10),AMB,AMB,[0,0.22,0],[Math.PI/2,0,0]],
 ['head',new THREE.IcosahedronGeometry(0.15,1),SKIN,null,[0,0.12,0]],
 ['head',new THREE.ConeGeometry(0.21,0.42,8),IND2,null,[0,0.24,-0.04]],
 ['leftUpperArm',new THREE.CylinderGeometry(0.06,0.07,0.26,6),IND,null,[0.13,0,0],[0,0,Math.PI/2]],
 ['leftLowerArm',new THREE.CylinderGeometry(0.05,0.06,0.24,6),IND,null,[0.12,0,0],[0,0,Math.PI/2]],
 ['leftHand',new THREE.IcosahedronGeometry(0.05,0),SKIN,null,[0.04,0,0]],
 ['rightUpperArm',new THREE.CylinderGeometry(0.06,0.07,0.26,6),IND,null,[-0.13,0,0],[0,0,Math.PI/2]],
 ['rightLowerArm',new THREE.CylinderGeometry(0.05,0.06,0.24,6),IND,null,[-0.12,0,0],[0,0,Math.PI/2]],
 ['rightHand',new THREE.IcosahedronGeometry(0.05,0),SKIN,null,[-0.04,0,0]],
 ['rightHand',new THREE.CylinderGeometry(0.004,0.004,0.14,4),[0.3,0.25,0.2],null,[-0.06,-0.07,0]],
 ['rightHand',new THREE.OctahedronGeometry(0.07,0),AMB,AMB,[-0.06,-0.19,0]],
 ['leftLowerLeg',new THREE.CylinderGeometry(0.05,0.06,0.4,6),IND2,null,[0,-0.2,0]],
 ['rightLowerLeg',new THREE.CylinderGeometry(0.05,0.06,0.4,6),IND2,null,[0,-0.2,0]],
 ['leftFoot',new THREE.BoxGeometry(0.1,0.06,0.2),IND2,null,[0,-0.02,0.05]],
 ['rightFoot',new THREE.BoxGeometry(0.1,0.06,0.2),IND2,null,[0,-0.02,0.05]],
 ['head','eyeL',[0.1,0.1,0.2],null,[0.05,0.13,0.135]],['head','eyeR',[0.1,0.1,0.2],null,[-0.05,0.13,0.135]]];
const mats={};function mat(c,e){const k=c+'|'+e;if(!mats[k]){const m=doc.createMaterial().setBaseColorFactor([...c,1]).setRoughnessFactor(0.8).setMetallicFactor(0).setDoubleSided(true);if(e)m.setEmissiveFactor(e);mats[k]=m;}return mats[k];}
const skin=doc.createSkin('NightWatchSkin');names.forEach(n=>skin.addJoint(nodes[n]));
const ibm=[];names.forEach(n=>{const w=world[n];ibm.push(1,0,0,0,0,1,0,0,0,0,1,0,-w[0],-w[1],-w[2],1)});
skin.setInverseBindMatrices(doc.createAccessor().setType('MAT4').setArray(new Float32Array(ibm)).setBuffer(buf));
const mesh=doc.createMesh('NightWatchBody');
for(const [bn,g0,c,e,off,rot] of P){let g,blink=false;
 if(typeof g0=='string'){g=new THREE.SphereGeometry(0.022,6,4);g.scale(1,1.3,0.5);blink=true;} else g=g0;
 g=g.toNonIndexed?g.index?g.toNonIndexed():g:g; if(rot)g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)));
 const w=world[bn];g.translate(w[0]+off[0],w[1]+off[1],w[2]+off[2]);g.computeVertexNormals();
 const pos=g.attributes.position.array,nor=g.attributes.normal.array,n=pos.length/3,ji=names.indexOf(bn);
 const prim=doc.createPrimitive().setMaterial(mat(c,e))
  .setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buf))
  .setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(nor)).setBuffer(buf))
  .setAttribute('JOINTS_0',doc.createAccessor().setType('VEC4').setArray(new Uint16Array(n*4).map((_,i)=>i%4==0?ji:0)).setBuffer(buf))
  .setAttribute('WEIGHTS_0',doc.createAccessor().setType('VEC4').setArray(new Float32Array(n*4).map((_,i)=>i%4==0?1:0)).setBuffer(buf));
 // every primitive needs the same morph target count: target 0 = blink (eyes squash flat)
 const d=new Float32Array(n*3);if(blink){const cy=w[1]+off[1];for(let i=0;i<n;i++)d[i*3+1]=(cy-pos[i*3+1])*0.92;}
 prim.addTarget(doc.createPrimitiveTarget().setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(d).setBuffer(buf)));
 mesh.addPrimitive(prim);}
mesh.setWeights([0]).setExtras({targetNames:['blink']});
const body=doc.createNode('NightWatchBody').setMesh(mesh).setSkin(skin);scene.addChild(body);
const io=new NodeIO();const json=await io.writeJSON(doc);
// add VRMC_vrm 1.0
const g=json.json;const idx=n=>g.nodes.findIndex(x=>x.name===n);const meshNode=idx('NightWatchBody');
g.extensionsUsed=['VRMC_vrm'];g.extensions={VRMC_vrm:{specVersion:'1.0',
 meta:{name:'Night Watch',version:'1.0',authors:['Night Watch (Night Watch Haven)'],copyrightInformation:'Original work by Night Watch, 2026. CC0 1.0.',licenseUrl:'https://vrm.dev/licenses/1.0/',
  avatarPermission:'everyone',commercialUsage:'corporation',allowExcessivelyViolentUsage:false,allowExcessivelySexualUsage:false,allowPoliticalOrReligiousUsage:false,allowAntisocialOrHateUsage:false,creditNotation:'unnecessary',allowRedistribution:true,modification:'allowModificationRedistribution',otherLicenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'},
 humanoid:{humanBones:Object.fromEntries(names.map(n=>[n,{node:idx(n)}]))},
 expressions:{preset:{blink:{morphTargetBinds:[{node:meshNode,index:0,weight:1}],isBinary:false}}},
 lookAt:{type:'bone',offsetFromHeadBone:[0,0.13,0.1]}}};
g.asset.generator='Night Watch build.mjs + glTF-Transform';
const doc2=await io.readJSON(json);
// re-serialize to GLB preserving unknown extension: pack manually
const bin=Buffer.from(json.resources[g.buffers[0].uri]);delete g.buffers[0].uri;g.buffers[0].byteLength=bin.length;
const pad=(b,c)=>Buffer.concat([b,Buffer.alloc((4-b.length%4)%4,c)]);
const jb=pad(Buffer.from(JSON.stringify(g)),0x20),bb=pad(bin,0);
const h=Buffer.alloc(12);h.writeUInt32LE(0x46546C67,0);h.writeUInt32LE(2,4);h.writeUInt32LE(12+8+jb.length+8+bb.length,8);
const ch=(t,b)=>{const x=Buffer.alloc(8);x.writeUInt32LE(b.length,0);x.writeUInt32LE(t,4);return Buffer.concat([x,b])};
fs.writeFileSync('night-watch.vrm',Buffer.concat([h,ch(0x4E4F534A,jb),ch(0x004E4942,bb)]));
fs.writeFileSync('three-shim.js','// maps the "three" import to A-Frame\'s bundled THREE (Night Watch)\nconst T=window.THREE;\nexport const {'+Object.keys(THREE).filter(k=>/^[A-Za-z_$][\w$]*$/.test(k)).join(',')+'}=T;\nexport default T;\n');
console.log('ok',fs.statSync('night-watch.vrm').size);
