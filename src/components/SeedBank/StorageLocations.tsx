import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';
import { SeedBankService } from 'src/services';
import { StorageLocation } from 'src/types/Facility';
import { useLocalization } from 'src/providers/hooks';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { useNumberFormatter } from 'src/utils/useNumber';
import isEnabled from 'src/features';
import StorageLocationsCellRenderer from './StorageLocationsCellRenderer';

export type SubLocationsProps = {
  seedBankId: number;
  // TODO: add edit callback props
};

export default function SubLocations({ seedBankId }: SubLocationsProps): JSX.Element | null {
  const { activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const numericFormatter = useMemo(() => numberFormatter(activeLocale), [numberFormatter, activeLocale]);
  const columns: TableColumnType[] = [
    { key: 'name', name: strings.SUB_LOCATION, type: 'string' },
    { key: 'activeAccessions', name: strings.ACTIVE_ACCESSIONS, type: 'number' },
  ];

  useEffect(() => {
    const fetchStorageLocations = async () => {
      const response = await SeedBankService.getStorageLocations(seedBankId);
      if (response.requestSucceeded) {
        if (activeLocale) {
          const collator = new Intl.Collator(activeLocale);
          setStorageLocations(response.locations.sort((a, b) => collator.compare(a.name, b.name)));
        }
      }
    };

    if (isEnabled('Storage locations')) {
      fetchStorageLocations();
    }
  }, [seedBankId, activeLocale]);

  if (!storageLocations.length) {
    return null;
  }

  return (
    <>
      <Grid item xs={12}>
        <Typography fontSize='16px' fontWeight={600}>
          {strings.SUB_LOCATIONS}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Table
          id='storage-sub-locations-table'
          columns={columns}
          rows={storageLocations}
          orderBy='name'
          Renderer={StorageLocationsCellRenderer({ seedBankId, numericFormatter })}
        />
      </Grid>
    </>
  );
}
