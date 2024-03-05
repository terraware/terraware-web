import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
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

import PageHeaderWrapper from '../../components/common/PageHeaderWrapper';
import TextField from '../../components/common/Textfield/Textfield';
import TfMain from '../../components/common/TfMain';
import SeedBanksCellRenderer from './TableCellRenderer';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchField: {
    width: '300px',
  },
  searchBar: {
    display: 'flex',
    marginBottom: '16px',
  },
}));

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
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [results, setResults] = useState<Facility[]>([]);
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);

  const goToNewSeedBank = () => {
    const newSeedBankLocation = {
      pathname: APP_PATHS.SEED_BANKS_NEW,
    };
    history.push(newSeedBankLocation);
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

    refreshSearch();
  }, [debouncedSearchTerm, organization, timeZones, defaultTimeZone]);

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={8}>
            <h1 className={classes.title}>{strings.SEED_BANKS}</h1>
          </Grid>
          <Grid item xs={4} className={classes.centered}>
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
          <Grid item xs={12} className={classes.searchBar}>
            <TextField
              placeholder={strings.SEARCH}
              iconLeft='search'
              label=''
              id='search'
              type='text'
              className={classes.searchField}
              onChange={(value) => onChangeSearch('search', value)}
              value={temporalSearchValue}
              iconRight='cancel'
              onClickRightIcon={clearSearch}
            />
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
