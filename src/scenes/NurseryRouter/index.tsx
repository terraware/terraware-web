import React, { useCallback, useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router';

import { useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import NurseryPlantingsAndWithdrawalsView from 'src/scenes/NurseryRouter/NurseryPlantingsAndWithdrawalsView';
import NurseryReassignmentView from 'src/scenes/NurseryRouter/NurseryReassignmentView';
import NurseryWithdrawalsDetailsView from 'src/scenes/NurseryRouter/NurseryWithdrawalsDetailsView';

const NurseryRouter = () => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const speciesResponse = useAppSelector(selectSpecies(selectedOrganization.id));

  const { allPlantingSites } = usePlantingSiteData();

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

  const plantingSubzoneNames = useMemo(() => {
    const subzones: Record<number, string> = {};
    for (const plantingSite of allPlantingSites ?? []) {
      for (const plantingZone of plantingSite.plantingZones ?? []) {
        for (const subzone of plantingZone.plantingSubzones ?? []) {
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
        element={
          <NurseryWithdrawalsDetailsView
            species={speciesResponse?.data?.species || []}
            plantingSubzoneNames={plantingSubzoneNames}
          />
        }
      />
      <Route path={'/reassignment/:deliveryId'} element={<NurseryReassignmentView />} />
    </Routes>
  );
};

export default NurseryRouter;
