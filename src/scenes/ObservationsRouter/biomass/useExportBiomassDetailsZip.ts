import { useCallback } from 'react';

import sanitize from 'sanitize-filename';

import ObservationsService from 'src/services/ObservationsService';
import strings from 'src/strings';
import { ObservationResultsPayload } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';
import downloadZipFile from 'src/utils/downloadZipFile';

export default function useExportBiomassDetailsZip(
  observation?: ObservationResultsPayload,
  plantingSite?: PlantingSite
) {
  return useCallback(async () => {
    if (observation && plantingSite) {
      const fileNamePrefix = `${plantingSite.name}-${observation.startDate}-${strings.BIOMASS_OBSERVATION_FILENAME_PREFIX}`;
      await downloadZipFile({
        dirName: sanitize(fileNamePrefix),
        files: [
          {
            fileName: `${fileNamePrefix}-${strings.PLOT}`,
            content: () => ObservationsService.exportBiomassPlotCsv(observation.observationId),
          },
          {
            fileName: `${fileNamePrefix}-${strings.QUADRAT}`,
            content: () => ObservationsService.exportBiomassQuadratCsv(observation.observationId),
          },
          {
            fileName: `${fileNamePrefix}-${strings.TREES_AND_SHRUBS}`,
            content: () => ObservationsService.exportBiomassTreesShrubsCsv(observation.observationId),
          },
        ],
        suffix: '.csv',
      });
    }
  }, [observation, plantingSite]);
}
