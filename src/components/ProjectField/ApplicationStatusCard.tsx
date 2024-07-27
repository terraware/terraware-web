import React from 'react';

import { Box, Theme, Typography, useTheme } from '@mui/material';
import { Property } from 'csstype';

import Link from 'src/components/common/Link';
import strings from 'src/strings';
import { Application } from 'src/types/Application';

import ProjectFieldCard from './Card';

const getApplicationStatusColor = (
  application: Application | undefined,
  theme: Theme
): Property.Color | string | undefined => {
  if (!application || !theme?.palette?.TwClrTxtInfo) {
    return 'black';
  }

  switch (application.status) {
    case 'Accepted':
    case 'Carbon Eligible':
    case 'Issue Resolved':
      return theme.palette.TwClrTxtSuccess;
    case 'In Review':
    case 'Issue Active':
    case 'Needs Follow-up':
    case 'Waitlist':
      return theme.palette.TwClrTxtWarning;
    case 'Not Accepted':
      return theme.palette.TwClrTxtDanger;
    case 'Issue Pending':
    case 'PL Review':
    case 'Pre-check':
    case 'Ready for Review':
    case 'Submitted':
      return theme.palette.TwClrTxtInfo;
    // TODO: define colors for these statuses
    case 'Not Submitted':
    case 'Failed Pre-screen':
    case 'Passed Pre-screen':
    default:
      return theme.palette.TwClrTxtInfo;
  }
};

type ApplicationStatusCardProps = {
  application?: Application;
  linkTo?: string;
  md?: number;
};

const ApplicationStatusCard = ({ application, linkTo, md }: ApplicationStatusCardProps) => {
  const theme = useTheme();
  const color = getApplicationStatusColor(application, theme);

  return (
    <ProjectFieldCard
      height={linkTo ? '128px' : undefined}
      label={!application ? undefined : strings.APPLICATION_STATUS}
      md={md}
      value={
        !application ? (
          false
        ) : (
          <>
            <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} color={color || 'black'}>
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
