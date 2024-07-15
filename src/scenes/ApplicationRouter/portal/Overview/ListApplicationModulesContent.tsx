import React, { useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import strings from 'src/strings';
import { ApplicationModuleWithDeliverables } from 'src/types/Application';

import { useApplicationData } from '../../provider/Context';

export default function ListModulesContent(): JSX.Element {
  const { applicationSections } = useApplicationData();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [sectionsWithPrescreen, setSectionsWithPrescreen] =
    useState<ApplicationModuleWithDeliverables[]>(applicationSections);

  useEffect(() => {
    const newSections = [...applicationSections];
    const prescreenSection = {
      id: -1,
      name: 'Prescreen',
      overview:
        'Draw your site map and answer the Prescreen questions to see if you qualify to start the Application for the Accelerator Program. ',
      deliverables: [],
    };
    newSections.push(prescreenSection);
    setSectionsWithPrescreen(newSections);
  }, [applicationSections]);

  return (
    <Box paddingX={theme.spacing(2)}>
      {sectionsWithPrescreen.map((section, index) => (
        <Box
          key={`section-${index}`}
          borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}
          paddingY={theme.spacing(3)}
          sx={{ '&:last-child': { border: 'none' } }}
        >
          <Box marginBottom={theme.spacing(1)} display={'flex'} justifyContent={'space-between'}>
            <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
              {section.name}
            </Typography>
            <Button
              onClick={() => true}
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
