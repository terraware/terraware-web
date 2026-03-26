import React, { useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router';

import { useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import NurseryPlantingsAndWithdrawalsView from 'src/scenes/NurseryRouter/NurseryPlantingsAndWithdrawalsView';
import NurseryReassignmentView from 'src/scenes/NurseryRouter/NurseryReassignmentView';
import NurseryWithdrawalsDetailsView from 'src/scenes/NurseryRouter/NurseryWithdrawalsDetailsView';

const NurseryRouter = () => {
  const { species } = useSpeciesData();
  const { selectedOrganization } = useOrganization();

  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();
  const allPlantingSites = useMemo(
    () => listPlantingSitesResponse.currentData?.sites ?? [],
    [listPlantingSitesResponse]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, includeZones: false }, true);
    }
  }, [listPlantingSites, selectedOrganization]);

  const stratumNames = useMemo(() => {
    const strata: Record<number, string> = {};
    for (const plantingSite of allPlantingSites ?? []) {
      for (const stratum of plantingSite.strata ?? []) {
        strata[stratum.id] = stratum.name;
      }
    }

    return strata;
  }, [allPlantingSites]);

  const substratumNames = useMemo(() => {
    const substrata: Record<number, string> = {};
    for (const plantingSite of allPlantingSites ?? []) {
      for (const stratum of plantingSite.strata ?? []) {
        for (const substratum of stratum.substrata ?? []) {
          substrata[substratum.id] = substratum.name;
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
        element={
          <NurseryWithdrawalsDetailsView
            species={species}
            stratumNames={stratumNames}
            substratumNames={substratumNames}
          />
        }
      />
      <Route path={'/reassignment/:deliveryId'} element={<NurseryReassignmentView />} />
    </Routes>
  );
};

export default NurseryRouter;
