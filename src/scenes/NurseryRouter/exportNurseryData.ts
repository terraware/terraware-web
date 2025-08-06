import strings from 'src/strings';
import { makeCsv } from 'src/utils/csv';
import downloadZipFile from 'src/utils/downloadZipFile';

type NurseryWithdrawalResults = any[];

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

export const exportNurseryWithdrawalResults = ({
  nurseryWithdrawalResults,
}: {
  nurseryWithdrawalResults: NurseryWithdrawalResults;
}) => {
  const nurseryName = nurseryWithdrawalResults[0]?.facility_name || strings.UNKNOWN;
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
