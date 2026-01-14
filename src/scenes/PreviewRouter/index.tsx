import React, { useEffect, useRef } from 'react';

import { Viewer as GaussianSplatViewer } from '@mkkellogg/gaussian-splats-3d';
import { Box, Container, Typography } from '@mui/material';

const GaussianSplat = ({ source }: { source: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<GaussianSplatViewer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const viewer = new GaussianSplatViewer({
      cameraUp: [0, 0, 1],
      initialCameraPosition: [0, 0, 0.25],
      initialCameraLookAt: [0, 0.1, 0.25],
      sharedMemoryForWorkers: false,
      rootElement: container,
    });

    viewerRef.current = viewer;

    viewer
      .addSplatScene(source, {
        progressiveLoad: false,
      })
      .then(() => {
        viewer.start();

        // Start rotation animation - rotate the splat around Z axis
        let angle = 0;

        const animate = () => {
          angle += 0.005; // Rotation speed

          // Rotate the splat scene itself
          if (viewerRef.current) {
            const splatMesh = (viewerRef.current as any).splatMesh;
            if (splatMesh && splatMesh.rotation) {
              splatMesh.rotation.z = angle;
            }
          }

          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load Gaussian splat:', error);
      });

    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clean up before React removes the DOM
      if (viewerRef.current && container && container.isConnected) {
        try {
          viewerRef.current.stop();
        } catch (error) {
          // Ignore stop errors
        }

        // Manually remove canvas before disposing
        try {
          const canvas = container.querySelector('canvas');
          if (canvas && canvas.parentNode === container) {
            container.removeChild(canvas);
          }
        } catch (error) {
          // Ignore removal errors
        }

        try {
          viewerRef.current.dispose();
        } catch (error) {
          // Ignore dispose errors
        }

        viewerRef.current = null;
      }
    };
  }, [source]);

  return <Box ref={containerRef} sx={{ width: '100%', height: '100%', position: 'relative' }} />;
};

export default function PreviewRouter() {
  return (
    <Container maxWidth={false} sx={{ height: 'calc(100vh - 96px)', padding: 3 }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant='h4' gutterBottom>
          3D Gaussian Splat Preview
        </Typography>
        <Box sx={{ flexGrow: 1, backgroundColor: '#000', borderRadius: 1, overflow: 'hidden' }}>
          <GaussianSplat source='/assets/models/test/PlyExamples/backyard.ply' />
        </Box>
      </Box>
    </Container>
  );
}
