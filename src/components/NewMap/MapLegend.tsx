import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { AntSwitch, Dropdown, Icon } from '@terraware/web-components';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import { MapFillComponentStyle, MapIconComponentStyle } from './types';

export type MapLegendAnnotation = {
  border: 'dashed' | 'solid';
  label: string;
};

type BaseMapLegendGroup = {
  annotations?: MapLegendAnnotation[];
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

type MapSingleSelectLegendItem = {
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

type MapGroupToggleLegendItem = {
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

type MapLegendItem =
  | MapMultiSelectLegendItem
  | MapSingleSelectLegendItem
  | MapGroupToggleLegendItem
  | MapDropdownLegendItem;

type MapLegendProps = {
  legends: MapLegendGroup[];
};

const summaryFor = (legend: MapLegendGroup): string | undefined => {
  switch (legend.type) {
    case 'single-select':
      return legend.items.find((item) => item.id === legend.selectedLayer)?.label;
    case 'multi-select':
      return `${legend.items.filter((item) => item.visible).length}/${legend.items.length}`;
    case 'dropdown':
      return legend.items.find((item) => item.value === legend.selectedValue)?.label;
    case 'group-toggle':
      return undefined;
  }
};

const MapLegend = ({ legends }: MapLegendProps): JSX.Element => {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const [collapsedTitles, setCollapsedTitles] = useState<Record<string, boolean>>({});

  const toggleCollapsed = useCallback(
    (title: string) => setCollapsedTitles((current) => ({ ...current, [title]: !current[title] })),
    []
  );

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
          <Typography fontSize='16px' fontWeight={600} paddingLeft={theme.spacing(1)}>
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
              const itemIsLast = itemIndex === legend.items.length - 1;

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
                        height: '13px',
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
                    padding: '3px 8px',
                    opacity: disabled ? '0.5' : 1,
                    marginBottom: itemIsLast ? 0 : '3px',
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

        const collapsed = !!collapsedTitles[legend.title];
        const summary = collapsed ? summaryFor(legend) : undefined;

        return (
          <Box
            key={legend.title}
            sx={{ opacity: legend.disabled ? 0.7 : 1 }}
            borderBottom={isLast ? 'none' : `1px solid ${theme.palette.TwClrBrdrTertiary}`}
          >
            <Box paddingBottom={'5px'} paddingTop={isFirst ? 0 : '5px'} flexDirection={'column'}>
              <Box
                aria-expanded={!collapsed}
                onClick={() => toggleCollapsed(legend.title)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleCollapsed(legend.title);
                  }
                }}
                role='button'
                tabIndex={0}
                sx={{
                  alignItems: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingLeft: theme.spacing(1),
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.TwClrBrdrBrand}`,
                    outlineOffset: '-2px',
                  },
                }}
              >
                <Box display='flex' alignItems='center'>
                  <Icon
                    fillColor={theme.palette.TwClrIcnSecondary}
                    name={collapsed ? 'caretRight' : 'caretDown'}
                    size='small'
                    style={{ height: '12px', width: '12px' }}
                  />
                  {titleComponent}
                </Box>
                <Box alignItems='center' display='flex' paddingLeft={theme.spacing(1)}>
                  {summary && (
                    <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' whiteSpace='nowrap'>
                      {summary}
                    </Typography>
                  )}
                  {switchComponent && (
                    <Box display='flex' onClick={(event) => event.stopPropagation()}>
                      {switchComponent}
                    </Box>
                  )}
                </Box>
              </Box>

              {!collapsed && itemComponents}

              {!collapsed &&
                legend.annotations?.map((annotation) => (
                  <Box
                    alignItems='center'
                    display='flex'
                    key={annotation.label}
                    paddingLeft={theme.spacing(1)}
                    paddingTop={'3px'}
                  >
                    <Box
                      sx={{
                        border: `1px ${annotation.border} ${theme.palette.TwClrBrdrSecondary}`,
                        height: '13px',
                        marginRight: theme.spacing(1),
                        minWidth: '13px',
                        width: '13px',
                      }}
                    />
                    <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
                      {annotation.label}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Box>
        );
      }),
    [collapsedTitles, legends, onClick, theme, toggleCollapsed]
  );

  return (
    <Box
      bgcolor={theme.palette.TwClrBaseWhite}
      display='flex'
      justifyItems='flex-start'
      padding={theme.spacing(2, 1)}
      flexDirection={'column'}
      maxWidth={isDesktop ? '220px' : 'stretch'}
      minWidth={isDesktop ? '220px' : undefined}
      width={isDesktop ? '220px' : 'stretch'}
      margin={0}
      overflow={'scroll'}
    >
      {legendComponents}
    </Box>
  );
};

export default MapLegend;
