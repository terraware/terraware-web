import React, { type JSX, useCallback, useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { Box, CircularProgress } from '@mui/material';

import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { APP_PATHS } from 'src/constants';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import SpeciesAddView from 'src/scenes/Species/SpeciesAddView';
import SpeciesDetailView from 'src/scenes/Species/SpeciesDetailView';
import SpeciesEditView from 'src/scenes/Species/SpeciesEditView';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';

const SpeciesRouter = () => {
  const { species, isLoading, refetch } = useOrganizationSpecies();
  const location = useLocation();
  const isListRoute = location.pathname === (APP_PATHS.SPECIES as string);
  const wasListRoute = useRef(isListRoute);
  useEffect(() => {
    if (isListRoute && !wasListRoute.current) {
      void refetch();
    }
    wasListRoute.current = isListRoute;
  }, [isListRoute, refetch]);

  const getSpeciesView = useCallback((): JSX.Element => {
    if (species.length > 0) {
      return <SpeciesListView reloadData={refetch} species={species} />;
    }

    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '64px' }}>
          <CircularProgress />
        </Box>
      );
    }

    return <EmptyStatePage pageName={'Species'} reloadData={() => void refetch()} />;
  }, [isLoading, species, refetch]);

  return (
    <Routes>
      <Route path={'/new'} element={<SpeciesAddView reloadData={() => void refetch()} />} />
      <Route path={'/:speciesId'} element={<SpeciesDetailView reloadData={() => void refetch()} />} />
      <Route path={'/:speciesId/edit'} element={<SpeciesEditView />} />
      <Route path={'/*'} element={getSpeciesView()} />
    </Routes>
  );
};

export default SpeciesRouter;
