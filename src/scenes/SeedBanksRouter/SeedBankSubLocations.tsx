import React, { type JSX, useCallback } from 'react';

import SubLocations from 'src/components/common/SubLocations';
import { APP_PATHS } from 'src/constants';
import { ActiveStatuses } from 'src/types/Accession';
import { PartialSubLocation } from 'src/types/Facility';

export type SeedBankSubLocationsProps = {
  seedBankId?: number;
  onEdit?: (subLocations: PartialSubLocation[]) => void;
};

export default function SeedBankSubLocations({ seedBankId, onEdit }: SeedBankSubLocationsProps): JSX.Element {
  const renderLink = useCallback((facilityId: number, locationName: string) => {
    return [
      `${APP_PATHS.ACCESSIONS}/?`,
      `subLocationName=${encodeURIComponent(locationName)}`,
      `facilityId=${facilityId}`,
      ...ActiveStatuses().map((status) => `stage=${status}`),
    ].join('&');
  }, []);

  return <SubLocations facilityType='seedbank' facilityId={seedBankId} onEdit={onEdit} renderLink={renderLink} />;
}
