import { useEffect, useState } from 'react';
import { Typography, Grid, Box, useTheme } from '@mui/material';
import { Button, Textfield, Table, TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useDebounce from 'src/utils/useDebounce';
import { search, SearchResponseElement } from 'src/api/search';
import BatchesCellRenderer from './BatchesCellRenderer';
import { isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import Pill from 'src/components/Pill';
import InventoryFilters, { InventoryFiltersType } from '../InventoryFiltersPopover';
import { getNurseryName, removeFilter } from '../FilterUtils';

const columns = (editable: boolean): TableColumnType[] => {
  const defaultColumns: TableColumnType[] = [
    { key: 'batchNumber', name: strings.SEEDLING_BATCH, type: 'string' },
    { key: 'germinatingQuantity', name: strings.GERMINATING, type: 'string' },
    { key: 'notReadyQuantity', name: strings.NOT_READY, type: 'string' },
    { key: 'readyQuantity', name: strings.READY, type: 'string' },
    { key: 'totalQuantity', name: strings.TOTAL, type: 'string' },
    { key: 'totalQuantityWithdrawn', name: strings.WITHDRAWN, type: 'string' },
    { key: 'facility_name', name: strings.NURSERY, type: 'string' },
    { key: 'readyByDate', name: strings.EST_READY_DATE, type: 'string' },
    { key: 'addedDate', name: strings.DATE_ADDED, type: 'string' },
  ];

  if (editable) {
    return [...defaultColumns, { key: 'withdraw', name: '', type: 'string' }];
  } else {
    return defaultColumns;
  }
};

interface InventorySeedslingsTableProps {
  speciesId: number;
  organization: ServerOrganization;
  modified: number;
  setModified: (val: number) => void;
}

export default function InventorySeedslingsTable(props: InventorySeedslingsTableProps): JSX.Element {
  const { speciesId, organization, modified, setModified } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const [temporalSearchValue, setTemporalSearchValue] = useState<string>('');
  const [batches, setBatches] = useState<SearchResponseElement[]>([]);
  const [filters, setFilters] = useForm<InventoryFiltersType>({});
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const editable = !isContributor(organization);

  useEffect(() => {
    let activeRequests = true;

    const getSearchFields = () => {
      const fields = [
        {
          operation: 'field',
          field: 'facility_name',
          type: 'Fuzzy',
          values: [debouncedSearchTerm],
        },
      ];

      if (filters.facilityIds && filters.facilityIds.length > 0) {
        fields.push({
          operation: 'field',
          field: 'facility_id',
          type: 'Exact',
          values: filters.facilityIds.map((id) => id.toString()),
        });
      }
      return fields;
    };

    const populateResults = async () => {
      const searchResponse = await search({
        prefix: 'batches',
        search: {
          operation: 'and',
          children: [
            {
              operation: 'field',
              field: 'species_id',
              values: [speciesId.toString()],
            },
            {
              operation: 'and',
              children: getSearchFields(),
            },
          ],
        },
        fields: [
          'id',
          'batchNumber',
          'germinatingQuantity',
          'notReadyQuantity',
          'readyQuantity',
          'totalQuantity',
          'totalQuantityWithdrawn',
          'facility_name',
          'readyByDate',
          'addedDate',
        ],
        sortOrder: [
          {
            field: 'batchNumber',
          },
        ],
        count: 1000,
      });

      if (activeRequests) {
        setBatches(searchResponse || []);
      }
    };

    if (!isNaN(speciesId)) {
      populateResults();
    }

    return () => {
      activeRequests = false;
    };
  }, [debouncedSearchTerm, organization.id, speciesId, filters.facilityIds, modified]);

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  const addBatch = () => {
    // TODO
    reloadData();
    return;
  };

  const reloadData = () => {
    setModified(Date.now());
    return;
  };

  const onSelect = () => {
    // TODO
    return;
  };

  return (
    <Grid item xs={12} sx={{ marginTop: theme.spacing(1) }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
        {editable && (
          <Button
            id='new-batch'
            icon='plus'
            label={isMobile ? '' : strings.ADD_BATCH}
            onClick={addBatch}
            size='medium'
          />
        )}
      </Box>
      <Box marginTop={theme.spacing(3)}>
        <Box display='flex' flexDirection='row'>
          <Box width='300px'>
            <Textfield
              placeholder={strings.SEARCH}
              iconLeft='search'
              label=''
              id='search'
              type='text'
              onChange={onChangeSearch}
              value={temporalSearchValue}
              iconRight='cancel'
              onClickRightIcon={clearSearch}
            />
          </Box>
          <InventoryFilters filters={filters} setFilters={setFilters} organization={organization} />
        </Box>
        <Grid xs={12} display='flex' paddingTop={1}>
          {filters.facilityIds?.map((id) => (
            <Pill
              key={id}
              filter={strings.NURSERY}
              value={getNurseryName(id, organization)}
              onRemoveFilter={() => removeFilter(id, setFilters)}
            />
          ))}
        </Grid>
        <Box marginTop={theme.spacing(2)}>
          <Table
            id='batches-table'
            columns={columns(editable)}
            rows={batches}
            orderBy='batchNumber'
            Renderer={BatchesCellRenderer}
            reloadData={reloadData}
            onSelect={onSelect}
          />
        </Box>
      </Box>
    </Grid>
  );
}
