import React, { useMemo } from 'react';
import { Route, Routes } from 'react-router';

import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import NurseryPlantingsAndWithdrawalsView from 'src/scenes/NurseryRouter/NurseryPlantingsAndWithdrawalsView';
import NurseryReassignmentView from 'src/scenes/NurseryRouter/NurseryReassignmentView';
import NurseryWithdrawalsDetailsView from 'src/scenes/NurseryRouter/NurseryWithdrawalsDetailsView';

const NurseryRouter = () => {
  const { species } = useSpeciesData();
  const { allPlantingSites } = usePlantingSiteData();

  const substratumNames = useMemo(() => {
    const substrata: Record<number, string> = {};
    for (const plantingSite of allPlantingSites ?? []) {
      for (const stratum of plantingSite.strata ?? []) {
        for (const substratum of stratum.substrata ?? []) {
          substrata[substratum.id] = stratum.name + '-' + substratum.name;
        }
      }
    }

    return substrata;
  }, [allPlantingSites]);

  return (
    <Routes>
      <Route path={'/withdrawals'} element={<NurseryPlantingsAndWithdrawalsView />} />
      <Route
        path={'/withdrawals/:withdrawalId'}
        element={<NurseryWithdrawalsDetailsView species={species} substratumNames={substratumNames} />}
      />
      <Route path={'/reassignment/:deliveryId'} element={<NurseryReassignmentView />} />
    </Routes>
  );
};

export default NurseryRouter;
