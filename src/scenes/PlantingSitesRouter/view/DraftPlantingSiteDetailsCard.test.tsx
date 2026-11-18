import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import { ProjectPayload } from 'src/queries/generated/projects';
import DraftPlantingSiteDetailsCard from 'src/scenes/PlantingSitesRouter/view/DraftPlantingSiteDetailsCard';
import strings from 'src/strings';
import {
  buildDraftPlantingSite,
  buildOrganization,
  captureRequests,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';
import { DraftPlantingSite } from 'src/types/PlantingSite';

const PROJECTS_URL = '/api/v1/projects';

const PACIFIC = { id: 'America/Los_Angeles', longName: 'Pacific Time' };
const HAWAII = { id: 'Pacific/Honolulu', longName: 'Hawaii-Aleutian Time' };

const RESTORATION: ProjectPayload = { id: 20, name: 'Restoration', organizationId: 1 };
const OTHER_PROJECT: ProjectPayload = { id: 21, name: 'Other Project', organizationId: 1 };

/**
 * `Textfield` in display mode points its `<label for>` at an id no element carries, so the label
 * and the value it describes are not associated for a query to follow. Pair them up by walking the
 * field the label sits in instead.
 */
const detailValue = (label: string): string | undefined => {
  const field = Array.from(document.querySelectorAll('.textfield')).find(
    (box) => box.querySelector('.textfield-label')?.firstChild?.textContent === label
  );
  if (!field) {
    throw new Error(`No detail field labelled "${label}"`);
  }
  return field.querySelector('.textfield-value--display')?.textContent ?? undefined;
};

const renderCard = (overrides: Partial<DraftPlantingSite> = {}, onEdit?: () => void) =>
  renderWithProviders(
    <DraftPlantingSiteDetailsCard onEdit={onEdit} plantingSite={buildDraftPlantingSite(overrides)} />,
    {
      localization: { supportedTimeZones: [PACIFIC, HAWAII] },
      organization: { selectedOrganization: buildOrganization({ timeZone: PACIFIC.id }) },
    }
  );

describe('DraftPlantingSiteDetailsCard', () => {
  beforeEach(() => {
    mockGet(PROJECTS_URL, { projects: [RESTORATION, OTHER_PROJECT] });
  });

  it('reports what has been entered for the draft so far', async () => {
    renderCard({
      description: 'Dry forest restoration',
      name: 'Kona Draft',
      projectId: RESTORATION.id,
      timeZone: HAWAII.id,
    });

    await waitFor(() => expect(detailValue(strings.PROJECT)).toBe(RESTORATION.name));
    expect(detailValue(strings.NAME)).toBe('Kona Draft');
    expect(detailValue(strings.DESCRIPTION)).toBe('Dry forest restoration');
    expect(detailValue(strings.TIME_ZONE)).toBe(HAWAII.longName);
  });

  it('marks the optional fields a draft has not filled in as empty', async () => {
    const requests = captureRequests('get', PROJECTS_URL, { projects: [RESTORATION, OTHER_PROJECT] });

    renderCard({ description: undefined, projectId: undefined });

    // Waited for so that the empty project reads as "this draft has no project" rather than "the
    // list has not arrived yet".
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(detailValue(strings.DESCRIPTION)).toBe('—');
    expect(detailValue(strings.PROJECT)).toBe('—');
  });

  it('falls back to the organization time zone when the draft has none of its own', () => {
    renderCard({ timeZone: undefined });

    expect(detailValue(strings.TIME_ZONE)).toBe(PACIFIC.longName);
  });

  it('offers to edit the details only when editing is allowed', async () => {
    let edited = false;
    const { user } = renderCard({}, () => (edited = true));

    await user.click(screen.getByRole('button', { name: strings.EDIT }));
    expect(edited).toBe(true);
  });

  it('shows no edit action to someone who may not edit the draft', () => {
    renderCard();

    expect(screen.getByText(strings.DETAILS)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.EDIT })).not.toBeInTheDocument();
  });
});
