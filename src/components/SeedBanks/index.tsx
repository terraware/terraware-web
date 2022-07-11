import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from '../common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { Facility } from 'src/api/types/facilities';
import { getAllSeedBanks } from 'src/utils/organization';
import SeedBanksCellRenderer from './TableCellRenderer';
import TextField from '../common/Textfield/Textfield';
import { search, SearchNodePayload } from 'src/api/seeds/search';
import useDebounce from 'src/utils/useDebounce';
import { getRequestId, setRequestId } from 'src/utils/requestsId';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      marginTop: 0,
      fontSize: '24px',
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
  })
);

const columns: TableColumnType[] = [
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'description', name: 'Description', type: 'string' },
];

type SeedBanksListProps = {
  organization: ServerOrganization;
};

export default function SeedBanksList({ organization }: SeedBanksListProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [seedBanks, setSeedBanks] = useState<Facility[]>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [results, setResults] = useState<Facility[]>();

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
            siteId: 0,
            type: result.type as 'Seed Bank' | 'Desalination' | 'Reverse Osmosis',
            connectionState: result.connectionState as 'Not Connected' | 'Connected' | 'Configured',
          });
        });
        if (getRequestId('searchSeedbanks') === requestId) {
          setResults(seedBanksResults);
        } else {
          console.log(`Skipping seed-bank search response for stale value ${debouncedSearchTerm}`);
        }
      } else {
        setResults(seedBanks);
      }
    };
    refreshSearch();
  }, [debouncedSearchTerm, seedBanks, organization]);

  return (
    <TfMain>
      <Grid container spacing={3}>
        <Grid item xs={2}>
          <h1 className={classes.title}>{strings.SEED_BANKS}</h1>
        </Grid>
        <Grid item xs={8} />
        <Grid item xs={2} className={classes.centered}>
          {['Admin', 'Owner'].includes(organization.role) && (
            <Button id='new-facility' label={strings.ADD} onClick={goToNewSeedBank} size='medium' />
          )}
        </Grid>
        <PageSnackbar />
        <Grid item xs={12} className={classes.searchBar}>
          <TextField
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            className={classes.searchField}
            onChange={onChangeSearch}
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
    </TfMain>
  );
}
