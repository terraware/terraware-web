import getDateDisplayValue from '@terraware/web-components/utils/date';
import { asBlob, generateCsv, mkConfig } from 'export-to-csv';
import { AcceptedData, ColumnHeader } from 'export-to-csv/output/lib/types';

import strings from 'src/strings';
import { AdHocObservationResults } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';
import downloadZipFile from 'src/utils/downloadZipFile';

interface ExportAdHocObservationsResultsParams {
  adHocObservationsResults: AdHocObservationResults[];
  selectedPlantingSite?: PlantingSite;
}

function makeCsv(columns: ColumnHeader[], data: { [k: string]: AcceptedData }[]): Blob {
  const csvConfig = mkConfig({ columnHeaders: columns });
  const csv = generateCsv(csvConfig)(data);
  return asBlob(csvConfig)(csv);
}

function makeAdHocObservationsResultsCsv(adHocObservationsResults: AdHocObservationResults[]): Blob {
  console.log('makeAdHocObservationsResultsCsv - adHocObservationsResults:', adHocObservationsResults);

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
}

// TODO: makeAdHocObservationCsv
// TODO: exportAdHocObservation

export default function exportAdHocObservationsResults({
  adHocObservationsResults,
  selectedPlantingSite,
}: ExportAdHocObservationsResultsParams) {
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
}
