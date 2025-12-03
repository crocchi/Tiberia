import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const avatar=['/models/Duck.glb','/models/Dayo.glb']

function Avatar({ lipsync }) {
  const { scene } = useGLTF(avatar[1]);
  const [rot, setRot] = useState(0);

  useFrame(() => {
    scene.rotation.y = rot;
  });

  console.log(scene);
return (
    <primitive
      object={scene}
      onClick={() => setRot(rot + Math.PI / 2)}
    />
  );
}

export default function TiberiaFace({ audioSrc }) {
  return (
    <div style={{ textAlign: 'center', margin: '2rem' }}>
      <Canvas style={{ height: 300 }}>
        <ambientLight />
        <Avatar lipsync={0} />
      </Canvas>
      <h2>Ciao, sono Tiberia!!</h2>
    </div>
  );
}

