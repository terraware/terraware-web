import React from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { AntSwitch, Icon } from '@terraware/web-components';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import { MapFillComponentStyle, MapIconComponentStyle } from './types';

export type MapLayerLegendItem = {
  disabled?: boolean;
  id: string;
  label: string;
  style: MapIconComponentStyle | MapFillComponentStyle;
};

type BaseMapLegendGroup = {
  disabled?: boolean;
  title: string;
  tooltip?: string;
};

export type MapLayerLegendGroup = {
  type: 'layer';
  items: MapLayerLegendItem[];
  selectedLayer?: string;
  setSelectedLayer: (id: string | undefined) => void;
} & BaseMapLegendGroup;

export type MapMarkerLegendItem = {
  disabled?: boolean;
  id: string;
  label: string;
  setVisible?: (visible: boolean) => void;
  style: MapIconComponentStyle;
  visible: boolean;
};

export type MapMarkerLegendGroup = {
  items: MapMarkerLegendItem[];
  type: 'marker';
} & BaseMapLegendGroup;

export type MapHighlightLegendItem = {
  label: string;
  style: MapFillComponentStyle;
};

export type MapHighlightLegendGroup = {
  items: MapHighlightLegendItem[];
  setVisible?: (visible: boolean) => void;
  type: 'highlight';
  visible: boolean;
} & BaseMapLegendGroup;

export type MapLegendGroup = MapMarkerLegendGroup | MapLayerLegendGroup | MapHighlightLegendGroup;

export type MapLegendProps = {
  legends: MapLegendGroup[];
};

const MapLegend = ({ legends }: MapLegendProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile, isDesktop } = useDeviceInfo();

  const legendComponents = legends.map((legend, index) => {
    const isFirst = index === 0;
    const isLast = index === legends.length - 1;
    const switchComponent =
      legend.type === 'highlight' ? (
        <AntSwitch disabled={legend.disabled} checked={legend.visible} onChange={legend.setVisible} />
      ) : undefined;

    const titleComponent = (
      <Typography
        fontSize='16px'
        fontWeight={600}
        width={isMobile ? '100%' : undefined}
        marginRight={isMobile ? 0 : theme.spacing(4)}
        paddingLeft={switchComponent ? theme.spacing(1) : theme.spacing(0)}
      >
        {legend.title}
        {legend.tooltip && (
          <Tooltip
            title={legend.tooltip}
            sx={{
              display: 'inline-block',
              verticalAlign: 'text-top',
              marginLeft: theme.spacing(1),
            }}
          >
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        )}
      </Typography>
    );

    const itemComponents = legend.items.map((item, itemIndex) => {
      const onClick = legend.disabled
        ? undefined
        : legend.type === 'layer'
          ? (item as MapLayerLegendItem).disabled
            ? undefined
            : () => legend.setSelectedLayer((item as MapLayerLegendItem).id)
          : legend.type === 'marker'
            ? (item as MapMarkerLegendItem).disabled
              ? undefined
              : () => (item as MapMarkerLegendItem).setVisible?.(!(item as MapMarkerLegendItem).visible)
            : undefined;

      const disabled =
        legend.disabled ||
        (legend.type === 'layer'
          ? (item as MapLayerLegendItem).disabled
          : legend.type === 'marker'
            ? (item as MapMarkerLegendItem).disabled
            : false) ||
        false;

      const selected =
        legend.type === 'layer'
          ? (item as MapLayerLegendItem).id === legend.selectedLayer
          : legend.type === 'marker'
            ? (item as MapMarkerLegendItem).visible
            : false;

      const logoComponent = () => {
        if (item.style.type === 'icon') {
          return (
            <Icon
              name={item.style.iconName}
              fillColor={item.style.iconColor}
              style={{ marginRight: theme.spacing(1) }}
              size={'small'}
            />
          );
        } else {
          return (
            <Box
              display={'flex'}
              sx={{
                border: `2px solid ${item.style.borderColor ?? theme.palette.TwClrBaseGreen300}`,
                opacity: disabled ? 0.7 : 1.0,
                height: '16px',
                width: '24px',
                minWidth: '24px',
                marginRight: theme.spacing(1),
              }}
              overflow={'clip'}
            >
              <Box
                height={'100%'}
                width={'100%'}
                sx={{
                  backgroundColor: item.style.fillColor,
                  backgroundImage: item.style.fillPatternUrl ? `url('${item.style.fillPatternUrl}')` : undefined,
                  backgroundRepeat: 'repeat',
                  opacity: item.style.opacity ?? 0.2,
                }}
              />
            </Box>
          );
        }
      };

      const visibleComponent = () => {
        switch (legend.type) {
          case 'marker': {
            const featureItem = item as MapMarkerLegendItem;

            const visibleIcon = featureItem.visible ? <Icon name='iconEye' /> : <Icon name='iconEyeOff' />;

            return <Box display='flex'>{visibleIcon}</Box>;
          }
          case 'layer': {
            const layerItem = item as MapLayerLegendItem;

            return (
              <Box display='flex' sx={{ visibility: layerItem.id === legend.selectedLayer ? 'visible' : 'hidden' }}>
                <Icon name='checkmark' style={{ marginRight: theme.spacing(1) }} />
              </Box>
            );
          }

          case 'highlight':
            return undefined;
        }
      };

      return (
        <Box
          onClick={onClick}
          display='flex'
          alignItems='center'
          sx={{
            cursor: onClick ? 'pointer' : 'default',
            background: selected ? theme.palette.TwClrBgSecondary : 'none',
            borderRadius: theme.spacing(1),
            padding: theme.spacing(1, 1),
            opacity: disabled ? '0.5' : 1,
          }}
          justifyContent={'space-between'}
          key={`${index}-${itemIndex}`}
        >
          <Box display='flex' alignItems='center' paddingRight={theme.spacing(1)}>
            {logoComponent()}
            <Typography fontSize='14px' fontWeight={400}>
              {item.label}
            </Typography>
          </Box>
          <Box display='flex'>{visibleComponent()}</Box>
        </Box>
      );
    });

    return (
      <Box
        key={legend.title}
        sx={{ opacity: legend.disabled ? 0.7 : 1 }}
        borderBottom={isLast ? 'none' : `1px solid ${theme.palette.TwClrBrdrTertiary}`}
      >
        <Box paddingBottom={2} paddingTop={isFirst ? 0 : 2} flexDirection={'column'}>
          <Box display='flex' alignItems={'center'} paddingLeft={theme.spacing(1)}>
            {switchComponent}
            {titleComponent}
          </Box>

          {itemComponents}
        </Box>
      </Box>
    );
  });

  return (
    <Box
      display='flex'
      justifyItems='flex-start'
      padding={theme.spacing(2, 1)}
      flexDirection={'column'}
      maxWidth={isDesktop ? '184px' : 'stretch'}
      minWidth={isDesktop ? '160px' : undefined}
      width={isDesktop ? 'auto' : 'stretch'}
      margin={0}
      overflow={'scroll'}
    >
      {legendComponents}
    </Box>
  );
};

export default MapLegend;
