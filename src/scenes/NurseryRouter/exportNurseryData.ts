import { DateTime } from 'luxon';

import { SearchNurseryWithdrawalPayload } from 'src/queries/search/nurseries';
import strings from 'src/strings';
import { purposeLabel } from 'src/types/Batch';
import { PlantingProgressType } from 'src/types/PlantingSite';
import { downloadCsv, makeCsv } from 'src/utils/csv';

const makePlantingProgressCsv = ({
  plantingProgress,
}: {
  plantingProgress: Partial<PlantingProgressType>[] | undefined;
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

type NurseryWithdrawalResults = SearchNurseryWithdrawalPayload[];

const makeNurseryWithdrawalResultsCsv = ({
  nurseryWithdrawalResults,
}: {
  nurseryWithdrawalResults: NurseryWithdrawalResults;
}): Blob => {
  const columnHeaders = [
    { key: 'withdrawnDate', displayLabel: strings.DATE },
    { key: 'purpose', displayLabel: strings.PURPOSE },
    { key: 'nurseryName', displayLabel: strings.FROM_NURSERY },
    { key: 'destinationName', displayLabel: strings.PLANTING_SITE },
    { key: 'projectNames', displayLabel: strings.PROJECTS },
    { key: 'stratumName', displayLabel: strings.TO_STRATUM },
    { key: 'substratumShortName', displayLabel: strings.TO_SUBSTRATUM },
    { key: 'speciesNames', displayLabel: strings.SPECIES },
    { key: 'totalWithdrawn', displayLabel: strings.TOTAL_QUANTITY },
    { key: 'withdrawalActive', displayLabel: strings.WITHDRAWAL_ACTIVE },
  ];

  const data = nurseryWithdrawalResults.map((withdrawal) => ({
    withdrawnDate: withdrawal.withdrawnDate,
    purpose: purposeLabel(withdrawal.purpose),
    nurseryName: withdrawal.nurseryName,
    destinationName: withdrawal.destinationName,
    projectNames: withdrawal.projectNames?.filter((name: string) => !!name).join(', '),
    stratumName: withdrawal.stratumName,
    substratumShortName: withdrawal.substratumShortName,
    speciesNames: withdrawal.speciesNames?.join(', '),
    totalWithdrawn: withdrawal.totalWithdrawn,
    withdrawalActive: withdrawal.undoneByWithdrawalId
      ? strings.NO
      : withdrawal.purpose === 'Undo'
        ? strings.NA
        : strings.YES,
  }));

  return makeCsv(columnHeaders, data);
};

export const exportNurseryWithdrawalResults = async ({
  isFiltered,
  nurseryWithdrawalResults,
}: {
  isFiltered: boolean;
  nurseryWithdrawalResults: NurseryWithdrawalResults;
}) => {
  const today = DateTime.now().toFormat('yyyy-MM-dd');
  const filteredSuffix = isFiltered ? `_${strings.FILTERED}` : '';
  const filename = `${strings.INVENTORY_WITHDRAWALS}_${today}${filteredSuffix}`;
  const fileBlob = makeNurseryWithdrawalResultsCsv({ nurseryWithdrawalResults });
  const fileContent = await fileBlob.text();

  downloadCsv(filename, fileContent);
};

export const exportNurseryPlantingProgress = async ({
  plantingProgress,
}: {
  plantingProgress: Partial<PlantingProgressType>[] | undefined;
}) => {
  const nurseryName = plantingProgress?.[0]?.siteName || strings.UNKNOWN;
  const filename = `${nurseryName}-${strings.PLANTING_PROGRESS}`;
  const fileBlob = makePlantingProgressCsv({ plantingProgress });
  const fileContent = await fileBlob.text();

  downloadCsv(filename, fileContent);
};
