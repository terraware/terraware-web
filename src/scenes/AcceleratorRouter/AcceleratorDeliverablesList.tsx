import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Separator, SortOrder, TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import theme from 'src/theme';
import { useLocalization } from 'src/providers';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { useProjects } from 'src/hooks/useProjects';
import useDebounce from 'src/utils/useDebounce';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { requestDeliverablesSearch } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { DeliverableCategories, DeliverableStatuses, SearchResponseDeliverable } from 'src/types/Deliverables';
import PageHeader from 'src/components/PageHeader';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
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

const AcceleratorDeliverablesList = () => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  // TODO remake this hook for participants
  const { availableProjects: availableParticipants } = useProjects();
  const contentRef = useRef(null);
  const classes = useStyles();

  // TODO filter deliverables based on selected participant, using the participants instead of projects
  const [participantFilter, setParticipantFilter] = useState<{ projectId?: number }>({ projectId: undefined });

  const [deliverables, setDeliverables] = useState<SearchResponseDeliverable[]>([]);
  const [deliverablesSearchRequestId, setDeliverablesSearchRequestId] = useState('');
  const deliverablesSearchRequest = useAppSelector(selectDeliverablesSearchRequest(deliverablesSearchRequestId));

  // TODO alter deliverable search request when filters change or search value is entered
  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  // Logging this out for now so the build doesn't fail, still needs to be hooked up per previous TODO
  // tslint:disable-next-line:no-console
  console.log(debouncedSearchTerm);
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
              options: DeliverableStatuses,
              label: strings.STATUS,
            },
            {
              field: 'category',
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

  useEffect(() => {
    // -1 for "non-organization scoped search" IE admin search
    const request = dispatch(requestDeliverablesSearch({ organizationId: -1 }));
    setDeliverablesSearchRequestId(request.requestId);
  }, [dispatch]);

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
              {/* Using the projects dropdown as a stand in for now */}
              <ProjectsDropdown
                availableProjects={availableParticipants}
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
              // onReorderEnd={reorderSearchColumns}
            />
          </Grid>
        </Card>
      </Container>
    </AcceleratorMain>
  );
};

export default AcceleratorDeliverablesList;
