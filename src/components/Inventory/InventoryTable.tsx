import React from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Table, TableColumnType } from '@terraware/web-components';
import { Grid } from '@mui/material';
import { SearchResponseElement } from 'src/api/search';
import InventoryCellRenderer from './InventoryCellRenderer';
import { InventoryFiltersType } from './InventoryFiltersPopover';
import PageSnackbar from 'src/components/PageSnackbar';
import Search from './Search';

const columns: TableColumnType[] = [
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
];

interface InventoryTableProps {
  organization: ServerOrganization;
  results: SearchResponseElement[];
  temporalSearchValue: string;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
}

export default function InventoryTable(props: InventoryTableProps): JSX.Element {
  const { organization, results, setTemporalSearchValue, temporalSearchValue, filters, setFilters } = props;

  return (
    <>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Search
        organization={organization}
        searchValue={temporalSearchValue}
        onSearch={(val) => setTemporalSearchValue(val)}
        filters={filters}
        setFilters={setFilters}
      />
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
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </>
  );
}
