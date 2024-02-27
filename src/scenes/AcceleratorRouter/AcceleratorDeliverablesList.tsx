import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Separator, SortOrder, TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import theme from 'src/theme';
import { useLocalization } from 'src/providers';
import { useParticipants } from 'src/hooks/useParticipants';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useDebounce from 'src/utils/useDebounce';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { requestDeliverablesSearch } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { DeliverableCategories, DeliverableStatuses, SearchResponseDeliverable } from 'src/types/Deliverables';
import PageHeader from 'src/components/PageHeader';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import ParticipantsDropdown from 'src/components/ParticipantsDropdown';
import { BaseTable as Table } from 'src/components/common/table';
import SearchFiltersWrapperV2, { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import DeliverableCellRenderer from './DeliverableCellRenderer';
import AcceleratorMain from './AcceleratorMain';

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.DELIVERABLE_NAME,
          type: 'string',
        },
        {
          key: 'type',
          name: strings.TYPE,
          type: 'string',
        },
        {
          key: 'documentCount',
          name: strings.DOCUMENTS,
          type: 'number',
        },
        {
          key: 'category',
          name: strings.CATEGORY,
          type: 'string',
        },
        {
          key: 'project_name',
          name: strings.PROJECT,
          type: 'string',
        },
        {
          key: 'status',
          name: strings.STATUS,
          type: 'string',
        },
      ]
    : [];

const FUZZY_SEARCH_COLUMNS = ['name', 'project_name'];

const AcceleratorDeliverablesList = () => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { availableParticipants } = useParticipants();
  const contentRef = useRef(null);
  const classes = useStyles();

  const [participantFilter, setParticipantFilter] = useState<{ participantId?: number }>({ participantId: undefined });

  const [deliverables, setDeliverables] = useState<SearchResponseDeliverable[]>([]);
  const [deliverablesSearchRequestId, setDeliverablesSearchRequestId] = useState('');
  const deliverablesSearchRequest = useAppSelector(selectDeliverablesSearchRequest(deliverablesSearchRequestId));

  // TODO alter deliverable search request when filters change or search value is entered
  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'deliverableName',
    direction: 'Ascending',
  } as SearchSortOrder);

  const featuredFilters: FilterConfig[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              field: 'status',
              // These options are strings for now, but may end up as enums when the BE types come through, if that is
              // the case we will need to implement the renderOption and pillValueRenderer to render the desired
              // human readable values
              options: DeliverableStatuses,
              label: strings.STATUS,
            },
            {
              field: 'category',
              // Same note as above
              options: DeliverableCategories,
              label: strings.CATEGORY,
            },
          ]
        : [],
    [activeLocale]
  );

  const onSortChange = (order: SortOrder, orderBy: string) =>
    setSearchSortOrder({
      field: orderBy,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });

  const getSearchPayload = useCallback((): SearchNodePayload => {
    const searchNodeChildren: SearchNodePayload[] = [];

    // Apply search field to search API payload
    if (debouncedSearchTerm) {
      const fuzzySearchValueChildren = FUZZY_SEARCH_COLUMNS.map(
        (field: string): FieldNodePayload => ({
          operation: 'field',
          field,
          type: 'Fuzzy',
          values: [debouncedSearchTerm],
        })
      );

      searchNodeChildren.push({
        operation: 'or',
        children: fuzzySearchValueChildren,
      });
    }

    // Apply filters to search API payload
    if (Object.keys(filters).length > 0) {
      const filterValueChildren = Object.keys(filters)
        .filter((field: string) => (filters[field]?.values || []).length > 0)
        .map((field: string): SearchNodePayload => filters[field]);

      searchNodeChildren.push({
        operation: 'and',
        children: filterValueChildren,
      });
    }

    // Apply participant filter which lives outside the table
    if (participantFilter.participantId) {
      searchNodeChildren.push({
        operation: 'field',
        field: 'participant_id',
        type: 'Exact',
        values: [`${participantFilter.participantId}`],
      });
    }

    return {
      operation: 'and',
      children: searchNodeChildren,
    };
  }, [debouncedSearchTerm, filters, participantFilter.participantId]);

  useEffect(() => {
    const search: SearchNodePayload = getSearchPayload();
    // -1 for "non-organization scoped search" IE admin search
    const request = dispatch(requestDeliverablesSearch({ organizationId: -1, search, searchSortOrder }));
    setDeliverablesSearchRequestId(request.requestId);
  }, [dispatch, getSearchPayload, searchSortOrder]);

  useEffect(() => {
    // TODO do something if the request has an error
    if (deliverablesSearchRequest && deliverablesSearchRequest.data) {
      setDeliverables(deliverablesSearchRequest.data);
    }
  }, [deliverablesSearchRequest]);

  const PageHeaderLeftComponent = useMemo(
    () =>
      activeLocale ? (
        <>
          <Grid container>
            <Grid item>
              <Separator height={'40px'} />
            </Grid>
            <Grid item>
              <Typography sx={{ lineHeight: '40px' }} component={'span'}>
                {strings.PARTICIPANT}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: theme.spacing(1.5) }}>
              <ParticipantsDropdown
                allowUnselect
                availableParticipants={availableParticipants}
                record={participantFilter}
                setRecord={setParticipantFilter}
                label={''}
              />
            </Grid>
          </Grid>
        </>
      ) : null,
    [activeLocale, availableParticipants, participantFilter]
  );

  return (
    <AcceleratorMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />
      </PageHeaderWrapper>
      <Container ref={contentRef} maxWidth={false} className={classes.mainContainer}>
        <Card flushMobile>
          <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
            <SearchFiltersWrapperV2
              search={searchValue}
              onSearch={setSearchValue}
              currentFilters={filters}
              setCurrentFilters={setFilters}
              featuredFilters={featuredFilters}
            />
          </Grid>

          <Grid item xs={12}>
            <Table
              columns={columns(activeLocale)}
              rows={deliverables}
              orderBy={searchSortOrder.field}
              order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
              Renderer={DeliverableCellRenderer}
              sortHandler={onSortChange}
            />
          </Grid>
        </Card>
      </Container>
    </AcceleratorMain>
  );
};

export default AcceleratorDeliverablesList;
