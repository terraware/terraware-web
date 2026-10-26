import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';

import { EventLogEntryPayload } from 'src/queries/generated/events';
import strings from 'src/strings';
import { buildOrganization, captureRequests, mockPost, renderWithProviders } from 'src/test-utils';

import T0ChangeHistory from './T0ChangeHistory';

const SITE_ID = 3;

/** The toggle's field name arrives already localized from the server. */
const TEMP_PLOT_FIELD = 'survival rate includes temporary plots';

const JENNIFER = { userId: 4, userName: 'Jennifer Yim' };
const RAFAEL = { userId: 9, userName: 'Rafael Mendes' };

type Entry = EventLogEntryPayload;
type Subject = Entry['subject'];
type Action = Entry['action'];

const fieldUpdated = (fieldName: string, from?: string, to?: string): Action => ({
  type: 'FieldUpdated',
  fieldName,
  changedFrom: from === undefined ? undefined : [from],
  changedTo: to === undefined ? undefined : [to],
});

/** A density the server reports as newly created rather than as a field update. */
const densityCreated = (value: string): Action => ({
  type: 'Created',
  fields: [{ fieldName: 'density', value: [value] }],
});

const plotObservation = (plotNumber: number): Subject => ({
  type: 'PlotT0Observation',
  monitoringPlotId: 100 + plotNumber,
  plantingSiteId: SITE_ID,
  plotNumber,
  fullText: `Plot ${plotNumber} t0 observation`,
  shortText: 't0 observation',
});

const plotDensity = (plotNumber: number, scientificName: string): Subject => ({
  type: 'PlotT0Density',
  monitoringPlotId: 100 + plotNumber,
  plantingSiteId: SITE_ID,
  plotNumber,
  scientificName,
  speciesId: 1,
  fullText: `Plot ${plotNumber} ${scientificName} t0 density`,
  shortText: 't0 density',
});

const stratumDensity = (stratumName: string, scientificName: string): Subject => ({
  type: 'StratumT0Density',
  plantingSiteId: SITE_ID,
  scientificName,
  speciesId: 2,
  stratumId: 5,
  stratumName,
  fullText: `Stratum ${stratumName} ${scientificName} t0 density`,
  shortText: 't0 density',
});

const site = (): Subject => ({
  type: 'PlantingSite',
  plantingSiteId: SITE_ID,
  fullText: 'Planting site',
  shortText: 'Site',
});

/** Every entry of one save shares a timestamp and a user, which is how saves are reconstructed. */
const save = (timestamp: string, user: typeof JENNIFER, changes: [subject: Subject, action: Action][]): Entry[] =>
  changes.map(([subject, action]) => ({ action, subject, timestamp, ...user }));

const SETTINGS_ONLY_SAVE = save('2026-06-01T08:00:00Z', RAFAEL, [[site(), fieldUpdated(TEMP_PLOT_FIELD, 'No', 'Yes')]]);

const ONE_PLOT_SAVE = save('2026-06-10T09:00:00Z', RAFAEL, [
  [plotObservation(7), fieldUpdated('t0 observation', undefined, '2026-03-10')],
]);

const LATEST_SAVE = save('2026-06-15T12:00:00Z', JENNIFER, [
  [plotObservation(12), fieldUpdated('t0 observation', '2026-01-05', '2026-03-10')],
  [plotDensity(12, 'Acacia koa'), fieldUpdated('density', '500', '450')],
  [plotObservation(7), fieldUpdated('t0 observation', undefined, '2026-03-10')],
  [plotObservation(9), fieldUpdated('t0 observation', '2026-02-01', undefined)],
  [stratumDensity('A', 'Metrosideros polymorpha'), densityCreated('300')],
  [stratumDensity('A', 'Dodonaea viscosa'), fieldUpdated('density', '200', undefined)],
  [site(), fieldUpdated(TEMP_PLOT_FIELD, 'Yes', 'No')],
]);

/** Oldest first, the order the API returns. */
const ALL_SAVES = [...SETTINGS_ONLY_SAVE, ...ONE_PLOT_SAVE, ...LATEST_SAVE];

const lastModified = (date: string, userName: string) =>
  strings.formatString(strings.LAST_MODIFIED_ON_BY, date, userName) as string;

const saveRow = (timestamp: string, user: typeof JENNIFER) =>
  `${DateTime.fromISO(timestamp).toFormat('yyyy-MM-dd HH:mm')} ${strings.BY} ${user.userName}`;

const summaryOf = (...parts: string[]) => parts.join(' · ');

const LATEST_SUMMARY = summaryOf(
  strings.T0_HISTORY_UPDATED,
  strings.formatString(strings.T0_HISTORY_PLOTS, 3) as string,
  strings.T0_HISTORY_STRATA_ONE,
  strings.T0_HISTORY_SITE_SETTINGS
);

/**
 * A change line mixes plain copy with separately styled old and new values, so the whole line has
 * to be matched against the text of the line rather than of a single node.
 */
const lineMatcher = (expected: string) => (_content: string, element: Element | null) =>
  element?.tagName === 'P' && element.textContent?.replace(/\s+/g, ' ').trim() === expected;

const changeLine = (expected: string) => screen.getByText(lineMatcher(expected));

const queryChangeLine = (expected: string) => screen.queryByText(lineMatcher(expected));

const renderHistory = async (events: Entry[]) => {
  mockPost('/api/v1/events/list', { events });
  const rendered = renderWithProviders(<T0ChangeHistory plantingSiteId={SITE_ID} />);
  await screen.findByRole('button', { name: strings.CHANGE_HISTORY });
  return rendered;
};

const openHistory = async (events: Entry[]) => {
  const rendered = await renderHistory(events);
  await rendered.user.click(screen.getByRole('button', { name: strings.CHANGE_HISTORY }));
  return rendered;
};

describe('T0ChangeHistory', () => {
  it('requests the t0 event log for the selected organization and planting site', async () => {
    const requests = captureRequests('post', '/api/v1/events/list', { events: ALL_SAVES });

    renderWithProviders(<T0ChangeHistory plantingSiteId={SITE_ID} />, {
      organization: { selectedOrganization: buildOrganization({ id: 42 }) },
    });

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({
      organizationId: 42,
      plantingSiteId: SITE_ID,
      subjects: ['PlantingSite', 'PlotT0Density', 'PlotT0Observation', 'StratumT0Density'],
    });
  });

  it('renders nothing when the site has no t0 history', async () => {
    const requests = captureRequests('post', '/api/v1/events/list', { events: [] });

    renderWithProviders(<T0ChangeHistory plantingSiteId={SITE_ID} />);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByRole('button', { name: strings.CHANGE_HISTORY })).not.toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(strings.LAST_MODIFIED_ON_BY.replace(/\{\d\}/g, '.*')))
    ).not.toBeInTheDocument();
  });

  it('attributes the last modification to the most recent save', async () => {
    await renderHistory(ALL_SAVES);

    expect(screen.getByText(lastModified('2026-06-15', JENNIFER.userName))).toBeInTheDocument();
    expect(screen.queryByText(lastModified('2026-06-01', RAFAEL.userName))).not.toBeInTheDocument();
  });

  it('keeps the list of saves hidden until the change history is opened', async () => {
    const { user } = await renderHistory(ALL_SAVES);

    expect(screen.queryByText(saveRow('2026-06-15T12:00:00Z', JENNIFER))).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: strings.CHANGE_HISTORY }));

    expect(screen.getByText(saveRow('2026-06-15T12:00:00Z', JENNIFER))).toBeInTheDocument();
    expect(screen.getByText(saveRow('2026-06-10T09:00:00Z', RAFAEL))).toBeInTheDocument();
    expect(screen.getByText(saveRow('2026-06-01T08:00:00Z', RAFAEL))).toBeInTheDocument();
  });

  it('summarizes each save by its distinct plots, strata and site settings', async () => {
    await openHistory(ALL_SAVES);

    // Plot 12 changed both its observation and a density, and stratum A two densities: the
    // summary counts the plots and strata touched, not the entries logged.
    expect(screen.getByRole('button', { name: LATEST_SUMMARY })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: summaryOf(strings.T0_HISTORY_UPDATED, strings.T0_HISTORY_PLOTS_ONE) })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.T0_HISTORY_UPDATED_SETTINGS })).toBeInTheDocument();
  });

  it('details the t0 changes of a save only once that save is expanded', async () => {
    const { user } = await openHistory(ALL_SAVES);
    const observationChanged = strings.formatString(
      strings.T0_HISTORY_OBSERVATION_CHANGED,
      'Jan 5, 2026',
      'Mar 10, 2026'
    ) as string;

    expect(queryChangeLine(observationChanged)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: LATEST_SUMMARY }));

    expect(screen.getByText(strings.formatString(strings.T0_HISTORY_PLOT, 12) as string)).toBeInTheDocument();
    expect(screen.getByText(strings.formatString(strings.T0_HISTORY_STRATUM, 'A') as string)).toBeInTheDocument();
    expect(screen.getByText(strings.PLANTING_SITE)).toBeInTheDocument();

    expect(changeLine(observationChanged)).toBeInTheDocument();
    expect(
      changeLine(strings.formatString(strings.T0_HISTORY_OBSERVATION_SET, 'Mar 10, 2026') as string)
    ).toBeInTheDocument();
    expect(
      changeLine(strings.formatString(strings.T0_HISTORY_OBSERVATION_REMOVED, 'Feb 1, 2026') as string)
    ).toBeInTheDocument();
  });

  it('shows the old and new density of each species in an expanded save', async () => {
    const { user } = await openHistory(ALL_SAVES);

    await user.click(screen.getByRole('button', { name: LATEST_SUMMARY }));

    expect(
      changeLine(strings.formatString(strings.T0_HISTORY_DENSITY_CHANGED, 'Acacia koa', '500', '450') as string)
    ).toBeInTheDocument();
    expect(
      changeLine(strings.formatString(strings.T0_HISTORY_DENSITY_SET, 'Metrosideros polymorpha', '300') as string)
    ).toBeInTheDocument();
    expect(
      changeLine(strings.formatString(strings.T0_HISTORY_DENSITY_REMOVED, 'Dodonaea viscosa') as string)
    ).toBeInTheDocument();
  });

  it('shows the temporary plot setting by the field name the server reports', async () => {
    const { user } = await openHistory(SETTINGS_ONLY_SAVE);

    await user.click(screen.getByRole('button', { name: strings.T0_HISTORY_UPDATED_SETTINGS }));

    expect(
      changeLine(strings.formatString(strings.VALUE_CHANGED_FROM_TO, TEMP_PLOT_FIELD, 'No', 'Yes') as string)
    ).toBeInTheDocument();
  });
});
