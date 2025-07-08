import { useCallback } from 'react';

import sanitize from 'sanitize-filename';

import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import ObservationsService from 'src/services/ObservationsService';
import strings from 'src/strings';
import downloadZipFile from 'src/utils/downloadZipFile';

export default function useExportBiomassDetailsZip(
  observationId?: number,
  plantingSiteId?: number,
  startDate?: string
) {
  const plantingSite = useAppSelector((state) =>
    plantingSiteId ? selectPlantingSite(state, plantingSiteId) : undefined
  );

  return useCallback(async () => {
    if (plantingSite && observationId && startDate) {
      const fileNamePrefix = `${plantingSite.name}-${startDate}-${strings.BIOMASS_OBSERVATION_FILENAME_PREFIX}`;
      await downloadZipFile({
        dirName: sanitize(fileNamePrefix),
        files: [
          {
            fileName: `${fileNamePrefix}-${strings.PLOT}`,
            content: () => ObservationsService.exportBiomassPlotCsv(observationId),
          },
          {
            fileName: `${fileNamePrefix}-${strings.SPECIES_CLASSIFICATION}`,
            content: () => ObservationsService.exportBiomassSpeciesCsv(observationId),
          },
          {
            fileName: `${fileNamePrefix}-${strings.TREES_AND_SHRUBS}`,
            content: () => ObservationsService.exportBiomassTreesShrubsCsv(observationId),
          },
        ],
        suffix: '.csv',
      });
    }
  }, [observationId, plantingSite, startDate]);
}
