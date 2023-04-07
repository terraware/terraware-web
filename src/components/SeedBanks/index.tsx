import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import TfMain from '../common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { Facility } from 'src/types/Facility';
import SeedBanksCellRenderer from './TableCellRenderer';
import TextField from '../common/Textfield/Textfield';
import { FacilityService } from 'src/services';
import useDebounce from 'src/utils/useDebounce';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { Box, Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import { useTimeZones } from 'src/providers/hooks';
import { setTimeZone, useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

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
    marginBottom: '32px',
  },
  contentContainer: {
    backgroundColor: theme.palette.TwClrBg,
    padding: theme.spacing(3),
    borderRadius: '32px',
    minWidth: 'fit-content',
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

export default function SeedBanksList({ organization }: SeedBanksListProps): JSX.Element {
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
  const columns: TableColumnType[] = [
    { key: 'name', name: strings.NAME, type: 'string' },
    { key: 'description', name: strings.DESCRIPTION, type: 'string' },
    { key: 'timeZone', name: strings.TIME_ZONE, type: 'string' },
  ];

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
      <Box sx={{ paddingLeft: theme.spacing(3) }}>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <PageHeaderWrapper nextElement={contentRef.current}>
            <Grid container spacing={3} sx={{ paddingLeft: theme.spacing(3) }}>
              <Grid item xs={8}>
                <h1 className={classes.title}>{strings.SEED_BANKS}</h1>
              </Grid>
              <Grid item xs={4} className={classes.centered}>
                {['Admin', 'Owner'].includes(organization.role) &&
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
          <Grid container className={classes.contentContainer} ref={contentRef}>
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
        </Grid>
      </Box>
    </TfMain>
  );
}
