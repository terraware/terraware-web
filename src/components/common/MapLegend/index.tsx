import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { AntSwitch } from 'src/components/Switch/AntSwitch';

type MapLegendItem = {
  borderColor: string;
  fillColor: string;
  label: string;
  fillPatternUrl?: string;
  opacity?: number;
  height?: string;
  isDisabled?: boolean;
};

export type MapLegendGroup = {
  title: string;
  items: MapLegendItem[];
  switch?: boolean;
  // is the legend turned on
  checked?: boolean;
  // the legend is disabled (can't be turned on/off)
  disabled?: boolean;
};

type MapLegendProps = {
  legends: MapLegendGroup[];
  setLegends?: React.Dispatch<React.SetStateAction<MapLegendGroup[]>>;
};

export default function MapLegend({ legends, setLegends }: MapLegendProps): JSX.Element {
  const theme = useTheme();
  const { isMobile, isDesktop } = useDeviceInfo();

  return (
    <Box
      display='flex'
      justifyItems='flex-start'
      border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
      borderRadius='8px'
      padding={theme.spacing(2)}
      flexDirection={'column'}
      maxWidth={isDesktop ? '184px' : '100%'}
      width={isDesktop ? 'auto' : '100%'}
      marginRight={2}
      marginTop={isDesktop ? 0 : 2}
    >
      {legends.map((legend, index) => (
        <Box
          key={legend.title}
          sx={{ opacity: legend.disabled ? 0.7 : 1 }}
          borderBottom={index === legends.length - 1 ? 'none' : `1px solid ${theme.palette.TwClrBrdrTertiary}`}
        >
          <Box paddingBottom={2} paddingTop={index === 0 ? 0 : 2} flexDirection={isDesktop ? 'row' : 'column'}>
            <Box display='flex' alignItems={'center'}>
              {legend.switch && (
                <AntSwitch
                  disabled={legend.disabled}
                  checked={!legend.disabled && legend.checked}
                  onChange={(event, isChecked) => {
                    if (setLegends) {
                      setLegends((prev) => {
                        const newLegends = [...prev];
                        const found = newLegends.find((l) => l.title === legend.title);
                        if (found) {
                          found.checked = isChecked;
                        }
                        return newLegends;
                      });
                    }
                  }}
                />
              )}
              <Typography
                fontSize='14px'
                fontWeight={600}
                width={isMobile ? '100%' : undefined}
                marginRight={isMobile ? 0 : theme.spacing(4)}
                paddingLeft={legend.switch ? theme.spacing(1) : 0}
              >
                {legend.title}
              </Typography>
            </Box>

            <Box>
              {legend.items.map((item) => (
                <Box key={`${legend.title}-${item.label}`} paddingRight={1} paddingTop={1}>
                  <LabeledSwatch {...item} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
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
  isDisabled,
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
          opacity: isDisabled ? 0.7 : opacity,
          height: height ? height : '16px',
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
