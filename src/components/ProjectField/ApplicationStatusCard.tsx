import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import strings from 'src/strings';
import { Application, getApplicationStatusColor } from 'src/types/Application';

import ProjectFieldCard from './Card';

type ApplicationStatusCardProps = {
  application?: Application;
  linkTo?: string;
  md?: number;
};

const ApplicationStatusCard = ({ application, linkTo, md }: ApplicationStatusCardProps) => {
  const theme = useTheme();
  const color = application ? getApplicationStatusColor(application.status, theme) : 'black';

  return (
    <ProjectFieldCard
      height={linkTo ? '128px' : undefined}
      label={application ? strings.APPLICATION_STATUS : undefined}
      md={md}
      value={
        !application ? (
          false
        ) : (
          <>
            <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} color={color || 'black'}>
              {application?.status}
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
