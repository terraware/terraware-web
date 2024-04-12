import React, { useCallback, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { BusySpinner } from '@terraware/web-components';

import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useOrganization } from 'src/providers';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SpeciesAddView from 'src/scenes/Species/SpeciesAddView';
import SpeciesDetailView from 'src/scenes/Species/SpeciesDetailView';
import SpeciesEditView from 'src/scenes/Species/SpeciesEditView';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';

const SpeciesRouter = () => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const species = useAppSelector(selectSpecies);

  const reloadSpecies = useCallback(() => {
    void dispatch(requestSpecies(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (!species) {
      reloadSpecies();
    }
  }, [species, reloadSpecies]);

  const getSpeciesView = useCallback((): JSX.Element => {
    if (species === undefined) {
      return <BusySpinner withSkrim />;
    }

    if ((species || []).length > 0) {
      return <SpeciesListView reloadData={reloadSpecies} species={species || []} />;
    }

    return <EmptyStatePage pageName={'Species'} reloadData={reloadSpecies} />;
  }, [species, reloadSpecies]);

  return (
    <Routes>
      <Route path={'/new'} element={<SpeciesAddView reloadData={reloadSpecies} />} />
      <Route path={'/speciesId'} element={<SpeciesDetailView reloadData={reloadSpecies} />} />
      <Route path={'/speciesId/edit'} element={<SpeciesEditView />} />
      <Route path={'/*'} element={getSpeciesView()} />
    </Routes>
  );
};

export default SpeciesRouter;
