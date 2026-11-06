import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouterV2/SingleView/MonitoringPlotPhotos';
import { ObservationMonitoringPlotPosition, getQuadratLabel } from 'src/types/Observations';

import QuadratSpeciesEditableTable from './QuadratSpeciesEditableTable';
import useBiomassPlot from './useBiomassPlot';

type QuadratComponentProps = {
  position: ObservationMonitoringPlotPosition;
};

const QuadratComponent = ({ position }: QuadratComponentProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const { biomassMeasurement: biomassMeasurements, monitoringPlot, observationId } = useBiomassPlot();

  return (
    <Box>
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt} paddingBottom={2}>
        {getQuadratLabel(position, strings)}
      </Typography>
      <Box display={'flex'}>
        <MonitoringPlotPhotos
          observationId={observationId}
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
          editable={true}
          species={biomassMeasurements?.quadrats.find((quad) => quad.position === position)?.species}
          position={position}
        />
      )}
    </Box>
  );
};

export default QuadratComponent;
