import getDateDisplayValue from '@terraware/web-components/utils/date';

import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ObservationResults, getPlotStatus } from 'src/types/Observations';
import { makeCsv } from 'src/utils/csv';
import downloadZipFile from 'src/utils/downloadZipFile';

interface UseExportObservationResultsParams {
  observationResults: ObservationResults;
}

function makeObservationCsv(observationResults: ObservationResults): Blob {
  const columnHeaders = [
    {
      key: 'monitoringPlotNumber',
      displayLabel: strings.MONITORING_PLOT,
    },
    {
      key: 'stratumName',
      displayLabel: strings.STRATUM,
    },
    {
      key: 'substratumName',
      displayLabel: strings.SUBSTRATUM,
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

  const data = observationResults.strata.flatMap((stratum) =>
    stratum.substrata.flatMap((substratum) =>
      substratum.monitoringPlots.map((monitoringPlot) => {
        const allSpecies = monitoringPlot.unknownSpecies
          ? [...monitoringPlot.species, monitoringPlot.unknownSpecies]
          : monitoringPlot.species;
        const [totalDead, totalExisting, totalLive] = allSpecies.reduce(
          (acc, species) => [acc[0] + species.totalDead, acc[1] + species.totalExisting, acc[2] + species.totalLive],
          [0, 0, 0]
        );

        const pathPattern = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS;
        const detailsLink = new URL(
          pathPattern
            .replace(':plantingSiteId', observationResults.plantingSiteId.toString())
            .replace(':observationId', observationResults.observationId.toString())
            .replace(':stratumName', encodeURIComponent(stratum.name))
            .replace(':monitoringPlotId', monitoringPlot.monitoringPlotId.toString()),
          location.href
        ).toString();

        const dateObserved = monitoringPlot.completedTime
          ? getDateDisplayValue(monitoringPlot.completedTime, observationResults.timeZone)
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
          substratumName: substratum.name,
          survivalRate: monitoringPlot.survivalRate,
          totalDead,
          totalExisting,
          totalLive,
          totalPlants: totalDead + totalExisting + totalLive,
          totalSpecies: monitoringPlot.totalSpecies,
          stratumName: stratum.name,
        };
      })
    )
  );

  return makeCsv(columnHeaders, data);
}

function makePlotSpeciesCsv(observationResults: ObservationResults): Blob {
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

  const scientificNamesById: { [key: number]: string } = Object.fromEntries(
    observationResults.species
      .filter((species) => species.speciesId)
      .map((species) => [species.speciesId!, species.speciesScientificName])
  );

  const data = observationResults.strata.flatMap((stratum) =>
    stratum.substrata.flatMap((substratum) =>
      substratum.monitoringPlots.flatMap((monitoringPlot) => {
        const allSpecies = monitoringPlot.unknownSpecies
          ? [...monitoringPlot.species, monitoringPlot.unknownSpecies]
          : monitoringPlot.species;
        return allSpecies.map((species) => {
          let speciesName: string;
          if (species.speciesId) {
            speciesName = scientificNamesById[species.speciesId];
          } else if (species.speciesName) {
            speciesName = strings.formatString(strings.OTHER_VALUE, species.speciesName) as string;
          } else {
            speciesName = strings.UNKNOWN;
          }

          return {
            monitoringPlot: monitoringPlot.monitoringPlotNumber,
            scientificName: speciesName,
            totalPlants: species.totalDead + species.totalExisting + species.totalLive,
            preExistingPlants: species.totalExisting,
            livePlants: species.totalLive,
            deadPlants: species.totalDead,
          };
        });
      })
    )
  );

  return makeCsv(columnHeaders, data);
}

export default function exportObservationResults(params: UseExportObservationResultsParams) {
  const { observationResults } = params;
  const prefix = `${observationResults.plantingSiteName}-${observationResults.completedDate}`;
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
}
