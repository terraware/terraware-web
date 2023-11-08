import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Typography, Grid, Box, useTheme } from '@mui/material';
import { Button, DropdownItem, TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import BatchesCellRenderer from './BatchesCellRenderer';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import { InventoryFiltersType } from '../InventoryFiltersPopover';
import DeleteBatchesModal from './DeleteBatchesModal';
import { NurseryBatchService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import BatchDetailsModal from './BatchDetailsModal';
import Search from '../Search';
import { APP_PATHS } from 'src/constants';
import { TopBarButton } from '@terraware/web-components/components/table';
import { useOrganization } from 'src/providers';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import OptionsMenu from 'src/components/common/OptionsMenu';
import BatchesExportModal from './BatchesExportModal';

interface InventorySeedslingsTableProps {
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

export default function InventorySeedslingsTable(props: InventorySeedslingsTableProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { speciesId, modified, setModified, openBatchNumber, onUpdateOpenBatch } = props;
  const { isMobile, isDesktop } = useDeviceInfo();
  const theme = useTheme();
  const [openExportModal, setOpenExportModal] = useState<boolean>(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState<string>('');
  const [batches, setBatches] = useState<any[]>([]);
  const [filters, setFilters] = useForm<InventoryFiltersType>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openNewBatchModal, setOpenNewBatchModal] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<any>();
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>();
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const snackbar = useSnackbar();
  const history = useHistory();

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
          return { ...sr, facilityId: sr.facility_id };
        });
        setBatches(batchesResults || []);
      }
    };

    if (!isNaN(speciesId)) {
      populateResults();
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
            speciesId={speciesId}
            selectedBatch={selectedBatch}
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
          <Search
            searchValue={temporalSearchValue}
            onSearch={(val) => setTemporalSearchValue(val)}
            filters={filters}
            setFilters={setFilters}
          />
          <Box marginTop={theme.spacing(2)}>
            <Table
              id='batches-table'
              columns={columns}
              rows={batches}
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
