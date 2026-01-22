import React, { type JSX, useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon, IconName } from '@terraware/web-components';
import { Props as ButtonProps } from '@terraware/web-components/components/Button/Button';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Button from 'src/components/common/button/Button';

import PlantingSiteStats from './PlantingSiteStats';
import StatsCardItem, { StatsCardItemProps } from './StatsCardItem';

export type OrganizationStatsCardRow = {
  buttonProps?: ButtonProps;
  icon: IconName;
  statsCardItems: StatsCardItemProps[];
  title: string;
};

type OrganizationStatsCardProps = {
  rows: OrganizationStatsCardRow[];
};

const OrganizationStatsCard = ({ rows }: OrganizationStatsCardProps): JSX.Element => {
  const { isDesktop, isMobile } = useDeviceInfo();
  const theme = useTheme();

  const primaryGridSize = useMemo(() => (isDesktop ? 3 : 12), [isDesktop]);

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.TwClrBg,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
      }}
    >
      <PlantingSiteStats />
      {rows.map((row, index) => (
        <Grid key={index} container spacing={3} sx={{ marginBottom: '16px', padding: 0 }}>
          <Grid item xs={primaryGridSize}>
            <Box
              sx={{
                alignItems: 'center',
                background: theme.palette.TwClrBgSecondary,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
                minHeight: '112px',
                padding: '8px',
              }}
            >
              <Icon
                name={row.icon}
                size='medium'
                style={{
                  fill: theme.palette.TwClrIcnSecondary,
                }}
              />
              <Typography
                sx={{
                  color: theme.palette.TwClrTxt,
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: '24px',
                }}
              >
                {row.title}
              </Typography>
            </Box>
          </Grid>

          {(isDesktop || row.statsCardItems[0]) && (
            <Grid item xs={primaryGridSize}>
              {row.statsCardItems[0] && <StatsCardItem {...row.statsCardItems[0]} />}
            </Grid>
          )}

          {(isDesktop || row.statsCardItems[1]) && (
            <Grid item xs={primaryGridSize}>
              {row.statsCardItems[1] && <StatsCardItem {...row.statsCardItems[1]} />}
            </Grid>
          )}

          <Grid item xs={primaryGridSize}>
            {row.buttonProps && (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  height: '100%',
                  justifyContent: 'center',
                  paddingBottom: isDesktop ? 0 : '24px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <Button
                  priority='secondary'
                  style={{
                    marginLeft: isMobile ? 0 : undefined,
                    width: isMobile ? '100%' : 'auto',
                    whiteSpace: 'normal',
                  }}
                  type='productive'
                  {...row.buttonProps}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default OrganizationStatsCard;
