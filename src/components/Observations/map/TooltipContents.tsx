import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { ObservationState } from 'src/types/Observations';

type TooltipContentsProps = {
  title: string;
  observationState?: ObservationState;
  numPlants?: number;
  numSpecies?: number;
  plantingDensity?: number;
  percentMortality?: number;
};

export default function TooltipContents(props: TooltipContentsProps): JSX.Element {
  const { title, observationState, numPlants, numSpecies, plantingDensity, percentMortality } = props;
  const theme = useTheme();

  const observationInProgress = observationState === 'InProgress';
  const observationOverdue = observationState === 'Overdue';

  return (
    <Box display='flex' flexDirection='column' padding={theme.spacing(1)}>
      <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(2)}>
        {title}
      </Typography>
      {observationInProgress ? (
        <Typography>{strings.OBSERVATION_IN_PROGRESS}</Typography>
      ) : observationOverdue ? (
        <Typography>{strings.OBSERVATION_OVERDUE}</Typography>
      ) : (
        <>
          <Typography fontSize='16px' fontWeight={400}>
            {`${strings.PLANTS}: ${numPlants ?? strings.UNKNOWN}`}
          </Typography>
          <Typography fontSize='16px' fontWeight={400}>
            {`${strings.SPECIES}: ${numSpecies ?? strings.UNKNOWN}`}
          </Typography>
          <Typography fontSize='16px' fontWeight={400}>
            {`${strings.PLANTING_DENSITY}: ${plantingDensity ?? strings.UNKNOWN} ${strings.PLANTS_PER_HECTARE}`}
          </Typography>
          <Typography fontSize='16px' fontWeight={400}>
            {`${strings.MORTALITY_RATE}: ${percentMortality ?? strings.UNKNOWN}%`}
          </Typography>
        </>
      )}
    </Box>
  );
}
