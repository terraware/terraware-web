import React, { type JSX, useMemo, useState } from 'react';

import { Grid } from '@mui/material';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTimeZones } from 'src/providers';
import { useSearchFacilitiesQuery } from 'src/queries/search/facilities';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { Organization } from 'src/types/Organization';
import { isAdmin } from 'src/utils/organization';
import useDebounce from 'src/utils/useDebounce';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone, withTimeZoneLongName } from 'src/utils/useTimeZoneUtils';

import SeedBanksCellRenderer from './TableCellRenderer';

type SeedBanksListProps = {
  organization: Organization;
};

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
  { key: 'timeZone', name: strings.TIME_ZONE, type: 'string' },
];

export default function SeedBanksListView({ organization }: SeedBanksListProps): JSX.Element {
  const timeZones = useTimeZones();
  const defaultTimeZone = useDefaultTimeZone().get();
  const navigate = useSyncNavigate();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const { isMobile } = useDeviceInfo();

  const goToNewSeedBank = () => {
    const newSeedBankLocation = {
      pathname: APP_PATHS.SEED_BANKS_NEW,
    };
    navigate(newSeedBankLocation);
  };

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  const { currentData } = useSearchFacilitiesQuery({
    query: debouncedSearchTerm,
    organizationId: organization.id,
    type: 'Seed Bank',
  });

  const results = useMemo(
    () =>
      currentData
        ? (currentData.map((facility) => withTimeZoneLongName(facility, timeZones, defaultTimeZone)) as Facility[])
        : [],
    [currentData, timeZones, defaultTimeZone]
  );

  return (
    <Page
      title={strings.SEED_BANKS}
      contentStyle={{ display: 'block' }}
      rightComponent={
        isAdmin(organization) && (
          <Button
            id='new-facility'
            icon='plus'
            label={isMobile ? undefined : strings.ADD_SEED_BANK}
            onClick={goToNewSeedBank}
            size='medium'
          />
        )
      }
    >
      <Card flushMobile>
        <Grid container>
          <Grid
            sx={{
              display: 'flex',
              marginBottom: '16px',
            }}
            size={12}
          >
            <TextField
              placeholder={strings.SEARCH}
              iconLeft='search'
              label=''
              id='search'
              type='text'
              onChange={(value) => onChangeSearch('search', value)}
              value={temporalSearchValue}
              iconRight='cancel'
              onClickRightIcon={clearSearch}
              sx={{ width: '300px' }}
            />
            <TableSettingsButton />
          </Grid>
          <Grid size={12}>
            <div>
              <Grid container spacing={4}>
                <Grid size={12}>
                  <Table
                    id='seed-banks-table'
                    columns={columns}
                    rows={results}
                    orderBy='name'
                    Renderer={SeedBanksCellRenderer}
                  />
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Card>
    </Page>
  );
}
