import React, { type JSX, useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import CompleteIncompleteBadge from 'src/components/common/CompleteIncompleteBadge';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';
import { ApplicationModule } from 'src/types/Application';

export default function ListModulesContent(): JSX.Element {
  const { applicationSections, selectedApplication } = useApplicationData();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { goToApplicationPrescreen, goToApplicationSection } = useNavigateTo();

  const pathParams = useParams<{ applicationId: string }>();
  const applicationId = Number(pathParams.applicationId);

  const isPrescreen = useMemo(() => {
    if (!selectedApplication) {
      return true;
    } else {
      return selectedApplication.status === 'Not Submitted' || selectedApplication.status === 'Failed Pre-screen';
    }
  }, [selectedApplication]);

  const getSectionStatus = useCallback(
    (section: ApplicationModule) => {
      if (!selectedApplication) {
        return 'Incomplete';
      }

      if (section.phase === 'Application') {
        return section.status;
      } else {
        return isPrescreen ? 'Incomplete' : 'Complete';
      }
    },
    [selectedApplication, isPrescreen]
  );

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
                <CompleteIncompleteBadge status={getSectionStatus(section) ?? 'Incomplete'} />
              </Box>
            </Box>
            <Button
              onClick={() =>
                section.phase === 'Application'
                  ? goToApplicationSection(applicationId, section.moduleId)
                  : goToApplicationPrescreen(applicationId)
              }
              disabled={section.phase === 'Application' && isPrescreen}
              label={section.phase === 'Pre-Screen' && isPrescreen ? strings.GET_STARTED : strings.VIEW}
              priority={section.phase === 'Pre-Screen' && isPrescreen ? 'primary' : 'secondary'}
              style={isMobile ? { width: '100%' } : {}}
            />
          </Box>

          <Box dangerouslySetInnerHTML={{ __html: section.overview || '' }} />
        </Box>
      ))}
    </Box>
  );
}
