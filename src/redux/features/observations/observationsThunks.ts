import { Dispatch } from 'redux';
import {
  ObservationResultsPayload,
  ObservationPlantingZoneResultsPayload,
  ObservationPlantingSubzoneResultsPayload,
  ObservationMonitoringPlotResults,
} from 'src/types/Observations';
import { ObservationsService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { setObservationsResultsAction } from './observationsSlice';
import getDateDisplayValue from '@terraware/web-components/utils/date';

export type PlantingSiteTimeZone = {
  id: number;
  timeZone?: string;
};

/**
 * Apply time zones to completed time dates
 * TODO: apply them to other dates as we see-fit (for now completed times are the only used dates)
 */
const applyTimeZone = (observation: ObservationResultsPayload, timeZone?: string): ObservationResultsPayload => {
  return {
    ...observation,
    completedTime: observation.completedTime ? getDateDisplayValue(observation.completedTime, timeZone) : undefined,
    plantingZones: observation.plantingZones.map((zone: ObservationPlantingZoneResultsPayload) => ({
      ...zone,
      completedTime: zone.completedTime ? getDateDisplayValue(zone.completedTime, timeZone) : undefined,
      plantingSubzones: zone.plantingSubzones.map((subZone: ObservationPlantingSubzoneResultsPayload) => ({
        ...subZone,
        monitoringPlots: subZone.monitoringPlots.map((monitoringPlot: ObservationMonitoringPlotResults) => ({
          ...monitoringPlot,
          completedTime: monitoringPlot.completedTime
            ? getDateDisplayValue(monitoringPlot.completedTime, timeZone)
            : undefined,
        })),
      })),
    })),
  };
};

/**
 * Fetch observation results and post-process completed times to match planting site time zones
 */
export const requestObservationsResults = (organizationId: number, plantingSiteTimeZones: PlantingSiteTimeZone[]) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await ObservationsService.listObservationsResults(organizationId);
      const { error, observations } = response;
      dispatch(
        setObservationsResultsAction({
          error,
          observations: observations.map((observation) =>
            applyTimeZone(
              observation,
              plantingSiteTimeZones.find((site) => observation.plantingSiteId === site.id)?.timeZone
            )
          ),
        })
      );
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching observations results', e);
    }
  };
};
