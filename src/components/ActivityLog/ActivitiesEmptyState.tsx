import React, { type JSX, useMemo } from 'react';
import { useLocation } from 'react-router';

import { Box, Typography } from '@mui/material';

import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useFunderPortal from 'src/hooks/useFunderPortal';
import { useLocalization, useOrganization, useUser } from 'src/providers';

import Link from '../common/Link';

type ActivitiesEmptyStateProps = {
  projectId: number;
};

const ActivitiesEmptyState = ({ projectId }: ActivitiesEmptyStateProps): JSX.Element => {
  const { strings } = useLocalization();
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isFunderRoute } = useFunderPortal();
  const location = useLocation();

  const organization = useMemo(
    () => (isAcceleratorRoute ? undefined : selectedOrganization),
    [isAcceleratorRoute, selectedOrganization]
  );

  const canCreateActivities = !isFunderRoute && isAllowed('CREATE_ACTIVITIES', { organization });

  // Matches the Add Activity button's destinations in useNavigateTo, including the Console's return path.
  const createActivityPath = useMemo(() => {
    if (isAcceleratorRoute) {
      const params = new URLSearchParams({ source: location.pathname });
      return `${APP_PATHS.ACCELERATOR_ACTIVITY_LOG_NEW.replace(':projectId', `${projectId}`)}?${params}`;
    }
    return APP_PATHS.ACTIVITY_LOG_NEW.replace(':projectId', `${projectId}`);
  }, [isAcceleratorRoute, location.pathname, projectId]);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}
    >
      <img src='/assets/no-activities.png' alt={strings.THIS_PROJECT_HAS_NO_ACTIVITIES} />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingY: '24px' }}>
        <Typography fontSize={'20px'} paddingBottom={'8px'}>
          {strings.THIS_PROJECT_HAS_NO_ACTIVITIES}
        </Typography>
        {canCreateActivities && (
          <Link fontSize='16px' to={createActivityPath}>
            {strings.ADD_YOUR_FIRST_ACTIVITY}
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default ActivitiesEmptyState;
