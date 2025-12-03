import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function Avatar({ lipsync }) {
  const { scene } = useGLTF('/models/Duck.glb');
  React.useEffect(() => {
  console.log(scene.children.map(obj => obj.name));
}, [scene]);

console.log(scene);

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

