import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Box } from '@mui/material';

import ErrorBoundary from 'src/ErrorBoundary';
import { APP_PATHS } from 'src/constants';
import FunderHome from 'src/scenes/FunderHome';

export default function FunderRouter() {
  const contentStyles = {
    height: '100%',
    overflow: 'auto',
    '& > div, & > main': {
      paddingTop: '96px !important',
    },
  };

  return (
    <Box sx={contentStyles} className={'scrollable-content'}>
      <ErrorBoundary>
        <Routes>
          <Route path={APP_PATHS.FUNDER_HOME} element={<FunderHome />} />
        </Routes>
      </ErrorBoundary>
    </Box>
  );
}
