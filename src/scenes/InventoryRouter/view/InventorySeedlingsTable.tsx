import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem, TableColumnType } from '@terraware/web-components';
import { TopBarButton } from '@terraware/web-components/components/table';

import ProjectAssignTopBarButton from 'src/components/ProjectAssignTopBarButton';
import OptionsMenu from 'src/components/common/OptionsMenu';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { APP_PATHS } from 'src/constants';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers';
import { isBatchEmpty } from 'src/scenes/InventoryRouter/FilterUtils';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import Search from 'src/scenes/InventoryRouter/Search';
import { NurseryBatchService } from 'src/services';
import strings from 'src/strings';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { OriginPage } from '../InventoryBatchView';
import BatchDetailsModal from './BatchDetailsModal';
import BatchesCellRenderer from './BatchesCellRenderer';
import BatchesExportModal from './BatchesExportModal';
import DeleteBatchesModal from './DeleteBatchesModal';

export interface InventorySeedlingsTableProps {
  speciesId?: number;
  facilityId?: number;
  modified: number;
  setModified: (val: number) => void;
  openBatchNumber: string | null;
  onUpdateOpenBatch: (batchNum: string | null) => void;
  origin: OriginPage;
  columns: TableColumnType[] | (() => TableColumnType[]);
  isSelectionBulkWithdrawable: (selectedRows: SearchResponseElement[]) => boolean;
  getFuzzySearchFields: (debouncedSearchTerm: string) => FieldNodePayload[];
  // Origin ID is either the facility ID or the species ID
  getBatchesSearch: (
    orgId: number,
    originId: number,
    searchFields: FieldNodePayload[],
    searchSortOrder: SearchSortOrder | undefined
  ) => Promise<SearchResponseElement[] | null>;
  getBatchesExport?: (
    orgId: number,
    originId: number,
    searchFields: FieldNodePayload[],
    searchSortOrder: SearchSortOrder | undefined
  ) => Promise<SearchResponseElement[] | null>;
}

export default function InventorySeedlingsTable(props: InventorySeedlingsTableProps): JSX.Element {
  const {
    modified,
    setModified,
    openBatchNumber,
    onUpdateOpenBatch,
    origin,
    columns,
    isSelectionBulkWithdrawable,
    getFuzzySearchFields,
    getBatchesSearch,
    getBatchesExport,
  } = props;
  const originId: number | undefined = props.facilityId || props.speciesId;

  const { selectedOrganization } = useOrganization();
  const { isMobile, isDesktop } = useDeviceInfo();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();

  const [openExportModal, setOpenExportModal] = useState<boolean>(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState<string>('');
  const [batches, setBatches] = useState<SearchResponseElement[]>([]);
  // search results without species filtering, needed to populate values for the species filter dropdown
  const [speciesUnfilteredBatches, setSpeciesUnfilteredBatches] = useState<SearchResponseElement[]>([]);
  // The main distinction here is that the filtered batches are filtered in the view, whereas `batches` is
  // the filtered-by-search batches list that comes back from the API
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [filters, setFilters] = useForm<InventoryFiltersUnion>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openNewBatchModal, setOpenNewBatchModal] = useState<boolean>(false);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>();

  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (
      (origin === 'Species' || origin === 'Nursery') &&
      batches.length > 0 &&
      batches.filter((batch: SearchResponseElement) => !isBatchEmpty(batch)).length === 0
    ) {
      setFilters({ showEmptyBatches: ['true'] });
    }
  }, [batches, origin, setFilters]);

  const filterEmptyBatches = useCallback(
    (unfiltered: SearchResponseElement[]) => {
      // Because the field group filters have their values
      // set as SearchNodePayload['values'] (which is (string | null[]), we gotta boolean-ify it
      // If there is no value set (initial form state), this defaults to false
      const showEmptyBatches = (filters.showEmptyBatches || [])[0] === 'true';

      return unfiltered.filter((batch: SearchResponseElement) => (showEmptyBatches ? true : !isBatchEmpty(batch)));
    },
    [filters.showEmptyBatches]
  );

  const getNonSpeciesSearchFields = useCallback(() => {
    // Skip fuzzy search on empty strings since the query will be
    // expensive and results will be the same as not adding the fuzzy search
    const fields: FieldNodePayload[] = debouncedSearchTerm ? getFuzzySearchFields(debouncedSearchTerm) : [];

    if (filters.facilityIds && filters.facilityIds.length > 0) {
      fields.push({
        operation: 'field',
        field: 'facility_id',
        type: 'Exact',
        values: filters.facilityIds.map((id) => id.toString()),
      });
    }

    if (filters.projectIds && filters.projectIds.length > 0) {
      fields.push({
        operation: 'field',
        field: 'project_id',
        type: 'Exact',
        values: filters.projectIds.map((id) => (id === null ? id : id.toString())),
      });
    }

    return fields;
  }, [getFuzzySearchFields, debouncedSearchTerm, filters.facilityIds, filters.projectIds]);

  const getSearchFields = useCallback(() => {
    const fields: FieldNodePayload[] = getNonSpeciesSearchFields();

    if (filters.speciesIds && filters.speciesIds.length > 0) {
      fields.push({
        operation: 'field',
        field: 'species_id',
        type: 'Exact',
        values: filters.speciesIds.map((id) => id.toString()),
      });
    }

    return fields;
  }, [getNonSpeciesSearchFields, filters.speciesIds]);

  useEffect(() => {
    const requestId = setRequestId('inventory-seedlings');

    const populateResults = async () => {
      if (!originId || !selectedOrganization) {
        return;
      }

      const searchFields = getSearchFields();
      const batchesResults = await getBatchesSearch(selectedOrganization.id, originId, searchFields, searchSortOrder);

      if (requestId === getRequestId('inventory-seedlings')) {
        setBatches(batchesResults || []);
      }
    };

    if (!originId || !isNaN(originId)) {
      void populateResults();
    }
  }, [
    filters.facilityIds,
    getBatchesSearch,
    getSearchFields,
    modified,
    originId,
    searchSortOrder,
    selectedOrganization,
  ]);

  useEffect(() => {
    const requestId = setRequestId('inventory-seedlings-species-unfiltered');

    const populateSpeciesUnfilteredResults = async () => {
      if (!originId || !selectedOrganization) {
        return;
      }

      const searchFields = getNonSpeciesSearchFields();
      const speciesUnfilteredBatchesResults = await getBatchesSearch(
        selectedOrganization.id,
        originId,
        searchFields,
        searchSortOrder
      );

      if (requestId === getRequestId('inventory-seedlings-species-unfiltered')) {
        // keep state of results without species filtering, to populate species_id filter values
        setSpeciesUnfilteredBatches(filterEmptyBatches(speciesUnfilteredBatchesResults || []));
      }
    };

    if (!originId || !isNaN(originId)) {
      void populateSpeciesUnfilteredResults();
    }
  }, [
    filterEmptyBatches,
    getBatchesSearch,
    getNonSpeciesSearchFields,
    originId,
    searchSortOrder,
    selectedOrganization,
  ]);

  useEffect(() => {
    const batch = batches.find((b) => b.batchNumber === openBatchNumber);
    if (batch) {
      const batchId = batch.id as number | string;
      if (origin === 'Nursery') {
        navigate({
          pathname: APP_PATHS.INVENTORY_BATCH_FOR_NURSERY.replace(':nurseryId', `${originId}`).replace(
            ':batchId',
            `${batchId}`
          ),
        });
      } else {
        navigate({
          pathname: APP_PATHS.INVENTORY_BATCH_FOR_SPECIES.replace(':speciesId', `${originId}`).replace(
            ':batchId',
            `${batchId}`
          ),
        });
      }
    }
  }, [batches, navigate, openBatchNumber, origin, originId]);

  useEffect(() => {
    setFilteredBatches(filterEmptyBatches(batches));
  }, [batches, filterEmptyBatches]);

  const deleteSelectedBatches = () => {
    const promises = selectedRows.map((r) => NurseryBatchService.deleteBatch(r.id as number));
    void Promise.allSettled(promises).then((results) => {
      if (results.some((result) => result.status === 'rejected' || result?.value?.requestSucceeded === false)) {
        snackbar.toastError();
      }
      reloadData();
      setOpenDeleteModal(false);
    });
  };

  const addBatch = () => {
    setOpenNewBatchModal(true);
    reloadData();
    return;
  };

  const reloadData = () => {
    setModified(Date.now());
    return;
  };

  const selectAllRows = useCallback(() => {
    setSelectedRows(batches);
  }, [batches]);

  const onBatchSelected = (batch: any, fromColumn?: string) => {
    if (fromColumn === 'withdraw') {
      navigate({
        pathname: APP_PATHS.BATCH_WITHDRAW,
        search: `?batchId=${batch.id.toString()}&source=${window.location.pathname}`,
      });
    } else if (fromColumn === 'quantitiesMenu') {
      reloadData();
    } else {
      let to: string = APP_PATHS.INVENTORY_BATCH;

      if (origin === 'Nursery') {
        to = APP_PATHS.INVENTORY_BATCH_FOR_NURSERY.replace(':nurseryId', `${originId}`);
      } else if (origin === 'Species') {
        to = APP_PATHS.INVENTORY_BATCH_FOR_SPECIES.replace(':speciesId', `${originId}`);
      }

      navigate(to.replace(':batchId', batch.id));
    }
  };

  const getSelectedRowsAsQueryParams = () => {
    const batchIds = selectedRows.map((row) => `batchId=${row.id}`);
    return `?${batchIds.join('&')}&source=${window.location.pathname}`;
  };

  const bulkWithdrawSelectedRows = () => {
    navigate({
      pathname: APP_PATHS.BATCH_WITHDRAW,
      search: getSelectedRowsAsQueryParams(),
    });
  };

  const totalSelectedQuantity = useMemo<number>(
    () =>
      selectedRows.reduce(
        (total, row) => total + Number(row['totalQuantity(raw)']) + Number(row['germinatingQuantity(raw)']),
        0
      ),
    [selectedRows]
  );

  const getTopBarButtons = () => {
    const topBarButtons: (TopBarButton | JSX.Element)[] = [];
    topBarButtons.push({
      buttonType: 'destructive',
      buttonText: strings.DELETE,
      onButtonClick: () => setOpenDeleteModal(true),
    });

    const bulkWithdrawable = isSelectionBulkWithdrawable(selectedRows);

    let withdrawTooltip;

    if (!bulkWithdrawable) {
      withdrawTooltip = strings.WITHDRAW_SINGLE_NURSERY;
    } else if (totalSelectedQuantity === 0) {
      withdrawTooltip = strings.NO_WITHDRAWABLE_QUANTITIES_FOUND;
    }

    topBarButtons.push(
      <ProjectAssignTopBarButton
        key={1}
        totalResultsCount={batches?.length}
        selectAllRows={selectAllRows}
        reloadData={reloadData}
        projectAssignPayloadCreator={() => ({ batchIds: selectedRows.map((row) => Number(row.id)) })}
      />
    );

    topBarButtons.push({
      buttonType: 'passive',
      buttonText: strings.WITHDRAW,
      onButtonClick: () => bulkWithdrawSelectedRows(),
      disabled: !bulkWithdrawable || !totalSelectedQuantity,
      tooltipTitle: withdrawTooltip,
    });

    return topBarButtons;
  };

  const onSortChange = (order: SortOrder, orderBy: string) => {
    setSearchSortOrder({
      field: orderBy,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'export') {
      setOpenExportModal(true);
    }
  };

  const batchesExport = useCallback(() => {
    if (!originId || !getBatchesExport || !selectedOrganization) {
      return Promise.resolve([] as SearchResponseElement[]);
    }

    return getBatchesExport(selectedOrganization.id, originId, getSearchFields(), searchSortOrder);
  }, [getBatchesExport, selectedOrganization, originId, getSearchFields, searchSortOrder]);

  const getResultsSpeciesNames = useCallback(
    (): string[] => speciesUnfilteredBatches.map((s) => s.species_scientificName as string),
    [speciesUnfilteredBatches]
  );

  return (
    <>
      {openExportModal && (
        <BatchesExportModal batchesExport={batchesExport} onClose={() => setOpenExportModal(false)} />
      )}
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: theme.palette.TwClrBg,
        }}
      >
        {openNewBatchModal && (
          <BatchDetailsModal
            reload={reloadData}
            onClose={() => {
              onUpdateOpenBatch(null);
              setOpenNewBatchModal(false);
            }}
            originId={originId}
            origin={origin}
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
              {getBatchesExport && (
                <OptionsMenu
                  onOptionItemClick={onOptionItemClick}
                  optionItems={[{ label: strings.EXPORT, value: 'export' }]}
                  size='small'
                />
              )}
            </Box>
          </Box>

          <Box>
            <Search
              filters={filters}
              getResultsSpeciesNames={getResultsSpeciesNames}
              onSearch={(val) => setTemporalSearchValue(val)}
              origin={origin}
              searchValue={temporalSearchValue}
              setFilters={setFilters}
              showEmptyBatchesFilter
              showProjectsFilter
            />
          </Box>

          <Box marginTop={theme.spacing(2)}>
            <Table
              id={`inventory-seedlings-table-${origin.toLowerCase()}`}
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
