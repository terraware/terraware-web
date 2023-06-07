import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { TableColumnType } from '@terraware/web-components';
import { Box, Grid } from '@mui/material';
import { SearchResponseElement } from 'src/types/Search';
import InventoryCellRenderer from './InventoryCellRenderer';
import { InventoryFiltersType } from './InventoryFiltersPopover';
import { APP_PATHS } from 'src/constants';
import Search from './Search';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { SearchSortOrder } from 'src/types/Search';
import { useLocalization } from 'src/providers';

interface InventoryTableProps {
  results: SearchResponseElement[];
  temporalSearchValue: string;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
  setSearchSortOrder: (sortOrder: SearchSortOrder) => void;
  isPresorted: boolean;
}

export default function InventoryTable(props: InventoryTableProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const { results, setTemporalSearchValue, temporalSearchValue, filters, setFilters, setSearchSortOrder, isPresorted } =
    props;
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const history = useHistory();

  const columns: TableColumnType[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              key: 'species_scientificName',
              name: strings.SPECIES,
              type: 'string',
              tooltipTitle: strings.TOOLTIP_SCIENTIFIC_NAME,
            },
            {
              key: 'species_commonName',
              name: strings.COMMON_NAME,
              type: 'string',
              tooltipTitle: strings.TOOLTIP_COMMON_NAME,
            },
            { key: 'facilityInventories', name: strings.NURSERIES, type: 'string' },
            {
              key: 'germinatingQuantity',
              name: strings.GERMINATING,
              type: 'string',
              tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
            },
            {
              key: 'notReadyQuantity',
              name: strings.NOT_READY,
              type: 'string',
              tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
            },
            { key: 'readyQuantity', name: strings.READY, type: 'string', tooltipTitle: strings.TOOLTIP_READY_QUANTITY },
            { key: 'totalQuantity', name: strings.TOTAL, type: 'string', tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY },
          ]
        : [],
    [activeLocale]
  );

  const withdrawInventory = () => {
    const speciesIds = selectedRows.filter((row) => row.species_id).map((row) => `speciesId=${row.species_id}`);
    if (!speciesIds.length) {
      // we can't handle deleted inventory today
      return;
    }

    history.push({
      pathname: APP_PATHS.INVENTORY_WITHDRAW,
      search: `?${speciesIds.join('&')}&source=${window.location.pathname}`,
    });
  };

  const isSelectionWithdrawable = () => {
    return selectedRows.some((row) => row.species_id && +row['totalQuantity(raw)'] > 0);
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
        />
      </Box>
      <Grid item xs={12}>
        <div>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                id='inventory-table'
                columns={columns}
                rows={results}
                orderBy='species_scientificName'
                Renderer={InventoryCellRenderer}
                isClickable={(row) => row.species_id}
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
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </>
  );
}
