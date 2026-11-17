import React, { useEffect } from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import ReassignPlotModalProvider, { useReassignPlotModal } from 'src/scenes/ObservationsRouterV2/Reassign';
import strings from 'src/strings';
import { captureRequests, dialogTitled, mockPost, renderWithProviders, selectDropdownOption } from 'src/test-utils';

const OBSERVATION_ID = 100;
const PLOT_ID = 10;
const REPLACEMENT_PLOT_ID = 11;
const REPLACE_URL = `/api/v1/tracking/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/replace`;
const PREVIEW_URL = `${REPLACE_URL}/preview`;
const JUSTIFICATION = 'Plot is flooded';

const REPLACE_RESPONSE = {
  addedMonitoringPlotIds: [REPLACEMENT_PLOT_ID],
  removedMonitoringPlotIds: [PLOT_ID],
  reassignedObservationIds: [201],
  deletedObservationIds: [202],
};

const OpenOnMount = () => {
  const { openReassignPlotModal } = useReassignPlotModal();
  useEffect(() => openReassignPlotModal(OBSERVATION_ID, PLOT_ID, true), [openReassignPlotModal]);
  return null;
};

const renderModal = () => {
  mockPost('/api/v1/search', {
    results: [
      { id: `${PLOT_ID}`, plotNumber: '5' },
      { id: `${REPLACEMENT_PLOT_ID}`, plotNumber: '6' },
    ],
  });

  return renderWithProviders(
    <ReassignPlotModalProvider>
      <OpenOnMount />
    </ReassignPlotModalProvider>
  );
};

/** Textfield gives a textarea no id, so its label points at nothing and `getByLabelText` cannot reach it. */
const reasonInput = (): HTMLTextAreaElement => {
  const textarea = document
    .querySelector('label[for="reason"]')
    ?.closest('.textfield')
    ?.querySelector<HTMLTextAreaElement>('textarea');
  if (!textarea) {
    throw new Error('No Reason textarea');
  }
  return textarea;
};

const fillInAndSend = async (user: UserEvent, durationLabel: string) => {
  // Wait for the plot lookup to settle so it doesn't update the form mid-interaction.
  await screen.findByText('5');
  await user.type(reasonInput(), JUSTIFICATION);
  await selectDropdownOption(user, 'duration', durationLabel);
  await user.click(screen.getByRole('button', { name: strings.SEND_REQUEST }));
};

describe('ReplaceObservationPlotModal', () => {
  it('lists the affected upcoming observations and replaces the plot only once they are confirmed', async () => {
    const previews = captureRequests('post', PREVIEW_URL, {
      affectedObservations: [
        { observationId: 201, observationType: 'Monitoring', startDate: '2027-03-01', outcome: 'PlotsReassigned' },
        {
          observationId: 202,
          observationType: 'Biomass Measurements',
          startDate: '2027-06-15',
          outcome: 'ObservationDeleted',
        },
      ],
    });
    const replaces = captureRequests('post', REPLACE_URL, REPLACE_RESPONSE);

    const { user, store } = renderModal();
    await fillInAndSend(user, strings.LONG_TERM_PERMANENT);

    expect(await screen.findByText(strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_TITLE)).toBeInTheDocument();
    const dialog = dialogTitled(strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_TITLE);
    expect(
      within(dialog).getByText(
        strings.formatString(
          strings.REPLACE_PLOT_UPCOMING_OBSERVATION_PLOTS_REASSIGNED,
          strings.PLANT_MONITORING,
          '2027-03-01'
        ) as string
      )
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        strings.formatString(
          strings.REPLACE_PLOT_UPCOMING_OBSERVATION_DELETED,
          strings.BIOMASS_MONITORING,
          '2027-06-15'
        ) as string
      )
    ).toBeInTheDocument();

    expect(previews).toHaveLength(1);
    expect(await previews[0].json()).toEqual({ duration: 'LongTerm' });
    expect(replaces).toHaveLength(0);

    await user.click(within(dialog).getByRole('button', { name: strings.CONFIRM }));

    await waitFor(() => expect(replaces).toHaveLength(1));
    expect(await replaces[0].json()).toEqual({ justification: JUSTIFICATION, duration: 'LongTerm' });

    await waitFor(() => expect(store.getState().snackbar.snackbars.page).not.toBeNull());
    expect(store.getState().snackbar.snackbars.page?.msg).toEqual(
      expect.arrayContaining([
        strings.formatString(strings.REASSIGNMENT_REQUEST_UPCOMING_OBSERVATIONS_REASSIGNED, 1),
        strings.formatString(strings.REASSIGNMENT_REQUEST_UPCOMING_OBSERVATIONS_DELETED, 1),
      ])
    );
  });

  it('returns to the request form without replacing the plot when the user goes back', async () => {
    mockPost(PREVIEW_URL, {
      affectedObservations: [
        { observationId: 201, observationType: 'Baseline Survey', startDate: '2027-03-01', outcome: 'PlotsReassigned' },
      ],
    });
    const replaces = captureRequests('post', REPLACE_URL, REPLACE_RESPONSE);

    const { user } = renderModal();
    await fillInAndSend(user, strings.LONG_TERM_PERMANENT);

    await screen.findByText(strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_TITLE);
    await user.click(
      within(dialogTitled(strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_TITLE)).getByRole('button', {
        name: strings.BACK,
      })
    );

    expect(await screen.findByText(strings.REQUEST_REASSIGNMENT)).toBeInTheDocument();
    expect(screen.queryByText(strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_TITLE)).not.toBeInTheDocument();
    expect(reasonInput()).toHaveValue(JUSTIFICATION);
    expect(replaces).toHaveLength(0);
  });

  it('replaces the plot without asking for confirmation when no other observations are affected', async () => {
    mockPost(PREVIEW_URL, { affectedObservations: [] });
    const replaces = captureRequests('post', REPLACE_URL, {
      ...REPLACE_RESPONSE,
      reassignedObservationIds: [],
      deletedObservationIds: [],
    });

    const { user } = renderModal();
    await fillInAndSend(user, strings.LONG_TERM_PERMANENT);

    await waitFor(() => expect(replaces).toHaveLength(1));
    expect(await replaces[0].json()).toEqual({ justification: JUSTIFICATION, duration: 'LongTerm' });
    expect(screen.queryByText(strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_TITLE)).not.toBeInTheDocument();
  });

  it('does not preview a temporary replacement', async () => {
    const previews = captureRequests('post', PREVIEW_URL, { affectedObservations: [] });
    const replaces = captureRequests('post', REPLACE_URL, {
      ...REPLACE_RESPONSE,
      reassignedObservationIds: [],
      deletedObservationIds: [],
    });

    const { user } = renderModal();
    await fillInAndSend(user, strings.TEMPORARY);

    await waitFor(() => expect(replaces).toHaveLength(1));
    expect(await replaces[0].json()).toEqual({ justification: JUSTIFICATION, duration: 'Temporary' });
    expect(previews).toHaveLength(0);
  });
});
