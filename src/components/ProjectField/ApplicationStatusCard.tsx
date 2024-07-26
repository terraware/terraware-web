import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import strings from 'src/strings';
import { Application } from 'src/types/Application';

import ProjectFieldCard from './Card';

const ApplicationStatusCard = ({ application, linkTo }: { application?: Application; linkTo?: string }) => {
  const theme = useTheme();

  return (
    <ProjectFieldCard
      height={linkTo ? '128px' : undefined}
      label={!application ? undefined : strings.APPLICATION_STATUS}
      value={
        !application ? (
          false
        ) : (
          <>
            <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} color='orange'>
              {application?.status ? application.status : 'In Review'}
            </Typography>
            {linkTo && (
              <Box marginTop={theme.spacing(1)} textAlign={'center'}>
                <Link fontSize={'16px'} to={linkTo}>
                  {strings.VIEW_APPLICATION}
                </Link>
              </Box>
            )}
          </>
        )
      }
    />
  );
};

export default ApplicationStatusCard;
