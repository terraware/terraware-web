import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import SpeciesAddView from 'src/scenes/Species/SpeciesAddView';
import SpeciesDetailView from 'src/scenes/Species/SpeciesDetailView';
import SpeciesEditView from 'src/scenes/Species/SpeciesEditView';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';

const SpeciesAddRoute = (): JSX.Element => {
  const { refetch } = useOrganizationSpecies();
  return <SpeciesAddView reloadData={() => void refetch()} />;
};

const SpeciesDetailRoute = (): JSX.Element => {
  const { refetch } = useOrganizationSpecies();
  return <SpeciesDetailView reloadData={() => void refetch()} />;
};

const SpeciesRouter = () => {
  return (
    <Routes>
      <Route path={'/new'} element={<SpeciesAddRoute />} />
      <Route path={'/:speciesId'} element={<SpeciesDetailRoute />} />
      <Route path={'/:speciesId/edit'} element={<SpeciesEditView />} />
      <Route path={'/*'} element={<SpeciesListView />} />
    </Routes>
  );
};

export default SpeciesRouter;
