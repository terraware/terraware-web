import React, { useCallback, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

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
    if (selectedOrganization.id !== -1) {
      void dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (!species) {
      reloadSpecies();
    }
  }, [species, reloadSpecies]);

  return (
    <Routes>
      <Route
        path={'/*'}
        element={
          <InventoryV2View
            hasNurseries={selectedOrgHasFacilityType(selectedOrganization, 'Nursery')}
            hasSpecies={(species || []).length > 0}
          />
        }
      />
      <Route path={'/new'} element={<InventoryCreateView />} />
      <Route
        path={'/withdraw'}
        element={<SpeciesBulkWithdrawView withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />}
      />
      <Route path={'/batch/:batchId'} element={<InventoryBatchView origin='Batches' species={species || []} />} />
      <Route
        path={'/nursery/:nurseryId/batch/:batchId'}
        element={<InventoryBatchView origin='Nursery' species={species || []} />}
      />
      <Route
        path={'/species/:speciesId/batch/:batchId'}
        element={<InventoryBatchView origin='Species' species={species || []} />}
      />
      <Route path={'/nursery/:nurseryId'} element={<InventoryForNurseryView />} />
      <Route path={'/:speciesId'} element={<InventoryForSpeciesView species={species || []} />} />
    </Routes>
  );
};

export default InventoryRouter;
