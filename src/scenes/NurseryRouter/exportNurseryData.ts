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

type NurseryWithdrawalResults = any[];

const makeNurseryWithdrawalResultsCsv = ({
  nurseryWithdrawalResults,
}: {
  nurseryWithdrawalResults: NurseryWithdrawalResults;
}): Blob => {
  const columnHeaders = [
    { key: 'withdrawnDate', displayLabel: strings.DATE },
    { key: 'purpose', displayLabel: strings.PURPOSE },
    { key: 'facility_name', displayLabel: strings.FROM_NURSERY },
    { key: 'destinationName', displayLabel: strings.PLANTING_SITE },
    { key: 'project_names', displayLabel: strings.PROJECTS },
    { key: 'substratumNames', displayLabel: strings.TO_SUBSTRATUM },
    { key: 'speciesScientificNames', displayLabel: strings.SPECIES },
    { key: 'totalWithdrawn', displayLabel: strings.TOTAL_QUANTITY },
  ];

  const data = nurseryWithdrawalResults.map((withdrawal) => ({
    withdrawnDate: withdrawal.withdrawnDate,
    purpose: withdrawal.purpose,
    facility_name: withdrawal.facility_name,
    destinationName: withdrawal.destinationName,
    project_names: (withdrawal.project_names as string[] | undefined)
      ?.filter((name: string) => !!name)
      .join(', '),
    substratumNames: withdrawal.substratumNames,
    speciesScientificNames: (withdrawal.speciesScientificNames as string[] | undefined)?.join(', '),
    totalWithdrawn: withdrawal['totalWithdrawn(raw)'],
  }));

  return makeCsv(columnHeaders, data);
};

export const exportNurseryWithdrawalResults = async ({
  nurseryWithdrawalResults,
}: {
  nurseryWithdrawalResults: NurseryWithdrawalResults;
}) => {
  const nurseryName = (nurseryWithdrawalResults?.[0]?.facility_name as string) || strings.UNKNOWN;
  const filename = `${nurseryName}-${strings.NURSERY_WITHDRAWALS}`;
  const fileBlob = makeNurseryWithdrawalResultsCsv({ nurseryWithdrawalResults });
  const fileContent = await fileBlob.text();

  downloadCsv(filename, fileContent);
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
