import React, { useCallback, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { useLocalization, useOrganization } from 'src/providers';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import NurseryPlantingsAndWithdrawalsView from 'src/scenes/NurseryRouter/NurseryPlantingsAndWithdrawalsView';
import NurseryReassignmentView from 'src/scenes/NurseryRouter/NurseryReassignmentView';
import NurseryWithdrawalsDetailsView from 'src/scenes/NurseryRouter/NurseryWithdrawalsDetailsView';
import { PlantingSite } from 'src/types/Tracking';
import { isPlaceholderOrg } from 'src/utils/organization';

const NurseryRouter = () => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  const species = useAppSelector(selectSpecies);
  const plantingSites: PlantingSite[] | undefined = useAppSelector(selectPlantingSites);

  const [plantingSubzoneNames, setPlantingSubzoneNames] = useState<Record<number, string>>({});

  const reloadTracking = useCallback(() => {
    const populatePlantingSites = () => {
      if (!isPlaceholderOrg(selectedOrganization.id)) {
        void dispatch(requestPlantingSites(selectedOrganization.id, activeLocale || undefined));
      }
    };
    populatePlantingSites();
  }, [dispatch, selectedOrganization.id, activeLocale]);

  const reloadSpecies = useCallback(() => {
    void dispatch(requestSpecies(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (!species) {
      reloadSpecies();
    }
  }, [species, reloadSpecies]);

  useEffect(() => {
    const subzones: Record<number, string> = {};
    for (const plantingSite of plantingSites ?? []) {
      for (const plantingZone of plantingSite.plantingZones ?? []) {
        for (const subzone of plantingZone.plantingSubzones ?? []) {
          subzones[subzone.id] = plantingZone.name + '-' + subzone.name;
        }
      }
    }

    setPlantingSubzoneNames(subzones);
  }, [plantingSites]);

  return (
    <Routes>
      <Route path={'/withdrawals'} element={<NurseryPlantingsAndWithdrawalsView reloadTracking={reloadTracking} />} />
      <Route
        path={'/withdrawals/:withdrawalId'}
        element={<NurseryWithdrawalsDetailsView species={species || []} plantingSubzoneNames={plantingSubzoneNames} />}
      />
      <Route path={'/reassignment/:deliveryId'} element={<NurseryReassignmentView />} />
    </Routes>
  );
};

export default NurseryRouter;
