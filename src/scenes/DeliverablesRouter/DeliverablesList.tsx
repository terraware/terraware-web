import React, { useMemo, useRef, useState } from 'react';
import { Separator, TableColumnType } from '@terraware/web-components';
import { Grid, Typography } from '@mui/material';
import strings from 'src/strings';
import theme from 'src/theme';
import { SearchNodePayload } from 'src/types/Search';
import { useLocalization, useOrganization } from 'src/providers';
import { useProjects } from 'src/hooks/useProjects';
import TfMain from 'src/components/common/TfMain';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import PageHeader from 'src/components/PageHeader';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import DeliverablesTable from 'src/components/DeliverablesTable';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.DELIVERABLE_NAME,
          type: 'string',
        },
        {
          key: 'description',
          name: strings.DESCRIPTION,
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

const DeliverablesList = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { availableProjects } = useProjects();
  const { selectedOrganization } = useOrganization();
  const contentRef = useRef(null);

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number }>({ projectId: undefined });

  const extraTableFilters: SearchNodePayload[] = useMemo(
    () =>
      projectFilter.projectId
        ? [
            {
              operation: 'field',
              field: 'project_id',
              type: 'Exact',
              values: [`${projectFilter.projectId}`],
            },
          ]
        : [],
    [projectFilter]
  );

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
      <PageHeaderWrapper nextElement={contentRef.current}>
        <PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />
      </PageHeaderWrapper>

      <DeliverablesTable
        columns={columns}
        extraTableFilters={extraTableFilters}
        pageHeaderRef={contentRef}
        organizationId={selectedOrganization.id}
      />
    </TfMain>
  );
};

export default DeliverablesList;
