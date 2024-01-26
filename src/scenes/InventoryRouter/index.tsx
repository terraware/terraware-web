import React, { useCallback, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { selectedOrgHasFacilityType } from 'src/utils/organization';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import InventoryV2View from 'src/scenes/InventoryRouter/InventoryV2View';
import InventoryCreateView from 'src/scenes/InventoryRouter/InventoryCreateView';
import InventoryBatchView from 'src/scenes/InventoryRouter/InventoryBatchView';
import InventoryForNurseryView from 'src/scenes/InventoryRouter/InventoryForNurseryView';
import InventoryForSpeciesView from 'src/scenes/InventoryRouter/InventoryForSpeciesView';
import SpeciesBulkWithdrawView from 'src/scenes/InventoryRouter/SpeciesBulkWithdrawView';

interface InventoryRouterProps {
  setWithdrawalCreated: (value: boolean) => void;
}

const InventoryRouter = ({ setWithdrawalCreated }: InventoryRouterProps) => {
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

  return (
    <Switch>
      <Route exact path={APP_PATHS.INVENTORY}>
        <InventoryV2View
          hasNurseries={selectedOrgHasFacilityType(selectedOrganization, 'Nursery')}
          hasSpecies={(species || []).length > 0}
        />
      </Route>
      <Route exact path={APP_PATHS.INVENTORY_NEW}>
        <InventoryCreateView />
      </Route>
      <Route path={APP_PATHS.INVENTORY_WITHDRAW}>
        <SpeciesBulkWithdrawView withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />
      </Route>
      <Route path={APP_PATHS.INVENTORY_BATCH}>
        <InventoryBatchView origin='Batches' species={species || []} />
      </Route>
      <Route path={APP_PATHS.INVENTORY_BATCH_FOR_NURSERY}>
        <InventoryBatchView origin='Nursery' species={species || []} />
      </Route>
      <Route path={APP_PATHS.INVENTORY_BATCH_FOR_SPECIES}>
        <InventoryBatchView origin='Species' species={species || []} />
      </Route>
      <Route path={APP_PATHS.INVENTORY_ITEM_FOR_NURSERY}>
        <InventoryForNurseryView />
      </Route>
      <Route path={APP_PATHS.INVENTORY_ITEM_FOR_SPECIES}>
        <InventoryForSpeciesView species={species || []} />
      </Route>
    </Switch>
  );
};

export default InventoryRouter;
