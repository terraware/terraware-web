import getDateDisplayValue from '@terraware/web-components/utils/date';
import { asBlob, generateCsv, mkConfig } from 'export-to-csv';
import { AcceptedData, ColumnHeader } from 'export-to-csv/output/lib/types';

import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ObservationResults, getPlotStatus } from 'src/types/Observations';
import downloadZipFile from 'src/utils/downloadZipFile';

interface UseExportObservationResultsParams {
  observationResults: ObservationResults;
}

function makeCsv(columns: ColumnHeader[], data: { [k: string]: AcceptedData }[]): Blob {
  const csvConfig = mkConfig({ columnHeaders: columns });
  const csv = generateCsv(csvConfig)(data);
  return asBlob(csvConfig)(csv);
}

function makeObservationCsv(observationResults: ObservationResults): Blob {
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
      displayLabel: strings.PLANTING_DENSITY,
    },
    {
      key: 'mortalityRate',
      displayLabel: strings.CUMULATIVE_MORTALITY_RATE,
    },
    {
      key: 'detailsLink',
      displayLabel: strings.LINK_TO_PLOT_OBSERVATION_DETAILS,
    },
  ];

  const data = observationResults.plantingZones.flatMap((plantingZone) =>
    plantingZone.plantingSubzones.flatMap((subzone) =>
      subzone.monitoringPlots.map((monitoringPlot) => {
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
            .replace(':plantingZoneName', encodeURIComponent(plantingZone.name))
            .replace(':monitoringPlotId', monitoringPlot.monitoringPlotId.toString()),
          location.href
        ).toString();

        const dateObserved = monitoringPlot.completedTime
          ? getDateDisplayValue(monitoringPlot.completedTime, observationResults.timeZone)
          : '';

        return {
          dateObserved,
          detailsLink,
          monitoringPlotNumber: monitoringPlot.monitoringPlotNumber,
          mortalityRate: monitoringPlot.mortalityRate,
          plantingDensity: monitoringPlot.plantingDensity,
          plotType: monitoringPlot.isPermanent ? strings.PERMANENT : strings.TEMPORARY,
          status: getPlotStatus(monitoringPlot.status),
          subzoneName: subzone.name,
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

  const data = observationResults.plantingZones.flatMap((plantingZone) =>
    plantingZone.plantingSubzones.flatMap((subzone) =>
      subzone.monitoringPlots.flatMap((monitoringPlot) => {
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
