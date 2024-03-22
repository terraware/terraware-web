import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import strings from 'src/strings';

import { ProjectFieldProps, renderFieldValue } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldDisplay = ({ label, link, rightBorder, value }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper rightBorder={rightBorder}>
      <Box paddingX={theme.spacing(2)}>
        <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={600} marginBottom={theme.spacing(1)}>
          {label}
        </Typography>
        {renderFieldValue(value)}
        {link && (
          <Box marginTop={theme.spacing(1)}>
            <Link to={link} fontSize={'16px'} fontWeight={400} lineHeight={'24px'}>
              {strings.SEE_SHAPE_FILE}
            </Link>
          </Box>
        )}
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldDisplay;
