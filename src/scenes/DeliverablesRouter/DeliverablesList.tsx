import React, { useCallback, useMemo, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { Separator, TableColumnType } from '@terraware/web-components';

import DeliverablesTable from 'src/components/DeliverablesTable';
import PageHeader from 'src/components/PageHeader';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import TfMain from 'src/components/common/TfMain';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers';
import strings from 'src/strings';
import theme from 'src/theme';
import { ListDeliverablesElement } from 'src/types/Deliverables';
import { SearchNodePayload } from 'src/types/Search';
import {
  SearchAndSortFn,
  SearchNodeModifyConfig,
  SearchOrderConfig,
  searchAndSort as genericSearchAndSort,
  modifySearchNode,
} from 'src/utils/searchAndSort';

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
          key: 'numDocuments',
          name: strings.DOCUMENTS,
          type: 'number',
        },
        {
          key: 'category',
          name: strings.CATEGORY,
          type: 'string',
        },
        {
          key: 'projectName',
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

const DeliverablesList = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { availableProjects } = useProjects();
  const { selectedOrganization } = useOrganization();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number }>({ projectId: undefined });

  const extraTableFilters: SearchNodePayload[] = useMemo(
    () =>
      projectFilter.projectId
        ? [
            {
              operation: 'field',
              field: 'projectId',
              type: 'Exact',
              values: [`${projectFilter.projectId}`],
            },
          ]
        : [],
    [projectFilter]
  );

  const filterModifiers = useCallback(
    (filters: FilterConfig[]) =>
      filters.map((filter: FilterConfig) => {
        if (filter.field !== 'status') {
          return filter;
        }

        // In the participant view, "needs translation" needs to be "in review", so we will remove "needs translation" as an option
        return {
          ...filter,
          options: filter.options.filter((option) => option !== 'Needs Translation'),
        };
      }),
    []
  );

  const searchAndSort: SearchAndSortFn<ListDeliverablesElement> = useCallback(
    (results: ListDeliverablesElement[], search?: SearchNodePayload, sortOrderConfig?: SearchOrderConfig) => {
      // In the participant view, "needs translation" needs to be "in review", so we will coerce results with "needs translation"
      // into the filter rules for "in review"
      // We need to find the search node payload that contains the "status" filter and add "needs translation" as a search value
      const modifyStatus: SearchNodeModifyConfig = {
        field: 'status',
        operation: 'APPEND',
        values: ['Needs Translation'],
        condition: (values) => values.includes('In Review'),
      };

      const modifiedSearch = modifySearchNode(modifyStatus, search);
      return genericSearchAndSort(results, modifiedSearch, sortOrderConfig);
    },
    []
  );

  const PageHeaderLeftComponent = useMemo(
    () =>
      activeLocale ? (
        <>
          <Grid container sx={{ marginTop: theme.spacing(0.5) }}>
            <Grid item>
              <Separator height={'40px'} />
            </Grid>
            <Grid item>
              <Typography sx={{ lineHeight: '40px' }} component={'span'}>
                {strings.PROJECT}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: theme.spacing(1.5) }}>
              <ProjectsDropdown
                allowUnselect
                availableProjects={availableProjects}
                record={projectFilter}
                setRecord={setProjectFilter}
                label={''}
              />
            </Grid>
          </Grid>
        </>
      ) : null,
    [activeLocale, availableProjects, projectFilter]
  );

  return (
    <TfMain>
      <PageHeaderWrapper>
        <PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />
      </PageHeaderWrapper>

      <DeliverablesTable
        columns={columns}
        extraTableFilters={extraTableFilters}
        filterModifiers={filterModifiers}
        organizationId={selectedOrganization.id}
        searchAndSort={searchAndSort}
        tableId={'participantDeliverablesTable'}
      />
    </TfMain>
  );
};

export default DeliverablesList;
