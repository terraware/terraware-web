import { useCallback, useMemo } from 'react';

import { getDateDisplayValue } from '@terraware/web-components/utils';
import sanitize from 'sanitize-filename';

import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useLazyExportObservationCsvQuery, useLazyExportObservationGpxQuery } from 'src/queries/exports/observations';
import { ObservationResultsPayload, useLazyGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { getPlotStatus } from 'src/types/Observations';
import { makeCsv } from 'src/utils/csv';
import downloadZipFile from 'src/utils/downloadZipFile';

const useObservationExports = (timezoneId?: string) => {
  const { strings } = useLocalization();
  const [getObservationResults] = useLazyGetObservationResultsQuery();
  const [exportObservationCsv] = useLazyExportObservationCsvQuery();
  const [exportObservationGpx] = useLazyExportObservationGpxQuery();
  const [getPlantingSite] = useLazyGetPlantingSiteQuery();

  const { species } = useSpeciesData();

  const scientificNamesById = useMemo(
    () =>
      species.reduce(
        (speciesData, nextSpecies) => {
          speciesData[nextSpecies.id] = nextSpecies.scientificName;
          return speciesData;
        },
        {} as { [id: number]: string }
      ),
    [species]
  );

  const makeObservationCsv = useCallback(
    (observationResults: ObservationResultsPayload) => {
      const columnHeaders = [
        {
          key: 'monitoringPlotNumber',
          displayLabel: strings.MONITORING_PLOT,
        },
        {
          key: 'zoneName',
          displayLabel: strings.ZONE,
        },
        {
          key: 'subzoneName',
          displayLabel: strings.SUBZONE,
        },
        {
          key: 'dateObserved',
          displayLabel: strings.DATE_OBSERVED,
        },
        {
          key: 'status',
          displayLabel: strings.STATUS,
        },
        {
          key: 'plotType',
          displayLabel: strings.MONITORING_PLOT_TYPE,
        },
        {
          key: 'southwestLatitude',
          displayLabel: strings.SOUTHWEST_CORNER_LATITUDE,
        },
        {
          key: 'southwestLongitude',
          displayLabel: strings.SOUTHWEST_CORNER_LONGITUDE,
        },
        {
          key: 'northwestLatitude',
          displayLabel: strings.NORTHWEST_CORNER_LATITUDE,
        },
        {
          key: 'northwestLongitude',
          displayLabel: strings.NORTHWEST_CORNER_LONGITUDE,
        },
        {
          key: 'southeastLatitude',
          displayLabel: strings.SOUTHEAST_CORNER_LATITUDE,
        },
        {
          key: 'southeastLongitude',
          displayLabel: strings.SOUTHEAST_CORNER_LONGITUDE,
        },
        {
          key: 'northeastLatitude',
          displayLabel: strings.NORTHEAST_CORNER_LATITUDE,
        },
        {
          key: 'northeastLongitude',
          displayLabel: strings.NORTHEAST_CORNER_LONGITUDE,
        },
        {
          key: 'totalPlants',
          displayLabel: strings.TOTAL_PLANTS_OBSERVED,
        },
        {
          key: 'totalExisting',
          displayLabel: strings.PREEXISTING_PLANTS_OBSERVED,
        },
        {
          key: 'totalLive',
          displayLabel: strings.LIVE_PLANTS_OBSERVED,
        },
        {
          key: 'totalDead',
          displayLabel: strings.DEAD_PLANTS_OBSERVED,
        },
        {
          key: 'totalSpecies',
          displayLabel: strings.TOTAL_SPECIES_OBSERVED,
        },
        {
          key: 'plantingDensity',
          displayLabel: strings.PLANT_DENSITY,
        },
        {
          key: 'survivalRate',
          displayLabel: strings.SURVIVAL_RATE,
        },
        {
          key: 'detailsLink',
          displayLabel: strings.LINK_TO_PLOT_OBSERVATION_DETAILS,
        },
      ];

      const data = observationResults.strata.flatMap((plantingZone) =>
        plantingZone.substrata.flatMap((subzone) =>
          subzone.monitoringPlots.map((monitoringPlot) => {
            const allSpecies = monitoringPlot.unknownSpecies
              ? [...monitoringPlot.species, monitoringPlot.unknownSpecies]
              : monitoringPlot.species;
            const [totalDead, totalExisting, totalLive] = allSpecies.reduce(
              (acc, observedSpecies) => [
                acc[0] + observedSpecies.totalDead,
                acc[1] + observedSpecies.totalExisting,
                acc[2] + observedSpecies.totalLive,
              ],
              [0, 0, 0]
            );

            const pathPattern = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS;
            const detailsLink = new URL(
              pathPattern
                .replace(':plantingSiteId', observationResults.plantingSiteId.toString())
                .replace(':observationId', observationResults.observationId.toString())
                .replace(':plantingZoneName', encodeURIComponent(plantingZone.name))
                .replace(':monitoringPlotId', monitoringPlot.monitoringPlotId.toString()),
              location.href
            ).toString();

            const dateObserved = monitoringPlot.completedTime
              ? getDateDisplayValue(monitoringPlot.completedTime, timezoneId)
              : '';

            // Plot polygon has a single ring of coordinates. They're in order SW-SE-NE-NW-SW, with
            // longitude first in each coordinate pair.
            const plotCoordinates: number[][] = monitoringPlot.boundary.coordinates[0];

            return {
              dateObserved,
              detailsLink,
              northeastLatitude: plotCoordinates[2][1],
              northeastLongitude: plotCoordinates[2][0],
              northwestLatitude: plotCoordinates[3][1],
              northwestLongitude: plotCoordinates[3][0],
              monitoringPlotNumber: monitoringPlot.monitoringPlotNumber,
              plantingDensity: monitoringPlot.plantingDensity,
              plotType: monitoringPlot.isPermanent ? strings.PERMANENT : strings.TEMPORARY,
              southeastLatitude: plotCoordinates[1][1],
              southeastLongitude: plotCoordinates[1][0],
              southwestLatitude: plotCoordinates[0][1],
              southwestLongitude: plotCoordinates[0][0],
              status: getPlotStatus(monitoringPlot.status),
              subzoneName: subzone.name,
              survivalRate: monitoringPlot.survivalRate,
              totalDead,
              totalExisting,
              totalLive,
              totalPlants: totalDead + totalExisting + totalLive,
              totalSpecies: monitoringPlot.totalSpecies,
              zoneName: plantingZone.name,
            };
          })
        )
      );

      return makeCsv(columnHeaders, data);
    },
    [
      strings.DATE_OBSERVED,
      strings.DEAD_PLANTS_OBSERVED,
      strings.LINK_TO_PLOT_OBSERVATION_DETAILS,
      strings.LIVE_PLANTS_OBSERVED,
      strings.MONITORING_PLOT,
      strings.MONITORING_PLOT_TYPE,
      strings.NORTHEAST_CORNER_LATITUDE,
      strings.NORTHEAST_CORNER_LONGITUDE,
      strings.NORTHWEST_CORNER_LATITUDE,
      strings.NORTHWEST_CORNER_LONGITUDE,
      strings.PERMANENT,
      strings.PLANT_DENSITY,
      strings.PREEXISTING_PLANTS_OBSERVED,
      strings.SOUTHEAST_CORNER_LATITUDE,
      strings.SOUTHEAST_CORNER_LONGITUDE,
      strings.SOUTHWEST_CORNER_LATITUDE,
      strings.SOUTHWEST_CORNER_LONGITUDE,
      strings.STATUS,
      strings.SUBZONE,
      strings.SURVIVAL_RATE,
      strings.TEMPORARY,
      strings.TOTAL_PLANTS_OBSERVED,
      strings.TOTAL_SPECIES_OBSERVED,
      strings.ZONE,
      timezoneId,
    ]
  );

  const makePlotSpeciesCsv = useCallback(
    (observationResults: ObservationResultsPayload): Blob => {
      const columnHeaders = [
        {
          key: 'monitoringPlot',
          displayLabel: strings.MONITORING_PLOT,
        },
        {
          key: 'scientificName',
          displayLabel: strings.SPECIES_SCIENTIFIC_NAME,
        },
        {
          key: 'totalPlants',
          displayLabel: strings.TOTAL_PLANTS_OBSERVED,
        },
        {
          key: 'preExistingPlants',
          displayLabel: strings.PREEXISTING_PLANTS_OBSERVED,
        },
        {
          key: 'livePlants',
          displayLabel: strings.LIVE_PLANTS_OBSERVED,
        },
        {
          key: 'deadPlants',
          displayLabel: strings.DEAD_PLANTS_OBSERVED,
        },
      ];

      const data = observationResults.strata.flatMap((plantingZone) =>
        plantingZone.substrata.flatMap((subzone) =>
          subzone.monitoringPlots.flatMap((monitoringPlot) => {
            const allSpecies = monitoringPlot.unknownSpecies
              ? [...monitoringPlot.species, monitoringPlot.unknownSpecies]
              : monitoringPlot.species;
            return allSpecies.map((observedSpecies) => {
              let speciesName: string;
              if (observedSpecies.speciesId) {
                speciesName = scientificNamesById[observedSpecies.speciesId];
              } else if (observedSpecies.speciesName) {
                speciesName = strings.formatString(strings.OTHER_VALUE, observedSpecies.speciesName) as string;
              } else {
                speciesName = strings.UNKNOWN;
              }

              return {
                monitoringPlot: monitoringPlot.monitoringPlotNumber,
                scientificName: speciesName,
                totalPlants: observedSpecies.totalDead + observedSpecies.totalExisting + observedSpecies.totalLive,
                preExistingPlants: observedSpecies.totalExisting,
                livePlants: observedSpecies.totalLive,
                deadPlants: observedSpecies.totalDead,
              };
            });
          })
        )
      );

      return makeCsv(columnHeaders, data);
    },
    [scientificNamesById, strings]
  );

  const downloadObservationResults = useCallback(
    async (observationId: number) => {
      const results = await getObservationResults({ observationId, includePlants: true }, true).unwrap();
      const observationResults = results.observation;

      const siteResults = await getPlantingSite(observationResults.plantingSiteId, true).unwrap();
      const site = siteResults.site;

      const completedDate = observationResults.completedTime
        ? getDateDisplayValue(observationResults.completedTime, timezoneId)
        : strings.INCOMPLETE;

      const prefix = `${site.name}-${completedDate}`;
      const dirName = `${prefix}-${strings.OBSERVATION}`;

      return downloadZipFile({
        dirName,
        files: [
          {
            fileName: dirName,
            content: makeObservationCsv(observationResults),
          },
          {
            fileName: `${prefix}-${strings.SPECIES}`,
            content: makePlotSpeciesCsv(observationResults),
          },
        ],
        suffix: '.csv',
      });
    },
    [
      getObservationResults,
      getPlantingSite,
      makeObservationCsv,
      makePlotSpeciesCsv,
      strings.INCOMPLETE,
      strings.OBSERVATION,
      strings.SPECIES,
      timezoneId,
    ]
  );

  const downloadObservationCsv = useCallback(
    async (observationId: number) => {
      const content = await exportObservationCsv(observationId, true).unwrap();
      const results = await getObservationResults({ observationId, includePlants: true }, true).unwrap();
      const observationResults = results.observation;

      const siteResults = await getPlantingSite(observationResults.plantingSiteId, true).unwrap();
      const site = siteResults.site;

      const completedDate = observationResults.completedTime
        ? getDateDisplayValue(observationResults.completedTime, timezoneId)
        : strings.INCOMPLETE;

      const sanitizedSiteName = sanitize(site.name);
      const fileName = `${sanitizedSiteName}-${completedDate}.csv`;
      const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);

      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', fileName);
      link.click();
    },
    [exportObservationCsv, getObservationResults, getPlantingSite, strings.INCOMPLETE, timezoneId]
  );

  const downloadObservationGpx = useCallback(
    async (observationId: number) => {
      const content = await exportObservationGpx(observationId, true).unwrap();
      const results = await getObservationResults({ observationId, includePlants: true }, true).unwrap();
      const observationResults = results.observation;

      const siteResults = await getPlantingSite(observationResults.plantingSiteId, true).unwrap();
      const site = siteResults.site;

      const completedDate = observationResults.completedTime
        ? getDateDisplayValue(observationResults.completedTime, timezoneId)
        : strings.INCOMPLETE;

      const sanitizedSiteName = sanitize(site.name);
      const fileName = `${sanitizedSiteName}-${completedDate}.gpx`;
      const encodedUri = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(content);

      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', fileName);
      link.click();
    },
    [exportObservationGpx, getObservationResults, getPlantingSite, strings.INCOMPLETE, timezoneId]
  );

  return {
    downloadObservationResults,
    downloadObservationCsv,
    downloadObservationGpx,
  };
};

export default useObservationExports;
