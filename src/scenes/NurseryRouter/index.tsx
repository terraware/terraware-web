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
    const subzones: Record<number, string> = {};
    for (const plantingSite of allPlantingSites ?? []) {
      for (const plantingZone of plantingSite.strata ?? []) {
        for (const subzone of plantingZone.substrata ?? []) {
          subzones[subzone.id] = plantingZone.name + '-' + subzone.name;
        }
      }
    }

    return subzones;
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
