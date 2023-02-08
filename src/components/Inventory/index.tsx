import { Box, CircularProgress, Container, Grid, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
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
import { NurseryInventoryService } from 'src/services';
import ImportInventoryModal from './ImportInventoryModal';
import { Button } from '@terraware/web-components';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { DropdownItem } from '@terraware/web-components';
import PopoverMenu from '../common/PopoverMenu';
import { useOrganization } from 'src/providers/hooks';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: '32px 0',
  },
  message: {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '48px',
    width: (props: StyleProps) => (props.isMobile ? 'auto' : '800px'),
  },
  spinnerContainer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
  },
  actionMenuIcon: {
    fill: theme.palette.TwClrTxtBrand,
  },
}));

type InventoryProps = {
  hasNurseries: boolean;
  hasSpecies: boolean;
};

type FacilityName = {
  facility_name: string;
};

type InventoryResult = {
  species_id: string;
  species_scientificName: string;
  germinatingQuantity: string;
  notReadyQuantity: string;
  readyQuantity: string;
  totalQuantity: string;
  facilityInventories: FacilityName[];
};

export default function Inventory(props: InventoryProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const theme = useTheme();
  const history = useHistory();
  const { hasNurseries, hasSpecies } = props;
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [unfilteredInventory, setUnfilteredInventory] = useState<SearchResponseElement[] | null>(null);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [filters, setFilters] = useForm<InventoryFiltersType>({});
  const [importInventoryModalOpen, setImportInventoryModalOpen] = useState(false);
  const contentRef = useRef(null);

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

    if (!hasNurseries) {
      emptyState.push({
        title: strings.ADD_NURSERIES,
        text: strings.INVENTORY_ONBOARDING_NURSERIES_MSG,
        buttonText: strings.GO_TO_NURSERIES,
        onClick: () => goTo(APP_PATHS.NURSERIES),
      });
    }

    if (!hasSpecies) {
      emptyState.push({
        title: strings.CREATE_SPECIES_LIST,
        text: strings.INVENTORY_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
        disabled: !hasNurseries,
        altItem: {
          title: strings.IMPORT_INVENTORY_ALT_TITLE,
          text: strings.IMPORT_INVENTORY_WITH_TEMPLATE,
          linkText: strings.DOWNLOAD_THE_CSV_TEMPLATE,
          onLinkClick: () => downloadCsvTemplateHandler(NurseryInventoryService.downloadInventoryTemplate),
          buttonText: strings.IMPORT_INVENTORY,
          onClick: () => importInventory(),
        },
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
            values: [selectedOrganization.id],
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
  }, [filters, debouncedSearchTerm, selectedOrganization]);

  const onApplyFilters = useCallback(async () => {
    const params: SearchNodePayload = getParams();
    const requestId = Math.random().toString();
    setRequestId('searchInventory', requestId);
    const apiSearchResults = await search(params);
    const updatedResult = apiSearchResults?.map((result) => {
      const resultTyped = result as InventoryResult;
      const facilityInventoriesNames = resultTyped.facilityInventories.map((nursery) => nursery.facility_name);
      return { ...result, facilityInventories: facilityInventoriesNames.join('\r') };
    });
    if (updatedResult) {
      if (params.search.children.length === 1) {
        setUnfilteredInventory(updatedResult);
      }
      if (getRequestId('searchInventory') === requestId) {
        setSearchResults(updatedResult);
      }
    }
  }, [getParams]);

  useEffect(() => {
    onApplyFilters();
  }, [filters, onApplyFilters]);

  const shouldShowTable = isOnboarded && unfilteredInventory && unfilteredInventory.length > 0;

  const [actionMenuAnchorEl, setActionMenuAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleClickActionMenuButton = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };

  const onItemClick = (selectedItem: DropdownItem) => {
    switch (selectedItem.value) {
      case 'import': {
        handleCloseActionMenu();
        setImportInventoryModalOpen(true);
        break;
      }
      default: {
        handleCloseActionMenu();
      }
    }
  };

  const getHeaderButtons = () => (
    <>
      <Box marginLeft={1} display='inline'>
        <Button
          id='more-options'
          icon='menuVertical'
          onClick={(event) => event && handleClickActionMenuButton(event)}
          priority='secondary'
          size='medium'
        />
      </Box>

      <PopoverMenu
        sections={[[{ label: strings.IMPORT, value: 'import' }]]}
        handleClick={onItemClick}
        anchorElement={actionMenuAnchorEl}
        setAnchorElement={setActionMenuAnchorEl}
      />
    </>
  );

  return (
    <TfMain backgroundImageVisible={!isOnboarded}>
      <ImportInventoryModal
        open={importInventoryModalOpen}
        onClose={() => setImportInventoryModalOpen(false)}
        reloadData={onApplyFilters}
      />
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ paddingBottom: theme.spacing(4), paddingLeft: theme.spacing(3) }}>
          <Grid container>
            <Grid item xs={6}>
              <Typography fontSize='24px' fontWeight={600}>
                {strings.INVENTORY}
              </Typography>
            </Grid>
            {isOnboarded && unfilteredInventory && unfilteredInventory.length > 0 ? (
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                {isMobile ? (
                  <Button id='new-inventory' icon='plus' onClick={() => goTo(APP_PATHS.INVENTORY_NEW)} size='medium' />
                ) : (
                  <>
                    <Box sx={{ display: 'inline', paddingLeft: 1 }}>
                      <Button
                        id='new-inventory'
                        icon='plus'
                        label={strings.ADD_INVENTORY}
                        onClick={() => goTo(APP_PATHS.INVENTORY_NEW)}
                        size='medium'
                      />
                    </Box>
                    {getHeaderButtons()}
                  </>
                )}
              </Grid>
            ) : null}
          </Grid>
        </Box>
      </PageHeaderWrapper>
      <Box
        ref={contentRef}
        sx={{
          backgroundColor: shouldShowTable ? theme.palette.TwClrBg : undefined,
          borderRadius: '32px',
          padding: theme.spacing(3),
          minWidth: 'fit-content',
        }}
      >
        {isOnboarded ? (
          unfilteredInventory && unfilteredInventory.length > 0 ? (
            <InventoryTable
              results={searchResults || []}
              temporalSearchValue={temporalSearchValue}
              setTemporalSearchValue={setTemporalSearchValue}
              filters={filters}
              setFilters={setFilters}
            />
          ) : unfilteredInventory === null ? (
            <div className={classes.spinnerContainer}>
              <CircularProgress />
            </div>
          ) : (
            <Container maxWidth={false} className={classes.mainContainer}>
              <EmptyStatePage backgroundImageVisible={false} pageName={'Inventory'} reloadData={onApplyFilters} />
            </Container>
          )
        ) : (
          <Container maxWidth={false} className={classes.mainContainer}>
            <PageSnackbar />
            {isAdmin(selectedOrganization) ? (
              <EmptyMessage
                className={classes.message}
                title={strings.ONBOARDING_ADMIN_TITLE}
                rowItems={getEmptyState()}
              />
            ) : (
              <EmptyMessage
                className={classes.message}
                title={strings.REACH_OUT_TO_ADMIN_TITLE}
                text={strings.NO_NURSERIES_NON_ADMIN_MSG}
              />
            )}
          </Container>
        )}
      </Box>
    </TfMain>
  );
}
