import { useCallback } from 'react';
import { APP_PATHS } from 'src/constants';
import { PartialSubLocation } from 'src/types/Facility';
import SubLocations from 'src/components/common/SubLocations';

export type NurserySubLocationsProps = {
  nurseryId?: number;
  onEdit?: (subLocations: PartialSubLocation[]) => void;
};

export default function NurserySubLocations({ nurseryId, onEdit }: NurserySubLocationsProps): JSX.Element | null {
  const renderLink = useCallback((facilityId: number, locationName: string) => {
    return [
      `${APP_PATHS.INVENTORY}/?`,
      `subLocationName=${encodeURIComponent(locationName)}`,
      `facilityId=${facilityId}`,
      `tab=batches_by_batch`,
    ].join('&');
  }, []);

  return <SubLocations facilityType='nursery' facilityId={nurseryId} onEdit={onEdit} renderLink={renderLink} />;
}
