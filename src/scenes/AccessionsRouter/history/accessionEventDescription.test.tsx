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

import {
  type ChangedValueColors,
  type ViabilityTestWithdrawals,
  accessionEventTarget,
  accessionPhotoUrl,
  findPhotoFilename,
  findViabilityTestWithdrawals,
  formatEventValue,
  isPairedViabilityTestEvent,
  renderAccessionEventDescription,
} from './accessionEventDescription';

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

const withdrawal = (withdrawalId = 555111): EventLogEntryPayload['subject'] => ({
  type: 'Withdrawal',
  accessionId: 7,
  facilityId: 2,
  withdrawalId,
  fullText: `Withdrawal ${withdrawalId}`,
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

const describeEvent = (entry: EventLogEntryPayload, pairs?: ViabilityTestWithdrawals): string => {
  const { container } = render(<>{renderAccessionEventDescription(entry, defaultStrings, colors, pairs)}</>);
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

    it('reads a quantity change without the raw server object', () => {
      const entry = event(
        accession(),
        fieldUpdated(
          'quantity',
          ['SeedQuantityModel(quantity=33, units=Seeds)'],
          ['SeedQuantityModel(quantity=100, units=Seeds)']
        )
      );
      const text = describeEvent(entry);

      expect(text).toBe('quantity changed from 33 Seeds to 100 Seeds');
      expect(text).not.toContain('SeedQuantityModel');
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

describe('accessionEventTarget', () => {
  it('targets the photo modal for photo events', () => {
    expect(accessionEventTarget(event(photo(), created))).toEqual({
      kind: 'photo',
      accessionId: 7,
      fullText: 'Photo IMG_1234.jpg',
    });
  });

  it('targets the viability test modal for test events', () => {
    expect(accessionEventTarget(event(viabilityTest(), created))).toEqual({
      kind: 'viabilityTest',
      accessionId: 7,
      viabilityTestId: 444222,
    });
  });

  // A seedbank withdrawal ID is not a nursery withdrawal ID, so linking it to
  // /nursery/withdrawals/:withdrawalId would open an unrelated withdrawal.
  it('gives withdrawal events nothing to open', () => {
    expect(accessionEventTarget(event(withdrawal(), created))).toBeUndefined();
  });

  it('gives accession events nothing to open, since this is already that page', () => {
    expect(accessionEventTarget(event(accession(), created))).toBeUndefined();
  });

  it('gives a deleted entity nothing to open', () => {
    const deletedPhoto: EventLogEntryPayload['subject'] = { ...photo(), deleted: true };
    expect(accessionEventTarget(event(deletedPhoto, deleted))).toBeUndefined();
  });
});

describe('findPhotoFilename', () => {
  it('recovers the filename from the subject display text', () => {
    expect(findPhotoFilename('Photo IMG_1234.jpg', ['IMG_0001.jpg', 'IMG_1234.jpg'])).toBe('IMG_1234.jpg');
  });

  it('returns undefined when the photo is no longer on the accession', () => {
    expect(findPhotoFilename('Photo IMG_1234.jpg', ['IMG_0001.jpg'])).toBeUndefined();
  });

  it('returns undefined when the accession has not loaded', () => {
    expect(findPhotoFilename('Photo IMG_1234.jpg', undefined)).toBeUndefined();
  });
});

describe('accessionPhotoUrl', () => {
  it('builds the photo endpoint URL', () => {
    expect(accessionPhotoUrl(7, 'IMG_1234.jpg')).toBe('/api/v1/seedbank/accessions/7/photos/IMG_1234.jpg');
  });

  it('escapes a filename with characters that need it', () => {
    expect(accessionPhotoUrl(7, 'my photo (1).jpg')).toBe('/api/v1/seedbank/accessions/7/photos/my%20photo%20(1).jpg');
  });
});

describe('formatEventValue', () => {
  it('unpacks a seed count', () => {
    expect(formatEventValue(defaultStrings, 'SeedQuantityModel(quantity=10, units=Seeds)')).toBe('10 Seeds');
  });

  it('unpacks each weight unit', () => {
    const cases: [string, string][] = [
      ['Grams', '50 Grams'],
      ['Kilograms', '50 Kilograms'],
      ['Milligrams', '50 Milligrams'],
      ['Ounces', '50 Ounces'],
      ['Pounds', '50 Pounds'],
    ];

    cases.forEach(([units, expected]) => {
      expect(formatEventValue(defaultStrings, `SeedQuantityModel(quantity=50, units=${units})`)).toBe(expected);
    });
  });

  it('drops the trailing zero the server sends for whole weights', () => {
    expect(formatEventValue(defaultStrings, 'SeedQuantityModel(quantity=50.0, units=Grams)')).toBe('50 Grams');
  });

  it('keeps a genuine fraction', () => {
    expect(formatEventValue(defaultStrings, 'SeedQuantityModel(quantity=1.50, units=Grams)')).toBe('1.5 Grams');
  });

  it('falls back to the raw unit name if the server adds one we do not know', () => {
    expect(formatEventValue(defaultStrings, 'SeedQuantityModel(quantity=2, units=Bushels)')).toBe('2 Bushels');
  });

  it('passes through values that are not quantities', () => {
    expect(formatEventValue(defaultStrings, 'Drying')).toBe('Drying');
    expect(formatEventValue(defaultStrings, '')).toBe('');
  });
});

const at = (
  timestamp: string,
  subject: EventLogEntryPayload['subject'],
  action: EventLogEntryPayload['action'],
  userId = 1
): EventLogEntryPayload => ({
  ...event(subject, action),
  timestamp,
  userId,
});

describe('findViabilityTestWithdrawals', () => {
  // The real server writes both creations in one transaction, ~20ms apart.
  const testCreated = at('2026-08-14T20:15:07.419985Z', viabilityTest(), created);
  const pairedWithdrawal = at('2026-08-14T20:15:07.439033Z', withdrawal(494), created);
  const nurseryWithdrawal = at('2026-08-14T20:11:40.516598Z', withdrawal(493), created);

  it('maps a withdrawal to the test it was created alongside', () => {
    const pairs = findViabilityTestWithdrawals([nurseryWithdrawal, testCreated, pairedWithdrawal]);
    expect([...pairs.entries()]).toEqual([[494, 444222]]);
  });

  // This is the guard against folding in withdrawals made for a different purpose.
  it('does not pair a withdrawal made minutes earlier', () => {
    const pairs = findViabilityTestWithdrawals([nurseryWithdrawal, testCreated, pairedWithdrawal]);
    expect(pairs.has(493)).toBe(false);
  });

  it('does not pair across different users', () => {
    const otherUser = at('2026-08-14T20:15:07.439033Z', withdrawal(494), created, 99);
    expect(findViabilityTestWithdrawals([testCreated, otherUser]).size).toBe(0);
  });

  it('finds nothing when no viability test was created', () => {
    expect(findViabilityTestWithdrawals([nurseryWithdrawal]).size).toBe(0);
  });

  it('finds nothing in an empty log', () => {
    expect(findViabilityTestWithdrawals([]).size).toBe(0);
  });
});

describe('withdrawals made for a viability test', () => {
  const pairs: ViabilityTestWithdrawals = new Map([[494, 444222]]);

  it('says what the withdrawal was for when it is added', () => {
    expect(describeEvent(event(withdrawal(494), created), pairs)).toBe('added a withdrawal for viability test');
  });

  // The pairing comes from the log, so this still reads correctly after both are deleted.
  it('says what the withdrawal was for when it is deleted', () => {
    expect(describeEvent(event(withdrawal(494), deleted), pairs)).toBe('deleted a withdrawal for viability test');
  });

  it('leaves a withdrawal made for another purpose unqualified', () => {
    expect(describeEvent(event(withdrawal(493), created), pairs)).toBe('added a withdrawal');
    expect(describeEvent(event(withdrawal(493), deleted), pairs)).toBe('deleted a withdrawal');
  });

  it('leaves withdrawals unqualified when nothing was paired', () => {
    expect(describeEvent(event(withdrawal(494), created))).toBe('added a withdrawal');
  });

  it('does not qualify a field change', () => {
    const entry = event(withdrawal(494), fieldUpdated('notes', ['a'], ['b']));
    expect(describeEvent(entry, pairs)).toBe('Withdrawal notes changed from a to b');
  });

  it('opens the test the withdrawal was made for', () => {
    expect(accessionEventTarget(event(withdrawal(494), created), pairs)).toEqual({
      kind: 'viabilityTest',
      accessionId: 7,
      viabilityTestId: 444222,
    });
  });

  it('gives a withdrawal made for another purpose nothing to open', () => {
    expect(accessionEventTarget(event(withdrawal(493), created), pairs)).toBeUndefined();
  });
});

describe('isPairedViabilityTestEvent', () => {
  const pairs: ViabilityTestWithdrawals = new Map([[494, 444222]]);

  it('drops the paired test creation, which the withdrawal row now covers', () => {
    expect(isPairedViabilityTestEvent(event(viabilityTest(), created), pairs)).toBe(true);
  });

  it('drops the paired test deletion', () => {
    expect(isPairedViabilityTestEvent(event(viabilityTest(), deleted), pairs)).toBe(true);
  });

  // A field change on the test is a real separate edit, not part of the withdrawal action.
  it('keeps a field change on the test', () => {
    const entry = event(viabilityTest(), fieldUpdated('seeds tested', ['20'], ['25']));
    expect(isPairedViabilityTestEvent(entry, pairs)).toBe(false);
  });

  it('keeps a test that was not paired with a withdrawal', () => {
    const unpaired: ViabilityTestWithdrawals = new Map([[494, 999]]);
    expect(isPairedViabilityTestEvent(event(viabilityTest(), created), unpaired)).toBe(false);
  });

  it('keeps everything when nothing was paired', () => {
    expect(isPairedViabilityTestEvent(event(viabilityTest(), created), undefined)).toBe(false);
  });

  it('never drops a non-test subject', () => {
    expect(isPairedViabilityTestEvent(event(withdrawal(494), created), pairs)).toBe(false);
    expect(isPairedViabilityTestEvent(event(accession(), created), pairs)).toBe(false);
  });
});
