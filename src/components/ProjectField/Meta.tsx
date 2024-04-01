import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';

import FluidEntryWrapper from './FluidEntryWrapper';

interface ProjectFieldMetaProps {
  date?: string;
  dateLabel: string;
  userId?: number;
  userName?: string;
  userLabel: string;
}

const ProjectFieldMeta = ({ date, dateLabel, userId, userName, userLabel }: ProjectFieldMetaProps) => {
  const theme = useTheme();

  return (
    <FluidEntryWrapper>
      <Grid container alignContent={'center'} height={'100px'} paddingX={theme.spacing(2)}>
        <Grid item xs={12}>
          <Box>
            <Typography
              fontSize={'16px'}
              lineHeight={'24px'}
              marginBottom={theme.spacing(1)}
              component={'span'}
              marginRight={theme.spacing(0.5)}
            >
              {dateLabel}
            </Typography>
            <Typography
              fontSize={'16px'}
              lineHeight={'24px'}
              fontWeight={600}
              marginBottom={theme.spacing(1)}
              component={'span'}
            >
              {getDateDisplayValue(date || '')}
            </Typography>
          </Box>
          <Box>
            <Typography
              fontSize={'16px'}
              lineHeight={'24px'}
              fontWeight={400}
              marginBottom={theme.spacing(1)}
              component={'span'}
              marginRight={theme.spacing(0.5)}
            >
              {userLabel}
            </Typography>
            {/* // TODO this will depend on what the BE returns, if we get a user object we can
            // do name and ID here but if they are spread into the project entity the structure
            // will be different */}
            <Link
              to={APP_PATHS.PEOPLE_VIEW.replace(':userId', `${userId}`)}
              fontSize={'16px'}
              fontWeight={400}
              lineHeight={'24px'}
            >
              {userName}
            </Link>
          </Box>
        </Grid>
      </Grid>
    </FluidEntryWrapper>
  );
};

export default ProjectFieldMeta;
