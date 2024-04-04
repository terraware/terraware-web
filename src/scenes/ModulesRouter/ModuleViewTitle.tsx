import React from 'react';

import { Box, Typography } from '@mui/material';

import { Module } from 'src/types/Module';

type ModulePageTitleProps = {
  module: Module | undefined;
};

const ModuleViewTitle = ({ module }: ModulePageTitleProps) => {
  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap' marginY='24px' width='100%'>
      <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} paddingRight='24px' whiteSpace='nowrap'>
        {module ? 'AND_Climate Action Network-Andromeda' : ''}
      </Typography>

      <Box alignItems='center' display='flex' flexDirection='row'>
        <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600} paddingRight='8px'>
          {module?.name ? module.name : ''}
        </Typography>

        <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'}>
          {module?.dateRange ? module.dateRange : ''}
        </Typography>
      </Box>
    </Box>
  );
};

export default ModuleViewTitle;
