import React, { type JSX, useCallback, useMemo } from 'react';

import { Box } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useBoolean from 'src/hooks/useBoolean';
import { useLocalization } from 'src/providers';
import { ObservationSplatPayload, useGetObservationResultsQuery } from 'src/queries/generated/observations';
import VirtualPlotModal from 'src/scenes/ObservationsRouterV2/SingleView/PlantMonitoring/MonitoringPlot/VirtualPlotModal';
import { ObservationMonitoringPlotPhotoWithGps } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

const PHOTO_URL = '/api/v1/tracking/observations/:observationId/plots/:monitoringPlotId/photos/:fileId';

type MapPhotoDrawerProps = {
  monitoringPlotId: number;
  observationId: number;
  photo?: ObservationMonitoringPlotPhotoWithGps;
  splat?: ObservationSplatPayload;
};

const MapPhotoDrawer = ({
  monitoringPlotId,
  observationId,
  photo,
  splat,
}: MapPhotoDrawerProps): JSX.Element | undefined => {
  const { activeLocale, strings } = useLocalization();

  const { format } = useNumberFormatter();
  const { data } = useGetObservationResultsQuery({ observationId });
  const [virtualPlotOpen, , setVirtualPlotOpenTrue, setVirtualPlotOpenFalse] = useBoolean(false);

  const photoUrl = useMemo(() => {
    if (!photo) {
      return undefined;
    }
    return PHOTO_URL.replace(':observationId', `${observationId}`)
      .replace(':monitoringPlotId', `${monitoringPlotId}`)
      .replace(':fileId', `${photo.fileId}`);
  }, [observationId, monitoringPlotId, photo]);

  const result = useMemo(() => {
    return data?.observation;
  }, [data?.observation]);

  const observationUrl = useMemo(() => {
    if (result) {
      return APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', `${result.plantingSiteId}`).replace(
        ':observationId',
        `${result.observationId}`
      );
    }
  }, [result]);

  const monitoringPlot = useMemo(() => {
    const monitoringPlots =
      result?.strata.flatMap((stratum) => stratum.substrata).flatMap((substratum) => substratum.monitoringPlots) ?? [];
    const adHocPlots = result?.adHocPlot ? [result.adHocPlot] : [];

    return [...monitoringPlots, ...adHocPlots].find((plot) => plot.monitoringPlotId === monitoringPlotId);
  }, [monitoringPlotId, result?.adHocPlot, result?.strata]);

  const observer = useMemo(() => {
    return monitoringPlot?.claimedByName;
  }, [monitoringPlot?.claimedByName]);

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
    if (result && photo) {
      const stratum = result.strata.find((_stratum) =>
        _stratum.substrata.some((substratum) =>
          substratum.monitoringPlots.some((plot) => plot.monitoringPlotId === monitoringPlotId)
        )
      );
      return [
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
          key: strings.STRATUM,
          value: stratum?.name ?? '',
        },
        {
          key: strings.LOCATION,
          value: formatGPS(photo.gpsCoordinates.coordinates[0], photo.gpsCoordinates.coordinates[1]),
        },
      ];
    } else if (result && splat && monitoringPlot) {
      return [
        {
          key: strings.PLOT_TYPE,
          value: strings.VIRTUAL,
        },
        {
          key: strings.STATUS,
          value: monitoringPlot.status,
        },
        {
          key: strings.PLANTS,
          value: monitoringPlot.totalPlants.toString(),
        },
        {
          key: strings.SPECIES,
          value: monitoringPlot.totalSpecies.toString(),
        },
        {
          key: strings.PLANTING_DENSITY,
          value: `${format(monitoringPlot.plantingDensity)} ${strings.PLANTS_PER_HA}`,
        },
        ...(monitoringPlot.survivalRate !== undefined
          ? [
              {
                key: strings.SURVIVAL_RATE,
                value: `${format(monitoringPlot.survivalRate)}%`,
              },
            ]
          : []),
      ];
    } else {
      return [];
    }
  }, [
    activeLocale,
    format,
    formatGPS,
    monitoringPlot,
    monitoringPlotId,
    observationUrl,
    observer,
    photo,
    result,
    splat,
    strings,
  ]);

  if (photo && photoUrl) {
    return (
      <Box display={'flex'} flexDirection={'column'} width={'100%'}>
        <img src={`${photoUrl}?maxWidth=377`} />
        <MapDrawerTable rows={rows} />
      </Box>
    );
  } else if (splat) {
    return (
      <>
        {virtualPlotOpen && monitoringPlotId && (
          <VirtualPlotModal observationId={observationId} fileId={splat.fileId} onClose={setVirtualPlotOpenFalse} />
        )}
        <Box display={'flex'} flexDirection={'column'} width={'100%'} gap={2}>
          <MapDrawerTable rows={rows} />
          {/* TODO: render a preview image  */}
          <Button
            id='visit-virtual-plot'
            label={strings.VISIT_VIRTUAL_PLOT}
            onClick={setVirtualPlotOpenTrue}
            priority='primary'
            size='medium'
          />
        </Box>
      </>
    );
  }

  return undefined;
};

export default MapPhotoDrawer;
