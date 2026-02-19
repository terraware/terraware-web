import React, { useMemo } from 'react';

import DeliverablesTable from 'src/components/DeliverablesTable';
import PageHeader from 'src/components/PageHeader';
import { FilterField } from 'src/components/common/FilterGroup';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import { DeliverableTypes } from 'src/types/Deliverables';

const DeliverablesList = () => {
  const { strings } = useLocalization();

  const iconFilters: FilterConfig[] = useMemo(() => {
    return [
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
  }, [strings]);

  return (
    <AcceleratorMain>
      <PageHeader title={strings.DELIVERABLES} />

      {/* -1 for "non-organization scoped search" IE admin search */}
      <DeliverablesTable
        isAcceleratorRoute={true}
        organizationId={-1}
        tableId={'acceleratorDeliverablesTable'}
        iconFilters={iconFilters}
      />
    </AcceleratorMain>
  );
};

export default DeliverablesList;
