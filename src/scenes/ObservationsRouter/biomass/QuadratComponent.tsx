import React from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import { selectAdHocObservationResults } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import strings from 'src/strings';
import {
  ObservationMonitoringPlotPosition,
  ObservationMonitoringPlotResultsPayload,
  getQuadratLabel,
} from 'src/types/Observations';

import QuadratSpeciesEditableTable from './QuadratSpeciesEditableTable';

type QuadratComponentProps = {
  position: ObservationMonitoringPlotPosition;
  monitoringPlot?: ObservationMonitoringPlotResultsPayload;
  reload: () => void;
};

const QuadratComponent = ({ position, monitoringPlot, reload }: QuadratComponentProps) => {
  const theme = useTheme();
  const { observationId } = useParams<{ observationId: string }>();
  const allAdHocObservationResults = useAppSelector(selectAdHocObservationResults);

  const observation = allAdHocObservationResults?.find(
    (obsResult) => obsResult?.observationId.toString() === observationId?.toString()
  );
  const biomassMeasurements = observation?.biomassMeasurements;

  return (
    <Box>
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt} paddingBottom={2}>
        {getQuadratLabel(position)}
      </Typography>
      <Box display={'flex'}>
        <MonitoringPlotPhotos
          observationId={Number(observationId)}
          monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
          photos={monitoringPlot?.photos
            ?.filter((photo) => photo.type === 'Quadrat' && photo.position === position)
            ?.filter((pic, index) => index === 0)}
        />
        <Box>
          <Typography fontSize='14px' lineHeight='28px' fontWeight={400} color={theme.palette.TwClrTxt}>
            {strings.DESCRIPTION_NOTES}
          </Typography>
          <Typography fontSize='16px' lineHeight='24px' fontWeight={500} color={theme.palette.TwClrTxt}>
            {biomassMeasurements?.quadrats.find((quad) => quad.position === position)?.description}
          </Typography>
        </Box>
      </Box>
      {position && (
        <QuadratSpeciesEditableTable
          species={biomassMeasurements?.quadrats.find((quad) => quad.position === position)?.species}
          position={position}
          observationId={Number(observationId)}
          plotId={Number(monitoringPlot?.monitoringPlotId)}
          reload={reload}
        />
      )}
    </Box>
  );
};

export default QuadratComponent;
