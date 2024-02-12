import React, { useCallback, useEffect } from 'react';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useOrganization } from 'src/providers';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';
import SpeciesDetailView from 'src/scenes/Species/SpeciesDetailView';
import SpeciesEditView from 'src/scenes/Species/SpeciesEditView';
import SpeciesAddView from 'src/scenes/Species/SpeciesAddView';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';

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

  if ((species || []).length === 0) {
    console.log('BLAH!');
    return <EmptyStatePage pageName={'Species'} reloadData={reloadSpecies} />;
  }

  return (
    <Switch>
      <Route exact path={APP_PATHS.SPECIES_NEW}>
        <SpeciesAddView />
      </Route>
      <Route exact path={APP_PATHS.SPECIES}>
        <SpeciesListView reloadData={reloadSpecies} species={species || []} />
      </Route>
      <Route exact path={APP_PATHS.SPECIES_EDIT}>
        <SpeciesEditView />
      </Route>
      <Route path={APP_PATHS.SPECIES_DETAILS}>
        <SpeciesDetailView />
      </Route>
    </Switch>
  );
};

export default SpeciesRouter;
