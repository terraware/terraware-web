import React, { useMemo, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';

import DeliverablesTable from 'src/components/DeliverablesTable';
import PageHeader from 'src/components/PageHeader';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { FilterField } from 'src/components/common/FilterGroup';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization } from 'src/providers';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import strings from 'src/strings';
import theme from 'src/theme';
import { DeliverableTypes } from 'src/types/Deliverables';
import { SearchNodePayload } from 'src/types/Search';

const DeliverablesList = () => {
  const { activeLocale } = useLocalization();
  const { availableProjects: availableProjectOptions } = useProjects();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number }>({ projectId: undefined });

  const availableProjects = useMemo(() => availableProjectOptions || [], [availableProjectOptions]);

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
                label={''}
                record={projectFilter}
                setRecord={setProjectFilter}
                unselectLabel={strings.ALL}
              />
            </Grid>
          </Grid>
        </>
      ) : null,
    [activeLocale, availableProjects, projectFilter]
  );

  const iconFilters: FilterConfig[] = useMemo(() => {
    const _filters = [
      {
        field: 'type',
        label: strings.TYPE,
        type: 'multiple_selection' as FilterField['type'],
        options: DeliverableTypes,
        pillValueRenderer: (values: (string | number | null)[]) =>
          values?.map((value) => (value === 'Questions' ? 'Questionnaire' : value)).join(', '),
        renderOption: (value: string | number) =>
          value.toString() === 'Questions' ? 'Questionnaire' : value.toString(),
      },
    ];

    return activeLocale ? _filters : [];
  }, [activeLocale]);

  return (
    <AcceleratorMain>
      <PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />

      {/* -1 for "non-organization scoped search" IE admin search */}
      <DeliverablesTable
        extraTableFilters={extraTableFilters}
        isAcceleratorRoute={true}
        organizationId={-1}
        tableId={'acceleratorDeliverablesTable'}
        iconFilters={iconFilters}
      />
    </AcceleratorMain>
  );
};

export default DeliverablesList;
