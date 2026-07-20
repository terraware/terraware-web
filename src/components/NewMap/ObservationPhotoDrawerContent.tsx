import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import Button from 'src/components/common/button/Button';
import { API_PATHS, APP_PATHS } from 'src/constants';
import useBoolean from 'src/hooks/useBoolean';
import useOrganizationFeatures from 'src/hooks/useOrganizationFeatures';
import { useLocalization } from 'src/providers';
import { ObservationSplatPayload } from 'src/queries/generated/observationSplats';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import VirtualPlotData from 'src/scenes/ObservationsRouterV2/SingleView/PlantMonitoring/MonitoringPlot/VirtualPlotData';
import VirtualWalkthroughModal from 'src/scenes/VirtualWalkthrough/VirtualWalkthroughModal';
import { ObservationMonitoringPlotPhotoWithGps } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import MapPhotoDrawer from './MapPhotoDrawer';
import { useFormatGPS } from './useFormatGPS';

type ObservationPhotoDrawerContentProps = {
  monitoringPlotId: number;
  observationId: number;
  photo?: ObservationMonitoringPlotPhotoWithGps;
  splat?: ObservationSplatPayload;
};

const ObservationPhotoDrawerContent = ({
  monitoringPlotId,
  observationId,
  photo,
  splat,
}: ObservationPhotoDrawerContentProps): JSX.Element | null => {
  const { activeLocale, strings } = useLocalization();

  const { format } = useNumberFormatter();
  const { data } = useGetObservationResultsQuery({ observationId });
  const [virtualWalkthroughOpen, setVirtualWalkthroughOpen] = useBoolean(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const orgFeatures = useOrganizationFeatures();
  const isVirtualPlotsEnabled = !!orgFeatures?.virtualWalkthrough?.enabled;
  const formatGPS = useFormatGPS();

  const photoUrl = useMemo(() => {
    if (!photo) {
      return undefined;
    }
    return API_PATHS.OBSERVATION_PLOT_PHOTO.replace('{observationId}', String(observationId))
      .replace('{monitoringPlotId}', String(monitoringPlotId))
      .replace('{fileId}', String(photo.fileId));
  }, [observationId, monitoringPlotId, photo]);

  const result = useMemo(() => {
    return data?.observation;
  }, [data?.observation]);

  const observationUrl = useMemo(() => {
    if (result) {
      return APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', `${result.observationId}`);
    }
  }, [result]);

  const resultAdHocPlot = result?.adHocPlot;
  const resultStrata = result?.strata;

  const monitoringPlot = useMemo(() => {
    const monitoringPlots =
      resultStrata?.flatMap((stratum) => stratum.substrata).flatMap((substratum) => substratum.monitoringPlots) ?? [];
    const adHocPlots = resultAdHocPlot ? [resultAdHocPlot] : [];

    return [...monitoringPlots, ...adHocPlots].find((plot) => plot.monitoringPlotId === monitoringPlotId);
  }, [monitoringPlotId, resultAdHocPlot, resultStrata]);

  const monitoringPlotClaimedByName = monitoringPlot?.claimedByName;

  const observer = useMemo(() => {
    return monitoringPlotClaimedByName;
  }, [monitoringPlotClaimedByName]);

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
          value: monitoringPlot.totalPlants !== undefined ? monitoringPlot.totalPlants.toString() : '',
        },
        {
          key: strings.SPECIES,
          value: monitoringPlot.totalSpecies !== undefined ? monitoringPlot.totalSpecies.toString() : '',
        },
        {
          key: strings.PLANT_DENSITY,
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

  const virtualWalkthroughParamValue = searchParams.get('virtualWalkthrough');

  useEffect(() => {
    const shouldBeOpen =
      virtualWalkthroughParamValue &&
      isVirtualPlotsEnabled &&
      Boolean(splat && result && monitoringPlot) &&
      Number(virtualWalkthroughParamValue) === splat?.fileId;

    if (shouldBeOpen && !virtualWalkthroughOpen) {
      setVirtualWalkthroughOpen(true);
    } else if (!shouldBeOpen && virtualWalkthroughOpen) {
      setVirtualWalkthroughOpen(false);
    }
  }, [
    virtualWalkthroughParamValue,
    monitoringPlotId,
    splat,
    result,
    monitoringPlot,
    virtualWalkthroughOpen,
    setVirtualWalkthroughOpen,
    isVirtualPlotsEnabled,
  ]);

  const handleOpenVirtualWalkthrough = useCallback(() => {
    if (splat) {
      const params = new URLSearchParams(searchParams);
      params.set('virtualWalkthrough', splat.fileId.toString());
      setSearchParams(params, { replace: true });
    }
  }, [splat, searchParams, setSearchParams]);

  const handleCloseVirtualWalkthrough = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('virtualWalkthrough');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  if (photo && photoUrl) {
    return <MapPhotoDrawer imageUrl={photoUrl} rows={rows} />;
  }

  if (splat) {
    return (
      <>
        {virtualWalkthroughOpen && result && monitoringPlot && (
          <VirtualWalkthroughModal
            observationId={observationId}
            fileId={splat.fileId}
            editable={true}
            onClose={handleCloseVirtualWalkthrough}
            belowComponent={<VirtualPlotData monitoringPlot={monitoringPlot} plantingSiteId={result.plantingSiteId} />}
          />
        )}
        <MapPhotoDrawer tableHeader={monitoringPlot?.monitoringPlotNumber?.toString()} rows={rows}>
          {/* TODO: render a preview image  */}
          <Button
            id='visit-virtual-plot'
            label={strings.VISIT_VIRTUAL_PLOT}
            onClick={handleOpenVirtualWalkthrough}
            priority='primary'
            size='medium'
          />
        </MapPhotoDrawer>
      </>
    );
  }

  return null;
};

export default ObservationPhotoDrawerContent;
