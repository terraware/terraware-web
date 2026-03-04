import getDateDisplayValue from '@terraware/web-components/utils/date';
import sanitize from 'sanitize-filename';

import { getConditionString } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { AdHocObservationResults } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';
import { downloadCsv, makeCsv } from 'src/utils/csv';

interface ExportAdHocObservationsResultsParams {
  adHocObservationsResults: AdHocObservationResults[];
  plantingSite?: PlantingSite;
}

const makeAdHocObservationsCsv = (adHocObservations: AdHocObservationResults[]): Blob => {
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
      key: 'dateObserved',
      displayLabel: strings.DATE_OBSERVED,
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

  const data = adHocObservations.map((adHocObservation: AdHocObservationResults) => {
    const aggregateSpeciesData = adHocObservation.adHocPlot.species.reduce(
      (acc, species) => {
        acc.cumulativeDead += species.totalDead || 0;
        acc.permanentLive += species.totalLive || 0;
        acc.totalPlants += species.totalPlants || 0;
        acc.totalLive += species.totalLive || 0;
        acc.totalDead += species.totalDead || 0;
        return acc;
      },
      {
        cumulativeDead: 0,
        permanentLive: 0,
        totalPlants: 0,
        totalLive: 0,
        totalDead: 0,
      }
    );

    const plotBoundaryCoordinates = adHocObservation.adHocPlot.boundary.coordinates[0];

    return {
      monitoringPlotNumber: adHocObservation.adHocPlot.monitoringPlotNumber,
      plantingSiteName: adHocObservation.plantingSiteName,
      dateObserved: adHocObservation.completedTime
        ? getDateDisplayValue(adHocObservation.completedTime || '', adHocObservation.timeZone)
        : '',
      southwestLatitude: plotBoundaryCoordinates[0][1],
      southwestLongitude: plotBoundaryCoordinates[0][0],
      southeastLatitude: plotBoundaryCoordinates[1][1],
      southeastLongitude: plotBoundaryCoordinates[1][0],
      northeastLatitude: plotBoundaryCoordinates[2][1],
      northeastLongitude: plotBoundaryCoordinates[2][0],
      northwestLatitude: plotBoundaryCoordinates[3][1],
      northwestLongitude: plotBoundaryCoordinates[3][0],
      totalPlants: adHocObservation.adHocPlot.totalPlants || 0,
      livePlants: aggregateSpeciesData.totalLive || 0,
      deadPlants: aggregateSpeciesData.totalDead || 0,
      totalSpecies: adHocObservation.adHocPlot.totalSpecies || 0,
      conditions:
        adHocObservation.adHocPlot?.conditions.map((condition) => getConditionString(condition)).join(', ') || '',
      notes: adHocObservation.adHocPlot?.notes || '',
    };
  });

  return makeCsv(columnHeaders, data);
};

export const exportAdHocObservationsResults = async ({
  adHocObservationsResults,
  plantingSite,
}: ExportAdHocObservationsResultsParams) => {
  const plantingSiteName = plantingSite?.name || strings.ALL_PLANTING_SITES;
  const filename = sanitize(`${plantingSiteName}-${strings.AD_HOC_PLANT_MONITORING}`);

  const fileBlob = makeAdHocObservationsCsv(adHocObservationsResults);
  const fileContent = await fileBlob.text();

  downloadCsv(filename, fileContent);
};
