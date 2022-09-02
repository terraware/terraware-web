import React, { useState, useEffect } from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Grid, useTheme } from '@mui/material';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { getAllSeedBanks } from 'src/utils/organization';
import { Facility, StorageLocationDetails } from 'src/api/types/facilities';
import { listStorageLocations } from 'src/api/facility/facility';
import { SelectT } from '@terraware/web-components';

type SeedBankSelectorProps = {
  organization: ServerOrganization;
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
};

export default function SeedBankSelector(props: SeedBankSelectorProps): JSX.Element {
  const { organization, record, onChange } = props;
  // TODO: replace this with record.storageLocation (not supported today, needs a BE enhancements)
  const [storageLocation, setStorageLocation] = useState<StorageLocationDetails>();
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
        <SelectT<Facility>
          label={strings.LOCATION_REQUIRED}
          placeholder={strings.SELECT}
          options={seedBanks}
          onChange={(value: Facility) => onChange('facilityId', value.id)}
          isEqual={(a: Facility, b: Facility) => a.id === b.id}
          renderOption={(facility) => facility.name}
          displayLabel={(facility) => facility?.name || ''}
          selectedValue={seedBanks.find((sb) => sb.id === record.facilityId)}
          toT={(name: string) => ({ name } as Facility)}
          fullWidth={true}
          readonly={false}
        />
      </Grid>
      <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }}>
        <SelectT<StorageLocationDetails>
          label={strings.SUB_LOCATION_REQUIRED}
          placeholder={strings.SELECT}
          options={storageLocations}
          onChange={(value: StorageLocationDetails) => setStorageLocation(value)}
          isEqual={(a: StorageLocationDetails, b: StorageLocationDetails) => a.storageLocation === b.storageLocation}
          renderOption={(details) => details.storageLocation}
          displayLabel={(details) => details?.storageLocation || ''}
          selectedValue={storageLocation}
          toT={(name: string) => ({ storageLocation: name } as StorageLocationDetails)}
          fullWidth={true}
          readonly={false}
        />
      </Grid>
    </Grid>
  );
}
