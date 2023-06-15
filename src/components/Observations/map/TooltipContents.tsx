import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';

type TooltipContentsProps = {
  title: string;
  observationInProgress: boolean;
  numPlants: number;
  numSpecies: number;
  plantingDensity: number;
  percentMortality: number;
};

export default function TooltipContents(props: TooltipContentsProps): JSX.Element {
  const { title, observationInProgress, numPlants, numSpecies, plantingDensity, percentMortality } = props;
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column' padding={theme.spacing(1)}>
      <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(2)}>
        {title}
      </Typography>
      {observationInProgress ? (
        <Typography>{strings.OBSERVATION_IN_PROGRESS}</Typography>
      ) : (
        <>
          <Typography fontSize='16px' fontWeight={400}>{`${numPlants} ${strings.PLANTS}`}</Typography>
          <Typography fontSize='16px' fontWeight={400}>{`${numSpecies} ${strings.SPECIES}`}</Typography>
          <Typography fontSize='16px' fontWeight={400}>
            {`${strings.PLANTING_DENSITY} ${plantingDensity} ${strings.PLANTS_PER_HECTARE}`}
          </Typography>
          <Typography fontSize='16px' fontWeight={400}>{`${strings.MORTALITY_RATE} ${percentMortality}%`}</Typography>
        </>
      )}
    </Box>
  );
}
