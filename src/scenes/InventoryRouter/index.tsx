import React from 'react';
import { Route, Routes } from 'react-router';

import { useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
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
  const { selectedOrganization } = useOrganization();
  const { species } = useSpeciesData();

  return (
    <Routes>
      <Route
        path={'/*'}
        element={
          <InventoryV2View
            hasNurseries={selectedOrgHasFacilityType(selectedOrganization, 'Nursery')}
            hasSpecies={species.length > 0}
          />
        }
      />
      <Route path={'/new'} element={<InventoryCreateView />} />
      <Route
        path={'/withdraw'}
        element={<SpeciesBulkWithdrawView withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />}
      />
      <Route path={'/batch/:batchId'} element={<InventoryBatchView origin='Batches' species={species} />} />
      <Route
        path={'/nursery/:nurseryId/batch/:batchId'}
        element={<InventoryBatchView origin='Nursery' species={species} />}
      />
      <Route
        path={'/species/:speciesId/batch/:batchId'}
        element={<InventoryBatchView origin='Species' species={species} />}
      />
      <Route path={'/nursery/:nurseryId'} element={<InventoryForNurseryView />} />
      <Route path={'/:speciesId'} element={<InventoryForSpeciesView species={species} />} />
    </Routes>
  );
};

export default InventoryRouter;
