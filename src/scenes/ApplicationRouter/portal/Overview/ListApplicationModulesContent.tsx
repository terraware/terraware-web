import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import strings from 'src/strings';

import { useApplicationData } from '../../provider/Context';

export default function ListModulesContent(): JSX.Element {
  const { applicationSections } = useApplicationData();
  const theme = useTheme();
  const { isDesktop, isMobile } = useDeviceInfo();

  return (
    <Box paddingX={theme.spacing(2)}>
      {applicationSections.map((section, index) => (
        <Box
          key={`section-${index}`}
          borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}
          paddingY={theme.spacing(3)}
          sx={{ '&:last-child': { border: 'none' } }}
        >
          <Grid container display={'flex'} justifyContent={'space-between'} marginBottom={theme.spacing(1)}>
            <Grid item xs={12}>
              <Typography
                component={'span'}
                fontSize={'20px'}
                fontWeight={600}
                lineHeight={'28px'}
                marginRight={theme.spacing(3)}
                whiteSpace={'nowrap'}
              >
                {section.name}
              </Typography>

              {isMobile && <br />}
            </Grid>

            <Grid item xs={isDesktop ? undefined : 12}>
              <Button
                onClick={() => true}
                label={strings.VIEW}
                priority={'secondary'}
                style={isMobile ? { width: '100%' } : {}}
              />
            </Grid>
          </Grid>

          <Box marginBottom={theme.spacing(1)}>
            <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
              {section.name}
            </Typography>
          </Box>

          <Box>{section.overview}</Box>
        </Box>
      ))}
    </Box>
  );
}
