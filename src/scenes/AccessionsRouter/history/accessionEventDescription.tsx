import React, { type JSX, type ReactNode } from 'react';

import { Typography } from '@mui/material';

import { API_PATHS } from 'src/constants';
import type { ProvidedLocalizationData } from 'src/providers';
import { type EventLogEntryPayload } from 'src/queries/generated/events';

type Strings = ProvidedLocalizationData['strings'];

/**
 * What clicking a history row should do. Rows whose entity still exists and has somewhere to go open
 * it; everything else stays plain text.
 *
 * Note what is deliberately absent: seedbank withdrawals. They are not the same entity as the nursery
 * withdrawals behind APP_PATHS.NURSERY_WITHDRAWALS_DETAILS -- those IDs come from a different table --
 * so pointing a seedbank withdrawal ID at that route would open an unrelated withdrawal. Linking a
 * withdrawal to its nursery batch needs a batchId on the subject payload.
 */
export type AccessionEventTarget =
  | { kind: 'photo'; accessionId: number; fullText: string }
  | { kind: 'viabilityTest'; accessionId: number; viabilityTestId: number };

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
    // The withdrawal row stands in for the test it was made for, so it opens that test.
    case 'Withdrawal': {
      const viabilityTestId = pairs?.get(subject.withdrawalId);

      return viabilityTestId === undefined
        ? undefined
        : { kind: 'viabilityTest', accessionId: subject.accessionId, viabilityTestId };
    }
    default:
      return undefined;
  }
};

/**
 * The photo subject has no filename field -- the server only puts the filename inside its display
 * text -- and photos are addressable by filename alone, so the filename is recovered by matching the
 * display text against the accession's current photos. Returns undefined when nothing matches, which
 * is what should happen for a photo that has since been replaced or deleted.
 */
export const findPhotoFilename = (fullText: string, photoFilenames: string[] | undefined): string | undefined =>
  photoFilenames?.find((filename) => fullText.endsWith(filename));

export const accessionPhotoUrl = (accessionId: number, filename: string): string =>
  API_PATHS.ACCESSION_PHOTO.replace('{accessionId}', String(accessionId)).replace(
    '{photoFilename}',
    encodeURIComponent(filename)
  );

/**
 * Withdrawing seeds for a viability test logs both a withdrawal and the test, so one user action
 * would otherwise be reported as two rows -- on creation, and again on deletion. The withdrawal row
 * is the one kept, since it can say what the withdrawal was for; the test's own row is dropped.
 *
 * Nothing in either payload references the other, and the accession only knows the link while the
 * withdrawal exists, which is no help once it is deleted. What does survive is the event log itself:
 * the server writes both creations in a single transaction, so a withdrawal made for a test is one
 * whose creation sits alongside a test creation by the same user. Requiring that tight a window is
 * what keeps genuinely separate withdrawals -- a nursery withdrawal minutes earlier, say -- from
 * being folded in.
 *
 * A viabilityTestId on WithdrawalSubjectPayload would replace this inference with the real link.
 */
const PAIRED_CREATION_WINDOW_MS = 1000;

/** Withdrawal ID to the ID of the viability test it was made for. */
export type ViabilityTestWithdrawals = Map<number, number>;

export const findViabilityTestWithdrawals = (events: EventLogEntryPayload[]): ViabilityTestWithdrawals => {
  const testCreations = events.filter(
    (event) => event.subject.type === 'ViabilityTest' && event.action.type === 'Created'
  );

  const pairs: ViabilityTestWithdrawals = new Map();

  if (testCreations.length === 0) {
    return pairs;
  }

  events.forEach((event) => {
    const { action, subject } = event;

    if (subject.type !== 'Withdrawal' || action.type !== 'Created') {
      return;
    }

    const createdAt = Date.parse(event.timestamp);
    const test = testCreations.find(
      (candidate) =>
        candidate.userId === event.userId &&
        Math.abs(Date.parse(candidate.timestamp) - createdAt) <= PAIRED_CREATION_WINDOW_MS
    );

    if (test?.subject.type === 'ViabilityTest') {
      pairs.set(subject.withdrawalId, test.subject.viabilityTestId);
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
 * user action produces one row. Only creation and deletion are paired; a field change on the test is
 * a separate edit and keeps its own row.
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
 * are unpacked into "33 Seeds" / "50 Grams". Anything that doesn't match is passed through untouched.
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

/**
 * Turns one accession event into its history row description. The row already shows the date and the
 * user, so these read as the remainder of that sentence.
 *
 * Two subjects are phrased around the field name rather than the server's subject text: withdrawals
 * and viability tests have no user-facing identifier, so their subject text is "Withdrawal 123" /
 * "Viability test 45" -- an internal database ID that must not reach the page. Accessions and photos
 * do have one (accession number, filename), so they read subject-first like the other event logs.
 *
 * Creation events for withdrawals and viability tests carry no field values at all, so there is
 * nothing to say beyond that they happened. See docs/handoffs for the full list of gaps.
 *
 * Pass pairs to say so when a withdrawal was made for a viability test; see
 * findViabilityTestWithdrawals for how those are identified.
 */
export const renderAccessionEventDescription = (
  event: EventLogEntryPayload,
  strings: Strings,
  colors: ChangedValueColors,
  pairs?: ViabilityTestWithdrawals
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
        case 'Created':
          return forViabilityTest
            ? strings.ACCESSION_EVENT_WITHDRAWAL_ADDED_FOR_VIABILITY_TEST
            : strings.ACCESSION_EVENT_WITHDRAWAL_ADDED;
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
        case 'Created':
          return strings.ACCESSION_EVENT_VIABILITY_TEST_ADDED;
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
