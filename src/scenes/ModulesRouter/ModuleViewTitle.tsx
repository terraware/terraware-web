import React from 'react';

import { Box, Typography } from '@mui/material';

import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import { ProjectModule } from 'src/types/Module';
import { getDateRangeString } from 'src/utils/dateFormatter';

type ModulePageTitleProps = {
  module: ProjectModule | undefined;
  projectId: number;
};

const ModuleViewTitle = ({ module, projectId }: ModulePageTitleProps) => {
  const project = useAppSelector(selectProject(projectId));

  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap' marginY='24px' width='100%'>
      <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} paddingRight='24px' whiteSpace='nowrap'>
        {project?.name ?? ''}
      </Typography>

      <Box alignItems='center' display='flex' flexDirection='row'>
        {module && (
          <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600} paddingRight='8px'>
            {module.title}
          </Typography>
        )}

        {module?.startDate && module?.endDate && (
          <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'}>
            {getDateRangeString(module?.startDate, module?.endDate)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ModuleViewTitle;
