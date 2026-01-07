import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import { ObservationMonitoringPlotPosition, getQuadratLabel } from 'src/types/Observations';

import QuadratSpeciesEditableTable from './QuadratSpeciesEditableTable';

type QuadratComponentProps = {
  position: ObservationMonitoringPlotPosition;
};

const QuadratComponent = ({ position }: QuadratComponentProps) => {
  const theme = useTheme();
  const params = useParams<{ observationId: string }>();
  const { strings } = useLocalization();
  const isEditObservationsEnabled = isEnabled('Edit Observations');

  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const monitoringPlot = useMemo(() => results?.adHocPlot, [results?.adHocPlot]);
  const biomassMeasurements = useMemo(() => results?.biomassMeasurements, [results?.biomassMeasurements]);

  return (
    <Box>
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt} paddingBottom={2}>
        {getQuadratLabel(position)}
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
          editable={isEditObservationsEnabled}
          species={biomassMeasurements?.quadrats.find((quad) => quad.position === position)?.species}
          position={position}
        />
      )}
    </Box>
  );
};

export default QuadratComponent;
