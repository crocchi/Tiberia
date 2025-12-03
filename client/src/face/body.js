import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const avatar=['/models/Duck.glb','/models/Dayo.glb']

function Avatar({ lipsync }) {
  const { scene } = useGLTF(avatar[1]);
  const [rot, setRot] = useState(0);

  //posizione avatar nel frame
    scene.position.x=0
    scene.position.y=-10.5
    scene.position.z=2

    scene.scale.x=7
    scene.scale.y=7
    scene.scale.z=1

     //scegli elementi modello
    const eyes = scene.getObjectByName('EyesNode');
  useFrame(() => {
  // Simula il blinking (apertura/chiusura occhi)
  if (eyes) {
    // Valore tra 0.3 (chiuso) e 1 (aperto)
    const blink = 0.7 + 0.3 * Math.abs(Math.sin(Date.now() * 0.002));
    eyes.scale.y = blink;
  }
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

/*
   scene.rotation.y += 0.01; // rotazione continua
    t.current += delta;
    scene.position.y = Math.sin(t.current * 2) * 0.2; // oscillazione verticale


    //posizione avatar nel frame
    scene.position.x=0
    scene.position.y=-10.5
    scene.position.z=2

    scene.scale.x=7
    scene.scale.y=7
    scene.scale.z=1

    //scegli elementi modello
    const eyes = scene.getObjectByName('EyesNode');


    const mouth = scene.getObjectByName('Mouth');
    if (mouth && mouth.morphTargetInfluences) {
      mouth.morphTargetInfluences[0] = Math.abs(Math.sin(Date.now() * 0.005));
    }
*/