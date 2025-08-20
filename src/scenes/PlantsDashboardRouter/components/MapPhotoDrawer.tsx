import React, { useCallback, useMemo } from 'react';

import { Box } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { ObservationMonitoringPlotPhoto } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

const PHOTO_URL = '/api/v1/tracking/observations/:observationId/plots/:monitoringPlotId/photos/:fileId';

type MapPhotoDrawerProps = {
  monitoringPlotId: number;
  observationId: number;
  photo: ObservationMonitoringPlotPhoto;
};

const MapPhotoDrawer = ({ monitoringPlotId, observationId, photo }: MapPhotoDrawerProps): JSX.Element | undefined => {
  const { observationResults } = usePlantingSiteData();
  const { activeLocale, strings } = useLocalization();

  const { format } = useNumberFormatter(activeLocale);

  const photoUrl = useMemo(() => {
    return PHOTO_URL.replace(':observationId', `${observationId}`)
      .replace(':monitoringPlotId', `${monitoringPlotId}`)
      .replace(':fileId', `${photo.fileId}`);
  }, [observationId, monitoringPlotId, photo]);

  const result = useMemo(() => {
    return observationResults?.find((_result) => _result.observationId === observationId);
  }, [observationId, observationResults]);

  const observationUrl = useMemo(() => {
    if (result) {
      return APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', `${result.plantingSiteId}`).replace(
        ':observationId',
        `${result.observationId}`
      );
    }
  }, [result]);

  const observer = useMemo(() => {
    if (result) {
      return result.plantingZones
        .flatMap((zone) => zone.plantingSubzones)
        .flatMap((subzone) => subzone.monitoringPlots)
        .find((plot) => plot.monitoringPlotId === monitoringPlotId)?.claimedByName;
    }
  }, [monitoringPlotId, result]);

  const formatGPS = useCallback(
    (lon: number, lat: number): string => {
      const latHemisphere = lat >= 0 ? 'N' : 'S';
      const lonHemisphere = lon >= 0 ? 'E' : 'W';

      const latAbs = Math.abs(lat).toFixed(4);
      const lonAbs = Math.abs(lon).toFixed(4);

      const latFormatted = format(Number(latAbs));
      const lonFormatted = format(Number(lonAbs));

      return `${latFormatted}° ${latHemisphere}, ${lonFormatted}° ${lonHemisphere}`;
    },
    [format]
  );

  const rows = useMemo((): MapDrawerTableRow[] => {
    if (result) {
      const zone = result.plantingZones.find((_zone) =>
        _zone.plantingSubzones.some((subzone) =>
          subzone.monitoringPlots.some((plot) => plot.monitoringPlotId === monitoringPlotId)
        )
      );
      return [
        {
          key: strings.PHOTO_DATE_TIME,
          value: strings.UNKNOWN,
        },
        {
          key: strings.OBSERVATION_DATE,
          value: result.completedTime ? getShortDate(result.completedTime, activeLocale) : strings.UNKNOWN,
          url: observationUrl,
        },
        {
          key: strings.OBSERVER_NAME,
          value: observer ?? strings.UNKNOWN,
        },
        {
          key: strings.ZONE,
          value: zone?.name ?? '',
        },
        {
          key: strings.LOCATION,
          value: formatGPS(photo.gpsCoordinates.coordinates[0], photo.gpsCoordinates.coordinates[1]),
        },
      ];
    } else {
      return [];
    }
  }, [activeLocale, formatGPS, monitoringPlotId, observationUrl, observer, photo, result, strings]);

  return (
    <Box display={'flex'} flexDirection={'column'} width={'100%'}>
      <img src={`${photoUrl}?maxWidth=377`} />
      <MapDrawerTable rows={rows} />
    </Box>
  );
};

export default MapPhotoDrawer;
