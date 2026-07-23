import React, { type JSX, useCallback } from 'react';
import { Route, Routes } from 'react-router';

import { Box, CircularProgress } from '@mui/material';

import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import SpeciesAddView from 'src/scenes/Species/SpeciesAddView';
import SpeciesDetailView from 'src/scenes/Species/SpeciesDetailView';
import SpeciesEditView from 'src/scenes/Species/SpeciesEditView';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';

const SpeciesRouter = () => {
  const { species, isLoading, refetch } = useOrganizationSpecies();

  const getSpeciesView = useCallback((): JSX.Element => {
    // Show a spinner while species are still loading so the onboarding empty state doesn't flash first.
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '64px' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (species.length > 0) {
      return <SpeciesListView reloadData={refetch} species={species} />;
    }

    return <EmptyStatePage pageName={'Species'} reloadData={refetch} />;
  }, [isLoading, species, refetch]);

  return (
    <Routes>
      <Route path={'/new'} element={<SpeciesAddView reloadData={refetch} />} />
      <Route path={'/:speciesId'} element={<SpeciesDetailView reloadData={refetch} />} />
      <Route path={'/:speciesId/edit'} element={<SpeciesEditView />} />
      <Route path={'/*'} element={getSpeciesView()} />
    </Routes>
  );
};

export default SpeciesRouter;
