import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';

import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';

import Link from '../common/Link';

type ActivitiesEmptyStateProps = {
  projectId: number;
};

const ActivitiesEmptyState = ({ projectId }: ActivitiesEmptyStateProps): JSX.Element => {
  const { strings } = useLocalization();

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}
    >
      <img src='/assets/no-activities.png' alt={strings.THIS_PROJECT_HAS_NO_ACTIVITIES} />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingY: '24px' }}>
        <Typography fontSize={'20px'} paddingBottom={'8px'}>
          {strings.THIS_PROJECT_HAS_NO_ACTIVITIES}
        </Typography>
        <Link fontSize='16px' to={APP_PATHS.ACCELERATOR_ACTIVITY_LOG_NEW.replace(':projectId', projectId.toString())}>
          {strings.ADD_YOUR_FIRST_ACTIVITY}
        </Link>
      </Box>
    </Box>
  );
};

export default ActivitiesEmptyState;
