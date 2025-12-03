import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, useTexture } from '@react-three/drei';  // Aggiungi useTexture
import { useFrame } from '@react-three/fiber';

// Muovere il modello 3D con le gesture da mobile (es. ruotare, zoomare, spostare con il dito)

const avatar = ['/models/Duck.glb', '/models/Dayo.glb', '/models/girl.glb',
   '/models/CesiumMan.glb', '/models/Emi.glb', '/models/best.glb', '/models/spongebob.glb'];


   import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

function FaceModel(props) {
  const group = useRef()
  const { scene, nodes } = useGLTF(avatar[6])  // Carica modello Spongebob

  // Trova i mesh degli occhi e della bocca (modifica i nomi secondo il tuo modello)
  const leftEye = nodes['LeftEye'] // oppure nodes['Object_XXX']
  const rightEye = nodes['RightEye']
  const mouth = nodes['Mouth']

  // Stato per animazione occhi
  const eyeOpen = useRef(true)
  let eyeTimer = useRef(0)

  // Stato per animazione bocca
  const mouthValue = useRef(0)
  console.log('scene:', scene)
  console.log('nodes:', nodes)

  useFrame((state, delta) => {
    // Occhi: apri/chiudi ogni 2 secondi
    eyeTimer.current += delta
    if (eyeTimer.current > 2) {
      eyeOpen.current = !eyeOpen.current
      eyeTimer.current = 0
    }
    // Se hai morph target
    if (leftEye?.morphTargetInfluences) {
      leftEye.morphTargetInfluences[0] = eyeOpen.current ? 1 : 0 // 1 = aperto, 0 = chiuso
      rightEye.morphTargetInfluences[0] = eyeOpen.current ? 1 : 0
    }
    // Se invece sono mesh, puoi scalare
    if (leftEye && rightEye) {
      leftEye.scale.y = eyeOpen.current ? 1 : 0.1
      rightEye.scale.y = eyeOpen.current ? 1 : 0.1
    }

    // Bocca: movimento casuale
    mouthValue.current += (Math.random() - 0.5) * delta
    mouthValue.current = Math.max(0, Math.min(1, mouthValue.current))
    if (mouth?.morphTargetInfluences) {
      mouth.morphTargetInfluences[0] = mouthValue.current
    }
    if (mouth) {
      mouth.scale.y = 1 + mouthValue.current * 0.5
    }
  })

  return <primitive ref={group} object={scene} {...props} />
}

export default function FaceScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight />
      <FaceModel />
    </Canvas>
  )
}