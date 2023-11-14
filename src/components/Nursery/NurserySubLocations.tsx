import { useCallback } from 'react';
import { APP_PATHS } from 'src/constants';
import { PartialSubLocation } from 'src/types/Facility';
import SubLocations from 'src/components/common/SubLocations';
import isEnabled from 'src/features';

export type NurserySubLocationsProps = {
  nurseryId?: number;
  onEdit?: (subLocations: PartialSubLocation[]) => void;
};

export default function NurserySubLocations({ nurseryId, onEdit }: NurserySubLocationsProps): JSX.Element | null {
  const nurseryV2 = isEnabled('Nursery Updates');

  const renderLink = useCallback((facilityId: number, locationName: string) => {
    return [
      `${APP_PATHS.INVENTORY}/?`,
      `subLocationName=${encodeURIComponent(locationName)}`,
      `facilityId=${facilityId}`,
      `tab=batches_by_batch`,
    ].join('&');
  }, []);

  if (!nurseryV2) {
    return null;
  }

  return <SubLocations facilityType='nursery' facilityId={nurseryId} onEdit={onEdit} renderLink={renderLink} />;
}
