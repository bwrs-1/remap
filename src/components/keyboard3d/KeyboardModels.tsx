import React, { useMemo } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

interface KeyboardModelsProps {
  splitDistance?: number;
  rotationAngle?: number;
  pitchAngle?: number;
  materialColor?: string;
  roughness?: number;
  metalness?: number;
}

export const KeyboardModels: React.FC<KeyboardModelsProps> = ({
  splitDistance = 1.0,
  rotationAngle = 0.12,
  pitchAngle = -0.5,
  materialColor = '#f0f0f0',
  roughness = 0.35,
  metalness = 0.1,
}) => {
  const leftGltf = useGLTF('/models/keyboard-left.glb');
  const rightGltf = useGLTF('/models/keyboard-right.glb');

  // Shared high-detail material that catches highlights and shadows for dithering
  const customMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(materialColor),
      roughness,
      metalness,
      flatShading: false,
    });
  }, [materialColor, roughness, metalness]);

  // Clone scenes and apply material
  const leftScene = useMemo(() => {
    const cloned = leftGltf.scene.clone(true);
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = customMaterial;
      }
    });
    return cloned;
  }, [leftGltf.scene, customMaterial]);

  const rightScene = useMemo(() => {
    const cloned = rightGltf.scene.clone(true);
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = customMaterial;
      }
    });
    return cloned;
  }, [rightGltf.scene, customMaterial]);

  return (
    <group rotation={[pitchAngle, 0, 0]}>
      {/* Left Keyboard Half */}
      <group position={[-splitDistance, 0, 0]} rotation={[0, 0, rotationAngle]}>
        <Center>
          <primitive object={leftScene} />
        </Center>
      </group>

      {/* Right Keyboard Half */}
      <group position={[splitDistance, 0, 0]} rotation={[0, 0, -rotationAngle]}>
        <Center>
          <primitive object={rightScene} />
        </Center>
      </group>
    </group>
  );
};

useGLTF.preload('/models/keyboard-left.glb');
useGLTF.preload('/models/keyboard-right.glb');
