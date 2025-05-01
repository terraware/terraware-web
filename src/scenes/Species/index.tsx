import React, { useCallback, useEffect } from 'react';
import { Route, Routes } from 'react-router';

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

  const speciesResponse = useAppSelector(selectSpecies(selectedOrganization.id));

  const reloadSpecies = useCallback(() => {
    if (selectedOrganization.id !== -1) {
      void dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (!speciesResponse?.data?.species) {
      reloadSpecies();
    }
  }, [speciesResponse?.data?.species, reloadSpecies]);

  const getSpeciesView = useCallback((): JSX.Element => {
    if (speciesResponse?.data?.species === undefined) {
      return <BusySpinner withSkrim />;
    }

    if ((speciesResponse?.data?.species || []).length > 0) {
      return <SpeciesListView reloadData={reloadSpecies} species={speciesResponse?.data?.species || []} />;
    }

    return <EmptyStatePage pageName={'Species'} reloadData={reloadSpecies} />;
  }, [speciesResponse?.data?.species, reloadSpecies]);

  return (
    <Routes>
      <Route path={'/new'} element={<SpeciesAddView reloadData={reloadSpecies} />} />
      <Route path={'/:speciesId'} element={<SpeciesDetailView reloadData={reloadSpecies} />} />
      <Route path={'/:speciesId/edit'} element={<SpeciesEditView />} />
      <Route path={'/*'} element={getSpeciesView()} />
    </Routes>
  );
};

export default SpeciesRouter;
