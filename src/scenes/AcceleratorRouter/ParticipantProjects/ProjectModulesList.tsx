import React, { useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components/components/table/types';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import { useLocalization } from 'src/providers';
import { useListProjectModulesQuery } from 'src/queries/generated/projectModules';
import { SearchSortOrder } from 'src/types/Search';

import ProjectModulesCellRenderer from './ProjectModulesCellRenderer';

type ProjectModulesListProps = {
  projectId: number;
};

const defaultSortOrder: SearchSortOrder = {
  field: 'startDate',
  direction: 'Ascending',
};

const fuzzySearchColumns = ['title', 'name', 'id'];

const ProjectModulesList = ({ projectId }: ProjectModulesListProps): JSX.Element => {
  const { strings } = useLocalization();
  const { data, isLoading } = useListProjectModulesQuery(projectId);
  const modules = useMemo(() => data?.modules || [], [data?.modules]);

  const columns: TableColumnType[] = useMemo(() => {
    return [
      { key: 'title', name: strings.NAME, type: 'string' },
      { key: 'name', name: strings.MODULE, type: 'string' },
      { key: 'id', name: strings.MODULE_ID, type: 'string' },
      { key: 'startDate', name: strings.START_DATE, type: 'date' },
      { key: 'endDate', name: strings.END_DATE, type: 'date' },
    ];
  }, [strings]);

  return (
    <ClientSideFilterTable
      id={'projectModulesTable'}
      busy={isLoading}
      defaultSortOrder={defaultSortOrder}
      columns={columns}
      fuzzySearchColumns={fuzzySearchColumns}
      rows={modules}
      title={strings.MODULES}
      Renderer={ProjectModulesCellRenderer}
    />
  );
};

export default ProjectModulesList;
