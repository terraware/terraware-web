import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Typography, Grid, Box, useTheme, Theme, Popover } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DropdownItem, TableColumnType, Tooltip } from '@terraware/web-components';
import { TopBarButton } from '@terraware/web-components/components/table';
import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import { FieldNodePayload, SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import { NurseryBatchService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import OptionsMenu from 'src/components/common/OptionsMenu';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import { convertFilterGroupToMap, isBatchEmpty } from 'src/components/InventoryV2/FilterUtils';
import { InventoryFiltersType } from 'src/components/InventoryV2/InventoryFiltersPopover';
import Search from 'src/components/InventoryV2/Search';
import BatchesCellRenderer from './BatchesCellRenderer';
import BatchDetailsModal from './BatchDetailsModal';
import BatchesExportModal from './BatchesExportModal';
import DeleteBatchesModal from './DeleteBatchesModal';

interface InventorySeedlingsTableProps {
  speciesId: number;
  modified: number;
  setModified: (val: number) => void;
  openBatchNumber: string | null;
  onUpdateOpenBatch: (batchNum: string | null) => void;
}

const columns = (): TableColumnType[] => [
  { key: 'batchNumber', name: strings.SEEDLING_BATCH, type: 'string' },
  { key: 'germinatingQuantity', name: strings.GERMINATING, type: 'string' },
  { key: 'notReadyQuantity', name: strings.NOT_READY, type: 'string' },
  { key: 'readyQuantity', name: strings.READY, type: 'string' },
  { key: 'totalQuantity', name: strings.TOTAL, type: 'string' },
  { key: 'totalQuantityWithdrawn', name: strings.WITHDRAWN, type: 'string' },
  { key: 'facility_name', name: strings.NURSERY, type: 'string' },
  { key: 'readyByDate', name: strings.EST_READY_DATE, type: 'string' },
  { key: 'addedDate', name: strings.DATE_ADDED, type: 'string' },
  { key: 'withdraw', name: '', type: 'string' },
  { key: 'quantitiesMenu', name: '', type: 'string' },
];

const useStyles = makeStyles((theme: Theme) => ({
  popoverContainer: {
    '& .MuiPaper-root': {
      border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
      borderRadius: '8px',
      width: '480px',
    },
  },
}));

const initialFilters: Record<string, SearchNodePayload> = {
  showEmptyBatches: {
    field: 'showEmptyBatches',
    values: ['false'],
    type: 'Exact',
    operation: 'field',
  },
};

export default function InventorySeedlingsTable(props: InventorySeedlingsTableProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { speciesId, modified, setModified, openBatchNumber, onUpdateOpenBatch } = props;
  const { isMobile, isDesktop } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();
  const [openExportModal, setOpenExportModal] = useState<boolean>(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState<string>('');
  const [batches, setBatches] = useState<any[]>([]);
  // The main distinction here is that the filtered batches are filtered in the view, whereas `batches` is
  // the filtered-by-search batches list that comes back from the API
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [filters, setFilters] = useForm<InventoryFiltersType>({});
  const [filterGroupFilters, setFilterGroupFilters] = useForm<Record<string, SearchNodePayload>>(initialFilters);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openNewBatchModal, setOpenNewBatchModal] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<any>();
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>();
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const snackbar = useSnackbar();
  const history = useHistory();
  const { activeLocale } = useLocalization();

  const getSearchFields = useCallback(() => {
    // Skip fuzzy search on empty strings since the query will be
    // expensive and results will be the same as not adding the fuzzy search
    const fields: FieldNodePayload[] = debouncedSearchTerm
      ? [
          {
            operation: 'field',
            field: 'facility_name',
            type: 'Fuzzy',
            values: [debouncedSearchTerm],
          },
        ]
      : [];

    if (filters.facilityIds && filters.facilityIds.length > 0) {
      fields.push({
        operation: 'field',
        field: 'facility_id',
        type: 'Exact',
        values: filters.facilityIds.map((id) => id.toString()),
      });
    }
    return fields;
  }, [debouncedSearchTerm, filters?.facilityIds]);

  useEffect(() => {
    let activeRequests = true;

    const populateResults = async () => {
      const searchFields = getSearchFields();
      const searchResponse = await NurseryBatchService.getBatchesForSpeciesById(
        selectedOrganization.id,
        speciesId,
        searchFields,
        searchSortOrder
      );

      if (activeRequests) {
        const batchesResults = searchResponse?.map((sr: SearchResponseElement) => {
          return { ...sr, facilityId: sr.facility_id, species_id: speciesId };
        });
        setBatches(batchesResults || []);
      }
    };

    if (!isNaN(speciesId)) {
      void populateResults();
    }

    return () => {
      activeRequests = false;
    };
  }, [getSearchFields, selectedOrganization, speciesId, filters.facilityIds, modified, searchSortOrder]);

  useEffect(() => {
    const batch = batches.find((b) => b.batchNumber === openBatchNumber);
    if (batch) {
      setSelectedBatch(batch);
      setOpenNewBatchModal(true);
    }
  }, [openBatchNumber, batches]);

  useEffect(() => {
    if (batches.length === 0) {
      return;
    }

    // Because the field group filters have their values
    // set as SearchNodePayload['values'] (which is (string | null[]), we gotta boolean-ify it
    // If there is no value set (initial form state), this defaults to false
    const showEmptyBatches = (filters.showEmptyBatches || [])[0] === 'true';

    const _filteredBatches: SearchResponseElement[] = batches.filter((batch: SearchResponseElement) =>
      showEmptyBatches ? batch : !isBatchEmpty(batch)
    );

    setFilteredBatches(_filteredBatches);
  }, [batches, filters.showEmptyBatches]);

  const deleteSelectedBatches = () => {
    const promises = selectedRows.map((r) => NurseryBatchService.deleteBatch(r.id as number));
    Promise.allSettled(promises).then((results) => {
      if (results.some((result) => result.status === 'rejected' || result?.value?.requestSucceeded === false)) {
        snackbar.toastError();
      }
      reloadData();
      setOpenDeleteModal(false);
    });
  };

  const addBatch = () => {
    setSelectedBatch(undefined);
    setOpenNewBatchModal(true);
    reloadData();
    return;
  };

  const reloadData = () => {
    setModified(Date.now());
    return;
  };

  const onBatchSelected = (batch: any, fromColumn?: string) => {
    setSelectedBatch(batch);
    if (fromColumn === 'withdraw') {
      history.push({
        pathname: APP_PATHS.BATCH_WITHDRAW,
        search: `?batchId=${batch.id.toString()}&source=${window.location.pathname}`,
      });
    } else if (fromColumn === 'quantitiesMenu') {
      reloadData();
    } else {
      onUpdateOpenBatch(batch.batchNumber);
      setOpenNewBatchModal(true);
    }
  };

  const areAllFromSameNursery = () => {
    const initialNurseryId = selectedRows[0].facilityId;
    const otherNursery = selectedRows.some((row) => row.facilityId.toString() !== initialNurseryId.toString());
    return !otherNursery;
  };

  const selectionHasWithdrawableQuantities = () => {
    return selectedRows.some((row) => +row['totalQuantity(raw)'] > 0);
  };

  const isSelectionBulkWithdrawable = () => {
    return areAllFromSameNursery() && selectionHasWithdrawableQuantities();
  };

  const getSelectedRowsAsQueryParams = () => {
    const batchIds = selectedRows.map((row) => `batchId=${row.id}`);
    return `?${batchIds.join('&')}&source=${window.location.pathname}`;
  };

  const bulkWithdrawSelectedRows = () => {
    history.push({
      pathname: APP_PATHS.BATCH_WITHDRAW,
      search: getSelectedRowsAsQueryParams(),
    });
  };

  const getTopBarButtons = () => {
    const topBarButtons: TopBarButton[] = [];
    topBarButtons.push({
      buttonType: 'destructive',
      buttonText: strings.DELETE,
      onButtonClick: () => setOpenDeleteModal(true),
    });

    if (selectedRows.length > 1 && isSelectionBulkWithdrawable()) {
      topBarButtons.push({
        buttonType: 'passive',
        buttonText: strings.WITHDRAW,
        onButtonClick: () => bulkWithdrawSelectedRows(),
      });
    }
    return topBarButtons;
  };

  const onSortChange = (order: SortOrder, orderBy: string) => {
    setSearchSortOrder({
      field: orderBy as string,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'export') {
      setOpenExportModal(true);
    }
  };

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  const filterGroupColumns = useMemo<FilterField[]>(
    () =>
      activeLocale
        ? [
            {
              name: 'showEmptyBatches',
              label: strings.FILTER_SHOW_EMPTY_BATCHES,
              showLabel: false,
              type: 'boolean',
            },
          ]
        : [],
    [activeLocale]
  );

  return (
    <>
      {openExportModal && (
        <BatchesExportModal
          speciesId={speciesId}
          organizationId={selectedOrganization.id}
          searchFields={getSearchFields()}
          searchSortOrder={searchSortOrder}
          onClose={() => setOpenExportModal(false)}
        />
      )}
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          marginTop: theme.spacing(3),
          minWidth: 'fit-content',
          padding: theme.spacing(3),
        }}
      >
        {openNewBatchModal && (
          <BatchDetailsModal
            reload={reloadData}
            onClose={() => {
              onUpdateOpenBatch(null);
              setOpenNewBatchModal(false);
            }}
            selectedBatch={selectedBatch}
            originSpeciesId={speciesId}
            origin={'Species'}
          />
        )}
        <DeleteBatchesModal
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onSubmit={deleteSelectedBatches}
        />
        <Grid item xs={12} sx={{ marginTop: theme.spacing(1) }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing(4),
              width: isDesktop ? 'calc(100vw - 300px)' : 'calc(100vw - 76px)',
              maxWidth: '100%',
            }}
          >
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {strings.SEEDLINGS_BATCHES}
            </Typography>
            <Box display='flex' alignItems='center'>
              <Button
                id='new-batch'
                icon='plus'
                label={isMobile ? '' : strings.ADD_BATCH}
                onClick={addBatch}
                size='small'
              />
              <OptionsMenu
                onOptionItemClick={onOptionItemClick}
                optionItems={[{ label: strings.EXPORT, value: 'export' }]}
                size='small'
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginBottom: theme.spacing(2),
            }}
          >
            <Search
              searchValue={temporalSearchValue}
              onSearch={(val) => setTemporalSearchValue(val)}
              filters={filters}
              setFilters={setFilters}
            />

            <Box sx={{ marginTop: theme.spacing(0.5) }}>
              <Tooltip title={strings.FILTER}>
                <Button
                  id='filterSpecies'
                  onClick={(event) => event && handleFilterClick(event)}
                  type='passive'
                  priority='ghost'
                  icon='filter'
                />
              </Tooltip>
              <Popover
                id='simple-popover'
                open={Boolean(filterAnchorEl)}
                anchorEl={filterAnchorEl}
                onClose={handleFilterClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                className={classes.popoverContainer}
              >
                <FilterGroup
                  initialFilters={filterGroupFilters}
                  fields={filterGroupColumns}
                  onConfirm={(_filterGroupFilters: Record<string, SearchNodePayload>) => {
                    handleFilterClose();
                    setFilterGroupFilters(_filterGroupFilters);
                    setFilters({ ...filters, ...convertFilterGroupToMap(_filterGroupFilters) });
                  }}
                  onCancel={handleFilterClose}
                />
              </Popover>
            </Box>
          </Box>

          <Box marginTop={theme.spacing(2)}>
            <Table
              id='inventory-seedlings-table'
              columns={columns}
              rows={filteredBatches}
              orderBy='batchNumber'
              Renderer={BatchesCellRenderer}
              reloadData={reloadData}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              showCheckbox={true}
              isClickable={() => false}
              showTopBar={true}
              topBarButtons={getTopBarButtons()}
              onSelect={onBatchSelected}
              controlledOnSelect={true}
              sortHandler={onSortChange}
              isPresorted={!!searchSortOrder}
            />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
