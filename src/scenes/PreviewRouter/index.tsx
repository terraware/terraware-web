import React, { Suspense } from 'react';

import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

function PlyModel({ url }: { url: string }) {
  const geometry = useLoader(PLYLoader, url);

  return (
    <mesh>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <primitive object={geometry} attach='geometry' />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <meshBasicMaterial vertexColors />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <OrbitControls />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={500} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight intensity={500} position={[10, 10, 5]} />
      <Suspense fallback={null}>
        <PlyModel url='/assets/models/test/PlyExamples/point_cloud_29999 (5).ply' />
      </Suspense>
    </>
  );
}

export default function PreviewRouter() {
  return (
    <Container maxWidth={false} sx={{ height: 'calc(100vh - 96px)', padding: 3 }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant='h4' gutterBottom>
          3D Model Preview
        </Typography>
        <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Suspense
            fallback={
              <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
                <CircularProgress />
              </Box>
            }
          >
            <Canvas>
              <Scene />
            </Canvas>
          </Suspense>
        </Box>
      </Box>
    </Container>
  );
}
