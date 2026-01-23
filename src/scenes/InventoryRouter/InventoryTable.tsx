import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import _, { isArray } from 'lodash';

import ProjectAssignTopBarButton from 'src/components/ProjectAssignTopBarButton';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import Search from 'src/scenes/InventoryRouter/Search';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { useSessionFilters } from 'src/utils/filterHooks/useSessionFilters';

import InventoryCellRenderer from './InventoryCellRenderer';

interface InventoryTableProps {
  allowSelectionProjectAssign?: boolean;
  columns: TableColumnType[] | (() => TableColumnType[]);
  filters: InventoryFiltersUnion;
  isPresorted: boolean;
  origin: OriginPage;
  reloadData?: () => void;
  results: SearchResponseElement[];
  setFilters: (f: InventoryFiltersUnion) => void;
  setSearchSortOrder: (sortOrder: SearchSortOrder) => void;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
  temporalSearchValue: string;
  emptyTableMessage?: string;
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
    allowSelectionProjectAssign,
    emptyTableMessage,
  } = props;

  const { strings } = useLocalization();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const navigate = useSyncNavigate();
  const { sessionFilters, setSessionFilters } = useSessionFilters(origin.toLowerCase());
  const [withdrawTooltip, setWithdrawTooltip] = useState<string>();

  // Sync query filters into view
  useEffect(() => {
    if (!sessionFilters) {
      // Wait for session filters to finish loading
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { showEmptyBatches: filterShowEmptyBatches, ...restFilters } = filters;
    const { showEmptyBatches: sessionFilterShowEmptyBatches, ...restSessionFilters } = sessionFilters;

    let nextFilters: InventoryFiltersUnion = { ...restSessionFilters };
    if (!_.isEqual(restFilters, restSessionFilters)) {
      nextFilters = { ...restSessionFilters };
    }

    // Since showEmptyBatches is a super special filter that unfortunately needs to
    // conform to SearchNodePayload (or refactor the ./Search and src/common/FilterGroup components), we need to change
    // the `true` and `false` values to `['true']` and `['false']`
    if (sessionFilterShowEmptyBatches) {
      nextFilters.showEmptyBatches = isArray(sessionFilterShowEmptyBatches)
        ? sessionFilterShowEmptyBatches.map((value) => `${value}`)
        : [`${sessionFilterShowEmptyBatches}`];
    }

    if (!_.isEqual(filters, nextFilters)) {
      setFilters(nextFilters);
    }
  }, [filters, sessionFilters, setFilters]);

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

    navigate({
      pathname: path,
      search: `?${searchParams}&source=${window.location.pathname}`,
    });
  };

  const isSelectionWithdrawable = () => {
    // we are woring with 'any' type rows in this table
    const hasWithdrawableQuantity = (row: any) =>
      Number(row['totalQuantity(raw)']) > 0 || Number(row['germinatingQuantity(raw)']) > 0;

    switch (origin) {
      case 'Species':
        return selectedRows.some((row) => row.species_id && hasWithdrawableQuantity(row));
      case 'Nursery':
        return selectedRows.length === 1 && selectedRows.some((row) => hasWithdrawableQuantity(row));
      case 'Batches': {
        const nurseries = new Set(selectedRows.map((row) => row.facility_id));
        return nurseries.size === 1 && selectedRows.some((row) => row.species_id && hasWithdrawableQuantity(row));
      }
    }
  };

  const totalSelectedQuantity = useMemo<number>(
    () =>
      selectedRows.reduce(
        (total, row) => total + Number(row['totalQuantity(raw)']) + Number(row['germinatingQuantity(raw)']),
        0
      ),
    [selectedRows]
  );

  useEffect(() => {
    const nurseries = new Set(selectedRows.map((row) => row.facility_id));
    if ((origin === 'Nursery' && selectedRows.length > 1) || (origin === 'Batches' && nurseries.size > 1)) {
      setWithdrawTooltip(strings.WITHDRAW_SINGLE_NURSERY);
    } else if (totalSelectedQuantity === 0) {
      setWithdrawTooltip(strings.NO_WITHDRAWABLE_QUANTITIES_FOUND);
    } else {
      setWithdrawTooltip(undefined);
    }
  }, [origin, selectedRows, strings, totalSelectedQuantity]);

  const onSortChange = useCallback(
    (order: SortOrder, orderBy: string) => {
      setSearchSortOrder({
        field: orderBy,
        direction: order === 'asc' ? 'Ascending' : 'Descending',
      });
    },
    [setSearchSortOrder]
  );

  const selectAllRows = useCallback(() => {
    setSelectedRows(results);
  }, [results]);

  const getResultsSpeciesNames = useCallback(() => {
    return results
      .map((result: SearchResponseElement & { facilityInventories?: string }) =>
        result.facilityInventories?.split('\r')
      )
      .flat()
      .filter((species) => !!species) as string[];
  }, [results]);

  const setSearchFilters = useCallback(
    (f: InventoryFiltersUnion) => {
      setFilters(f);
      setSessionFilters(f);
    },
    [setFilters, setSessionFilters]
  );

  const isClickable = useCallback(() => false, []);

  const projectAssignPayloadCreator = useCallback(() => {
    return { batchIds: selectedRows.map((row) => Number(row.id)) };
  }, [selectedRows]);

  return (
    <>
      <Box>
        <Search
          filters={filters}
          getResultsSpeciesNames={getResultsSpeciesNames}
          onSearch={setTemporalSearchValue}
          origin={origin}
          searchValue={temporalSearchValue}
          setFilters={setSearchFilters}
          showEmptyBatchesFilter={origin === 'Batches'}
          showProjectsFilter={origin === 'Batches'}
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
                isClickable={isClickable}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                showCheckbox={true}
                showTopBar={true}
                topBarButtons={[
                  ...(allowSelectionProjectAssign
                    ? [
                        <ProjectAssignTopBarButton
                          key={1}
                          totalResultsCount={results?.length}
                          selectAllRows={selectAllRows}
                          reloadData={reloadData}
                          projectAssignPayloadCreator={projectAssignPayloadCreator}
                        />,
                      ]
                    : []),
                  {
                    buttonType: 'passive',
                    buttonText: strings.WITHDRAW,
                    onButtonClick: withdrawInventory,
                    disabled: !isSelectionWithdrawable(),
                    tooltipTitle: withdrawTooltip,
                  },
                ]}
                sortHandler={onSortChange}
                isPresorted={isPresorted}
                reloadData={reloadData}
                emptyTableMessage={emptyTableMessage}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </>
  );
}
