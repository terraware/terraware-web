import React from 'react';
import { useLocation } from 'react-router';

import { screen, waitFor } from '@testing-library/react';

import ToastSnackbar from 'src/components/ToastSnackbar';
import DeleteDraftPlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeleteDraftPlantingSiteModal';
import strings from 'src/strings';
import { buildDraftPlantingSite, captureRequests, mockError, renderWithProviders } from 'src/test-utils';

const DRAFT_ID = 7;
const DRAFT_URL = `/api/v1/tracking/draftSites/${DRAFT_ID}`;
const SITE_NAME = 'Kona Draft';

const plantingSite = buildDraftPlantingSite({ id: DRAFT_ID, name: SITE_NAME });

/** Renders the current location so a test can tell whether the delete navigated away. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const renderModal = (onClose: () => void = () => undefined) =>
  renderWithProviders(
    <>
      <DeleteDraftPlantingSiteModal plantingSite={plantingSite} onClose={onClose} />
      <ToastSnackbar />
      <LocationProbe />
    </>,
    { route: '/planting-sites/draft/7' }
  );

describe('DeleteDraftPlantingSiteModal', () => {
  it('warns that the draft and everything set up so far will go', () => {
    renderModal();

    expect(screen.getByText(strings.DELETE_THIS_DRAFT)).toBeInTheDocument();
    expect(
      screen.getByText(strings.formatString(strings.DELETE_DRAFT_MESSAGE, SITE_NAME) as string)
    ).toBeInTheDocument();
  });

  it('deletes nothing when the user backs out', async () => {
    // Registered so a stray call is recorded rather than merely failing, which lets the assertion
    // below tell "never called" apart from "called and errored".
    const requests = captureRequests('delete', DRAFT_URL);

    let closed = false;
    const { user } = renderModal(() => (closed = true));

    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(closed).toBe(true);
    expect(requests).toHaveLength(0);
  });

  it('deletes the draft and returns to the planting sites list', async () => {
    const requests = captureRequests('delete', DRAFT_URL);

    const { user } = renderModal();

    await user.click(screen.getByRole('button', { name: strings.DELETE_DRAFT }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].url).toContain(`/draftSites/${DRAFT_ID}`);
    expect(await screen.findByText(strings.PLANTING_SITE_DELETED)).toBeInTheDocument();
    expect(screen.getByTestId('location').textContent).toBe('/planting-sites');
  });

  it('keeps the user on the draft and reports the failure when the delete fails', async () => {
    mockError('delete', DRAFT_URL);

    let closed = false;
    const { user } = renderModal(() => (closed = true));

    await user.click(screen.getByRole('button', { name: strings.DELETE_DRAFT }));

    expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
    // Navigating away here would tell the user the draft was deleted when it was not.
    expect(screen.getByTestId('location').textContent).toBe('/planting-sites/draft/7');
    expect(closed).toBe(false);
    expect(screen.getByText(strings.DELETE_THIS_DRAFT)).toBeInTheDocument();
  });
});
