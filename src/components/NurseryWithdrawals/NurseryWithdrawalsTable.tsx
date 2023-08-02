import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Grid, Popover, Theme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { makeStyles } from '@mui/styles';
import { SortOrder, Tooltip } from '@terraware/web-components';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { NurseryWithdrawalService } from 'src/services';
import { FieldNodePayload, FieldOptionsMap, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import WithdrawalLogRenderer from './WithdrawalLogRenderer';
import useDebounce from 'src/utils/useDebounce';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { useLocalization, useOrganization } from 'src/providers';
import { Button, PillList } from '@terraware/web-components';
import Table from 'src/components/common/table';
import { TableColumnType } from '@terraware/web-components/components/table/types';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import { PlantingSite } from 'src/types/Tracking';

const useStyles = makeStyles((theme: Theme) => ({
  searchField: {
    width: '300px',
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      border: `1px solid ${theme.palette.TwClrBaseGray300}`,
      borderRadius: '8px',
      overflow: 'visible',
      width: '480px',
    },
  },
}));

const columns = (): TableColumnType[] => [
  { key: 'withdrawnDate', name: strings.DATE, type: 'string' },
  { key: 'purpose', name: strings.PURPOSE, type: 'string' },
  { key: 'facility_name', name: strings.FROM_NURSERY, type: 'string' },
  { key: 'destinationName', name: strings.DESTINATION, type: 'string' },
  { key: 'plantingSubzoneNames', name: strings.TO_SUBZONE, type: 'string' },
  { key: 'speciesScientificNames', name: strings.SPECIES, type: 'string' },
  { key: 'totalWithdrawn', name: strings.TOTAL_QUANTITY, type: 'number' },
  { key: 'hasReassignments', name: '', type: 'string' },
];

type NurseryWithdrawalsTableProps = {
  selectedPlantingSite?: PlantingSite;
};

export default function NurseryWithdrawalsTable({ selectedPlantingSite }: NurseryWithdrawalsTableProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();
  const classes = useStyles();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const subzoneParam = query.get('subzoneName');
  const siteParam = query.get('siteName');
  const trackingV2 = isEnabled('TrackingV2');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'withdrawnDate',
    direction: 'Descending',
  } as SearchSortOrder);

  const filterColumns = useMemo<FilterField[]>(() => {
    const destination: FilterField[] = trackingV2
      ? []
      : [{ name: 'destinationName', label: strings.DESTINATION, type: 'multiple_selection' }];

    return activeLocale
      ? [
          { name: 'purpose', label: strings.PURPOSE, type: 'multiple_selection' },
          { name: 'facility_name', label: strings.FROM_NURSERY, type: 'multiple_selection' },
          ...destination,
          { name: 'plantingSubzoneNames', label: strings.SUBZONE, type: 'multiple_selection' },
          {
            name: 'batchWithdrawals.batch_species_scientificName',
            label: strings.SPECIES,
            type: 'multiple_selection',
          },
          { name: 'withdrawnDate', label: strings.WITHDRAWN_DATE, type: 'date_range' },
        ]
      : [];
  }, [activeLocale, trackingV2]);

  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});

  useEffect(() => {
    const getApiSearchResults = async () => {
      setFilterOptions(
        await NurseryWithdrawalService.getFilterOptions(
          selectedOrganization.id,
          selectedPlantingSite?.id && selectedPlantingSite.id !== -1 ? selectedPlantingSite?.name : undefined
        )
      );
    };
    getApiSearchResults();
  }, [selectedOrganization.id, selectedPlantingSite?.id, selectedPlantingSite?.name]);

  const filterPillData = useMemo(
    () =>
      Object.keys(filters).map((key) => {
        const removeFilter = (k: string) => {
          const result = { ...filters };
          delete result[k];
          setFilters(result);
        };

        return {
          id: key,
          label: filterColumns.find((f) => key === f.name)?.label ?? '',
          value: filters[key].values.join(', '),
          onRemove: () => removeFilter(key),
        };
      }),
    [filters, filterColumns]
  );

  const onWithdrawalClicked = (withdrawal: any) => {
    history.push({
      pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', withdrawal.delivery_id),
    });
  };

  const getSearchChildren = useCallback(() => {
    const filterValueChildren: FieldNodePayload[] = [...Object.values(filters)];
    const finalSearchValueChildren: FieldNodePayload[] = [];
    const searchValueChildren: FieldNodePayload[] = [];

    if (debouncedSearchTerm) {
      const fromNurseryNode: FieldNodePayload = {
        operation: 'field',
        field: 'facility_name',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(fromNurseryNode);

      const speciesNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'batchWithdrawals.batch_species_scientificName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(speciesNameNode);

      if (!selectedPlantingSite) {
        const destinationNurseryNode: FieldNodePayload = {
          operation: 'field',
          field: 'destinationName',
          type: 'Fuzzy',
          values: [debouncedSearchTerm],
        };
        searchValueChildren.push(destinationNurseryNode);
      }
    }

    if (selectedPlantingSite && selectedPlantingSite.id !== -1) {
      const destinationSiteNode: FieldNodePayload = {
        operation: 'field',
        field: 'destinationName',
        type: 'Exact',
        values: [selectedPlantingSite.name],
      };
      filterValueChildren.push(destinationSiteNode);
    }

    if (searchValueChildren.length) {
      const searchValueNodes: FieldNodePayload = {
        operation: 'or',
        children: searchValueChildren,
      };

      if (filterValueChildren.length) {
        const filterValueNodes: FieldNodePayload = {
          operation: 'and',
          children: filterValueChildren,
        };

        finalSearchValueChildren.push({
          operation: 'and',
          children: [filterValueNodes, searchValueNodes],
        });
      } else {
        finalSearchValueChildren.push(searchValueNodes);
      }
    } else if (filterValueChildren.length) {
      const filterValueNodes: FieldNodePayload = {
        operation: 'and',
        children: filterValueChildren,
      };
      finalSearchValueChildren.push(filterValueNodes);
    }
    return finalSearchValueChildren;
  }, [filters, debouncedSearchTerm, selectedPlantingSite]);

  const onApplyFilters = useCallback(async () => {
    const searchChildren: FieldNodePayload[] = getSearchChildren();
    const requestId = Math.random().toString();
    setRequestId('searchWithdrawals', requestId);
    const apiSearchResults = await NurseryWithdrawalService.listNurseryWithdrawals(
      selectedOrganization.id,
      searchChildren,
      searchSortOrder
    );
    if (apiSearchResults) {
      if (getRequestId('searchWithdrawals') === requestId) {
        if (selectedPlantingSite?.name) {
          // Workaround to get Exact matches on destination name
          setSearchResults(apiSearchResults.filter((result) => result.destinationName === selectedPlantingSite.name));
        } else {
          setSearchResults(apiSearchResults);
        }
      }
    }
  }, [getSearchChildren, selectedOrganization, searchSortOrder, selectedPlantingSite?.name]);

  useEffect(() => {
    if (siteParam) {
      query.delete('siteName');
      history.replace(getLocation(location.pathname, location, query.toString()));
      setFilters((curr) => ({
        ...curr,
        destinationName: {
          field: 'destinationName',
          operation: 'field',
          type: 'Exact',
          values: [siteParam],
        },
      }));
    }
  }, [siteParam, query, history, location]);

  useEffect(() => {
    if (subzoneParam) {
      query.delete('subzoneName');
      history.replace(getLocation(location.pathname, location, query.toString()));
      setFilters((curr) => ({
        ...curr,
        plantingSubzoneNames: {
          field: 'plantingSubzoneNames',
          operation: 'field',
          type: 'Exact',
          values: [subzoneParam],
        },
      }));
    }
  }, [subzoneParam, query, history, location]);

  useEffect(() => {
    onApplyFilters();
  }, [filters, onApplyFilters]);

  const onSortChange = (order: SortOrder, orderBy: string) => {
    const orderByStr = orderBy === 'speciesScientificNames' ? 'batchWithdrawals.batch_species_scientificName' : orderBy;
    setSearchSortOrder({
      field: orderByStr as string,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  return (
    <Grid container>
      <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
        <TextField
          placeholder={strings.SEARCH}
          iconLeft='search'
          label=''
          id='search'
          type='text'
          className={classes.searchField}
          iconRight='cancel'
          value={searchValue}
          onChange={(value) => setSearchValue(value as string)}
        />
        <Tooltip title={strings.FILTER}>
          <Button
            id='filterNurseryWithdrawal'
            onClick={(event) => event && handleFilterClick(event)}
            type='passive'
            priority='ghost'
            icon='filter'
          />
        </Tooltip>
        <Popover
          id='simple-popover'
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
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
            initialFilters={filters}
            fields={filterColumns}
            values={filterOptions || {}}
            onConfirm={(fs) => {
              handleFilterClose();
              setFilters(fs);
            }}
            onCancel={handleFilterClose}
          />
        </Popover>
      </Grid>
      <Grid xs={12} display='flex'>
        <PillList data={filterPillData} />
      </Grid>

      <Grid item xs={12}>
        <Table
          id='withdrawal-log'
          columns={columns}
          rows={searchResults || []}
          Renderer={WithdrawalLogRenderer}
          orderBy={searchSortOrder.field}
          order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
          isPresorted={searchSortOrder.field !== 'batchWithdrawals.batch_species_scientificName'}
          onSelect={onWithdrawalClicked}
          controlledOnSelect={true}
          sortHandler={onSortChange}
          isClickable={() => false}
        />
      </Grid>
    </Grid>
  );
}
