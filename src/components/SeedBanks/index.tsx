import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from '../common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { Facility, FacilityType } from 'src/api/types/facilities';
import { getAllSeedBanks } from 'src/utils/organization';
import SeedBanksCellRenderer from './TableCellRenderer';
import TextField from '../common/Textfield/Textfield';
import { search, SearchNodePayload } from 'src/api/search';
import useDebounce from 'src/utils/useDebounce';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { Box, Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageHeaderWrapper from '../common/PageHeaderWrapper';

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
  },
  searchField: {
    width: '300px',
  },
  searchBar: {
    display: 'flex',
    marginBottom: '16px',
  },
}));

const columns: TableColumnType[] = [
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'description', name: 'Description', type: 'string' },
];

type SeedBanksListProps = {
  organization: ServerOrganization;
};

export default function SeedBanksList({ organization }: SeedBanksListProps): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [seedBanks, setSeedBanks] = useState<Facility[]>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [results, setResults] = useState<Facility[]>();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);

  useEffect(() => {
    const getSeedBanks = () => {
      if (organization) {
        const orgSeedBanks = getAllSeedBanks(organization).filter((sb) => sb !== undefined) as Facility[];
        setSeedBanks(orgSeedBanks);
        setResults(orgSeedBanks);
      }
    };

    getSeedBanks();
  }, [organization]);

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
      if (debouncedSearchTerm) {
        const params: SearchNodePayload = {
          prefix: 'facilities',
          fields: ['id', 'name', 'description', 'type', 'organization_id'],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'or',
                children: [
                  { operation: 'field', field: 'name', type: 'Fuzzy', values: [debouncedSearchTerm] },
                  { operation: 'field', field: 'description', type: 'Fuzzy', values: [debouncedSearchTerm] },
                ],
              },
              { operation: 'field', field: 'type', type: 'Exact', values: ['Seed Bank'] },
              {
                operation: 'field',
                field: 'organization_id',
                type: 'Exact',
                values: [organization.id],
              },
            ],
          },
          count: 0,
        };
        const requestId = Math.random().toString();
        setRequestId('searchSeedbanks', requestId);
        const searchResults = await search(params);
        const seedBanksResults: Facility[] = [];
        searchResults?.forEach((result) => {
          seedBanksResults.push({
            id: result.id as number,
            name: result.name as string,
            description: result.description as string,
            organizationId: parseInt(result.organization_id as string, 10),
            type: result.type as FacilityType,
            connectionState: result.connectionState as 'Not Connected' | 'Connected' | 'Configured',
          });
        });
        if (getRequestId('searchSeedbanks') === requestId) {
          setResults(seedBanksResults);
        }
      } else {
        setResults(seedBanks);
      }
    };
    refreshSearch();
  }, [debouncedSearchTerm, seedBanks, organization]);

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
                    {seedBanks && (
                      <Table
                        id='seed-banks-table'
                        columns={columns}
                        rows={results || seedBanks}
                        orderBy='name'
                        Renderer={SeedBanksCellRenderer}
                      />
                    )}
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
