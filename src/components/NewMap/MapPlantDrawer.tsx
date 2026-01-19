import React, { type JSX, useCallback, useMemo } from 'react';

import { Box } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { RecordedPlant } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type MapPlantDrawerProps = {
  monitoringPlotId: number;
  observationId: number;
  plant: RecordedPlant;
};

const MapPlantDrawer = ({ monitoringPlotId, observationId, plant }: MapPlantDrawerProps): JSX.Element | undefined => {
  const { activeLocale, strings } = useLocalization();

  const { format } = useNumberFormatter(activeLocale);
  const { data } = useGetObservationResultsQuery({ observationId, includePlants: true });

  const { species } = useSpeciesData();

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

  const plantStatus = useMemo(() => {
    switch (plant.status) {
      case 'Live':
        return strings.LIVE;
      case 'Dead':
        return strings.DEAD;
      case 'Existing':
        return strings.EXISTING;
    }
  }, [plant.status, strings]);

  const plantSpecies = useMemo(() => {
    if (plant.speciesId) {
      return species.find((_species) => _species.id === plant.speciesId)?.scientificName ?? strings.UNKNOWN;
    } else {
      return plant.speciesName ?? strings.UNKNOWN;
    }
  }, [plant.speciesId, plant.speciesName, species, strings.UNKNOWN]);

  const rows = useMemo((): MapDrawerTableRow[] => {
    if (result) {
      return [
        {
          key: strings.ACTIVITY_TYPE,
          value: strings.PLANTS,
        },
        {
          key: strings.STATUS,
          value: plantStatus,
        },
        {
          key: strings.SPECIES,
          value: plantSpecies,
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
          key: strings.LOCATION,
          value: formatGPS(plant.gpsCoordinates.coordinates[0], plant.gpsCoordinates.coordinates[1]),
        },
      ];
    } else {
      return [];
    }
  }, [
    activeLocale,
    formatGPS,
    observationUrl,
    observer,
    plant.gpsCoordinates.coordinates,
    plantSpecies,
    plantStatus,
    result,
    strings,
  ]);

  return (
    <Box display={'flex'} flexDirection={'column'} width={'100%'}>
      <MapDrawerTable rows={rows} />
    </Box>
  );
};

export default MapPlantDrawer;
