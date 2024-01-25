import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TableColumnType } from '@terraware/web-components';
import { Box, Grid } from '@mui/material';
import _, { isArray } from 'lodash';
import strings from 'src/strings';
import { useSessionFilters } from 'src/utils/filterHooks/useSessionFilters';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import { APP_PATHS } from 'src/constants';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import Search from 'src/scenes/InventoryRouter/Search';
import InventoryCellRenderer from './InventoryCellRenderer';
import ProjectAssignTopBarButton from 'src/components/ProjectAssignTopBarButton';
import isEnabled from 'src/features';

interface InventoryTableProps {
  allowSelectionProjectAssign?: boolean;
  columns: () => TableColumnType[];
  filters: InventoryFiltersUnion;
  isPresorted: boolean;
  origin: OriginPage;
  reloadData?: () => void;
  results: SearchResponseElement[];
  setFilters: (f: InventoryFiltersUnion) => void;
  setSearchSortOrder: (sortOrder: SearchSortOrder) => void;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
  temporalSearchValue: string;
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
  } = props;

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const history = useHistory();
  const { sessionFilters, setSessionFilters } = useSessionFilters(origin.toLowerCase());
  const [withdrawTooltip, setWithdrawTooltip] = useState<string>();
  const featureFlagProjects = isEnabled('Projects');

  // Sync query filters into view
  useEffect(() => {
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

    history.push({
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
      case 'Batches':
        const nurseries = new Set(selectedRows.map((row) => row.facility_id));
        return nurseries.size === 1 && selectedRows.some((row) => row.species_id && hasWithdrawableQuantity(row));
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
  }, [origin, selectedRows, totalSelectedQuantity]);

  const onSortChange = (order: SortOrder, orderBy: string) => {
    setSearchSortOrder({
      field: orderBy as string,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  const selectAllRows = useCallback(() => {
    setSelectedRows(results);
  }, [results]);

  return (
    <>
      <Box>
        <Search
          searchValue={temporalSearchValue}
          onSearch={(val) => setTemporalSearchValue(val)}
          filters={filters}
          setFilters={(f) => {
            setFilters(f);
            setSessionFilters(f);
          }}
          origin={origin}
          showProjectsFilter={origin === 'Batches'}
          showEmptyBatchesFilter={origin === 'Batches'}
          tableResults={results}
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
                    tooltipTitle: withdrawTooltip,
                  },
                  ...(featureFlagProjects && allowSelectionProjectAssign
                    ? [
                        <ProjectAssignTopBarButton
                          key={1}
                          totalResultsCount={results?.length}
                          selectAllRows={selectAllRows}
                          reloadData={reloadData}
                          projectAssignPayloadCreator={() => ({ batchIds: selectedRows.map((row) => Number(row.id)) })}
                        />,
                      ]
                    : []),
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
