import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import { ProjectFieldProps, renderFieldValue } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldDisplay = ({ label, md, rightBorder, value, tooltip, height, units }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper md={md} rightBorder={rightBorder} height={height || '100px'}>
      <Box paddingX={theme.spacing(2)}>
        <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={600} marginBottom={theme.spacing(1)}>
          {label}
          {tooltip && (
            <Tooltip title={tooltip} placement='top'>
              <Icon
                style={{ marginLeft: theme.spacing(1) }}
                name='info'
                size='small'
                fillColor={theme.palette.TwClrIcn}
              />
            </Tooltip>
          )}
        </Typography>
        {value !== false ? renderFieldValue(value, units) : null}
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldDisplay;
