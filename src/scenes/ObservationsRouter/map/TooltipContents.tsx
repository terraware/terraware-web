import React, { useState } from 'react';

import { Portal } from '@mui/base';
import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { useMapPortalContainer } from 'src/components/Map/MapRenderUtils';
import { useOrganization } from 'src/providers';
import ReplaceObservationPlotModal from 'src/scenes/ObservationsRouter/replacePlot/ReplaceObservationPlotModal';
import strings from 'src/strings';
import { ObservationMonitoringPlotForMap, ObservationState } from 'src/types/Observations';
import { isManagerOrHigher } from 'src/utils/organization';

type TooltipContentsProps = {
  monitoringPlot: ObservationMonitoringPlotForMap;
  observationId?: number;
  observationState?: ObservationState;
  plantingSiteId: number;
  title: string;
};

export default function TooltipContents(props: TooltipContentsProps): JSX.Element {
  const { monitoringPlot, observationId, observationState, plantingSiteId, title } = props;
  const theme = useTheme();
  const mapPortalContainer = useMapPortalContainer();
  const { selectedOrganization } = useOrganization();
  const [showReplacePlotModal, setShowReplacePlotModal] = useState<boolean>(false);

  const replaceObservationPlotEnabled = isManagerOrHigher(selectedOrganization);

  const observationInProgress = observationState === 'InProgress';
  const observationOverdue = observationState === 'Overdue';

  const numPlants = monitoringPlot?.totalPlants;
  const numShrubs = monitoringPlot?.totalShrubs;
  const numSpecies = monitoringPlot?.totalSpecies;
  const plantingDensity = monitoringPlot?.plantingDensity;
  const percentMortality = monitoringPlot?.mortalityRate;

  return (
    <>
      {showReplacePlotModal && observationId && monitoringPlot && (
        <Portal container={mapPortalContainer}>
          <ReplaceObservationPlotModal
            monitoringPlot={monitoringPlot}
            observationId={observationId}
            onClose={() => setShowReplacePlotModal(false)}
            plantingSiteId={plantingSiteId}
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
                {monitoringPlot.isBiomassMeasurement
                  ? `${strings.TREES_TRUNKS}: ${numPlants} ${strings.OR_SHRUBS}: ${numShrubs}`
                  : `${strings.PLANTS}: ${numPlants ?? strings.UNKNOWN}`}
              </Typography>
              <Typography fontSize='16px' fontWeight={400}>
                {`${strings.SPECIES}: ${numSpecies ?? strings.UNKNOWN}`}
              </Typography>

              {monitoringPlot.isBiomassMeasurement ? (
                <Typography>{`${strings.DATE}: ${getDateDisplayValue(monitoringPlot?.completedTime || '')} `}</Typography>
              ) : (
                <>
                  <Typography fontSize='16px' fontWeight={400}>
                    {`${strings.PLANTING_DENSITY}: ${plantingDensity ? `${plantingDensity} ${strings.PLANTS_PER_HECTARE}` : strings.UNKNOWN} `}
                  </Typography>
                  <Typography fontSize='16px' fontWeight={400}>
                    {`${strings.MORTALITY_RATE}: ${percentMortality ? `${percentMortality} %` : strings.UNKNOWN} `}
                  </Typography>
                </>
              )}
            </>
          )}
        </Box>
        {!monitoringPlot?.completedTime && replaceObservationPlotEnabled && (
          <Box display='flex' padding={theme.spacing(2)} sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}>
            <Button
              id='reassignPlot'
              label={`${strings.REQUEST_REASSIGNMENT}...`}
              type='passive'
              onClick={() => setShowReplacePlotModal(true)}
              priority='secondary'
              sx={{
                marginLeft: 'auto',
                '&:focus': {
                  outline: 'none',
                },
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
}
