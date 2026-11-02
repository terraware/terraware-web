import React, { type JSX, useMemo, useRef, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import Table from 'src/components/common/table';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
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
import { setTimeZone, useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import NurseriesCellRenderer from './TableCellRenderer';

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
  { key: 'timeZone', name: strings.TIME_ZONE, type: 'string' },
];

type NurseriesListProps = {
  organization: Organization;
};

export default function NurseriesListView({ organization }: NurseriesListProps): JSX.Element {
  const theme = useTheme();
  const timeZones = useTimeZones();
  const defaultTimeZone = useDefaultTimeZone().get();
  const { isMobile } = useDeviceInfo();
  const navigate = useSyncNavigate();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const contentRef = useRef(null);

  const goToNewNursery = () => {
    const newNurseryLocation = {
      pathname: APP_PATHS.NURSERIES_NEW,
    };
    navigate(newNurseryLocation);
  };

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  const { data: facilities } = useSearchFacilitiesQuery({
    query: debouncedSearchTerm,
    organizationId: organization.id,
    type: 'Nursery',
  });

  const results = useMemo(
    () =>
      facilities
        ? (facilities.map((facility) => setTimeZone(facility, timeZones, defaultTimeZone)) as Facility[])
        : undefined,
    [facilities, timeZones, defaultTimeZone]
  );

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid container paddingBottom={theme.spacing(2)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid alignItems='center' size={9}>
            <Typography fontSize='24px' fontWeight={600}>
              {strings.NURSERIES}
            </Typography>
          </Grid>
          <Grid sx={{ textAlign: 'right' }} size={3}>
            {isAdmin(organization) &&
              (isMobile ? (
                <Button id='new-nursery' icon='plus' onClick={goToNewNursery} size='medium' />
              ) : (
                <Button
                  id='new-nursery'
                  icon='plus'
                  label={strings.ADD_NURSERY}
                  onClick={goToNewNursery}
                  size='medium'
                />
              ))}
          </Grid>
          <PageSnackbar />
        </Grid>
      </PageHeaderWrapper>
      <Card flushMobile>
        <Grid container ref={contentRef}>
          <Grid
            marginBottom={theme.spacing(2)}
            flexDirection={'row'}
            sx={{
              display: 'flex',
            }}
            size={12}
          >
            <Box width='300px'>
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
              />
            </Box>
            <TableSettingsButton />
          </Grid>
          <Grid size={12}>
            {results && (
              <Table
                id='nurseries-table'
                columns={columns}
                rows={results}
                orderBy='name'
                Renderer={NurseriesCellRenderer}
              />
            )}
          </Grid>
        </Grid>
      </Card>
    </TfMain>
  );
}
