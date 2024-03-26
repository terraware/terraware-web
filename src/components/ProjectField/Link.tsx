import React from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';

import { ProjectFieldProps } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldLink = ({ label, rightBorder, value }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper rightBorder={rightBorder}>
      <Grid container alignContent={'center'} height={'100px'} paddingX={theme.spacing(2)}>
        <Grid item xs={12}>
          <Box padding={theme.spacing(2)} textAlign={'center'}>
            <Link fontSize={'16px'} to={`${value}`}>
              {label}
            </Link>
          </Box>
        </Grid>
      </Grid>
    </GridEntryWrapper>
  );
};

export default ProjectFieldLink;
