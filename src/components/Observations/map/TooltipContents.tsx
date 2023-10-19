import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Portal } from '@mui/base';
import { makeStyles } from '@mui/styles';
import { Button } from '@terraware/web-components';
import strings from 'src/strings';
import { ObservationState, ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import { useOrganization } from 'src/providers';
import isEnabled from 'src/features';
import { isManagerOrHigher } from 'src/utils/organization';
import ReplaceObservationPlotModal from 'src/components/Observations/replacePlot/ReplaceObservationPlotModal';

const useStyles = makeStyles(() => ({
  button: {
    marginLeft: 'auto',
    '&:focus': {
      outline: 'none',
    },
  },
}));

type TooltipContentsProps = {
  monitoringPlot: ObservationMonitoringPlotResultsPayload;
  observationId?: number;
  observationState?: ObservationState;
  title: string;
};

export default function TooltipContents(props: TooltipContentsProps): JSX.Element {
  const { monitoringPlot, observationId, observationState, title } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { selectedOrganization } = useOrganization();
  const [showReplacePlotModal, setShowReplacePlotModal] = useState<boolean>(false);

  const replaceObservationPlotEnabled =
    isEnabled('Replace Observation Plot') && isManagerOrHigher(selectedOrganization);

  const observationInProgress = observationState === 'InProgress';
  const observationOverdue = observationState === 'Overdue';

  const numPlants = monitoringPlot?.totalPlants;
  const numSpecies = monitoringPlot?.totalSpecies;
  const plantingDensity = monitoringPlot?.plantingDensity;
  const percentMortality = monitoringPlot?.mortalityRate;

  return (
    <>
      {showReplacePlotModal && observationId && monitoringPlot && (
        <Portal>
          <ReplaceObservationPlotModal
            onClose={() => setShowReplacePlotModal(false)}
            observationId={observationId}
            monitoringPlot={monitoringPlot}
          />
        </Portal>
      )}
      <Box>
        <Box display='flex' flexDirection='column' padding={theme.spacing(2)}>
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
        {!monitoringPlot?.completedTime && replaceObservationPlotEnabled && (
          <Box display='flex' padding={theme.spacing(2)} sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}>
            <Button
              className={classes.button}
              id='reassignPlot'
              label={`${strings.REQUEST_REASSIGNMENT}...`}
              type='passive'
              onClick={() => setShowReplacePlotModal(true)}
              priority='secondary'
            />
          </Box>
        )}
      </Box>
    </>
  );
}
