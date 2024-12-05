import React, { Fragment } from 'react';

import { Box, Grid, Switch, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import isEnabled from 'src/features';

type MapLegendItem = {
  borderColor: string;
  fillColor: string;
  label: string;
  fillPatternUrl?: string;
  opacity?: number;
  height?: string;
};

export type MapLegendGroup = {
  title: string;
  items: MapLegendItem[];
  switch?: boolean;
  disabled?: boolean;
};

type MapLegendProps = {
  legends: MapLegendGroup[];
  setLegends?: React.Dispatch<React.SetStateAction<MapLegendGroup[]>>;
};

export default function MapLegend({ legends, setLegends }: MapLegendProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const newPlantsDashboardEnabled = isEnabled('New Plants Dashboard');

  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '24px',
    marginLeft: '24px',
  };

  return newPlantsDashboardEnabled ? (
    <Box
      display='flex'
      justifyItems='flex-start'
      border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
      borderRadius='8px'
      padding={theme.spacing(2)}
    >
      {legends.map((legend) => (
        <Fragment key={legend.title}>
          <Box
            border={legend.switch ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : 'none'}
            display='flex'
            padding={2}
            borderRadius={1}
            marginRight={2}
          >
            {legend.switch && (
              <Box>
                <Switch
                  checked={!legend.disabled}
                  onChange={(event, checked) => {
                    if (setLegends) {
                      setLegends((prev) => {
                        const newLegends = [...prev];
                        const found = newLegends.find((l) => l.title === legend.title);
                        if (found) {
                          found.disabled = !checked;
                        }
                        return newLegends;
                      });
                    }
                  }}
                />
              </Box>
            )}
            <Box>
              <Typography
                fontSize='14px'
                fontWeight={600}
                width={isMobile ? '100%' : undefined}
                marginRight={isMobile ? 0 : theme.spacing(4)}
              >
                {legend.title}
              </Typography>
              <Box display='flex'>
                {legend.items.map((item) => (
                  <Box key={`${legend.title}-${item.label}`} paddingRight={1}>
                    <LabeledSwatch {...item} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          {!legend.switch && <div style={separatorStyles} />}
        </Fragment>
      ))}
    </Box>
  ) : (
    <Box
      display='flex'
      justifyItems='flex-start'
      flexDirection='column'
      border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
      borderRadius='8px'
      padding={theme.spacing(2)}
      rowGap={theme.spacing(3)}
    >
      {legends.map((legend) => (
        <Grid container key={legend.title} spacing={2} columns={8}>
          <Grid item xs={isMobile ? 8 : 1}>
            <Typography
              fontSize='14px'
              fontWeight={600}
              width={isMobile ? '100%' : undefined}
              marginRight={isMobile ? 0 : theme.spacing(4)}
            >
              {legend.title}
            </Typography>
          </Grid>
          {legend.items.map((item) => (
            <Grid item xs={isMobile ? 4 : 1} key={`${legend.title}-${item.label}`}>
              <LabeledSwatch {...item} />
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  );
}

type LabeledSwatchProps = MapLegendItem;

function LabeledSwatch({
  borderColor,
  fillColor,
  label,
  fillPatternUrl,
  opacity,
  height,
}: LabeledSwatchProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' alignItems='center'>
      <Box
        sx={{
          border: `2px solid ${borderColor}`,
          backgroundColor: fillColor,
          backgroundImage: fillPatternUrl ? `url("${fillPatternUrl}")` : undefined,
          backgroundRepeat: 'repeat',
          opacity,
          height: height ? height : '8px',
          width: '24px',
          marginRight: theme.spacing(1),
        }}
      />
      <Typography fontSize='12px' fontWeight={400}>
        {label}
      </Typography>
    </Box>
  );
}
