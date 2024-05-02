import React from 'react';

import { Box } from '@mui/material';

import { selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppSelector } from 'src/redux/store';

import ModuleEntry from './ModuleEntry';
import { useModuleData } from './Provider/Context';

export default function ListModulesContent(): JSX.Element {
  const { projectId } = useModuleData();

  const modules = useAppSelector(selectProjectModuleList(projectId));

  return (
    <Box>
      {modules?.map((module, index) => <ModuleEntry index={index} key={index} module={module} projectId={projectId} />)}
    </Box>
  );
}
