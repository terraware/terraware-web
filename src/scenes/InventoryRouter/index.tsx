import React, { useCallback, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import InventoryBatchView from 'src/scenes/InventoryRouter/InventoryBatchView';
import InventoryCreateView from 'src/scenes/InventoryRouter/InventoryCreateView';
import InventoryForNurseryView from 'src/scenes/InventoryRouter/InventoryForNurseryView';
import InventoryForSpeciesView from 'src/scenes/InventoryRouter/InventoryForSpeciesView';
import InventoryV2View from 'src/scenes/InventoryRouter/InventoryV2View';
import SpeciesBulkWithdrawView from 'src/scenes/InventoryRouter/SpeciesBulkWithdrawView';
import { selectedOrgHasFacilityType } from 'src/utils/organization';

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
    <Routes>
      <Route
        path={APP_PATHS.INVENTORY}
        element={
          <InventoryV2View
            hasNurseries={selectedOrgHasFacilityType(selectedOrganization, 'Nursery')}
            hasSpecies={(species || []).length > 0}
          />
        }
      />
      <Route path={APP_PATHS.INVENTORY_NEW} element={<InventoryCreateView />} />
      <Route
        path={APP_PATHS.INVENTORY_WITHDRAW}
        element={<SpeciesBulkWithdrawView withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />}
      />
      <Route
        path={APP_PATHS.INVENTORY_BATCH}
        element={<InventoryBatchView origin='Batches' species={species || []} />}
      />
      <Route
        path={APP_PATHS.INVENTORY_BATCH_FOR_NURSERY}
        element={<InventoryBatchView origin='Nursery' species={species || []} />}
      />
      <Route
        path={APP_PATHS.INVENTORY_BATCH_FOR_SPECIES}
        element={<InventoryBatchView origin='Species' species={species || []} />}
      />
      <Route path={APP_PATHS.INVENTORY_ITEM_FOR_NURSERY} element={<InventoryForNurseryView />} />
      <Route
        path={APP_PATHS.INVENTORY_ITEM_FOR_SPECIES}
        element={<InventoryForSpeciesView species={species || []} />}
      />
    </Routes>
  );
};

export default InventoryRouter;
