import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useCallback, useEffect, useRef, useState } from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TfMain from '../common/TfMain';
import { makeStyles } from '@mui/styles';
import { Table, TableColumnType } from '@terraware/web-components';
import { listNurseryWithdrawals } from 'src/api/tracking/withdrawals';
import { FieldNodePayload, SearchResponseElement } from 'src/api/search';
import WithdrawalLogRenderer from './WithdrawalLogRenderer';
import { APP_PATHS } from 'src/constants';
import { useHistory } from 'react-router-dom';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import NurseryWithdrawalsFiltersPopover from './NurseryWithdrawalsFiltersPopover';
import Pill from '../Pill';
import { getAllNurseries } from 'src/utils/organization';

export type NurseryWithdrawalsFiltersType = {
  fromNurseryIds?: string[];
  purposes?: string[];
};

type NurseryWithdrawalsProps = {
  organization: ServerOrganization;
};

const useStyles = makeStyles((theme: Theme) => ({
  searchField: {
    width: '300px',
  },
}));

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

export default function NurseryWithdrawals(props: NurseryWithdrawalsProps): JSX.Element {
  const { organization } = props;
  const theme = useTheme();
  const contentRef = useRef(null);
  const classes = useStyles();
  const [nurseryWithdrawals, setNurseryWithdrawals] = useState<SearchResponseElement[]>();

  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const history = useHistory();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [filters, setFilters] = useForm<NurseryWithdrawalsFiltersType>({});

  useEffect(() => {
    const getNurseryWithdrawals = async () => {
      if (organization) {
        const withdrawals = await listNurseryWithdrawals(organization.id, []);
        if (withdrawals) {
          setNurseryWithdrawals(withdrawals);
        }
      }
    };

    getNurseryWithdrawals();
  }, [organization]);

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

    let nurseryFilter: FieldNodePayload;
    if (filters.fromNurseryIds && filters.fromNurseryIds.length > 0) {
      nurseryFilter = {
        operation: 'field',
        field: 'facility_id',
        type: 'Exact',
        values: filters.fromNurseryIds.map((id) => id.toString()),
      };
    }

    if (filters.purposes && filters.purposes.length > 0) {
      nurseryFilter = {
        operation: 'field',
        field: 'purpose',
        type: 'Exact',
        values: filters.purposes,
      };
    }

    if (searchValueChildren.length) {
      const searchValueNodes: FieldNodePayload = {
        operation: 'or',
        children: searchValueChildren,
      };

      if (nurseryFilter) {
        finalSearchValueChildren.push({
          operation: 'and',
          children: [nurseryFilter, searchValueNodes],
        });
      } else {
        finalSearchValueChildren.push(searchValueNodes);
      }
    } else if (nurseryFilter) {
      finalSearchValueChildren.push(nurseryFilter);
    }

    return finalSearchValueChildren;
  }, [filters, debouncedSearchTerm]);

  const onApplyFilters = useCallback(async () => {
    const searchChildren: FieldNodePayload[] = getSearchChildren();
    const requestId = Math.random().toString();
    setRequestId('searchWithdrawals', requestId);
    const apiSearchResults = await listNurseryWithdrawals(organization.id, searchChildren);
    if (apiSearchResults) {
      if (getRequestId('searchWithdrawals') === requestId) {
        setSearchResults(apiSearchResults);
      }
    }
  }, [getSearchChildren, organization.id]);

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
    const found = getAllNurseries(organization).find((n) => n.id.toString() === facilityId.toString());
    if (found) {
      return found.name;
    }
    return '';
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
            <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px' }}>
              <TextField
                placeholder={strings.SEARCH}
                iconLeft='search'
                label=''
                id='search'
                type='text'
                className={classes.searchField}
                iconRight='cancel'
                value={searchValue}
                onChange={(_id, value) => setSearchValue(value as string)}
              />
              <NurseryWithdrawalsFiltersPopover filters={filters} setFilters={setFilters} organization={organization} />
              <Grid xs={12} display='flex'>
                {(Object.keys(filters) as (keyof typeof filters)[]).map(
                  (filter: keyof NurseryWithdrawalsFiltersType) => {
                    return filters[filter]?.map((value) => {
                      return (
                        <Pill
                          key={value}
                          filter={filter}
                          value={filter === 'fromNurseryIds' ? getNurseryName(value) : value}
                          onRemoveFilter={() => removeFilter(filter, value)}
                        />
                      );
                    });
                  }
                )}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Table
                id='withdrawal-log'
                columns={columns}
                rows={searchResults || nurseryWithdrawals || []}
                Renderer={WithdrawalLogRenderer}
                orderBy={'name'}
                onSelect={onWithdrawalClicked}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </TfMain>
  );
}
