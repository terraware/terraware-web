import { useCallback, useState } from 'react';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { PlantingSite } from 'src/types/Tracking';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import useQuery from 'src/utils/useQuery';
import NurseryPlantingsAndWithdrawals from './NurseryPlantingsAndWithdrawals';
import PlantsPrimaryPage from '../PlantsPrimaryPage';

/**
 * Primary route management for nursery withdrawals.
 */
type NurserySiteWithdrawalsProps = {
  reloadTracking: () => void;
};

export default function NurserySiteWithdrawals({ reloadTracking }: NurserySiteWithdrawalsProps): JSX.Element {
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const plantingSites = useAppSelector(selectPlantingSites);
  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);
  const query = useQuery();
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  return (
    <PlantsPrimaryPage
      title={strings.WITHDRAWALS}
      onSelect={onSelect}
      pagePath={APP_PATHS.NURSERY_SITE_WITHDRAWALS}
      lastVisitedPreferenceName='seedlings.withdrawals.lastVisitedPlantingSite'
      plantsSitePreferences={plantsSitePreferences}
      setPlantsSitePreferences={onPreferences}
      allowAllAsSiteSelection={true}
      isEmptyState={!plantingSites?.length}
      query={query.toString()}
    >
      {selectedPlantingSite && (
        <NurseryPlantingsAndWithdrawals reloadTracking={reloadTracking} selectedPlantingSite={selectedPlantingSite} />
      )}
    </PlantsPrimaryPage>
  );
}
