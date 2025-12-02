import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function Avatar({ lipsync }) {
  const { scene } = useGLTF('/models/girl.glb');
  useFrame(() => {
    const mouth = scene.getObjectByName('Mouth');
    if (mouth) {
      // Modifica la scala Y per simulare apertura/chiusura bocca
      mouth.scale.y = 1 + Math.abs(Math.sin(Date.now() * 0.005)) * 0.5;
    }
    scene.rotation.y += 0.01;
  });
  return <primitive object={scene} />;
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

React.useEffect(() => {
  console.log(scene.children.map(obj => obj.name));
}, [scene]);