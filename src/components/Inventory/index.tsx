import { Box, Container, Grid, Typography } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import { ServerOrganization } from 'src/types/Organization';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import { isAdmin } from 'src/utils/organization';
import PageSnackbar from 'src/components/PageSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import EmptyStatePage from '../emptyStatePages/EmptyStatePage';
import { Button, Table, TableColumnType } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { search, SearchResponseElement } from 'src/api/seeds/search';
import useDebounce from 'src/utils/useDebounce';
import InventoryCellRenderer from './TableCellRenderer';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: '32px 0',
  },
  message: {
    margin: '0 auto',
    marginTop: '10%',
    maxWidth: '800px',
    width: (props: StyleProps) => (props.isMobile ? 'auto' : '800px'),
  },
}));

type InventoryProps = {
  organization: ServerOrganization;
  hasNurseries: boolean;
  hasSpecies: boolean;
};

const columns: TableColumnType[] = [
  { key: 'species_scientificName', name: strings.SPECIES, type: 'string' },
  { key: 'species_commonName', name: strings.COMMON_NAME, type: 'string' },
  { key: 'facilityInventories', name: strings.NURSERIES, type: 'string' },
  { key: 'germinatingQuantity', name: strings.GERMINATING, type: 'string' },
  { key: 'notReadyQuantity', name: strings.NOT_READY, type: 'string' },
  { key: 'readyQuantity', name: strings.READY, type: 'string' },
  { key: 'totalQuantity', name: strings.TOTAL, type: 'string' },
];

export default function Inventory(props: InventoryProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const history = useHistory();
  const { organization, hasNurseries, hasSpecies } = props;
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  const getEmptyState = () => {
    const emptyState = [];

    if (!hasSpecies) {
      emptyState.push({
        title: strings.SPECIES,
        text: emptyMessageStrings.INVENTORY_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
      });
    }

    if (!hasNurseries) {
      emptyState.push({
        title: strings.NURSERIES,
        text: emptyMessageStrings.INVENTORY_ONBOARDING_NURSERIES_MSG,
        buttonText: strings.GO_TO_NURSERIES,
        onClick: () => goTo(APP_PATHS.NURSERIES),
      });
    }

    return emptyState;
  };

  const isOnboarded = hasNurseries && hasSpecies;

  useEffect(() => {
    let activeRequests = true;

    if (organization) {
      const populateResults = async () => {
        const apiResponse = await search({
          prefix: 'inventories',
          fields: [
            'species_id',
            'species_scientificName',
            'species_commonName',
            'facilityInventories.facility_name',
            'germinatingQuantity',
            'notReadyQuantity',
            'readyQuantity',
            'totalQuantity',
          ],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'or',
                children: [
                  { operation: 'field', field: 'species_scientificName', type: 'Fuzzy', values: [debouncedSearchTerm] },
                  { operation: 'field', field: 'species_commonName', type: 'Fuzzy', values: [debouncedSearchTerm] },
                  {
                    operation: 'field',
                    field: 'facilityInventories.facility_name',
                    type: 'Fuzzy',
                    values: [debouncedSearchTerm],
                  },
                ],
              },
              {
                operation: 'field',
                field: 'organization_id',
                values: [organization.id],
              },
            ],
          },
          count: 1000,
        });

        if (activeRequests) {
          setSearchResults(apiResponse);
        }
      };

      populateResults();
    }

    return () => {
      activeRequests = false;
    };
  }, [debouncedSearchTerm, organization]);

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  return (
    <TfMain>
      <Grid container spacing={3}>
        <Grid item xs={9}>
          <Typography fontSize='24px' fontWeight={600}>
            {strings.INVENTORY}
          </Typography>
        </Grid>
        <PageSnackbar />
        {isOnboarded ? (
          searchResults && searchResults.length > 0 ? (
            <>
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                {['Admin', 'Owner'].includes(organization.role) &&
                  (isMobile ? (
                    <Button
                      id='new-inventory'
                      icon='plus'
                      onClick={() => goTo(APP_PATHS.INVENTORY_NEW)}
                      size='medium'
                    />
                  ) : (
                    <Button
                      id='new-inventory'
                      icon='plus'
                      label={strings.ADD_INVENTORY}
                      onClick={() => goTo(APP_PATHS.INVENTORY_NEW)}
                      size='medium'
                    />
                  ))}
              </Grid>
              <Grid item xs={12} marginTop={3}>
                <Box width='300px'>
                  <TextField
                    placeholder={strings.SEARCH}
                    iconLeft='search'
                    label=''
                    id='search'
                    type='text'
                    onChange={onChangeSearch}
                    value={temporalSearchValue}
                    iconRight='cancel'
                    onClickRightIcon={clearSearch}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <div>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Table
                        id='inventory-table'
                        columns={columns}
                        rows={searchResults}
                        orderBy='species_scientificName'
                        Renderer={InventoryCellRenderer}
                      />
                    </Grid>
                  </Grid>
                </div>
              </Grid>
            </>
          ) : (
            <Container maxWidth={false} className={classes.mainContainer}>
              <EmptyStatePage pageName={'Inventory'} />
            </Container>
          )
        ) : (
          <Container maxWidth={false} className={classes.mainContainer}>
            {isAdmin(organization) ? (
              <EmptyMessage
                className={classes.message}
                title={emptyMessageStrings.ONBOARDING_ADMIN_TITLE}
                rowItems={getEmptyState()}
              />
            ) : (
              <EmptyMessage
                className={classes.message}
                title={emptyMessageStrings.REACH_OUT_TO_ADMIN_TITLE}
                text={emptyMessageStrings.NO_NURSERIES_NON_ADMIN_MSG}
              />
            )}
          </Container>
        )}
      </Grid>
    </TfMain>
  );
}
