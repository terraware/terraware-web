import React, { useState, useEffect } from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Grid, useTheme } from '@mui/material';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { getAllSeedBanks } from 'src/utils/organization';
import { Facility, StorageLocationDetails } from 'src/api/types/facilities';
import { listStorageLocations } from 'src/api/facility/facility';
import { StorageSubLocationSelector, StorageLocationSelector } from './';

type SeedBank2SelectorProps = {
  organization: ServerOrganization;
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
  validate?: boolean;
};

export default function SeedBank2Selector(props: SeedBank2SelectorProps): JSX.Element {
  const { organization, record, onChange, validate } = props;
  const [storageLocations, setStorageLocations] = useState<StorageLocationDetails[]>([]);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const seedBanks: Facility[] = (getAllSeedBanks(organization).filter((sb) => !!sb) as Facility[]) || [];

  const gridSize = () => (isMobile ? 12 : 6);

  useEffect(() => {
    if (!record.facilityId && seedBanks.length === 1) {
      record.facilityId = seedBanks[0].id;
    }
  });

  useEffect(() => {
    const setLocation = async () => {
      if (record.facilityId) {
        const response = await listStorageLocations(record.facilityId);
        setStorageLocations(response.locations);
      } else {
        setStorageLocations([]);
      }
    };
    setLocation();
  }, [record.facilityId]);

  return (
    <Grid item xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} justifyContent='space-between'>
      <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2), marginRight: isMobile ? 0 : theme.spacing(2) }}>
        <StorageLocationSelector
          label={strings.LOCATION_REQUIRED}
          selectedStorageLocation={seedBanks.find((sb) => sb.id === record.facilityId)}
          storageLocations={seedBanks}
          onChange={(value: Facility) => onChange('facilityId', value.id)}
          errorText={validate && !record.facilityId ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>
      <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }}>
        <StorageSubLocationSelector
          label={strings.SUB_LOCATION}
          selectedStorageSubLocation={record.storageLocation}
          storageSubLocations={storageLocations.map((obj) => obj.storageLocation)}
          onChange={(value: string) => onChange('storageLocation', value)}
        />
      </Grid>
    </Grid>
  );
}
