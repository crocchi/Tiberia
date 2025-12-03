import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// Muovere il modello 3D con le gesture da mobile (es. ruotare, zoomare, spostare con il dito)

const avatar = ['/models/Duck.glb', '/models/Dayo.glb', '/models/girl.glb', '/models/CesiumMan.glb', '/models/Emi.glb'];

function Avatar({ lipsync }) {
  const { scene } = useGLTF(avatar[1]);
  const [rot, setRot] = useState(0);
  const blinkState = useRef({ nextBlink: 0, closing: false, t: 0 });
  const group = useRef();

  // Posizione avatar nel frame
  scene.position.x = 0;
  scene.position.y = -10.5;
  scene.position.z = 2;
  scene.scale.x = 7;
  scene.scale.y = 7;
  scene.scale.z = 7;

  React.useEffect(() => {
    scene.traverse(obj => {
      if (obj.isMesh) {
        console.log('Mesh:', obj.name);
        // Controlla se EyesNode ha morph targets (probabilmente no per questo modello)
        if (obj.name === 'EyesNode' && obj.morphTargetInfluences) {
          console.log('Morph targets per EyesNode:', obj.morphTargetDictionary);
        }
      }
    });
  }, [scene]);

  // Forza visibilità degli occhi (EyesNode)
  React.useEffect(() => {
    const eyesNode = scene.getObjectByName('EyesNode');
    if (eyesNode) {
      eyesNode.visible = true;
      if (eyesNode.material) {
        eyesNode.material.transparent = false;
        eyesNode.material.opacity = 1;
        // Forza bianco se necessario (ma dal JSON, il materiale è già definito)
      }
    }
  }, [scene]);

  useFrame((state, delta) => {
    // Oscillazione laterale (dondolio)
    if (group.current) {
      group.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 1) * 0.02;
    }

    // Blinking occhi: anima i bone LeftEye e RightEye (non la mesh EyesNode)
    const eyesNode = scene.getObjectByName('EyesNode');
    const now = state.clock.getElapsedTime();
    if (now > blinkState.current.nextBlink) {
      blinkState.current.closing = true;
      blinkState.current.t = 0;
      blinkState.current.nextBlink = now + 2 + Math.random() * 3; // prossimo blink tra 2-5 sec
    }

    if (blinkState.current.closing) {
      blinkState.current.t += delta * 5;
      const blink = Math.max(-0.5, 0 - blinkState.current.t); // Ruota per chiudere (valore negativo per rotazione verso il basso)
      if (eyesNode && eyesNode.skeleton) {
        const leftEyeBone = eyesNode.skeleton.bones.find(b => b.name.toLowerCase().includes('lefteye'));
        const rightEyeBone = eyesNode.skeleton.bones.find(b => b.name.toLowerCase().includes('righteye'));
        if (leftEyeBone) leftEyeBone.rotation.x = blink; // Anima rotazione X per chiudere/aprire
        if (rightEyeBone) rightEyeBone.rotation.x = blink;
      }
      if (blink <= -0.5) blinkState.current.closing = false;
    } else {
      // Riapri gli occhi
      if (eyesNode && eyesNode.skeleton) {
        const leftEyeBone = eyesNode.skeleton.bones.find(b => b.name.toLowerCase().includes('lefteye'));
        const rightEyeBone = eyesNode.skeleton.bones.find(b => b.name.toLowerCase().includes('righteye'));
        if (leftEyeBone) leftEyeBone.rotation.x = 0; // Rotazione neutra
        if (rightEyeBone) rightEyeBone.rotation.x = 0;
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