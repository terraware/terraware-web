import React, { type JSX, useCallback } from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { AntSwitch } from 'src/components/Switch/AntSwitch';
import strings from 'src/strings';

import { MapLayer } from '../MapLayerSelect';

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
  tooltip?: string;
  switch?: boolean;
  // is the legend turned on
  checked?: boolean;
  // the legend is disabled (can't be turned on/off)
  disabled?: boolean;
};

type MapLegendProps = {
  legends: MapLegendGroup[];
  setLegends?: React.Dispatch<React.SetStateAction<MapLegendGroup[]>>;
  onChangeLayer?: (layer: string) => void;
  selectedLayer?: string;
  disableLegends?: boolean;
};

export default function MapLegend({
  legends,
  setLegends,
  onChangeLayer,
  selectedLayer,
  disableLegends,
}: MapLegendProps): JSX.Element {
  const theme = useTheme();
  const { isMobile, isDesktop } = useDeviceInfo();

  return (
    <Box
      display='flex'
      justifyItems='flex-start'
      border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
      borderRadius='8px'
      padding={selectedLayer ? theme.spacing(2, 1) : theme.spacing(2)}
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
                  onChange={(_event: React.SyntheticEvent, isChecked: boolean) => {
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
                fontSize='16px'
                fontWeight={600}
                width={isMobile ? '100%' : undefined}
                marginRight={isMobile ? 0 : theme.spacing(4)}
                paddingLeft={legend.switch ? theme.spacing(1) : theme.spacing(0)}
              >
                {legend.title}
                {legend.tooltip && (
                  <Tooltip
                    title={legend.tooltip}
                    sx={{ display: 'inline-block', verticalAlign: 'text-top', marginLeft: theme.spacing(1) }}
                  >
                    <Box display='flex'>
                      <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
                    </Box>
                  </Tooltip>
                )}
              </Typography>
            </Box>

            <Box>
              {legend.items.map((item) => (
                <Box key={`${legend.title}-${item.label}`} paddingRight={1} paddingTop={1}>
                  <LabeledSwatch
                    {...item}
                    onChangeLayer={onChangeLayer}
                    selectedLayer={selectedLayer}
                    disableLegends={disableLegends}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

type LabeledSwatchProps = MapLegendItem & {
  onChangeLayer?: (layer: string) => void;
  selectedLayer?: string;
  disableLegends?: boolean;
};

const getLayerFromLabel = (label: string): MapLayer => {
  if (label === strings.SUBSTRATA) {
    return 'Sub-Strata';
  }
  return label as MapLayer;
};

function LabeledSwatch({
  borderColor,
  fillColor,
  label,
  fillPatternUrl,
  opacity,
  height,
  isDisabled,
  onChangeLayer,
  selectedLayer,
  disableLegends,
}: LabeledSwatchProps): JSX.Element {
  const theme = useTheme();

  const onLegendClickHandler = useCallback(() => {
    if (onChangeLayer) {
      if (label === strings.SUBSTRATA) {
        onChangeLayer('Sub-Strata');
      } else {
        onChangeLayer(label);
      }
    }
  }, [label, onChangeLayer]);

  return (
    <Box
      onClick={onLegendClickHandler}
      display='flex'
      alignItems='center'
      sx={{
        cursor: onChangeLayer ? 'pointer' : 'default',
        background:
          selectedLayer && selectedLayer === getLayerFromLabel(label) ? theme.palette.TwClrBgSecondary : 'none',
        borderRadius: selectedLayer && selectedLayer === getLayerFromLabel(label) ? '4px' : 'none',
        padding: selectedLayer ? '4px 8px' : 0,
        opacity: disableLegends ? '0.5' : 1,
      }}
      justifyContent={'space-between'}
    >
      <Box display='flex' alignItems='center' paddingRight={onChangeLayer ? theme.spacing(1) : 0}>
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
        <Typography fontSize='14px' fontWeight={400}>
          {label}
        </Typography>
      </Box>
      {onChangeLayer && (
        <Box
          display='flex'
          sx={{
            visibility: selectedLayer && selectedLayer === getLayerFromLabel(label) ? 'visible' : 'hidden',
          }}
        >
          <Icon name='checkmark' />
        </Box>
      )}
    </Box>
  );
}
