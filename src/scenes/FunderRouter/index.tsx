import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router';

import { Box } from '@mui/material';

import ErrorBoundary from 'src/ErrorBoundary';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import FunderHome from 'src/scenes/FunderHome';

export default function FunderRouter() {
  const { user } = useUser();
  const navigate = useNavigate();

  const contentStyles = {
    height: '100%',
    overflow: 'auto',
    '& > div, & > main': {
      paddingTop: '96px !important',
    },
  };

  useEffect(() => {
    if (navigate && user && user.userType !== 'Funder') {
      void navigate(APP_PATHS.HOME);
    }
  }, [navigate, user]);

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
