import { DateTime } from 'luxon';

import { SearchSeedWithdrawalPayload } from 'src/queries/search/seedWithdrawals';
import strings from 'src/strings';
import { unitAbbv } from 'src/units';
import { downloadCsv, escapeCsvFormula, makeCsv } from 'src/utils/csv';
import { seedWithdrawalPurposeLabel } from 'src/utils/withdrawalPurposes';

export const seedWithdrawalQuantity = (withdrawal: SearchSeedWithdrawalPayload): string => {
  if (withdrawal.quantity === undefined) {
    return '';
  }
  const abbreviation = withdrawal.units ? unitAbbv()[withdrawal.units] : undefined;
  return abbreviation ? `${withdrawal.quantity} ${abbreviation}` : `${withdrawal.quantity}`;
};

const makeSeedWithdrawalsCsv = (seedWithdrawals: SearchSeedWithdrawalPayload[]): Blob => {
  const columnHeaders = [
    { key: 'date', displayLabel: strings.DATE },
    { key: 'accessionNumber', displayLabel: strings.ACCESSION },
    { key: 'speciesName', displayLabel: strings.SPECIES },
    { key: 'purpose', displayLabel: strings.PURPOSE },
    { key: 'seedBankName', displayLabel: strings.FROM_SEED_BANK },
    { key: 'quantity', displayLabel: strings.QUANTITY },
    { key: 'destination', displayLabel: strings.DESTINATION },
    { key: 'projectName', displayLabel: strings.PROJECT },
    { key: 'notes', displayLabel: strings.NOTES },
  ];

  // Every column below that carries text someone typed is escaped; date and purpose are the only
  // two the application generates itself.
  const data = seedWithdrawals.map((withdrawal) => ({
    date: withdrawal.date,
    accessionNumber: escapeCsvFormula(withdrawal.accessionNumber),
    speciesName: escapeCsvFormula(withdrawal.speciesName),
    purpose: seedWithdrawalPurposeLabel(withdrawal.purpose, strings),
    seedBankName: escapeCsvFormula(withdrawal.seedBankName),
    quantity: escapeCsvFormula(seedWithdrawalQuantity(withdrawal)),
    destination: escapeCsvFormula(withdrawal.destination),
    projectName: escapeCsvFormula(withdrawal.projectName),
    notes: escapeCsvFormula(withdrawal.notes),
  }));

  return makeCsv(columnHeaders, data);
};

export const exportSeedWithdrawals = async ({
  isFiltered,
  seedWithdrawals,
}: {
  isFiltered: boolean;
  seedWithdrawals: SearchSeedWithdrawalPayload[];
}) => {
  const today = DateTime.now().toFormat('yyyy-MM-dd');
  const filteredSuffix = isFiltered ? `_${strings.FILTERED}` : '';
  const filename = `${strings.SEEDS_WITHDRAWALS}_${today}${filteredSuffix}`;
  const fileBlob = makeSeedWithdrawalsCsv(seedWithdrawals);
  const fileContent = await fileBlob.text();

  downloadCsv(filename, fileContent);
};
