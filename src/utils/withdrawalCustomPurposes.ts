import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';

/** The longest name the server accepts, measured after trimming. */
export const CUSTOM_PURPOSE_MAX_LENGTH = 50;

/**
 * Mirrors how the server matches custom purpose names: trimmed, case-insensitive and
 * accent-insensitive, so "Sale", " sale " and "Sále" all resolve to the same saved purpose.
 */
export const normalizeCustomPurposeName = (name: string): string =>
  name
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export const findCustomPurposeByName = (
  customPurposes: WithdrawalCustomPurposePayload[],
  name: string
): WithdrawalCustomPurposePayload | undefined => {
  const normalized = normalizeCustomPurposeName(name);
  return normalized === ''
    ? undefined
    : customPurposes.find((customPurpose) => normalizeCustomPurposeName(customPurpose.name) === normalized);
};

export const isCustomPurposeTooLong = (name: string): boolean => name.trim().length > CUSTOM_PURPOSE_MAX_LENGTH;
