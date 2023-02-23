import { Box, Grid, IconButton, Popover, Theme, Typography, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import strings from 'src/strings';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { makeStyles } from '@mui/styles';
import { SortOrder } from '@terraware/web-components';
import { NurseryWithdrawalService } from 'src/services';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/api/search';
import WithdrawalLogRenderer from './WithdrawalLogRenderer';
import { APP_PATHS } from 'src/constants';
import { useHistory } from 'react-router-dom';
import useDebounce from 'src/utils/useDebounce';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { useOrganization } from 'src/providers/hooks';
import { PillList } from '@terraware/web-components';
import Table from 'src/components/common/table';
import { TableColumnType } from '@terraware/web-components/components/table/types';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import Icon from 'src/components/common/icon/Icon';
import { FieldOptionsMap } from 'src/services/NurseryWithdrawalService';

const useStyles = makeStyles((theme: Theme) => ({
  searchField: {
    width: '300px',
  },
  iconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    marginLeft: '8px',
    padding: 0,
  },
  icon: {
    fill: theme.palette.TwClrIcnSecondary,
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      border: `1px solid ${theme.palette.TwClrBaseGray300}`,
      borderRadius: '8px',
      overflow: 'visible',
      width: '320px',
    },
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
  const [filters, setFilters] = useState<Record<string, any>>({});

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
  const columns: TableColumnType[] = [
    { key: 'withdrawnDate', name: strings.DATE, type: 'string' },
    { key: 'purpose', name: strings.PURPOSE, type: 'string' },
    { key: 'facility_name', name: strings.FROM_NURSERY, type: 'string' },
    { key: 'destinationName', name: strings.DESTINATION, type: 'string' },
    { key: 'plotNames', name: strings.TO_PLOT, type: 'string' },
    { key: 'speciesScientificNames', name: strings.SPECIES, type: 'string' },
    { key: 'totalWithdrawn', name: strings.TOTAL_QUANTITY, type: 'number' },
    { key: 'hasReassignments', name: '', type: 'string' },
  ];

  const filterColumns = useMemo<FilterField[]>(
    () => [
      { name: 'purpose', label: strings.PURPOSE, type: 'multiple_selection' },
      { name: 'facility_name', label: strings.FROM_NURSERY, type: 'multiple_selection' },
      { name: 'destinationName', label: strings.DESTINATION, type: 'multiple_selection' },
      { name: 'batchWithdrawals.batch_species_scientificName', label: strings.SPECIES, type: 'multiple_selection' },
      { name: 'withdrawnDate', label: strings.WITHDRAWN_DATE, type: 'date_range' },
    ],
    []
  );

  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});

  useEffect(() => {
    const getApiSearchResults = async () => {
      setFilterOptions(await NurseryWithdrawalService.getFilterOptions(selectedOrganization.id));
    };
    getApiSearchResults();
  }, [selectedOrganization]);

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

    const filterValueChildren: FieldNodePayload[] = [...Object.values(filters)];

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

  const onSortChange = (order: SortOrder, orderBy: string) => {
    const orderByStr = orderBy === 'speciesScientificNames' ? 'batchWithdrawals.batch_species_scientificName' : orderBy;
    setSearchSortOrder({
      field: orderByStr as string,
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
              <IconButton onClick={handleFilterClick} size='medium' className={classes.iconContainer}>
                <Icon name='filter' className={classes.icon} size='medium' />
              </IconButton>
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
                isPresorted={searchSortOrder.field !== 'batchWithdrawals.batch_species_scientificName'}
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
