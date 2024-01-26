import React, { useCallback, useEffect } from 'react';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useOrganization } from 'src/providers';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';

const SpeciesView = () => {
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

  if ((species || []).length === 0) {
    return <EmptyStatePage pageName={'Species'} reloadData={reloadSpecies} />;
  }

  return <SpeciesListView reloadData={reloadSpecies} species={species || []} />;
};

export default SpeciesView;
