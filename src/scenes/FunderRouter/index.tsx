import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';

import { Box } from '@mui/material';

import ErrorBoundary from 'src/ErrorBoundary';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { FundingEntityProvider, useUser } from 'src/providers';
import FunderHome from 'src/scenes/FunderHome';

import FunderInviteView from '../FunderInvite/FunderInviteView';

export default function FunderRouter() {
  const { user } = useUser();
  const navigate = useSyncNavigate();

  const contentStyles = {
    height: '100%',
    overflow: 'auto',
    '& > div, & > main': {
      paddingTop: '96px !important',
    },
  };

  useEffect(() => {
    if (navigate && user && user.userType !== 'Funder') {
      navigate(APP_PATHS.HOME);
    }
  }, [navigate, user]);

  return (
    <Box sx={contentStyles} className={'scrollable-content'}>
      <ErrorBoundary>
        <Routes>
          <Route path={APP_PATHS.FUNDER_HOME} element={<FunderHome />} />
          <Route
            path={`${APP_PATHS.FUNDER_INVITE}`}
            element={
              <FundingEntityProvider>
                <FunderInviteView />
              </FundingEntityProvider>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Box>
  );
}
