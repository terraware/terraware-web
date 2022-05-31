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

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      marginTop: 0,
      fontSize: '24px',
    },
    mainContent: {
      paddingTop: theme.spacing(4),
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
  organization?: ServerOrganization;
};

export default function SeedBanksList({ organization }: SeedBanksListProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [seedBanks, setSeedBanks] = useState<Facility[]>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
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

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  const onKeyDownHandler = async (key: string) => {
    if (key === 'Enter') {
      if (temporalSearchValue) {
        const params: SearchNodePayload = {
          prefix: 'projects.sites.facilities',
          fields: ['id', 'name', 'description', 'type'],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'or',
                children: [
                  { operation: 'field', field: 'name', type: 'Fuzzy', values: [temporalSearchValue] },
                  { operation: 'field', field: 'description', type: 'Fuzzy', values: [temporalSearchValue] },
                ],
              },
              { operation: 'field', field: 'type', type: 'Exact', values: ['Seed Bank'] },
              {
                operation: 'field',
                field: 'site_project_organization_id',
                type: 'Exact',
                values: [organization?.id],
              },
            ],
          },
          count: 0,
        };
        const searchResults = await search(params);
        const seedBanksResults: Facility[] = [];
        searchResults?.forEach((result) => {
          seedBanksResults.push({
            id: result.id as number,
            name: result.name as string,
            description: result.description as string,
            siteId: 0,
            type: result.type as 'Seed Bank' | 'Desalination' | 'Reverse Osmosis',
            connectionState: result.connectionState as 'Not Connected' | 'Connected' | 'Configured',
          });
        });
        setResults(seedBanksResults);
      } else {
        setResults(seedBanks);
      }
    }
  };

  return (
    <TfMain>
      <Grid container spacing={3}>
        <Grid item xs={2}>
          <h1 className={classes.title}>{strings.SEED_BANKS}</h1>
        </Grid>
        <Grid item xs={8} />
        <Grid item xs={2} className={classes.centered}>
          {organization && ['Admin', 'Owner'].includes(organization?.role) && (
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
            onKeyDown={onKeyDownHandler}
          />
        </Grid>
        <Grid item xs={12}>
          <div className={classes.mainContent}>
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
