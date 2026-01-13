import React, { useMemo, useRef, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';

import CohortsDropdown from 'src/components/CohortsDropdown';
import DeliverablesTable from 'src/components/DeliverablesTable';
import PageHeader from 'src/components/PageHeader';
import { FilterField } from 'src/components/common/FilterGroup';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useCohorts } from 'src/hooks/useCohorts';
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
  const { availableCohorts } = useCohorts();
  const contentRef = useRef(null);

  const [cohortFilter, setCohortFilter] = useState<{ id?: number }>({ id: undefined });

  const availableProjects = useMemo(() => availableProjectOptions || [], [availableProjectOptions]);

  const extraTableFilters: SearchNodePayload[] = useMemo(
    () =>
      cohortFilter.id
        ? [
            {
              operation: 'field',
              field: 'cohortId',
              type: 'Exact',
              values: [`${cohortFilter.id}`],
            },
          ]
        : [],
    [cohortFilter]
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
                {strings.COHORT}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: theme.spacing(1.5) }}>
              <CohortsDropdown
                allowUnselect
                availableCohorts={availableCohorts}
                record={cohortFilter}
                setRecord={setCohortFilter}
                label={''}
                unselectLabel={strings.ALL}
              />
            </Grid>
          </Grid>
        </>
      ) : null,
    [activeLocale, availableCohorts, cohortFilter]
  );

  const iconFilters: FilterConfig[] = useMemo(() => {
    const _filters = [
      {
        field: 'projectId',
        label: strings.PROJECT,
        type: 'multiple_selection' as FilterField['type'],
        options: availableProjects?.map((p) => p.id),
        pillValueRenderer: (values: (string | number | null)[]) =>
          values
            ?.map((value) => availableProjects.find((p) => p.id.toString() === value?.toString())?.name || '')
            .join(', '),
        renderOption: (value: string | number) => {
          return availableProjects.find((p) => p.id.toString() === value.toString())?.name || '';
        },
      },
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
  }, [activeLocale, availableProjects]);

  return (
    <AcceleratorMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />
      </PageHeaderWrapper>

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
