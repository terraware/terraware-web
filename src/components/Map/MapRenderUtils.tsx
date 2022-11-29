import { makeStyles } from '@mui/styles';
import { Box, Typography, useTheme } from '@mui/material';
import { MapPopupRenderer, MapSourceProperties } from './MapModels';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  popup: {
    '& > .mapboxgl-popup-content': {
      borderRadius: '8px',
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
    color: theme.palette.TwClrBaseBlack,
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
        <Box display='flex' flexDirection='column'>
          {populations.map((population: any, index: number) => (
            <Box key={index} display='flex' flexDirection='row'>
              <Box sx={{ textAlign: 'right', marginRight: 2, minWidth: '50px' }}>
                <Typography sx={textStyle}>{population.totalPlants}</Typography>
              </Box>
              <Box sx={{ textAlign: 'left', overflowWrap: 'anywhere' }}>
                <Typography sx={textStyle}>{population.species_scientificName}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      );
    },
  };
}
