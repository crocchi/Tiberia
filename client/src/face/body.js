import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, useTexture } from '@react-three/drei';  // Aggiungi useTexture
import { useFrame } from '@react-three/fiber';

// Muovere il modello 3D con le gesture da mobile (es. ruotare, zoomare, spostare con il dito)

const avatar = ['/models/Duck.glb', '/models/Dayo.glb', '/models/girl.glb', '/models/CesiumMan.glb', '/models/Emi.glb'];

function Avatar({ lipsync }) {
  const { scene } = useGLTF(avatar[1]);
  const [rot, setRot] = useState(0);
  const blinkState = useRef({ nextBlink: 0, closing: false });
  const group = useRef();

  // Carica le texture per gli occhi (adatta i path alle tue immagini)
  const eyesOpenTexture = useTexture('/models/textures/gltf_embedded_4.jpeg');  // Texture occhi aperti
  const eyesClosedTexture = useTexture('/models/textures/gltf_embedded_10.jpeg');  // Texture occhi chiusi

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

    // Blinking occhi: cambia texture invece di animare bone
    const eyesNode = scene.getObjectByName('EyesNode');
    const now = state.clock.getElapsedTime();
    if (now > blinkState.current.nextBlink) {
      blinkState.current.closing = true;
      blinkState.current.nextBlink = now + 2 + Math.random() * 3;  // Prossimo blink tra 2-5 sec
      if (eyesNode && eyesNode.material) {
        eyesNode.material.map = eyesClosedTexture;  // Chiudi occhi
        eyesNode.material.needsUpdate = true;
      }
    } else if (blinkState.current.closing && now > blinkState.current.nextBlink - 0.2) {  // Riapri dopo 0.2 sec
      blinkState.current.closing = false;
      if (eyesNode && eyesNode.material) {
        eyesNode.material.map = eyesOpenTexture;  // Riapri occhi
        eyesNode.material.needsUpdate = true;
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