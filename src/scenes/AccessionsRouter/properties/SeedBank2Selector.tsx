import React, { type JSX, useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { SubLocationService } from 'src/services';
import { AccessionPostRequestBody } from 'src/services/SeedBankService';
import strings from 'src/strings';
import { Facility, SubLocation } from 'src/types/Facility';
import { getAllSeedBanks } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { FacilitySelector, SubLocationSelector } from './index';

type SeedBank2SelectorProps = {
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
  validate?: boolean;
};

export default function SeedBank2Selector(props: SeedBank2SelectorProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const { record, onChange, validate } = props;
  const [subLocations, setSubLocations] = useState<SubLocation[]>([]);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const seedBanks: Facility[] = selectedOrganization ? getAllSeedBanks(selectedOrganization) : [];

  const gridSize = () => (isMobile ? 12 : 6);

  useEffect(() => {
    if (!record.facilityId && seedBanks.length === 1) {
      record.facilityId = seedBanks[0].id;
    }
  });

  useEffect(() => {
    const setLocation = async () => {
      if (record.facilityId && activeLocale) {
        const response = await SubLocationService.getSubLocations(record.facilityId);
        if (response.requestSucceeded) {
          const collator = new Intl.Collator(activeLocale);
          setSubLocations(response.subLocations.sort((a, b) => collator.compare(a.name, b.name)));
          return;
        }
      }
      setSubLocations([]);
    };
    void setLocation();
  }, [activeLocale, record.facilityId]);

  return (
    <Grid item xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} justifyContent='space-between'>
      <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2), marginRight: isMobile ? 0 : theme.spacing(2) }}>
        <FacilitySelector
          id='location'
          label={strings.LOCATION_REQUIRED}
          selectedFacility={seedBanks.find((sb) => sb.id === record.facilityId)}
          facilities={seedBanks}
          onChange={(value: Facility) => onChange('facilityId', value.id)}
          errorText={validate && !record.facilityId ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>
      <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }}>
        <SubLocationSelector
          id='sub-location'
          label={strings.SUB_LOCATION}
          selectedSubLocation={record.subLocation}
          subLocations={subLocations.map((obj) => obj.name)}
          onChange={(value: string) => onChange('subLocation', value)}
          disabled={!record.facilityId}
        />
      </Grid>
    </Grid>
  );
}
