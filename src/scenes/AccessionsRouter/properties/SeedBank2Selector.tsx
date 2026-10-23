import React, { type JSX, useEffect } from 'react';

import { Grid, useTheme } from '@mui/material';

import { useFacilitySubLocations } from 'src/components/common/SubLocations/useFacilitySubLocations';
import { useOrganization } from 'src/providers/hooks';
import { CreateAccessionRequestPayloadV2Write } from 'src/queries/generated/accessionsV2';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { getAllSeedBanks } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { FacilitySelector, SubLocationSelector } from './index';

type SeedBank2SelectorProps = {
  record: CreateAccessionRequestPayloadV2Write;
  onChange: (id: string, value?: any) => void;
  validate?: boolean;
};

export default function SeedBank2Selector(props: SeedBank2SelectorProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { record, onChange, validate } = props;
  const { subLocations } = useFacilitySubLocations(record.facilityId);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const seedBanks: Facility[] = selectedOrganization ? getAllSeedBanks(selectedOrganization) : [];

  const gridSize = () => (isMobile ? 12 : 6);

  useEffect(() => {
    if (!record.facilityId && seedBanks.length === 1) {
      record.facilityId = seedBanks[0].id;
    }
  });

  return (
    <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'} justifyContent='space-between' size={12}>
      <Grid sx={{ marginTop: theme.spacing(2), marginRight: isMobile ? 0 : theme.spacing(2) }} size={gridSize()}>
        <FacilitySelector
          id='location'
          label={strings.LOCATION_REQUIRED}
          selectedFacility={seedBanks.find((sb) => sb.id === record.facilityId)}
          facilities={seedBanks}
          onChange={(value: Facility) => onChange('facilityId', value.id)}
          errorText={validate && !record.facilityId ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>
      <Grid sx={{ marginTop: theme.spacing(2) }} size={gridSize()}>
        <SubLocationSelector
          id='sub-location'
          label={strings.SUB_LOCATION}
          selectedSubLocation={record.subLocation}
          subLocations={(subLocations ?? []).map((obj) => obj.name)}
          onChange={(value: string) => onChange('subLocation', value)}
          disabled={!record.facilityId}
        />
      </Grid>
    </Grid>
  );
}
