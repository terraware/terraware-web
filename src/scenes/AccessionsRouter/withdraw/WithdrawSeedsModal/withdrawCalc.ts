import { SeedQuantityPayload } from 'src/queries/generated/accessionsV2';
import strings from 'src/strings';
import { UnitType, convertUnits, convertWeightToSeedCount } from 'src/units';

import { AccessionWithdrawInfo, WithdrawPurpose } from './types';

export const remainingWeightOf = (accession: AccessionWithdrawInfo): SeedQuantityPayload | undefined =>
  accession.remainingQuantity?.units === 'Seeds' ? accession.estimatedWeight : accession.remainingQuantity;

export const remainingCountOf = (accession: AccessionWithdrawInfo): number | undefined => {
  if (accession.remainingQuantity?.units === 'Seeds') {
    return accession.remainingQuantity.quantity;
  }
  const remainingWeight = remainingWeightOf(accession);
  if (!remainingWeight || !accession.subsetCount || !accession.subsetWeight?.quantity) {
    return undefined;
  }
  return convertWeightToSeedCount(
    remainingWeight.quantity,
    remainingWeight.units,
    accession.subsetWeight,
    accession.subsetCount
  );
};

export const estimatedSeedCount = (
  accession: AccessionWithdrawInfo,
  withdrawByWeight: boolean,
  value: number | undefined,
  units: UnitType
): number => {
  if (!value) {
    return 0;
  }
  if (!withdrawByWeight) {
    return value;
  }
  return convertWeightToSeedCount(value, units, accession.subsetWeight, accession.subsetCount);
};

// The quantity to withdraw all of, in the current mode (count or weight), or undefined
// when it can't be determined (e.g. weight mode with the accession stored in seeds only).
export const withdrawAllValue = (
  accession: AccessionWithdrawInfo,
  withdrawByWeight: boolean
): { value: number; units: UnitType } | undefined => {
  if (withdrawByWeight) {
    const remainingWeight = remainingWeightOf(accession);
    if (!remainingWeight?.quantity || remainingWeight.units === 'Seeds') {
      return undefined;
    }
    return { value: remainingWeight.quantity, units: remainingWeight.units };
  }
  if (accession.remainingQuantity?.units === 'Seeds') {
    return { value: accession.remainingQuantity.quantity, units: 'Seeds' };
  }
  if (accession.estimatedCount) {
    return { value: accession.estimatedCount, units: 'Seeds' };
  }
  return undefined;
};

const requiresSubsetForCount = (purpose: WithdrawPurpose): boolean =>
  purpose === 'Nursery' || purpose === 'Viability Testing';

export const validateRow = (
  accession: AccessionWithdrawInfo,
  purpose: WithdrawPurpose,
  withdrawByWeight: boolean,
  value: number | undefined,
  units: UnitType
): string => {
  if (withdrawByWeight) {
    if (
      requiresSubsetForCount(purpose) &&
      (!accession.estimatedCount || !accession.subsetWeight?.quantity || !accession.subsetCount)
    ) {
      return purpose === 'Nursery'
        ? strings.MISSING_SUBSET_WEIGHT_ERROR_NURSERY
        : strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST;
    }
    if (!value) {
      return strings.REQUIRED_FIELD;
    }
    if (isNaN(value) || Number(value) <= 0) {
      return strings.INVALID_VALUE;
    }
    const estimated = estimatedSeedCount(accession, true, value, units);
    // A weight withdrawal yields a seed count only via the subset ratio. That ratio is required for
    // nursery/viability, and also whenever the remaining balance is in seeds — a cross-unit
    // withdrawal the server rejects without it. In both cases a missing ratio makes the estimate 0.
    if (!estimated && (requiresSubsetForCount(purpose) || accession.remainingQuantity?.units === 'Seeds')) {
      return strings.WITHDRAWAL_COUNT_GREATER_THAN_ZERO_ERROR;
    }
    const remainingCount = remainingCountOf(accession);
    if (remainingCount !== undefined && estimated > remainingCount) {
      return strings.WITHDRAWN_QUANTITY_ERROR;
    }
    const remainingWeight = remainingWeightOf(accession);
    if (remainingWeight && remainingWeight.units !== 'Seeds') {
      const withdrawnWeight = convertUnits(value, units, remainingWeight.units);
      if (withdrawnWeight > remainingWeight.quantity * (1 + 1e-6)) {
        return strings.WITHDRAWN_QUANTITY_ERROR;
      }
    }
    return '';
  }

  if (!value) {
    return strings.REQUIRED_FIELD;
  }
  if (isNaN(value) || Number(value) <= 0) {
    return strings.INVALID_VALUE;
  }
  // Seed counts must be whole numbers; the server rejects fractional seed quantities.
  if (!Number.isInteger(value)) {
    return strings.INVALID_VALUE;
  }
  if (accession.remainingQuantity?.units === 'Seeds') {
    if (value > accession.remainingQuantity.quantity) {
      return strings.WITHDRAWN_QUANTITY_ERROR;
    }
  } else {
    if (!accession.estimatedCount) {
      return strings.MISSING_SUBSET_WEIGHT_ERROR_COUNT;
    }
    if (value > accession.estimatedCount) {
      return strings.WITHDRAWN_QUANTITY_ERROR;
    }
  }
  return '';
};
