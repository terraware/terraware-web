import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';

import DeliverablesTable from 'src/components/DeliverablesTable';
import PageHeader from 'src/components/PageHeader';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import TfMain from 'src/components/common/TfMain';
import { useLocalization, useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
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

const DeliverablesList = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { participantProjects, currentParticipantProject, moduleProjects, setCurrentParticipantProject } =
    useParticipantData();
  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({
    projectId: currentParticipantProject?.id || '',
  });

  useEffect(() => {
    if (projectFilter.projectId) {
      setCurrentParticipantProject(projectFilter.projectId);
    }
  }, [projectFilter]);

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
    [projectFilter.projectId]
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

  const statusOrder = {
    Rejected: 1,
    'Not Submitted': 2,
    'In Review': 3,
    'Needs Translation': 3,
    Approved: 4,
    'Not Needed': 5,
    Completed: 5,
  };

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
      const firstSort = genericSearchAndSort(results, modifiedSearch, sortOrderConfig);
      if (sortOrderConfig?.sortOrder.field === 'status') {
        const direction = sortOrderConfig?.sortOrder.direction;
        return firstSort.sort((a, b) => {
          if (a.status !== b.status) {
            if (direction === 'Descending') {
              return statusOrder[b.status] - statusOrder[a.status];
            } else {
              return statusOrder[a.status] - statusOrder[b.status];
            }
          } else {
            // if the have same status sort by due date
            if ((a.dueDate || 0) < (b.dueDate || 0)) {
              return -1;
            } else if ((a.dueDate || 0) > (b.dueDate || 0)) {
              return 1;
            }
            return 0;
          }
        });
      } else {
        return firstSort;
      }
    },
    []
  );

  const PageHeaderLeftComponent = useMemo(
    () =>
      activeLocale ? (
        <>
          <Grid container sx={{ marginTop: theme.spacing(0.5), alignItems: 'center' }}>
            <Grid item>
              <Separator height={'40px'} />
            </Grid>
            {moduleProjects?.length > 0 && (
              <Grid item>
                {moduleProjects?.length > 1 ? (
                  <Box display='flex'>
                    <Typography sx={{ lineHeight: '40px', marginRight: theme.spacing(1.5) }} component={'span'}>
                      {strings.PROJECT}
                    </Typography>
                    <ProjectsDropdown
                      allowUnselect
                      availableProjects={moduleProjects}
                      label={''}
                      record={projectFilter}
                      setRecord={setProjectFilter}
                      unselectLabel={strings.ALL}
                    />
                  </Box>
                ) : (
                  <Typography>{moduleProjects[0].name}</Typography>
                )}
              </Grid>
            )}
          </Grid>
        </>
      ) : null,
    [activeLocale, participantProjects, currentParticipantProject, projectFilter]
  );

  return (
    <TfMain>
      <PageHeaderWrapper>
        <PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />
      </PageHeaderWrapper>

      <DeliverablesTable
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
