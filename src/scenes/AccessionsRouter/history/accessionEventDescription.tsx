import React, { type JSX, type ReactNode } from 'react';

import { Typography } from '@mui/material';

import { API_PATHS } from 'src/constants';
import type { ProvidedLocalizationData } from 'src/providers';
import { type EventLogEntryPayload } from 'src/queries/generated/events';

type Strings = ProvidedLocalizationData['strings'];

export type AccessionEventTarget =
  | { kind: 'photo'; accessionId: number; fullText: string }
  | { kind: 'viabilityTest'; accessionId: number; viabilityTestId: number }
  | { kind: 'batch'; batchId: number };

export const accessionEventTarget = (
  event: EventLogEntryPayload,
  pairs?: ViabilityTestWithdrawals
): AccessionEventTarget | undefined => {
  const { subject } = event;

  if (subject.deleted) {
    return undefined;
  }

  switch (subject.type) {
    case 'AccessionPhoto':
      return { kind: 'photo', accessionId: subject.accessionId, fullText: subject.fullText };
    case 'ViabilityTest':
      return {
        kind: 'viabilityTest',
        accessionId: subject.accessionId,
        viabilityTestId: subject.viabilityTestId,
      };
    case 'Withdrawal': {
      const batchId = createdField(event.action, 'batchId');

      if (batchId !== undefined) {
        return { kind: 'batch', batchId: Number(batchId) };
      }

      const viabilityTestId = pairs?.get(subject.withdrawalId);

      return viabilityTestId === undefined
        ? undefined
        : { kind: 'viabilityTest', accessionId: subject.accessionId, viabilityTestId };
    }
    default:
      return undefined;
  }
};

export const findPhotoFilename = (fullText: string, photoFilenames: string[] | undefined): string | undefined =>
  photoFilenames
    // Match the whole filename, not any suffix: "Photo myIMG.jpg" must not match "IMG.jpg". Filenames
    // can contain spaces, so where several still match, the longest is the real one.
    ?.filter((filename) => {
      const start = fullText.length - filename.length;

      return fullText.endsWith(filename) && (start === 0 || fullText[start - 1] === ' ');
    })
    .sort((a, b) => b.length - a.length)[0];

export const accessionPhotoUrl = (accessionId: number, filename: string): string =>
  API_PATHS.ACCESSION_PHOTO.replace('{accessionId}', String(accessionId)).replace(
    '{photoFilename}',
    encodeURIComponent(filename)
  );

/** Reads one value out of a creation event's initial field values. */
export const createdField = (action: EventLogEntryPayload['action'], fieldName: string): string | undefined =>
  action.type === 'Created' ? action.fields.find((field) => field.fieldName === fieldName)?.value?.[0] : undefined;

/**
 * Withdrawing seeds for a viability test logs both a withdrawal and the test, so one user action
 * would otherwise be reported as two rows -- on creation, and again on deletion. The withdrawal row
 * is the one kept, since it can say what the withdrawal was for; the test's own row is dropped.
 */
export type ViabilityTestWithdrawals = Map<number, number>;

export const findViabilityTestWithdrawals = (events: EventLogEntryPayload[]): ViabilityTestWithdrawals => {
  const pairs: ViabilityTestWithdrawals = new Map();

  events.forEach(({ action, subject }) => {
    if (subject.type !== 'Withdrawal') {
      return;
    }

    const viabilityTestId = createdField(action, 'viabilityTestId');

    if (viabilityTestId !== undefined) {
      pairs.set(subject.withdrawalId, Number(viabilityTestId));
    }
  });

  return pairs;
};

export const isViabilityTestWithdrawal = (
  event: EventLogEntryPayload,
  pairs: ViabilityTestWithdrawals | undefined
): boolean => event.subject.type === 'Withdrawal' && pairs?.has(event.subject.withdrawalId) === true;

/**
 * True for the viability test row that the paired withdrawal row already accounts for, so that one
 * user action produces one row.
 */
export const isPairedViabilityTestEvent = (
  event: EventLogEntryPayload,
  pairs: ViabilityTestWithdrawals | undefined
): boolean => {
  const { action, subject } = event;

  if (subject.type !== 'ViabilityTest' || (action.type !== 'Created' && action.type !== 'Deleted') || !pairs) {
    return false;
  }

  return [...pairs.values()].includes(subject.viabilityTestId);
};

export type ChangedValueColors = {
  changedFrom: string;
  changedTo: string;
};

/** Matches the server's raw rendering of a seed quantity, e.g. "SeedQuantityModel(quantity=33, units=Seeds)". */
const SEED_QUANTITY = /^SeedQuantityModel\(quantity=(-?[\d.]+), units=(\w+)\)$/;

const unitName = (strings: Strings, units: string): string => {
  switch (units) {
    case 'Grams':
      return strings.GRAMS;
    case 'Kilograms':
      return strings.KILOGRAMS;
    case 'Milligrams':
      return strings.MILLIGRAMS;
    case 'Ounces':
      return strings.OUNCES;
    case 'Pounds':
      return strings.POUNDS;
    case 'Seeds':
      return strings.SEEDS;
    default:
      return units;
  }
};

/**
 * Quantity fields arrive as the server's raw object rendering rather than a display string, so they
 * are unpacked into "33 Seeds" / "50 Grams".
 */
export const formatEventValue = (strings: Strings, value: string): string => {
  const match = SEED_QUANTITY.exec(value);

  if (!match) {
    return value;
  }

  const [, rawQuantity, units] = match;
  // Number() drops the trailing zero the server sends for whole weights ("50.0" -> "50").
  const parsed = Number(rawQuantity);
  const quantity = Number.isFinite(parsed) ? String(parsed) : rawQuantity;

  return `${quantity} ${unitName(strings, units)}`;
};

const renderChangedValue = (strings: Strings, color: string, values?: string[]): JSX.Element => (
  <Typography display='inline' color={color} fontWeight={600}>
    {values?.map((value) => formatEventValue(strings, value)).join(strings.LIST_SEPARATOR) || strings.NONE}
  </Typography>
);

const renderFieldChange = (
  strings: Strings,
  colors: ChangedValueColors,
  template: string,
  fieldName: string,
  changedFrom?: string[],
  changedTo?: string[]
): ReactNode =>
  strings.formatString<string | JSX.Element>(
    template,
    fieldName,
    renderChangedValue(strings, colors.changedFrom, changedFrom),
    renderChangedValue(strings, colors.changedTo, changedTo)
  );

export const renderAccessionEventDescription = (
  event: EventLogEntryPayload,
  strings: Strings,
  colors: ChangedValueColors,
  pairs?: ViabilityTestWithdrawals,
  nurseryNames?: Map<number, string>
): ReactNode => {
  const { action, subject } = event;
  const forViabilityTest = isViabilityTestWithdrawal(event, pairs);

  switch (subject.type) {
    case 'Accession':
      switch (action.type) {
        case 'Created':
          return strings.formatString(strings.EVENT_CREATED, subject.fullText);
        case 'Deleted':
          return strings.formatString(strings.EVENT_DELETED, subject.fullText);
        case 'FieldUpdated':
          return renderFieldChange(
            strings,
            colors,
            strings.VALUE_CHANGED_FROM_TO,
            action.fieldName,
            action.changedFrom,
            action.changedTo
          );
        default:
          return null;
      }

    case 'AccessionPhoto':
      switch (action.type) {
        case 'Created':
          return strings.formatString(strings.EVENT_ADDED, subject.fullText);
        case 'Deleted':
          return strings.formatString(strings.EVENT_DELETED, subject.fullText);
        // Re-uploading over an existing filename is logged as an update whose values are the old and
        // new file IDs, so only the subject is worth showing.
        case 'FieldUpdated':
          return strings.formatString(strings.ACCESSION_EVENT_PHOTO_REPLACED, subject.fullText);
        default:
          return null;
      }

    case 'Withdrawal':
      switch (action.type) {
        case 'Created': {
          const rawQuantity = createdField(action, 'withdrawnQuantity');

          if (rawQuantity === undefined) {
            return strings.ACCESSION_EVENT_WITHDRAWAL_ADDED;
          }

          const quantity = formatEventValue(strings, rawQuantity);
          const purpose = createdField(action, 'purpose');
          const batchId = createdField(action, 'batchId');
          const nursery = batchId === undefined ? undefined : nurseryNames?.get(Number(batchId));

          if (nursery !== undefined) {
            return strings.formatString(strings.ACCESSION_EVENT_WITHDRAWAL_ADDED_TO, quantity, nursery);
          }

          return purpose === undefined
            ? strings.formatString(strings.ACCESSION_EVENT_WITHDRAWAL_ADDED_QUANTITY, quantity)
            : strings.formatString(strings.ACCESSION_EVENT_WITHDRAWAL_ADDED_FOR, quantity, purpose);
        }
        case 'Deleted':
          return forViabilityTest
            ? strings.ACCESSION_EVENT_WITHDRAWAL_DELETED_FOR_VIABILITY_TEST
            : strings.ACCESSION_EVENT_WITHDRAWAL_DELETED;
        case 'FieldUpdated':
          return renderFieldChange(
            strings,
            colors,
            strings.ACCESSION_EVENT_WITHDRAWAL_UPDATED,
            action.fieldName,
            action.changedFrom,
            action.changedTo
          );
        default:
          return null;
      }

    case 'ViabilityTest':
      switch (action.type) {
        case 'Created': {
          const testType = createdField(action, 'testType');

          return testType === undefined
            ? strings.ACCESSION_EVENT_VIABILITY_TEST_ADDED
            : strings.formatString(strings.ACCESSION_EVENT_VIABILITY_TEST_STARTED, testType);
        }
        case 'Deleted':
          return strings.ACCESSION_EVENT_VIABILITY_TEST_DELETED;
        case 'FieldUpdated':
          return renderFieldChange(
            strings,
            colors,
            strings.ACCESSION_EVENT_VIABILITY_TEST_UPDATED,
            action.fieldName,
            action.changedFrom,
            action.changedTo
          );
        default:
          return null;
      }

    default:
      return null;
  }
};
