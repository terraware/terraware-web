import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { TableColumnType } from '@terraware/web-components';
import { Box, Grid } from '@mui/material';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import InventoryCellRenderer from './InventoryCellRenderer';
import { InventoryFiltersType } from 'src/components/InventoryV2/InventoryFilter';
import { APP_PATHS } from 'src/constants';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { OriginPage } from 'src/components/InventoryV2/InventoryBatch';
import Search from 'src/components/InventoryV2/Search';

interface InventoryTableProps {
  results: SearchResponseElement[];
  temporalSearchValue: string;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
  filters: InventoryFiltersType;
  setFilters: (f: InventoryFiltersType) => void;
  setSearchSortOrder: (sortOrder: SearchSortOrder) => void;
  isPresorted: boolean;
  columns: () => TableColumnType[];
  reloadData?: () => void;
  origin?: OriginPage;
}

export default function InventoryTable(props: InventoryTableProps): JSX.Element {
  const {
    results,
    setTemporalSearchValue,
    temporalSearchValue,
    filters,
    setFilters,
    setSearchSortOrder,
    isPresorted,
    columns,
    reloadData,
    origin,
  } = props;
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const history = useHistory();

  const withdrawInventory = () => {
    const path = origin === 'Species' ? APP_PATHS.INVENTORY_WITHDRAW : APP_PATHS.BATCH_WITHDRAW;

    const speciesIds = selectedRows.filter((row) => row.species_id).map((row) => `speciesId=${row.species_id}`);
    if (origin === 'Species' && !speciesIds.length) {
      // we can't handle deleted inventory today
      return;
    }

    const batchIds =
      origin === 'Nursery'
        ? selectedRows.flatMap((row) => row.batchIds).map((b) => `batchId=${b}`)
        : selectedRows.filter((r) => r.species_id).map((row) => `batchId=${row.batchId}`);
    const searchParams = origin === 'Species' ? speciesIds.join('&') : batchIds.join('&');

    history.push({
      pathname: path,
      search: `?${searchParams}&source=${window.location.pathname}`,
    });
  };

  const isSelectionWithdrawable = () => {
    switch (origin) {
      case 'Species':
      case 'Batches':
        return selectedRows.some((row) => row.species_id && +row['totalQuantity(raw)'] > 0);
      case 'Nursery':
        return selectedRows.some((row) => +row['totalQuantity(raw)'] > 0);
    }
  };

  const onSortChange = (order: SortOrder, orderBy: string) => {
    setSearchSortOrder({
      field: orderBy as string,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  return (
    <>
      <Box>
        <Search
          searchValue={temporalSearchValue}
          onSearch={(val) => setTemporalSearchValue(val)}
          filters={filters}
          setFilters={setFilters}
          origin={origin}
          showProjectsFilter={origin === 'Batches'}
          showEmptyBatchesFilter={origin === 'Batches'}
        />
      </Box>
      <Grid item xs={12}>
        <div>
          <Grid container spacing={0} marginTop={0}>
            <Grid item xs={12}>
              <Table
                id={`inventory-table-v2-${origin ?? ''}`}
                columns={columns}
                rows={results}
                orderBy='species_scientificName'
                Renderer={InventoryCellRenderer}
                isClickable={() => false}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                showCheckbox={true}
                showTopBar={true}
                topBarButtons={[
                  {
                    buttonType: 'passive',
                    buttonText: strings.WITHDRAW,
                    onButtonClick: withdrawInventory,
                    disabled: !isSelectionWithdrawable(),
                  },
                ]}
                sortHandler={onSortChange}
                isPresorted={isPresorted}
                reloadData={reloadData}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </>
  );
}
