import isEnabled from 'src/features';
import NurseryReassignment from './NurseryReassignment';
import NurseryWithdrawalsBase from './NurseryWithdrawals';
import NurseryPlantingsAndWithdrawals from './NurseryPlantingsAndWithdrawals';
import NurseryWithdrawalsDetails from './NurseryWithdrawalsDetails';
import PlantsPrimaryPage from '../PlantsPrimaryPage';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { useCallback, useState } from 'react';
import { PlantingSite } from 'src/types/Tracking';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import useQuery from 'src/utils/useQuery';

/**
 * Primary route management for nursery withdrawals.
 */
type NurseryWithdrawalsProps = {
  reloadTracking: () => void;
};
export default function NurseryWithdrawals({ reloadTracking }: NurseryWithdrawalsProps): JSX.Element {
  const trackingV2 = isEnabled('TrackingV2');
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const plantingSites = useAppSelector(selectPlantingSites);
  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);
  const query = useQuery();
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  if (trackingV2) {
    return (
      <PlantsPrimaryPage
        title={strings.WITHDRAWALS}
        onSelect={onSelect}
        pagePath={APP_PATHS.NURSERY_WITHDRAWALS_V2}
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

  return <NurseryWithdrawalsBase />;
}

export { NurseryReassignment, NurseryWithdrawals, NurseryWithdrawalsDetails };
