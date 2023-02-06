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
export function useSpeciesPlantsRenderer(plotsWithPlants: any): MapPopupRenderer {
  const theme = useTheme();
  const classes = useStyles();

  const textStyle = {
    fontWeight: 400,
    fontSize: '16px',
    color: theme.palette.TwClrBaseBlack as string,
  };

  const quantityStyle = {
    ...textStyle,
    textAlign: 'right',
    marginRight: theme.spacing(1),
  };

  const speciesStyle = {
    ...textStyle,
    textAlign: 'left',
    marginLeft: theme.spacing(1),
    overflowWrap: 'anywhere',
  };

  return {
    className: classes.popup,
    render: (data: MapSourceProperties): JSX.Element => {
      const { id } = data;
      const populations = plotsWithPlants[id.toString()];

      if (!populations) {
        return (
          <Box display='flex' justifyContent='center' padding={1}>
            <Typography sx={textStyle}>{strings.NO_PLANTS}</Typography>
          </Box>
        );
      }

      return (
        <table>
          <tbody>
            {populations.map((population: any, index: number) => (
              <tr key={index}>
                <td>
                  <Typography sx={quantityStyle}>{population.totalPlants}</Typography>
                </td>
                <td>
                  <Typography sx={speciesStyle}>{population.species_scientificName}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    },
  };
}
