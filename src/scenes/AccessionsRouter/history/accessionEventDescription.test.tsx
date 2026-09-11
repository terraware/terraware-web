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
  findViabilityTestWithdrawals,
  isPairedViabilityTestEvent,
  renderAccessionEventDescription,
} from './accessionEventDescription';

// Mirrors LocalizationProvider: the component library's table is the base layer and the
// application's strings are laid over it, so a single lookup reaches either.
defaultStrings.setContent({ en: { ...getComponentStrings(), ...english } } as unknown as ILocalizedStringsMap);
defaultStrings.setLanguage('en');

const colors: ChangedValueColors = { changedFrom: '#ff0000', changedTo: '#00ff00' };

const created: CreatedActionPayload = { type: 'Created', fields: [] };
const createdWith = (fields: Record<string, string>): CreatedActionPayload => ({
  type: 'Created',
  fields: Object.entries(fields).map(([fieldName, value]) => ({ fieldName, value: [value] })),
});
const QUANTITY_50 = '50 Seeds';
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

const describeEvent = (
  entry: EventLogEntryPayload,
  viabilityTestWithdrawals?: ViabilityTestWithdrawals,
  nurseryNames?: Map<number, string>
): string => {
  const { container } = render(
    <>
      {renderAccessionEventDescription(entry, {
        colors,
        nurseryNames,
        strings: defaultStrings,
        viabilityTestWithdrawals,
      })}
    </>
  );
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

    it('reads a quantity change', () => {
      const entry = event(accession(), fieldUpdated('quantity', ['33 Seeds'], ['100 Seeds']));
      expect(describeEvent(entry)).toBe('quantity changed from 33 Seeds to 100 Seeds');
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

describe('accessionPhotoUrl', () => {
  it('builds the photo endpoint URL', () => {
    expect(accessionPhotoUrl(7, 'IMG_1234.jpg')).toBe('/api/v1/seedbank/accessions/7/photos/IMG_1234.jpg');
  });

  it('escapes a filename with characters that need it', () => {
    expect(accessionPhotoUrl(7, 'my photo (1).jpg')).toBe('/api/v1/seedbank/accessions/7/photos/my%20photo%20(1).jpg');
  });
});

describe('findViabilityTestWithdrawals', () => {
  it('maps a withdrawal to the test named on its creation event', () => {
    const events = [
      event(withdrawal(494), createdWith({ viabilityTestId: '444222', purpose: 'Viability Testing' })),
      event(withdrawal(493), createdWith({ purpose: 'Nursery', batchId: '720' })),
    ];

    expect([...findViabilityTestWithdrawals(events).entries()]).toEqual([[494, 444222]]);
  });

  // A withdrawal deleted before WithdrawalCreatedEventV2 upgrades without a viabilityTestId.
  it('does not pair a withdrawal whose creation event has no viabilityTestId', () => {
    const events = [event(withdrawal(494), createdWith({ purpose: 'Viability Testing' }))];
    expect(findViabilityTestWithdrawals(events).size).toBe(0);
  });

  it('finds nothing in an empty log', () => {
    expect(findViabilityTestWithdrawals([]).size).toBe(0);
  });
});

describe('withdrawal creation copy', () => {
  it('names the destination nursery for a transfer', () => {
    const entry = event(
      withdrawal(493),
      createdWith({ withdrawnQuantity: QUANTITY_50, purpose: 'Nursery', batchId: '720' })
    );
    const nurseries = new Map([[720, 'Bend Nursery']]);

    expect(describeEvent(entry, undefined, nurseries)).toBe('withdrew 50 Seeds to Bend Nursery');
  });

  it('falls back to the purpose until the nursery name resolves', () => {
    const entry = event(
      withdrawal(493),
      createdWith({ withdrawnQuantity: QUANTITY_50, purpose: 'Nursery', batchId: '720' })
    );
    expect(describeEvent(entry)).toBe('withdrew 50 Seeds for Nursery');
  });

  it('uses the purpose when there is no batch', () => {
    const entry = event(withdrawal(494), createdWith({ withdrawnQuantity: QUANTITY_50, purpose: 'Viability Testing' }));
    expect(describeEvent(entry)).toBe('withdrew 50 Seeds for Viability Testing');
  });

  it('reports the quantity alone when there is no purpose', () => {
    const entry = event(withdrawal(493), createdWith({ withdrawnQuantity: QUANTITY_50 }));
    expect(describeEvent(entry)).toBe('withdrew 50 Seeds');
  });

  it('falls back to the bare wording when the event carries no fields', () => {
    expect(describeEvent(event(withdrawal(493), created))).toBe('added a withdrawal');
  });

  it('still says what a deleted withdrawal was for, using the pairing map', () => {
    const pairs: ViabilityTestWithdrawals = new Map([[494, 444222]]);
    expect(describeEvent(event(withdrawal(494), deleted), pairs)).toBe('deleted a withdrawal for viability test');
  });
});

describe('viability test creation copy', () => {
  it('names the test type', () => {
    const entry = event(viabilityTest(), createdWith({ testType: 'Lab', seedsTested: '50' }));
    expect(describeEvent(entry)).toBe('started a Lab viability test');
  });

  it('falls back when the event carries no fields', () => {
    expect(describeEvent(event(viabilityTest(), created))).toBe('started a viability test');
  });
});

describe('click targets for withdrawals', () => {
  it('sends a nursery transfer to its batch', () => {
    const entry = event(withdrawal(493), createdWith({ batchId: '720', purpose: 'Nursery' }));
    expect(accessionEventTarget(entry)).toEqual({ kind: 'batch', batchId: 720 });
  });

  it('sends a test withdrawal to the test it was made for', () => {
    const pairs: ViabilityTestWithdrawals = new Map([[494, 444222]]);
    const entry = event(withdrawal(494), createdWith({ viabilityTestId: '444222' }));

    expect(accessionEventTarget(entry, pairs)).toEqual({
      kind: 'viabilityTest',
      accessionId: 7,
      viabilityTestId: 444222,
    });
  });

  it('gives an unpaired withdrawal with no batch nothing to open', () => {
    expect(accessionEventTarget(event(withdrawal(493), createdWith({ purpose: 'Other' })))).toBeUndefined();
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
    expect(isPairedViabilityTestEvent(event(viabilityTest(), created), new Map([[494, 999]]))).toBe(false);
  });

  it('keeps everything when nothing was paired', () => {
    expect(isPairedViabilityTestEvent(event(viabilityTest(), created), undefined)).toBe(false);
  });

  it('never drops a non-test subject', () => {
    expect(isPairedViabilityTestEvent(event(withdrawal(494), created), pairs)).toBe(false);
    expect(isPairedViabilityTestEvent(event(accession(), created), pairs)).toBe(false);
  });
});
