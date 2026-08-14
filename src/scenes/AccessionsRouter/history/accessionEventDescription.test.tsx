import React from 'react';

import { getStrings as getComponentStrings } from '@terraware/web-components';
import { render } from '@testing-library/react';

import {
  type CreatedActionPayload,
  type DeletedActionPayload,
  type EventLogEntryPayload,
  type FieldUpdatedActionPayload,
} from 'src/queries/generated/events';
import defaultStrings, { type ILocalizedStringsMap } from 'src/strings';
import { strings as english } from 'src/strings/strings-en';

import { type ChangedValueColors, renderAccessionEventDescription } from './accessionEventDescription';

// Mirrors LocalizationProvider: the component library's table is the base layer and the
// application's strings are laid over it, so a single lookup reaches either.
defaultStrings.setContent({ en: { ...getComponentStrings(), ...english } } as unknown as ILocalizedStringsMap);
defaultStrings.setLanguage('en');

const colors: ChangedValueColors = { changedFrom: '#ff0000', changedTo: '#00ff00' };

const created: CreatedActionPayload = { type: 'Created', fields: [] };
const deleted: DeletedActionPayload = { type: 'Deleted' };
const fieldUpdated = (fieldName: string, changedFrom?: string[], changedTo?: string[]): FieldUpdatedActionPayload => ({
  type: 'FieldUpdated',
  fieldName,
  changedFrom,
  changedTo,
});

const event = (
  subject: EventLogEntryPayload['subject'],
  action: EventLogEntryPayload['action']
): EventLogEntryPayload => ({
  action,
  subject,
  timestamp: '2026-08-14T12:00:00Z',
  userId: 1,
  userName: 'Super Admin',
});

const accession = (fullText = 'Accession ABC-123'): EventLogEntryPayload['subject'] => ({
  type: 'Accession',
  accessionId: 7,
  facilityId: 2,
  fullText,
  shortText: 'Accession',
});

const photo = (fullText = 'Photo IMG_1234.jpg'): EventLogEntryPayload['subject'] => ({
  type: 'AccessionPhoto',
  accessionId: 7,
  facilityId: 2,
  fileId: 987654,
  fullText,
  shortText: 'Photo',
});

const withdrawal = (): EventLogEntryPayload['subject'] => ({
  type: 'Withdrawal',
  accessionId: 7,
  facilityId: 2,
  withdrawalId: 555111,
  fullText: 'Withdrawal 555111',
  shortText: 'Withdrawal',
});

const viabilityTest = (): EventLogEntryPayload['subject'] => ({
  type: 'ViabilityTest',
  accessionId: 7,
  facilityId: 2,
  viabilityTestId: 444222,
  fullText: 'Viability test 444222',
  shortText: 'Viability test',
});

const describeEvent = (entry: EventLogEntryPayload): string => {
  const { container } = render(<>{renderAccessionEventDescription(entry, defaultStrings, colors)}</>);
  return container.textContent ?? '';
};

describe('renderAccessionEventDescription', () => {
  describe('accession', () => {
    it('names the accession when it is created', () => {
      expect(describeEvent(event(accession(), created))).toBe('Accession ABC-123 created');
    });

    it('names the accession when it is deleted', () => {
      expect(describeEvent(event(accession(), deleted))).toBe('Accession ABC-123 deleted');
    });

    it('reads a field change as from/to using the field name', () => {
      const entry = event(accession(), fieldUpdated('status', ['Drying'], ['Dried']));
      expect(describeEvent(entry)).toBe('status changed from Drying to Dried');
    });

    it('renders a missing side of a change as None', () => {
      const entry = event(accession(), fieldUpdated('sub-location', undefined, ['Freezer 1']));
      expect(describeEvent(entry)).toBe('sub-location changed from None to Freezer 1');
    });

    it('joins multi-valued fields', () => {
      const entry = event(accession(), fieldUpdated('collectors', ['Ada'], ['Ada', 'Grace']));
      expect(describeEvent(entry)).toBe('collectors changed from Ada to Ada, Grace');
    });
  });

  describe('accession photo', () => {
    it('names the file when a photo is added', () => {
      expect(describeEvent(event(photo(), created))).toBe('Photo IMG_1234.jpg added');
    });

    it('names the file when a photo is deleted', () => {
      expect(describeEvent(event(photo(), deleted))).toBe('Photo IMG_1234.jpg deleted');
    });

    // The server sends the old and new file IDs as the changed values; neither belongs on the page.
    it('describes a replacement without exposing either file ID', () => {
      const entry = event(photo(), fieldUpdated('photo', ['987653'], ['987654']));
      const text = describeEvent(entry);

      expect(text).toBe('Photo IMG_1234.jpg was replaced');
      expect(text).not.toContain('987653');
      expect(text).not.toContain('987654');
    });
  });

  describe('withdrawal', () => {
    // Withdrawal creation events carry no field values, so there is nothing to report but the fact.
    it('reports only that a withdrawal was added', () => {
      expect(describeEvent(event(withdrawal(), created))).toBe('added a withdrawal');
    });

    it('reports only that a withdrawal was deleted', () => {
      expect(describeEvent(event(withdrawal(), deleted))).toBe('deleted a withdrawal');
    });

    it('reads a field change as from/to', () => {
      const entry = event(withdrawal(), fieldUpdated('withdrawn quantity', ['300 seeds'], ['250 seeds']));
      expect(describeEvent(entry)).toBe('Withdrawal withdrawn quantity changed from 300 seeds to 250 seeds');
    });

    it('never exposes the internal withdrawal ID', () => {
      const entries = [
        event(withdrawal(), created),
        event(withdrawal(), deleted),
        event(withdrawal(), fieldUpdated('notes', ['a'], ['b'])),
      ];

      entries.forEach((entry) => {
        expect(describeEvent(entry)).not.toContain('555111');
      });
    });
  });

  describe('viability test', () => {
    it('reports only that a test was started', () => {
      expect(describeEvent(event(viabilityTest(), created))).toBe('started a viability test');
    });

    it('reports only that a test was deleted', () => {
      expect(describeEvent(event(viabilityTest(), deleted))).toBe('deleted a viability test');
    });

    it('reads a field change as from/to', () => {
      const entry = event(viabilityTest(), fieldUpdated('seeds tested', ['20'], ['25']));
      expect(describeEvent(entry)).toBe('Viability test seeds tested changed from 20 to 25');
    });

    it('never exposes the internal viability test ID', () => {
      const entries = [
        event(viabilityTest(), created),
        event(viabilityTest(), deleted),
        event(viabilityTest(), fieldUpdated('substrate', ['Sand'], ['Agar'])),
      ];

      entries.forEach((entry) => {
        expect(describeEvent(entry)).not.toContain('444222');
      });
    });
  });

  // The query only asks for accession subjects, but the payload type covers every subject in the
  // system, so an unexpected one must not throw.
  it('renders nothing for a subject it does not handle', () => {
    const entry = event(
      {
        type: 'Organization',
        organizationId: 3,
        fullText: 'Organization Terraformation',
        shortText: 'Organization',
      },
      created
    );

    expect(describeEvent(entry)).toBe('');
  });
});
