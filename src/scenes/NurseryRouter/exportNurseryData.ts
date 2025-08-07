import { PlantingProgress } from 'src/redux/features/plantings/plantingsSelectors';
import strings from 'src/strings';
import { makeCsv } from 'src/utils/csv';
import downloadZipFile from 'src/utils/downloadZipFile';

type NurseryWithdrawalResults = any[];

const makePlantingProgressCsv = ({
  plantingProgress,
}: {
  plantingProgress: Partial<PlantingProgress>[] | undefined;
}): Blob => {
  const columnHeadersWithoutZones = [
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

  const columnHeadersWithZones = [
    {
      key: 'subzoneName',
      displayLabel: strings.SUBZONE,
    },
    {
      key: 'plantingCompleted',
      displayLabel: strings.PLANTING_COMPLETE,
    },
    {
      key: 'siteName',
      displayLabel: strings.PLANTING_SITE,
    },
    {
      key: 'projectName',
      displayLabel: strings.PROJECT,
    },
    {
      key: 'zoneName',
      displayLabel: strings.ZONE,
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

  const columnHeaders = plantingProgress?.some((progress) => !!progress?.subzoneName)
    ? columnHeadersWithZones
    : columnHeadersWithoutZones;

  const data = (plantingProgress || []).map((progress) => ({
    ...progress,
    plantingCompleted: progress.plantingCompleted ? strings.YES : strings.NO,
  }));

  return makeCsv(columnHeaders, data);
};

const makeNurseryWithdrawalResultsCsv = ({
  nurseryWithdrawalResults,
}: {
  nurseryWithdrawalResults: NurseryWithdrawalResults;
}): Blob => {
  const columnHeaders = [
    {
      key: 'withdrawnDate',
      displayLabel: strings.DATE,
    },
    {
      key: 'purpose',
      displayLabel: strings.PURPOSE,
    },
    {
      key: 'facility_name',
      displayLabel: strings.FROM_NURSERY,
    },
    {
      key: 'destinationName',
      displayLabel: strings.DESTINATION,
    },
    {
      key: 'project_names',
      displayLabel: strings.PROJECTS,
    },
    {
      key: 'plantingSubzoneNames',
      displayLabel: strings.TO_SUBZONE,
    },
    {
      key: 'speciesScientificNames',
      displayLabel: strings.SPECIES,
    },
    {
      key: 'totalWithdrawn',
      displayLabel: strings.TOTAL_QUANTITY,
    },
  ];

  const data = nurseryWithdrawalResults.map((withdrawal) => ({
    withdrawnDate: withdrawal.withdrawnDate,
    purpose: withdrawal.purpose,
    facility_name: withdrawal.facility_name,
    destinationName: withdrawal.destinationName,
    project_names: withdrawal.project_names.filter((projectName: string) => !!projectName).join(', '),
    plantingSubzoneNames: withdrawal.plantingSubzoneNames,
    speciesScientificNames: withdrawal.speciesScientificNames.join(', '),
    totalWithdrawn: withdrawal.totalWithdrawn,
  }));

  return makeCsv(columnHeaders, data);
};

export const exportNurseryPlantingProgress = ({
  plantingProgress,
}: {
  plantingProgress: Partial<PlantingProgress>[] | undefined;
}) => {
  const nurseryName = plantingProgress?.[0]?.siteName || strings.UNKNOWN;
  const dirName = `${nurseryName}-${strings.PLANTING_PROGRESS}`;

  return downloadZipFile({
    dirName,
    files: [
      {
        fileName: dirName,
        content: makePlantingProgressCsv({ plantingProgress }),
      },
    ],
    suffix: '.csv',
  });
};

export const exportNurseryWithdrawalResults = ({
  nurseryWithdrawalResults,
}: {
  nurseryWithdrawalResults: NurseryWithdrawalResults;
}) => {
  const nurseryName = nurseryWithdrawalResults?.[0]?.facility_name || strings.UNKNOWN;
  const dirName = `${nurseryName}-${strings.NURSERY_WITHDRAWALS}`;

  return downloadZipFile({
    dirName,
    files: [
      {
        fileName: dirName,
        content: makeNurseryWithdrawalResultsCsv({ nurseryWithdrawalResults }),
      },
    ],
    suffix: '.csv',
  });
};
