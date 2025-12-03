import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function Avatar({ lipsync }) {
  const { scene } = useGLTF('/models/Predator_s.glb');

console.log(scene);
useFrame(() => {
  const mouth = scene.getObjectByName('Mouth');
  if (mouth && mouth.morphTargetInfluences) {
    mouth.morphTargetInfluences[0] = Math.abs(Math.sin(Date.now() * 0.005));
  }
});
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

