import React, { type JSX, useCallback } from 'react';
import { Route, Routes } from 'react-router';

import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import SpeciesAddView from 'src/scenes/Species/SpeciesAddView';
import SpeciesDetailView from 'src/scenes/Species/SpeciesDetailView';
import SpeciesEditView from 'src/scenes/Species/SpeciesEditView';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';

const SpeciesRouter = () => {
  const { species, refetch } = useOrganizationSpecies();

  const getSpeciesView = useCallback((): JSX.Element => {
    if (species.length > 0) {
      return <SpeciesListView reloadData={refetch} species={species} />;
    }

    return <EmptyStatePage pageName={'Species'} reloadData={refetch} />;
  }, [species, refetch]);

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
