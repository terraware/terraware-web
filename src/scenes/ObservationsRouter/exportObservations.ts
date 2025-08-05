import getDateDisplayValue from '@terraware/web-components/utils/date';
import { asBlob, generateCsv, mkConfig } from 'export-to-csv';
import { AcceptedData, ColumnHeader } from 'export-to-csv/output/lib/types';

import { getConditionString } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { AdHocObservationResults } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';
import downloadZipFile from 'src/utils/downloadZipFile';

interface ExportAdHocObservationsResultsParams {
  adHocObservationsResults: AdHocObservationResults[];
  selectedPlantingSite?: PlantingSite;
}

const makeCsv = (columns: ColumnHeader[], data: { [k: string]: AcceptedData }[]): Blob => {
  const csvConfig = mkConfig({ columnHeaders: columns });
  const csv = generateCsv(csvConfig)(data);
  return asBlob(csvConfig)(csv);
};

const makeAdHocObservationsResultsCsv = (adHocObservationsResults: AdHocObservationResults[]): Blob => {
  const columnHeaders = [
    {
      key: 'monitoringPlot',
      displayLabel: strings.MONITORING_PLOT,
    },
    {
      key: 'plantingSiteName',
      displayLabel: strings.PLANTING_SITE,
    },
    {
      key: 'startDate',
      displayLabel: strings.START_DATE,
    },
    {
      key: 'totalLive',
      displayLabel: strings.LIVE_PLANTS,
    },
    {
      key: 'totalPlants',
      displayLabel: strings.TOTAL_PLANTS,
    },
    {
      key: 'totalSpecies',
      displayLabel: strings.SPECIES,
    },
  ];

  const data = adHocObservationsResults.map((observation) => ({
    monitoringPlot: observation.plotNumber,
    plantingSiteName: observation.plantingSiteName,
    startDate: getDateDisplayValue(observation.startDate),
    totalLive: observation.totalLive,
    totalPlants: observation.totalPlants,
    totalSpecies: observation.totalSpecies,
  }));

  return makeCsv(columnHeaders, data);
};

const makeAdHocObservationCsv = ({
  adHocObservation,
  plantingSiteName,
}: {
  adHocObservation: AdHocObservationResults;
  plantingSiteName: string;
}): Blob => {
  if (!adHocObservation?.adHocPlot) {
    return new Blob([], { type: 'text/csv' });
  }

  const columnHeaders = [
    {
      key: 'monitoringPlotNumber',
      displayLabel: strings.MONITORING_PLOT,
    },
    {
      key: 'plantingSiteName',
      displayLabel: strings.PLANTING_SITE,
    },
    {
      key: 'completedTime',
      displayLabel: 'Plot Completed Time',
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
    {
      key: 'totalSpecies',
      displayLabel: strings.TOTAL_SPECIES_OBSERVED,
    },
    {
      key: 'conditions',
      displayLabel: strings.PLOT_CONDITIONS,
    },
    {
      key: 'notes',
      displayLabel: strings.FIELD_NOTES,
    },
  ];

  const aggregateSpeciesData = adHocObservation.adHocPlot.species.reduce(
    (acc, species) => {
      acc.cumulativeDead += species.totalDead || 0;
      acc.permanentLive += species.totalLive || 0;
      acc.totalPlants += species.totalPlants || 0;
      acc.totalExisting += species.totalExisting || 0;
      acc.totalLive += species.totalLive || 0;
      acc.totalDead += species.totalDead || 0;
      return acc;
    },
    {
      cumulativeDead: 0,
      permanentLive: 0,
      totalPlants: 0,
      totalExisting: 0,
      totalLive: 0,
      totalDead: 0,
    }
  );

  const plotBoundaryCoordinates = adHocObservation.adHocPlot.boundary.coordinates[0];

  const data = [
    {
      monitoringPlotNumber: adHocObservation.adHocPlot.monitoringPlotNumber,
      plantingSiteName,
      completedTime: adHocObservation.completedTime ? getDateDisplayValue(adHocObservation.completedTime) : '',
      southwestLatitude: plotBoundaryCoordinates[0][0],
      southwestLongitude: plotBoundaryCoordinates[0][1],
      northwestLatitude: plotBoundaryCoordinates[1][0],
      northwestLongitude: plotBoundaryCoordinates[1][1],
      southeastLatitude: plotBoundaryCoordinates[2][0],
      southeastLongitude: plotBoundaryCoordinates[2][1],
      northeastLatitude: plotBoundaryCoordinates[3][0],
      northeastLongitude: plotBoundaryCoordinates[3][1],
      totalPlants: adHocObservation.adHocPlot.totalPlants || 0,
      preExistingPlants: aggregateSpeciesData.totalExisting || 0,
      livePlants: aggregateSpeciesData.totalLive || 0,
      deadPlants: aggregateSpeciesData.totalDead || 0,
      totalSpecies: adHocObservation.adHocPlot.totalSpecies || 0,
      conditions:
        adHocObservation.adHocPlot?.conditions.map((condition) => getConditionString(condition)).join(', ') || '- -',
      notes: adHocObservation.adHocPlot?.notes || '',
    },
  ];

  return makeCsv(columnHeaders, data);
};

const makeAdHocObservationSpeciesCsv = ({ adHocObservation }: { adHocObservation: AdHocObservationResults }): Blob => {
  if (!adHocObservation?.adHocPlot) {
    return new Blob([], { type: 'text/csv' });
  }

  const columnHeaders = [
    {
      key: 'monitoringPlotNumber',
      displayLabel: strings.MONITORING_PLOT,
    },
    {
      key: 'speciesScientificName',
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

  const monitoringPlotNumber = adHocObservation.adHocPlot.monitoringPlotNumber;

  const data =
    adHocObservation.adHocPlot.species.map((species) => ({
      monitoringPlotNumber,
      speciesScientificName: species.speciesName,
      totalPlants: species.totalPlants,
      preExistingPlants: species.totalExisting,
      livePlants: species.totalLive,
      deadPlants: species.totalDead,
    })) || [];

  return makeCsv(columnHeaders, data);
};

export const exportAdHocObservationsResults = ({
  adHocObservationsResults,
  selectedPlantingSite,
}: ExportAdHocObservationsResultsParams) => {
  const plantingSiteName = selectedPlantingSite?.name || strings.ALL_PLANTING_SITES;
  const dirName = `${plantingSiteName}-${strings.AD_HOC_PLANT_MONITORING}`;

  return downloadZipFile({
    dirName,
    files: [
      {
        fileName: dirName,
        content: makeAdHocObservationsResultsCsv(adHocObservationsResults),
      },
    ],
    suffix: '.csv',
  });
};

export const exportAdHocObservationDetails = ({
  adHocObservation,
  plantingSiteName,
}: {
  adHocObservation: AdHocObservationResults;
  plantingSiteName: string;
}) => {
  const dirName = `${plantingSiteName}-${adHocObservation.completedTime?.split('T')[0]}-${strings.AD_HOC_PLANT_MONITORING}-${strings.OBSERVATION}`;

  return downloadZipFile({
    dirName,
    files: [
      {
        fileName: `${dirName}-${strings.PLOT}`,
        content: makeAdHocObservationCsv({ adHocObservation, plantingSiteName }),
      },
      {
        fileName: `${dirName}-${strings.SPECIES}`,
        content: makeAdHocObservationSpeciesCsv({ adHocObservation }),
      },
    ],
    suffix: '.csv',
  });
};
