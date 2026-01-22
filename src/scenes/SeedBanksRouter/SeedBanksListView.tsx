import React, { type JSX, useEffect, useRef, useState } from 'react';

import { Grid, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextField from 'src/components/common/Textfield/Textfield';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTimeZones } from 'src/providers';
import { FacilityService } from 'src/services';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { Organization } from 'src/types/Organization';
import { isAdmin } from 'src/utils/organization';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { setTimeZone, useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

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
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [results, setResults] = useState<Facility[]>([]);
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);

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

  useEffect(() => {
    const refreshSearch = async () => {
      const requestId = Math.random().toString();
      setRequestId('searchSeedbanks', requestId);

      const seedBanksResults = await FacilityService.getFacilities({
        query: debouncedSearchTerm,
        organizationId: organization.id,
        type: 'Seed Bank',
      });

      const transformedResults = seedBanksResults.map((seedBank) =>
        setTimeZone(seedBank, timeZones, defaultTimeZone)
      ) as Facility[];

      if (getRequestId('searchSeedbanks') === requestId) {
        setResults(transformedResults);
      }
    };

    void refreshSearch();
  }, [debouncedSearchTerm, organization, timeZones, defaultTimeZone]);

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={8}>
            <h1
              style={{
                marginTop: 0,
                marginBottom: 0,
                fontSize: '24px',
                fontWeight: 600,
              }}
            >
              {strings.SEED_BANKS}
            </h1>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {isAdmin(organization) &&
              (isMobile ? (
                <Button id='new-facility' icon='plus' onClick={goToNewSeedBank} size='medium' />
              ) : (
                <Button
                  id='new-facility'
                  icon='plus'
                  label={strings.ADD_SEED_BANK}
                  onClick={goToNewSeedBank}
                  size='medium'
                />
              ))}
          </Grid>
        </Grid>
        <PageSnackbar />
      </PageHeaderWrapper>
      <Card flushMobile>
        <Grid container ref={contentRef}>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              marginBottom: '16px',
            }}
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
          <Grid item xs={12}>
            <div>
              <Grid container spacing={4}>
                <Grid item xs={12}>
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
    </TfMain>
  );
}
