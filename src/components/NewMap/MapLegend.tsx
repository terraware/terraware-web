import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { AntSwitch, Dropdown, Icon } from '@terraware/web-components';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import { MapFillComponentStyle, MapIconComponentStyle } from './types';

type BaseMapLegendGroup = {
  disabled?: boolean;
  title: string;
  tooltip?: string;
};

export type MapDropdownLegendItem = {
  label: string;
  value: string;
};

export type MapDropdownLegendGroup = {
  type: 'dropdown';
  items: MapDropdownLegendItem[];
  selectedValue: string | undefined;
  setSelectedValue: (value: string | undefined) => void;
} & BaseMapLegendGroup;

export type MapSingleSelectLegendItem = {
  disabled?: boolean;
  id: string;
  label: string;
  style: MapIconComponentStyle | MapFillComponentStyle;
};

export type MapSingleSelectLegendGroup = {
  type: 'single-select';
  items: MapSingleSelectLegendItem[];
  selectedLayer?: string;
  setSelectedLayer: (id: string | undefined) => void;
} & BaseMapLegendGroup;

export type MapMultiSelectLegendItem = {
  disabled?: boolean;
  id: string;
  label: string;
  setVisible?: (visible: boolean) => void;
  style: MapIconComponentStyle | MapFillComponentStyle;
  visible: boolean;
};

export type MapMultiSelectLegendGroup = {
  items: MapMultiSelectLegendItem[];
  type: 'multi-select';
} & BaseMapLegendGroup;

export type MapGroupToggleLegendItem = {
  label: string;
  style: MapIconComponentStyle | MapFillComponentStyle;
};

export type MapGroupToggleLegendGroup = {
  items: MapGroupToggleLegendItem[];
  setVisible?: (visible: boolean) => void;
  type: 'group-toggle';
  visible: boolean;
} & BaseMapLegendGroup;

export type MapLegendGroup =
  | MapMultiSelectLegendGroup
  | MapSingleSelectLegendGroup
  | MapGroupToggleLegendGroup
  | MapDropdownLegendGroup;

export type MapLegendItem =
  | MapMultiSelectLegendItem
  | MapSingleSelectLegendItem
  | MapGroupToggleLegendItem
  | MapDropdownLegendItem;

export type MapLegendProps = {
  legends: MapLegendGroup[];
};

const MapLegend = ({ legends }: MapLegendProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile, isDesktop } = useDeviceInfo();

  const onClick = useCallback((legend: MapLegendGroup, item: MapLegendItem) => {
    return legend.disabled
      ? undefined
      : legend.type === 'single-select'
        ? (item as MapSingleSelectLegendItem).disabled
          ? undefined
          : () => legend.setSelectedLayer((item as MapSingleSelectLegendItem).id)
        : legend.type === 'multi-select'
          ? (item as MapMultiSelectLegendItem).disabled
            ? undefined
            : () => (item as MapMultiSelectLegendItem).setVisible?.(!(item as MapMultiSelectLegendItem).visible)
          : undefined;
  }, []);

  const legendComponents = useMemo(
    () =>
      legends.map((legend, index) => {
        const isFirst = index === 0;
        const isLast = index === legends.length - 1;
        const switchComponent =
          legend.type === 'group-toggle' ? (
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

        const itemComponents =
          legend.type === 'dropdown' ? (
            <Dropdown
              fullWidth
              required
              options={legend.items}
              selectedValue={legend.selectedValue}
              onChange={legend.setSelectedValue}
            />
          ) : (
            legend.items.map((item, itemIndex) => {
              const itemOnClck = onClick(legend, item);

              const disabled =
                legend.disabled ||
                (legend.type === 'single-select'
                  ? (item as MapSingleSelectLegendItem).disabled
                  : legend.type === 'multi-select'
                    ? (item as MapMultiSelectLegendItem).disabled
                    : false) ||
                false;

              const selected =
                legend.type === 'single-select'
                  ? (item as MapSingleSelectLegendItem).id === legend.selectedLayer
                  : legend.type === 'multi-select'
                    ? (item as MapMultiSelectLegendItem).visible
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
                          backgroundImage: item.style.fillPatternUrl
                            ? `url('${item.style.fillPatternUrl}')`
                            : undefined,
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
                  case 'multi-select': {
                    const featureItem = item as MapMultiSelectLegendItem;

                    const visibleIcon = featureItem.visible ? <Icon name='iconEye' /> : <Icon name='iconEyeOff' />;

                    return <Box display='flex'>{visibleIcon}</Box>;
                  }
                  case 'single-select': {
                    const layerItem = item as MapSingleSelectLegendItem;

                    return (
                      <Box
                        display='flex'
                        sx={{ visibility: layerItem.id === legend.selectedLayer ? 'visible' : 'hidden' }}
                      >
                        <Icon name='checkmark' style={{ marginRight: theme.spacing(1) }} />
                      </Box>
                    );
                  }

                  case 'group-toggle':
                    return undefined;
                }
              };

              return (
                <Box
                  onClick={itemOnClck}
                  display='flex'
                  alignItems='center'
                  sx={{
                    cursor: itemOnClck ? 'pointer' : 'default',
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
            })
          );

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
      }),
    [isMobile, legends, onClick, theme]
  );

  return (
    <Box
      bgcolor={theme.palette.TwClrBaseWhite}
      display='flex'
      justifyItems='flex-start'
      padding={theme.spacing(2, 1)}
      flexDirection={'column'}
      maxWidth={isDesktop ? '184px' : 'stretch'}
      minWidth={isDesktop ? '184px' : undefined}
      width={isDesktop ? '184px' : 'stretch'}
      margin={0}
      overflow={'scroll'}
    >
      {legendComponents}
    </Box>
  );
};

export default MapLegend;
