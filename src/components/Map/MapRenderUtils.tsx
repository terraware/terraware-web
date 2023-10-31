import { useCallback, useEffect, useState } from 'react';
import { useMap } from 'react-map-gl';
import { makeStyles } from '@mui/styles';
import { Box, Typography, useTheme } from '@mui/material';
import { MapPopupRenderer, MapSourceProperties } from 'src/types/Map';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  popup: {
    '& > .mapboxgl-popup-content': {
      borderRadius: '8px',
      padding: '10px',
    },
  },
}));

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
