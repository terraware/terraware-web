import React from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import { selectAdHocObservationResults } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

import QuadratSpeciesEditableTable from './QuadratSpeciesEditableTable';

type QuadratPosition = 'NorthwestCorner' | 'NortheastCorner' | 'SouthwestCorner' | 'SoutheastCorner';

type QuadratConfig = {
  position: QuadratPosition;
  title: string;
};

const QUADRAT_CONFIG: Record<string, QuadratConfig> = {
  Northwest: { position: 'NorthwestCorner', title: strings.PHOTO_NORTHWEST_QUADRAT },
  Northeast: { position: 'NortheastCorner', title: strings.PHOTO_NORTHEAST_QUADRAT },
  Southwest: { position: 'SouthwestCorner', title: strings.PHOTO_SOUTHWEST_QUADRAT },
  Southeast: { position: 'SoutheastCorner', title: strings.PHOTO_SOUTHEAST_QUADRAT },
};

type QuadratComponentProps = {
  quadrat: string;
  monitoringPlot?: ObservationMonitoringPlotResultsPayload;
  reload: () => void;
};

const QuadratComponent = ({ quadrat, monitoringPlot, reload }: QuadratComponentProps) => {
  const theme = useTheme();
  const { observationId } = useParams<{ observationId: string }>();
  const allAdHocObservationResults = useAppSelector(selectAdHocObservationResults);

  const observation = allAdHocObservationResults?.find(
    (obsResult) => obsResult?.observationId.toString() === observationId?.toString()
  );
  const biomassMeasurements = observation?.biomassMeasurements;

  const config = QUADRAT_CONFIG[quadrat];
  if (!config) {
    return null;
  }

  const { position, title } = config;

  return (
    <Box>
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
        {title}
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
      <QuadratSpeciesEditableTable
        species={biomassMeasurements?.quadrats.find((quad) => quad.position === position)?.species}
        quadrat={position}
        observationId={Number(observationId)}
        plotId={Number(monitoringPlot?.monitoringPlotId)}
        reload={reload}
      />
    </Box>
  );
};

export default QuadratComponent;
