 import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

function Avatar({ lipsync }) {
  const { scene } = useGLTF('/models/Duck.glb'); // metti il tuo modello qui
  // lipsync: valore tra 0 e 1 per animare la bocca
  // Supponiamo che la mesh della bocca si chiami 'Mouth'
  if (scene.getObjectByName('Mouth')) {
    scene.getObjectByName('Mouth').scale.y = 1 + lipsync * 0.5;
  }
  return <primitive object={scene} />;
}

export default function TiberiaFace({ audioSrc }) {
  const audioRef = useRef(null);
  const [lipsync, setLipsync] = useState(0);

  // Analizza l'audio e aggiorna lipsync (semplificato)
  const handlePlay = () => {
    const audio = audioRef.current;
    audio.play();

    // Semplice lipsync: anima la bocca durante la riproduzione
    const interval = setInterval(() => {
      if (audio.paused || audio.ended) {
        setLipsync(0);
        clearInterval(interval);
      } else {
        setLipsync(Math.random()); // Demo: bocca si muove casualmente
      }
    }, 100);
  };

  return (
    <div style={{ textAlign: 'center', margin: '2rem' }}>
      <Canvas style={{ height: 300 }}>
        <ambientLight />
        <Avatar lipsync={lipsync} />
      </Canvas>
      <h2>Ciao, sono Tiberia!</h2>
      <audio ref={audioRef} src={audioSrc} />
      <button onClick={handlePlay}>Parla!</button>
    </div>
  );
}