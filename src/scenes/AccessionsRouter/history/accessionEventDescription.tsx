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

export const accessionEventTarget = (event: EventLogEntryPayload): AccessionEventTarget | undefined => {
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

export type ChangedValueColors = {
  changedFrom: string;
  changedTo: string;
};

const renderChangedValue = (strings: Strings, color: string, values?: string[]): JSX.Element => (
  <Typography display='inline' color={color} fontWeight={600}>
    {values?.join(strings.LIST_SEPARATOR) || strings.NONE}
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
 */
export const renderAccessionEventDescription = (
  event: EventLogEntryPayload,
  strings: Strings,
  colors: ChangedValueColors
): ReactNode => {
  const { action, subject } = event;

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
          return strings.ACCESSION_EVENT_WITHDRAWAL_ADDED;
        case 'Deleted':
          return strings.ACCESSION_EVENT_WITHDRAWAL_DELETED;
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
