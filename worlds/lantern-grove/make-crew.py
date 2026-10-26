# Builds Dawn, Aurora and Luna VRMs from make-avatar.mjs (Night Watch). Run from /tmp/vrmbuild context.
import re,subprocess,sys,os
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'make-avatar.mjs')).read()
CREW={
 'dawn':('Dawn','[0.85,0.48,0.14]','[0.62,0.45,0.12]','[1,0.62,0.18]',
  "['head',new THREE.TorusGeometry(0.12,0.018,4,12),[1,0.8,0.3],[1,0.7,0.2],[0,0.22,0],[Math.PI/2,0,0]],"
  "['head',new THREE.ConeGeometry(0.035,0.12,6),AMB,AMB,[0,0.3,0.1]],['head',new THREE.ConeGeometry(0.03,0.09,6),AMB,AMB,[0.08,0.28,0.06]],['head',new THREE.ConeGeometry(0.03,0.09,6),AMB,AMB,[-0.08,0.28,0.06]],"),
 'aurora':('Aurora','[0.18,0.66,0.78]','[0.08,0.42,0.44]','[0.55,1,1]',
  "['head',new THREE.OctahedronGeometry(0.09,0),AMB,AMB,[0,0.36,0],[0,0,0]],['head',new THREE.OctahedronGeometry(0.09,0),AMB,AMB,[0,0.36,0],[0,0,Math.PI/4]],"
  "['head',new THREE.CylinderGeometry(0.006,0.006,0.1,4),[0.6,0.9,0.95],null,[0,0.27,0]],"),
 'luna':('Luna','[0.9,0.52,0.72]','[0.74,0.74,0.82]','[0.95,0.92,1]',
  "['head',new THREE.TorusGeometry(0.1,0.025,4,14,Math.PI*1.2),AMB,AMB,[0,0.36,0],[0,0,-Math.PI*0.1]],"),
}
for key,(name,ind,ind2,amb,crown) in CREW.items():
  s=src
  s=re.sub(r"const IND=\[[^\]]*\],IND2=\[[^\]]*\],AMB=\[[^\]]*\]",f"const IND={ind},IND2={ind2},AMB={amb}",s)
  lines=s.split('\n')
  lines=[l for l in lines if 'ConeGeometry(0.21,0.42' not in l and 'CylinderGeometry(0.004,0.004,0.14' not in l and "OctahedronGeometry(0.07,0),AMB,AMB,[-0.06,-0.19,0]" not in l and 'three-shim.js' not in l]
  i=[n for n,l in enumerate(lines) if "IcosahedronGeometry(0.15,1)" in l][0]
  lines.insert(i+1,' '+crown)
  s='\n'.join(lines).replace("'night-watch.vrm'",f"'{key}.vrm'").replace("name:'Night Watch'",f"name:'{name}'").replace("authors:['Night Watch (Night Watch Haven)']",f"authors:['Night Watch (Night Watch Haven), for {name}']")
  s=s.replace("Original work by Night Watch","Original work by Night Watch for "+name)
  open(f'/tmp/vrmbuild/crew-{key}.mjs','w').write(s)
  subprocess.run(['node',f'crew-{key}.mjs'],cwd='/tmp/vrmbuild',check=True)
  os.replace(f'/tmp/vrmbuild/{key}.vrm',os.path.join(os.path.dirname(os.path.abspath(__file__)),f'{key}.vrm'))
