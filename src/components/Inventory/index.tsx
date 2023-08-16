import { Box, CircularProgress, Container, Grid, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import { isAdmin } from 'src/utils/organization';
import PageSnackbar from 'src/components/PageSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import EmptyStatePage from '../emptyStatePages/EmptyStatePage';
import InventoryTable from './InventoryTable';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { InventoryFiltersType } from './InventoryFiltersPopover';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { downloadCsvTemplateHandler } from '../common/ImportModal';
import NurseryInventoryService, { BE_SORTED_FIELDS } from 'src/services/NurseryInventoryService';
import ImportInventoryModal from './ImportInventoryModal';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { Button, DropdownItem } from '@terraware/web-components';
import { useOrganization, useUser } from 'src/providers/hooks';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { useNumberFormatter } from 'src/utils/useNumber';

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

type InventoryResultWithFacilityNames = Omit<InventoryResult, 'facilityInventories'> & { facilityInventories: string };

type FacilityInventoryResult = {
  facility_name: string;
  species_id: string;
  species_scientificName: string;
  'germinatingQuantity(raw)': string;
  'readyQuantity(raw)': string;
  'notReadyQuantity(raw)': string;
  'totalQuantity(raw)': string;
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
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'species_scientificName',
    direction: 'Ascending',
  });
  const contentRef = useRef(null);

  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [user?.locale, numberFormatter]);

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

  const onSearchSortOrder = (order: SearchSortOrder) => {
    const isClientSorted = BE_SORTED_FIELDS.indexOf(order.field) === -1;
    setSearchSortOrder(isClientSorted ? undefined : order);
  };

  const onApplyFilters = useCallback(async () => {
    const requestId = Math.random().toString();
    setRequestId('searchInventory', requestId);
    const apiSearchResults = await NurseryInventoryService.searchInventory({
      organizationId: selectedOrganization.id,
      query: debouncedSearchTerm,
      facilityIds: filters.facilityIds,
      searchSortOrder,
    });

    let updatedResult: InventoryResultWithFacilityNames[] | undefined = [];
    if (filters.facilityIds && filters.facilityIds.length) {
      const nextResults: InventoryResultWithFacilityNames[] = [];
      apiSearchResults?.reduce((acc, result) => {
        const resultTyped = result as FacilityInventoryResult;
        const indexFound = acc.findIndex((res) => res.species_id === resultTyped.species_id);

        if (indexFound !== undefined && indexFound !== -1) {
          const existingSpecies = acc[indexFound];
          acc[indexFound] = {
            ...existingSpecies,
            germinatingQuantity: (
              Number(existingSpecies.germinatingQuantity) + Number(resultTyped['germinatingQuantity(raw)'])
            ).toString(),
            notReadyQuantity: (
              Number(existingSpecies.notReadyQuantity) + Number(resultTyped['notReadyQuantity(raw)'])
            ).toString(),
            readyQuantity: (
              Number(existingSpecies.readyQuantity) + Number(resultTyped['readyQuantity(raw)'])
            ).toString(),
            totalQuantity: (
              Number(existingSpecies.totalQuantity) + Number(resultTyped['totalQuantity(raw)'])
            ).toString(),
            facilityInventories: `${existingSpecies.facilityInventories}, ${resultTyped.facility_name}`,
          };
        } else {
          const transformedResult: InventoryResultWithFacilityNames = {
            species_id: resultTyped.species_id,
            species_scientificName: resultTyped.species_scientificName,
            germinatingQuantity: resultTyped['germinatingQuantity(raw)'],
            notReadyQuantity: resultTyped['notReadyQuantity(raw)'],
            readyQuantity: resultTyped['readyQuantity(raw)'],
            totalQuantity: resultTyped['totalQuantity(raw)'],
            facilityInventories: resultTyped.facility_name,
          };

          acc.push(transformedResult);
        }
        return acc;
      }, nextResults);

      // format results
      updatedResult = nextResults.map((uR) => {
        return {
          ...uR,
          germinatingQuantity: numericFormatter.format(uR.germinatingQuantity),
          notReadyQuantity: numericFormatter.format(uR.notReadyQuantity),
          readyQuantity: numericFormatter.format(uR.readyQuantity),
          totalQuantity: numericFormatter.format(uR.totalQuantity),
        };
      });
    } else {
      updatedResult = apiSearchResults?.map((result) => {
        const resultTyped = result as InventoryResult;
        const facilityInventoriesNames = resultTyped.facilityInventories.map((nursery) => nursery.facility_name);
        return { ...resultTyped, facilityInventories: facilityInventoriesNames.join('\r') };
      });
    }
    if (updatedResult) {
      if (!debouncedSearchTerm && !filters.facilityIds?.length) {
        setUnfilteredInventory(updatedResult);
      }
      if (getRequestId('searchInventory') === requestId) {
        setSearchResults(updatedResult);
      }
    }
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder, numericFormatter]);

  useEffect(() => {
    onApplyFilters();
  }, [filters, onApplyFilters]);

  const shouldShowTable = isOnboarded && unfilteredInventory && unfilteredInventory.length > 0;

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'import') {
      setImportInventoryModalOpen(true);
    }
  };

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
                    <OptionsMenu
                      onOptionItemClick={onOptionItemClick}
                      optionItems={[{ label: strings.IMPORT, value: 'import' }]}
                    />
                  </>
                )}
              </Grid>
            ) : null}
          </Grid>
        </Box>
      </PageHeaderWrapper>
      <PageSnackbar />
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
              setSearchSortOrder={onSearchSortOrder}
              isPresorted={!!searchSortOrder}
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
