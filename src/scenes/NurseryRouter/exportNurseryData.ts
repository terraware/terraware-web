import { PlantingProgress } from 'src/redux/features/plantings/plantingsSelectors';
import strings from 'src/strings';
import { downloadCsv, makeCsv } from 'src/utils/csv';

const makePlantingProgressCsv = ({
  plantingProgress,
}: {
  plantingProgress: Partial<PlantingProgress>[] | undefined;
}): Blob => {
  const columnHeadersWithoutStrata = [
    {
      key: 'siteName',
      displayLabel: strings.PLANTING_SITE,
    },
    {
      key: 'projectName',
      displayLabel: strings.PROJECT,
    },
    {
      key: 'totalSeedlingsSent',
      displayLabel: strings.TOTAL_SEEDLINGS_SENT,
    },
  ];

  const columnHeadersWithStrata = [
    {
      key: 'siteName',
      displayLabel: strings.PLANTING_SITE,
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
      key: 'plantingCompleted',
      displayLabel: strings.PLANTING_COMPLETE,
    },
    {
      key: 'projectName',
      displayLabel: strings.PROJECT,
    },
    {
      key: 'targetPlantingDensity',
      displayLabel: strings.TARGET_PLANTING_DENSITY,
    },
    {
      key: 'totalSeedlingsSent',
      displayLabel: strings.TOTAL_SEEDLINGS_SENT,
    },
  ];

  const columnHeaders = plantingProgress?.some((progress) => !!progress?.substratumName)
    ? columnHeadersWithStrata
    : columnHeadersWithoutStrata;

  const data = (plantingProgress || []).map((progress) => ({
    ...progress,
    plantingCompleted: progress.plantingCompleted ? strings.YES : strings.NO,
  }));

  return makeCsv(columnHeaders, data);
};

export const exportNurseryPlantingProgress = async ({
  plantingProgress,
}: {
  plantingProgress: Partial<PlantingProgress>[] | undefined;
}) => {
  const nurseryName = plantingProgress?.[0]?.siteName || strings.UNKNOWN;
  const filename = `${nurseryName}-${strings.PLANTING_PROGRESS}`;
  const fileBlob = makePlantingProgressCsv({ plantingProgress });
  const fileContent = await fileBlob.text();

  downloadCsv(filename, fileContent);
};
