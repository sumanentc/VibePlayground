import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

function createDiffMesh(diff, showArrows) {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshStandardMaterial({
    color: diff.type === 'added' ? 0x00ff00 :
          diff.type === 'removed' ? 0xff0000 :
          diff.type === 'unchanged' ? 0x808080 : 0x0000ff,
    transparent: true,
    opacity: 0.8
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(diff.x, diff.y, diff.z);
  mesh.userData = { content: diff.content };

  // Create arrows for connections
  if (showArrows) {
    diff.connections.forEach((connectedDiff) => {
      const arrowGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
      const arrowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

      // Calculate arrow position and direction
      const direction = new THREE.Vector3(
        connectedDiff.x - diff.x,
        connectedDiff.y - diff.y,
        connectedDiff.z - diff.z
      ).normalize();

      const length = direction.length();
      arrow.position.set(
        diff.x + direction.x * (length - 0.2),
        diff.y + direction.y * (length - 0.2),
        diff.z + direction.z * (length - 0.2)
      );

      // Rotate arrow to point in the right direction
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      );
      arrow.quaternion.copy(quaternion);

      mesh.userData.arrows = mesh.userData.arrows || [];
      mesh.userData.arrows.push(arrow);
    });
  }

  return mesh;
}

function DiffViewer({ comparison, showArrows }) {
  const { scene } = useThree();

  React.useEffect(() => {
    if (!comparison) return;

    // Clear existing meshes
    scene.clear();

    // Create and add diff meshes
    comparison.forEach((diff, index) => {
      const mesh = createDiffMesh(diff, showArrows);
      scene.add(mesh);
    });

    return () => {
      // Cleanup on unmount
      scene.clear();
    };
  }, [comparison, scene]);

  return null; // This component only manages scene objects
}

export default DiffViewer;
