import { useCallback, useEffect, useState } from 'react';
import { useMap } from 'react-map-gl';
import { makeStyles } from '@mui/styles';
import { Box, IconButton, Typography, useTheme, Theme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';
import { MapPopupRenderer, MapSourceProperties } from 'src/types/Map';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) => ({
  popup: {
    '& > .mapboxgl-popup-content': {
      borderRadius: '8px',
      padding: '10px',
    },
  },
  button: {
    marginLeft: theme.spacing(2),
    '&:focus': {
      outline: 'none',
    },
  },
  tooltip: {
    '& .mapboxgl-popup-content': {
      borderRadius: theme.spacing(1),
      padding: 0,
    },
    '& .mapboxgl-popup-close-button': {
      display: 'none',
    },
  },
}));

export const mapTooltipDialogStyle = (theme: Theme) => ({
  tooltip: {
    '& .mapboxgl-popup-content': {
      borderRadius: theme.spacing(1),
      padding: 0,
    },
    '& .mapboxgl-popup-close-button': {
      display: 'none',
    },
  },
});

/**
 * Species / plants renderer
 */
export function useSpeciesPlantsRenderer(subzonesWithPlants: any): MapPopupRenderer {
  const theme = useTheme();
  const classes = useStyles();

  const textStyle = {
    fontWeight: 400,
    fontSize: '16px',
    color: theme.palette.TwClrBaseBlack as string,
  };

  return {
    className: classes.popup,
    render: (data: MapSourceProperties): JSX.Element => {
      const { id } = data;
      const populations = subzonesWithPlants[id.toString()];

      if (!populations) {
        return (
          <Box display='flex' justifyContent='center' padding={1}>
            <Typography sx={textStyle}>{strings.NO_PLANTS}</Typography>
          </Box>
        );
      }

      return (
        <MapTooltip
          properties={populations.map((population: any) => ({
            key: population.totalPlants,
            value: population.species_scientificName,
          }))}
        />
      );
    },
  };
}

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
  properties: TooltipProperty[];
};

export function MapTooltip({ title, properties }: MapTooltipProps): JSX.Element {
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
  };

  return (
    <>
      {title && (
        <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(2)} textAlign='left'>
          {title}
        </Typography>
      )}
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
  const classes = useStyles();

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
            className={classes.button}
            id='cancel'
            key='cancel'
            label={cancelButton.title}
            onClick={cancelButton.onClick}
            priority='secondary'
            type='passive'
          />
        )}
        {saveButton && (
          <Button
            className={classes.button}
            id='save'
            key='save'
            label={saveButton.title}
            onClick={saveButton.onClick}
          />
        )}
      </Box>
    </Box>
  );
};
