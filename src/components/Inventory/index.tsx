import { CircularProgress, Container, Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';
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
import { FieldNodePayload, search, SearchNodePayload, SearchResponseElement } from 'src/api/search';
import InventoryTable from './InventoryTable';
import { InventoryFiltersType } from './InventoryFiltersPopover';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { downloadCsvTemplateHandler } from '../common/ImportModal';
import { downloadInventoryTemplate } from 'src/api/inventory/inventory';
import ImportInventoryModal from './ImportInventoryModal';

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
  spinnerContainer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
  },
}));

type InventoryProps = {
  organization: ServerOrganization;
  hasNurseries: boolean;
  hasSpecies: boolean;
};

export default function Inventory(props: InventoryProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const history = useHistory();
  const { organization, hasNurseries, hasSpecies } = props;
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [unfilteredInventory, setUnfilteredInventory] = useState<SearchResponseElement[] | null>(null);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [filters, setFilters] = useForm<InventoryFiltersType>({});
  const [importInventoryModalOpen, setImportInventoryModalOpen] = useState(false);

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  const importInventory = () => {
    setImportInventoryModalOpen(true);
  };

  const getEmptyState = () => {
    const emptyState = [];

    if (!hasSpecies) {
      emptyState.push({
        title: strings.CREATE_SPECIES_LIST,
        text: emptyMessageStrings.INVENTORY_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
        altItem: hasNurseries
          ? {
              title: strings.IMPORT_INVENTORY_ALT_TITLE,
              linkText: strings.IMPORT_INVENTORY_WITH_TEMPLATE,
              onLinkClick: () => downloadCsvTemplateHandler(downloadInventoryTemplate),
              buttonText: strings.IMPORT_INVENTORY,
              onClick: () => importInventory(),
            }
          : undefined,
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

  const getParams = useCallback(() => {
    const params: SearchNodePayload = {
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
            operation: 'field',
            field: 'organization_id',
            values: [organization.id],
          },
        ],
      },
      count: 0,
    };

    const searchValueChildren: FieldNodePayload[] = [];

    if (debouncedSearchTerm) {
      const scientificNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'species_scientificName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(scientificNameNode);

      const commonNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'species_commonName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(commonNameNode);

      const facilityNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'facilityInventories.facility_name',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(facilityNameNode);
    }

    let nurseryFilter: FieldNodePayload;
    if (filters.facilityIds && filters.facilityIds.length > 0) {
      nurseryFilter = {
        operation: 'field',
        field: 'facilityInventories.facility_id',
        type: 'Exact',
        values: filters.facilityIds.map((id) => id.toString()),
      };
    }

    if (searchValueChildren.length) {
      const searchValueNodes: FieldNodePayload = {
        operation: 'or',
        children: searchValueChildren,
      };

      if (nurseryFilter) {
        params.search.children.push({
          operation: 'and',
          children: [nurseryFilter, searchValueNodes],
        });
      } else {
        params.search.children.push(searchValueNodes);
      }
    } else if (nurseryFilter) {
      params.search.children.push(nurseryFilter);
    }

    return params;
  }, [filters, debouncedSearchTerm, organization]);

  const onApplyFilters = useCallback(async () => {
    const params: SearchNodePayload = getParams();
    const requestId = Math.random().toString();
    setRequestId('searchInventory', requestId);
    const apiSearchResults = await search(params);
    if (params.search.children.length === 1) {
      setUnfilteredInventory(apiSearchResults);
    }
    if (getRequestId('searchInventory') === requestId) {
      setSearchResults(apiSearchResults);
    }
  }, [getParams]);

  useEffect(() => {
    onApplyFilters();
  }, [filters, onApplyFilters]);

  return (
    <TfMain>
      <ImportInventoryModal
        open={importInventoryModalOpen}
        onClose={() => setImportInventoryModalOpen(false)}
        organization={organization}
      />
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography fontSize='24px' fontWeight={600}>
            {strings.INVENTORY}
          </Typography>
        </Grid>
        {isOnboarded ? (
          unfilteredInventory && unfilteredInventory.length > 0 ? (
            <InventoryTable
              organization={organization}
              results={searchResults || []}
              temporalSearchValue={temporalSearchValue}
              setTemporalSearchValue={setTemporalSearchValue}
              filters={filters}
              setFilters={setFilters}
              setImportInventoryModalOpen={setImportInventoryModalOpen}
            />
          ) : unfilteredInventory === null ? (
            <div className={classes.spinnerContainer}>
              <CircularProgress />
            </div>
          ) : (
            <Container maxWidth={false} className={classes.mainContainer}>
              <EmptyStatePage pageName={'Inventory'} organization={organization} />
            </Container>
          )
        ) : (
          <Container maxWidth={false} className={classes.mainContainer}>
            <PageSnackbar />
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
