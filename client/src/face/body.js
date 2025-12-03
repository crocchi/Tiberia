import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, useTexture } from '@react-three/drei';  // Aggiungi useTexture
import { useFrame } from '@react-three/fiber';

// Muovere il modello 3D con le gesture da mobile (es. ruotare, zoomare, spostare con il dito)

const avatar = ['/models/Duck.glb', '/models/Dayo.glb', '/models/girl.glb', '/models/CesiumMan.glb', '/models/Emi.glb'];

function Avatar({ lipsync }) {
  const { scene } = useGLTF(avatar[1]);
  const [rot, setRot] = useState(0);
  const blinkState = useRef({ nextBlink: 0, closing: false, t: 0 });
  const group = useRef();

  // Carica le texture per gli occhi
  const eyesOpenTexture = useTexture('/models/textures/gltf_embedded_10.jpeg');  // Texture occhi aperti
  const eyesClosedTexture = useTexture('/models/textures/gltf_close.jpeg');  // Texture occhi chiusi

  // Posizione avatar nel frame
  scene.position.x = 0;
  scene.position.y = -10.5;
  scene.position.z = 2;
  scene.scale.x = 7;
  scene.scale.y = 7;
  scene.scale.z = 7;
  console.log('Avatar scene loaded:', scene);

  // Forza visibilità degli occhi (EyesNode) e applica texture iniziale
  React.useEffect(() => {
    const eyesNode = scene.getObjectByName('EyesNode');
    if (eyesNode && eyesNode.material) {
      eyesNode.visible = true;
      eyesNode.material.transparent = false;
      eyesNode.material.opacity = 1;
      eyesNode.material.map = eyesOpenTexture;  // Inizia con occhi aperti
      eyesNode.material.needsUpdate = true;
    }
  }, [scene, eyesOpenTexture]);

  useFrame((state, delta) => {
    // Oscillazione laterale (dondolio)
    if (group.current) {
      group.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 1) * 0.02;
    }

    // Blinking occhi: anima i bone LeftEye e RightEye invece di texture
    const eyesNode = scene.getObjectByName('EyesNode');
    const now = state.clock.getElapsedTime();
    if (now > blinkState.current.nextBlink) {
      blinkState.current.closing = true;
      blinkState.current.t = 0;
      blinkState.current.nextBlink = now + 2 + Math.random() * 3;  // Prossimo blink tra 2-5 sec
    }

    if (blinkState.current.closing) {
      blinkState.current.t += delta * 5;  // Velocità chiusura
      const blinkValue = Math.max(-0.5, 0 - blinkState.current.t);  // Ruota per chiudere (valore negativo per rotazione verso il basso)
      if (eyesNode && eyesNode.skeleton) {
        const leftEyeBone = eyesNode.skeleton.bones.find(b => b.name.toLowerCase().includes('lefteye'));
        const rightEyeBone = eyesNode.skeleton.bones.find(b => b.name.toLowerCase().includes('righteye'));
        if (leftEyeBone) leftEyeBone.rotation.x = blinkValue;  // Anima rotazione X per chiudere/aprire
        if (rightEyeBone) rightEyeBone.rotation.x = blinkValue;
      }
      if (blinkState.current.t >= 1) blinkState.current.closing = false;
    } else {
      // Riapri gli occhi gradualmente
      blinkState.current.t -= delta * 5;
      const blinkValue = Math.max(-0.5, 0 - Math.max(0, blinkState.current.t));
      if (eyesNode && eyesNode.skeleton) {
        const leftEyeBone = eyesNode.skeleton.bones.find(b => b.name.toLowerCase().includes('lefteye'));
        const rightEyeBone = eyesNode.skeleton.bones.find(b => b.name.toLowerCase().includes('righteye'));
        if (leftEyeBone) leftEyeBone.rotation.x = blinkValue;
        if (rightEyeBone) rightEyeBone.rotation.x = blinkValue;
      }
    }
  });

  return <group ref={group}><primitive object={scene} /></group>;
}

export default function TiberiaFace({ audioSrc }) {
  return (
    <div style={{ textAlign: 'center', margin: '2rem' }}>
      <Canvas style={{ height: 300 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Avatar lipsync={0} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      <h2>Ciao, sono Tiberia!!</h2>
    </div>
  );
}