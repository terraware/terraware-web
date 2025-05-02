import React, { useCallback, useEffect } from 'react';
import { Route, Routes } from 'react-router';

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

  return (
    <Routes>
      <Route
        path={'/*'}
        element={
          <InventoryV2View
            hasNurseries={selectedOrgHasFacilityType(selectedOrganization, 'Nursery')}
            hasSpecies={(speciesResponse?.data?.species || []).length > 0}
          />
        }
      />
      <Route path={'/new'} element={<InventoryCreateView />} />
      <Route
        path={'/withdraw'}
        element={<SpeciesBulkWithdrawView withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />}
      />
      <Route
        path={'/batch/:batchId'}
        element={<InventoryBatchView origin='Batches' species={speciesResponse?.data?.species || []} />}
      />
      <Route
        path={'/nursery/:nurseryId/batch/:batchId'}
        element={<InventoryBatchView origin='Nursery' species={speciesResponse?.data?.species || []} />}
      />
      <Route
        path={'/species/:speciesId/batch/:batchId'}
        element={<InventoryBatchView origin='Species' species={speciesResponse?.data?.species || []} />}
      />
      <Route path={'/nursery/:nurseryId'} element={<InventoryForNurseryView />} />
      <Route
        path={'/:speciesId'}
        element={<InventoryForSpeciesView species={speciesResponse?.data?.species || []} />}
      />
    </Routes>
  );
};

export default InventoryRouter;
