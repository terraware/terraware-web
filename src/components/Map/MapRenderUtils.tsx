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
  };

  const keyStyle = {
    ...textStyle,
    textAlign: 'right',
    marginRight: theme.spacing(1),
  };

  const valueStyle = {
    ...textStyle,
    textAlign: 'left',
    marginLeft: theme.spacing(1),
    overflowWrap: 'anywhere',
  };

  return (
    <>
      {title && (
        <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(2)} textAlign='center'>
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
