import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
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
          subzones[subzone.id] = subzone.name;
        }
      }
    }

    setPlantingSubzoneNames(subzones);
  }, [plantingSites]);

  return (
    <Switch>
      <Route exact path={APP_PATHS.NURSERY_WITHDRAWALS}>
        <NurseryPlantingsAndWithdrawalsView reloadTracking={reloadTracking} />
      </Route>
      <Route exact path={APP_PATHS.NURSERY_WITHDRAWALS_DETAILS}>
        <NurseryWithdrawalsDetailsView species={species || []} plantingSubzoneNames={plantingSubzoneNames} />
      </Route>
      <Route exact path={APP_PATHS.NURSERY_REASSIGNMENT}>
        <NurseryReassignmentView />
      </Route>
    </Switch>
  );
};

export default NurseryRouter;
