import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';

import FluidEntryWrapper from './FluidEntryWrapper';

interface CohortFieldMetaProps {
  date: string;
  dateLabel: string;
  user: string;
  userLabel: string;
}

const CohortFieldMeta = ({ date, dateLabel, user, userLabel }: CohortFieldMetaProps) => {
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
              marginRight={theme.spacing(1)}
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
              {date}
            </Typography>
          </Box>
          <Box>
            <Typography
              fontSize={'16px'}
              lineHeight={'24px'}
              fontWeight={400}
              marginBottom={theme.spacing(1)}
              component={'span'}
              marginRight={theme.spacing(1)}
            >
              {userLabel}
            </Typography>
            {/* // TODO this will depend on what the BE returns, if we get a user object we can
            // do name and ID here but if they are spread into the project entity the structure
            // will be different */}
            <Link to={'https://google.com'} fontSize={'16px'} fontWeight={400} lineHeight={'24px'}>
              {user}
            </Link>
          </Box>
        </Grid>
      </Grid>
    </FluidEntryWrapper>
  );
};

export default CohortFieldMeta;
