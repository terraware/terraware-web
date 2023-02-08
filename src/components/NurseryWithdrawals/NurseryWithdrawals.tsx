import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useCallback, useEffect, useRef, useState } from 'react';
import strings from 'src/strings';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { makeStyles } from '@mui/styles';
import { SortOrder, TableColumnType } from '@terraware/web-components';
import { NurseryWithdrawalService } from 'src/services';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/api/search';
import WithdrawalLogRenderer from './WithdrawalLogRenderer';
import { APP_PATHS } from 'src/constants';
import { useHistory } from 'react-router-dom';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import NurseryWithdrawalsFiltersPopover from './NurseryWithdrawalsFiltersPopover';
import { getAllNurseries } from 'src/utils/organization';
import { getAllSpecies } from 'src/api/species/species';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';
import { useOrganization } from 'src/providers/hooks';
import { PillList } from '@terraware/web-components';
import Table from 'src/components/common/table';

export type NurseryWithdrawalsFiltersType = {
  fromNurseryIds?: string[];
  purposes?: string[];
  destinationNames?: string[];
  speciesId?: string[];
  withdrawnDates?: string[];
};

const useStyles = makeStyles((theme: Theme) => ({
  searchField: {
    width: '300px',
  },
}));

export default function NurseryWithdrawals(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const contentRef = useRef(null);
  const classes = useStyles();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const history = useHistory();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [filters, setFilters] = useForm<NurseryWithdrawalsFiltersType>({});
  const [species, setSpecies] = useState<Species[]>();
  const snackbar = useSnackbar();
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'withdrawnDate',
    direction: 'Descending',
  } as SearchSortOrder);
  const columns: TableColumnType[] = [
    { key: 'withdrawnDate', name: strings.DATE, type: 'string' },
    { key: 'purpose', name: strings.PURPOSE, type: 'string' },
    { key: 'facility_name', name: strings.FROM_NURSERY, type: 'string' },
    { key: 'destinationName', name: strings.DESTINATION, type: 'string' },
    { key: 'plotNames', name: strings.TO_PLOT, type: 'string' },
    { key: 'speciesScientificNames', name: strings.SPECIES, type: 'string' },
    { key: 'totalWithdrawn', name: strings.TOTAL_QUANTITY, type: 'string' },
    { key: 'hasReassignments', name: '', type: 'string' },
  ];

  const onWithdrawalClicked = (withdrawal: any) => {
    history.push({
      pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', withdrawal.delivery_id),
    });
  };

  useEffect(() => {
    const populateSpecies = async () => {
      const result = await getAllSpecies(selectedOrganization.id);
      if (result.requestSucceeded) {
        setSpecies(result.species);
      } else {
        snackbar.toastError(strings.SPECIES_ERROR_SEARCH);
      }
    };
    populateSpecies();
  }, [selectedOrganization, snackbar]);

  const getSearchChildren = useCallback(() => {
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

      const destinationNurseryNode: FieldNodePayload = {
        operation: 'field',
        field: 'destinationName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(destinationNurseryNode);

      const speciesNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'batchWithdrawals.batch_species_scientificName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(speciesNameNode);
    }

    const filterValueChildren: FieldNodePayload[] = [];
    if (filters.fromNurseryIds && filters.fromNurseryIds.length > 0) {
      filterValueChildren.push({
        operation: 'field',
        field: 'facility_id',
        type: 'Exact',
        values: filters.fromNurseryIds.map((id) => id.toString()),
      });
    }

    if (filters.purposes && filters.purposes.length > 0) {
      filterValueChildren.push({
        operation: 'field',
        field: 'purpose',
        type: 'Exact',
        values: filters.purposes,
      });
    }

    if (filters.destinationNames && filters.destinationNames.length > 0) {
      filterValueChildren.push({
        operation: 'field',
        field: 'destinationName',
        type: 'Exact',
        values: filters.destinationNames,
      });
    }

    if (filters.speciesId && filters.speciesId.length > 0) {
      filterValueChildren.push({
        operation: 'field',
        field: 'batchWithdrawals.batch_species_id',
        type: 'Exact',
        values: filters.speciesId,
      });
    }

    if (filters.withdrawnDates && filters.withdrawnDates.length > 0) {
      filterValueChildren.push({
        operation: 'field',
        field: 'withdrawnDate',
        type: 'Range',
        values: filters.withdrawnDates,
      });
    }

    if (searchValueChildren.length) {
      const searchValueNodes: FieldNodePayload = {
        operation: 'or',
        children: searchValueChildren,
      };

      if (filterValueChildren.length) {
        const filterValueNodes: FieldNodePayload = {
          operation: 'or',
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
        operation: 'or',
        children: filterValueChildren,
      };
      finalSearchValueChildren.push(filterValueNodes);
    }

    return finalSearchValueChildren;
  }, [filters, debouncedSearchTerm]);

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
        setSearchResults(apiSearchResults);
      }
    }
  }, [getSearchChildren, selectedOrganization, searchSortOrder]);

  useEffect(() => {
    onApplyFilters();
  }, [filters, onApplyFilters]);

  const removeFilter = (filter: keyof NurseryWithdrawalsFiltersType, value: string) => {
    setFilters((prev) => {
      const oldValue = prev[filter];
      return {
        ...prev,
        [filter]: oldValue?.filter((val) => val !== value) || [],
      };
    });
  };

  const getNurseryName = (facilityId: string) => {
    const found = getAllNurseries(selectedOrganization).find((n) => n.id.toString() === facilityId.toString());
    if (found) {
      return found.name;
    }
    return '';
  };

  const geSpeciesScientificName = (speciesId: string) => {
    const selectedSpecies = species?.find((iSpecies) => iSpecies.id.toString() === speciesId);
    return selectedSpecies?.scientificName || '';
  };

  const getValueForPill = (filter: keyof NurseryWithdrawalsFiltersType, value: string) => {
    switch (filter) {
      case 'fromNurseryIds': {
        return getNurseryName(value);
      }
      case 'speciesId': {
        return geSpeciesScientificName(value);
      }
      default: {
        return value;
      }
    }
  };

  const getFilterName = (filter: keyof NurseryWithdrawalsFiltersType) => {
    switch (filter) {
      case 'fromNurseryIds': {
        return strings.FROM_NURSERY;
      }
      case 'speciesId': {
        return strings.SPECIES;
      }
      case 'destinationNames': {
        return strings.DESTINATION;
      }
      case 'purposes': {
        return strings.PURPOSE;
      }
      case 'withdrawnDates': {
        return strings.WITHDRAWN_DATE;
      }
      default: {
        return filter;
      }
    }
  };

  const filterPillData = (Object.keys(filters) as (keyof typeof filters)[]).flatMap(
    (filter: keyof NurseryWithdrawalsFiltersType) => {
      return (
        filters[filter]?.map((value) => {
          return {
            id: value,
            label: getFilterName(filter),
            value: getValueForPill(filter, value),
            onRemove: () => removeFilter(filter, value),
          };
        }) || []
      );
    }
  );

  const onSortChange = (order: SortOrder, orderBy: string) => {
    setSearchSortOrder({
      field: orderBy as string,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  return (
    <TfMain>
      <Box sx={{ paddingLeft: theme.spacing(3) }}>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <PageHeaderWrapper nextElement={contentRef.current}>
            <Grid container spacing={3} sx={{ paddingLeft: theme.spacing(3), paddingBottom: theme.spacing(4) }}>
              <Grid item xs={8}>
                <Typography sx={{ marginTop: 0, marginBottom: 0, fontSize: '24px', fontWeight: 600 }}>
                  {strings.WITHDRAWAL_LOG}
                </Typography>
              </Grid>
            </Grid>
          </PageHeaderWrapper>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
          <Grid
            container
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              padding: theme.spacing(3),
              borderRadius: '32px',
              minWidth: 'fit-content',
            }}
            ref={contentRef}
          >
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
              <NurseryWithdrawalsFiltersPopover filters={filters} setFilters={setFilters} species={species} />
            </Grid>
            <Grid xs={12} display='flex' sx={{ marginBottom: 2 }}>
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
                onSelect={onWithdrawalClicked}
                controlledOnSelect={true}
                sortHandler={onSortChange}
                isClickable={() => false}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </TfMain>
  );
}
