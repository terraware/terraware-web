import React from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import CompleteIncompleteBatch from 'src/components/common/CompleteIncompleteBatch';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

export default function ListModulesContent(): JSX.Element {
  const { applicationSections } = useApplicationData();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { goToApplicationSection } = useNavigateTo();

  const pathParams = useParams<{ applicationId: string }>();
  const applicationId = Number(pathParams.applicationId);

  return (
    <Box paddingX={theme.spacing(2)}>
      {applicationSections.map((section, index) => (
        <Box
          key={`section-${index}`}
          borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}
          paddingY={theme.spacing(3)}
          sx={{ '&:last-child': { border: 'none' } }}
        >
          <Box marginBottom={theme.spacing(1)} display={'flex'} justifyContent={'space-between'}>
            <Box display='flex' alignItems='center'>
              <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
                {section.name}
              </Typography>
              <Box paddingLeft={theme.spacing(2)} alignSelf={'flex-start'}>
                <CompleteIncompleteBatch status={section.status} />
              </Box>
            </Box>
            <Button
              onClick={() => goToApplicationSection(applicationId, section.id)}
              label={strings.VIEW}
              priority={'secondary'}
              style={isMobile ? { width: '100%' } : {}}
            />
          </Box>

          <Box>{section.overview}</Box>
        </Box>
      ))}
    </Box>
  );
}
