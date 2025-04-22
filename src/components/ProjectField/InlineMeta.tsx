import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';

import FluidEntryWrapper from './FluidEntryWrapper';

interface ProjectFieldInlineMetaProps {
  date?: string;
  dateLabel?: string;
  userId?: number;
  userName?: string;
  userLabel: string;
  fontSize?: string;
  lineHeight?: string;
  fontWeight?: number;
}

const ProjectFieldInlineMeta = ({
  date,
  dateLabel,
  userId,
  userName,
  userLabel,
  fontSize,
  lineHeight,
  fontWeight,
}: ProjectFieldInlineMetaProps) => {
  const theme = useTheme();

  return (
    <FluidEntryWrapper>
      <Grid container alignContent={'center'} paddingX={theme.spacing(2)}>
        <Grid item xs={12}>
          <Box>
            {dateLabel && (
              <Typography
                fontSize={fontSize || '14px'}
                lineHeight={lineHeight || '20px'}
                marginBottom={theme.spacing(1)}
                component={'span'}
                marginRight={theme.spacing(0.5)}
              >
                {dateLabel}
              </Typography>
            )}
            <Typography
              fontSize={fontSize || '14px'}
              lineHeight={lineHeight || '20px'}
              marginBottom={theme.spacing(1)}
              component={'span'}
            >
              {date ? getDateDisplayValue(date) : ''}
            </Typography>
            &nbsp;
            <Typography
              fontSize={fontSize || '14px'}
              lineHeight={lineHeight || '20px'}
              fontWeight={fontWeight || 400}
              marginBottom={theme.spacing(1)}
              component={'span'}
              marginRight={theme.spacing(0.5)}
            >
              {userLabel}
            </Typography>
            {userName ? (
              <Link
                to={APP_PATHS.PEOPLE_VIEW.replace(':personId', `${userId}`)}
                fontSize={fontSize || '14px'}
                fontWeight={fontWeight || 400}
                lineHeight={lineHeight || '20px'}
              >
                {userName}
              </Link>
            ) : (
              strings.UNASSIGNED
            )}
          </Box>
        </Grid>
      </Grid>
    </FluidEntryWrapper>
  );
};

export default ProjectFieldInlineMeta;
