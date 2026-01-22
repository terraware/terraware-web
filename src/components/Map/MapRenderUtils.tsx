import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useMap } from 'react-map-gl/mapbox';

import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

/**
 * Full screen map container ref for Portals
 */
export function useMapPortalContainer(): Element | undefined {
  const { current: map } = useMap();
  const [container, setContainer] = useState<Element | undefined>();

  const updateContainer = useCallback(() => {
    if (window.document.fullscreenElement?.attributes?.getNamedItem('class')?.value?.includes('mapboxgl-map')) {
      setContainer(window.document.fullscreenElement);
    } else {
      setContainer(undefined);
    }
  }, [setContainer]);

  useEffect(updateContainer);

  map?.on('resize', updateContainer);

  return container;
}

/**
 * Generic tooltip renderer
 */
export type TooltipProperty = {
  key: string;
  value: string | number;
};

export type MapTooltipProps = {
  title?: string;
  subtitle?: string;
  subtitleColor?: string;
  properties: TooltipProperty[];
};

export function MapTooltip({ title, properties, subtitle, subtitleColor }: MapTooltipProps): JSX.Element {
  const theme = useTheme();

  const textStyle = {
    fontWeight: 400,
    fontSize: '16px',
    color: theme.palette.TwClrBaseBlack as string,
    whiteSpace: 'pre',
    textAlign: 'left',
  };

  const keyStyle = {
    ...textStyle,
    marginRight: theme.spacing(1),
    overflowWrap: 'anywhere',
  };

  const valueStyle = {
    ...textStyle,
    marginLeft: theme.spacing(1),
    overflowWrap: 'anywhere',
    textAlign: 'right',
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
          borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          padding: theme.spacing(2),
          borderRadius: 1,
        }}
      >
        {title && (
          <Typography fontSize={'20px'} fontWeight={600} marginBottom={0} textAlign='left'>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography
            fontSize='16px'
            fontWeight={500}
            marginBottom={0}
            textAlign='left'
            color={subtitleColor || theme.palette.TwClrBasePink500}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box padding={2}>
        <table>
          <tbody>
            {properties.map((prop: TooltipProperty, index: number) => (
              <tr key={index}>
                <td>
                  <Typography sx={keyStyle}>{prop.key}</Typography>
                </td>
                <td>
                  <Typography sx={valueStyle}>{prop.value}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </>
  );
}

export type ButtonType = {
  title: string;
  onClick: () => void;
};

export type MapTooltipDialogProps = {
  cancelButton?: ButtonType;
  children: React.ReactNode;
  onClose: () => void;
  saveButton?: ButtonType;
  title: string;
};

export const MapTooltipDialog = (props: MapTooltipDialogProps): JSX.Element => {
  const { cancelButton, children, onClose, saveButton, title } = props;
  const theme = useTheme();

  const buttonStyles = {
    marginLeft: theme.spacing(2),
    '&:focus': {
      outline: 'none',
    },
  };

  return (
    <Box borderRadius={theme.spacing(1)} display='flex' flexDirection='column'>
      <Box
        borderRadius={theme.spacing(1, 1, 0, 0)}
        display='flex'
        justifyContent='space-between'
        padding={theme.spacing(2)}
        sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
      >
        <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size='small'>
          <Icon name='close' className='icon-close' />
        </IconButton>
      </Box>
      {children}
      <Box
        borderRadius={theme.spacing(0, 0, 1, 1)}
        display='flex'
        justifyContent='flex-end'
        padding={theme.spacing(2)}
        sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
      >
        {cancelButton && (
          <Button
            id='cancel'
            key='cancel'
            label={cancelButton.title}
            onClick={cancelButton.onClick}
            priority='secondary'
            sx={buttonStyles}
            type='passive'
          />
        )}
        {saveButton && (
          <Button id='save' key='save' label={saveButton.title} onClick={saveButton.onClick} sx={buttonStyles} />
        )}
      </Box>
    </Box>
  );
};
