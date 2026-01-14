import React, { useEffect, useRef } from 'react';

import { Box } from '@mui/material';
import { SplatMesh } from '@sparkjsdev/spark';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PreviewRouter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const autoRotateRef = useRef<boolean>(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth * 0.8, containerRef.current.clientHeight * 0.8);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const plyUrl = '/assets/models/test/PlyExamples/backyard.ply';
    const splatMesh = new SplatMesh({ url: plyUrl });
    scene.add(splatMesh);

    // Note that each model might have different xyz needs
    splatMesh.rotation.x = -Math.PI / 2;
    splatMesh.position.y = -0.1;

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
      if (autoRotateRef.current) {
        splatMesh.rotation.z += 0.005;
      }
    });

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) {
        return;
      }

      const width = containerRef.current.clientWidth * 0.8;
      const height = containerRef.current.clientHeight * 0.8;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Setup mouse controls to orbit the camera around
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.2, 0, 0);
    controls.minDistance = 0.8;
    controls.maxDistance = 2.3;
    controls.update();

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        autoRotateRef.current = true;
      }, 3000);
    };

    const handleUserInteraction = () => {
      autoRotateRef.current = false;
      resetInactivityTimer();
    };

    controls.addEventListener('start', handleUserInteraction);
    controls.addEventListener('change', handleUserInteraction);

    const container = containerRef.current;

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: 'calc(100vh - 96px)',
        position: 'relative',
      }}
    />
  );
};

export default PreviewRouter;
