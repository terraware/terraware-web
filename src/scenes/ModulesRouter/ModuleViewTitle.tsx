import React from 'react';

import { Box, Typography } from '@mui/material';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Module, getModuleNumber } from 'src/types/Module';
import { Project } from 'src/types/Project';
import { getDateRangeString } from 'src/utils/dateFormatter';

type ModulePageTitleProps = {
  module: Module | undefined;
  modules: Module[] | undefined;
  project: Project | undefined;
};

const ModuleViewTitle = ({ module, modules, project }: ModulePageTitleProps) => {
  const { activeLocale } = useLocalization();

  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap' marginY='24px' width='100%'>
      <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} paddingRight='24px' whiteSpace='nowrap'>
        {project?.name ? project?.name : ''}
      </Typography>

      <Box alignItems='center' display='flex' flexDirection='row'>
        <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600} paddingRight='8px'>
          {strings.formatString(strings.MODULE_N, getModuleNumber(module, modules))}
        </Typography>

        {module?.startDate && module?.endDate && activeLocale && (
          <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'}>
            {getDateRangeString(module?.startDate, module?.endDate, activeLocale)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ModuleViewTitle;
