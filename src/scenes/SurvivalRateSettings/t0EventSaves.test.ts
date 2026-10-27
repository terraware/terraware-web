import {
  EventLogEntryPayload,
  PlotT0DensitySubjectPayload,
  PlotT0ObservationSubjectPayload,
  StratumT0DensitySubjectPayload,
} from 'src/queries/generated/events';

import {
  SAVE_WINDOW_MS,
  T0DensityChange,
  T0ObservationChange,
  T0SettingChange,
  groupT0EventsIntoSaves,
} from './t0EventSaves';

const PLANTING_SITE_ID = 1;
const BASE_TIME = Date.parse('2026-10-02T12:00:00.000Z');

/** Fixture timestamps are expressed as seconds after the start of the log. */
const at = (seconds: number) => new Date(BASE_TIME + seconds * 1000).toISOString();

const WINDOW_SECONDS = SAVE_WINDOW_MS / 1000;

type When = { seconds: number; userId?: number; userName?: string };

const stamp = ({ seconds, userId = 1, userName = 'Alex Edwards' }: When) => ({
  timestamp: at(seconds),
  userId,
  userName,
});

const plotDensitySubject = (plotNumber: number, speciesName: string): PlotT0DensitySubjectPayload => ({
  type: 'PlotT0Density',
  monitoringPlotId: 100 + plotNumber,
  plantingSiteId: PLANTING_SITE_ID,
  plotNumber,
  scientificName: speciesName,
  speciesId: 10,
  fullText: `Plot ${plotNumber} ${speciesName}`,
  shortText: speciesName,
});

const STRATUM_IDS: Record<string, number> = { North: 21, South: 22, West: 23 };

const stratumDensitySubject = (stratumName: string, speciesName: string): StratumT0DensitySubjectPayload => ({
  type: 'StratumT0Density',
  plantingSiteId: PLANTING_SITE_ID,
  scientificName: speciesName,
  speciesId: 10,
  stratumId: STRATUM_IDS[stratumName],
  stratumName,
  fullText: `${stratumName} ${speciesName}`,
  shortText: speciesName,
});

const plotObservationSubject = (plotNumber: number): PlotT0ObservationSubjectPayload => ({
  type: 'PlotT0Observation',
  monitoringPlotId: 100 + plotNumber,
  plantingSiteId: PLANTING_SITE_ID,
  plotNumber,
  fullText: `Plot ${plotNumber} T0 observation`,
  shortText: `Plot ${plotNumber}`,
});

/** Setting a density logs a `Created` action, whose field names the server does not localize. */
const densitySet = ({
  density,
  plotNumber,
  speciesName,
  stratumName,
  ...when
}: When & {
  density: string;
  plotNumber?: number;
  speciesName: string;
  stratumName?: string;
}): EventLogEntryPayload => ({
  action: { type: 'Created', fields: [{ fieldName: 'density', value: [density] }] },
  subject:
    stratumName === undefined
      ? plotDensitySubject(plotNumber ?? 1, speciesName)
      : stratumDensitySubject(stratumName, speciesName),
  ...stamp(when),
});

/**
 * Changing a density logs a `FieldUpdated` action. Its `fieldName` arrives localized, so the
 * fixtures use a non-English name: nothing may match on it. A removed density has no `changedTo`.
 */
const densityChanged = ({
  fieldName = 'densité',
  from,
  plotNumber,
  speciesName,
  stratumName,
  to,
  ...when
}: When & {
  fieldName?: string;
  from: string;
  plotNumber?: number;
  speciesName: string;
  stratumName?: string;
  to?: string;
}): EventLogEntryPayload => ({
  action: { type: 'FieldUpdated', fieldName, changedFrom: [from], changedTo: to === undefined ? undefined : [to] },
  subject:
    stratumName === undefined
      ? plotDensitySubject(plotNumber ?? 1, speciesName)
      : stratumDensitySubject(stratumName, speciesName),
  ...stamp(when),
});

/** The t0 observation of a plot, reported as the observations' start dates. */
const observationChanged = ({
  fieldName = 'observación',
  fromDate,
  plotNumber,
  toDate,
  ...when
}: When & { fieldName?: string; fromDate?: string; plotNumber: number; toDate?: string }): EventLogEntryPayload => ({
  action: {
    type: 'FieldUpdated',
    fieldName,
    changedFrom: fromDate === undefined ? undefined : [fromDate],
    changedTo: toDate === undefined ? undefined : [toDate],
  },
  subject: plotObservationSubject(plotNumber),
  ...stamp(when),
});

/** The server adds this second entry when both observations start on the same date. */
const observationIdsChanged = ({
  fieldName = 'observación',
  fromId,
  plotNumber,
  toId,
  ...when
}: When & { fieldName?: string; fromId?: string; plotNumber: number; toId?: string }): EventLogEntryPayload => ({
  action: {
    type: 'FieldUpdated',
    fieldName,
    changedFrom: fromId === undefined ? undefined : [fromId],
    changedTo: toId === undefined ? undefined : [toId],
  },
  subject: plotObservationSubject(plotNumber),
  ...stamp(when),
});

const temporaryPlotSettingChanged = ({
  fieldName = 'parcelles temporaires',
  from,
  to,
  ...when
}: When & { fieldName?: string; from: string; to: string }): EventLogEntryPayload => ({
  action: { type: 'FieldUpdated', fieldName, changedFrom: [from], changedTo: [to] },
  subject: {
    type: 'PlantingSite',
    plantingSiteId: PLANTING_SITE_ID,
    fullText: 'Planting site',
    shortText: 'Site',
  },
  ...stamp(when),
});

const unrelatedEntry = (when: When): EventLogEntryPayload => ({
  action: { type: 'FieldUpdated', fieldName: 'notes', changedFrom: ['a'], changedTo: ['b'] },
  subject: {
    type: 'ObservationPlot',
    monitoringPlotId: 101,
    observationId: 7,
    plantingSiteId: PLANTING_SITE_ID,
    fullText: 'Plot',
    shortText: 'Plot',
  },
  ...stamp(when),
});

const densityDeleted = ({
  plotNumber,
  speciesName,
  ...when
}: When & { plotNumber: number; speciesName: string }): EventLogEntryPayload => ({
  action: { type: 'Deleted' },
  subject: plotDensitySubject(plotNumber, speciesName),
  ...stamp(when),
});

describe('groupT0EventsIntoSaves', () => {
  it('reads the several requests of one save as a single save', () => {
    // A save sends plot densities, stratum densities and the temporary plot setting separately.
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 0 }),
      densitySet({ stratumName: 'North', speciesName: 'Acacia koa', density: '95', seconds: 3 }),
      temporaryPlotSettingChanged({ from: 'false', to: 'true', seconds: 6 }),
    ]);

    expect(saves).toHaveLength(1);
    expect(saves[0]).toMatchObject({
      includesSiteSetting: true,
      plotCount: 1,
      stratumCount: 1,
      timestamp: at(6),
      userName: 'Alex Edwards',
    });
  });

  it('measures the window from the first entry, so a run of saves cannot chain into one', () => {
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 0 }),
      densitySet({ plotNumber: 2, speciesName: 'Acacia koa', density: '120', seconds: WINDOW_SECONDS }),
      densitySet({ plotNumber: 3, speciesName: 'Acacia koa', density: '120', seconds: WINDOW_SECONDS * 2 }),
    ]);

    expect(saves).toHaveLength(2);
    expect(saves.map((save) => save.plotCount)).toEqual([1, 2]);
    expect(saves.map((save) => save.timestamp)).toEqual([at(WINDOW_SECONDS * 2), at(WINDOW_SECONDS)]);
  });

  it('starts a new save when the next entry falls outside the window', () => {
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 0 }),
      densitySet({ plotNumber: 2, speciesName: 'Acacia koa', density: '130', seconds: WINDOW_SECONDS + 1 }),
    ]);

    expect(saves).toHaveLength(2);
    expect(saves.map((save) => save.timestamp)).toEqual([at(WINDOW_SECONDS + 1), at(0)]);
  });

  it('starts a new save when another person saved within the window', () => {
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 0, userId: 1 }),
      densitySet({
        plotNumber: 2,
        speciesName: 'Acacia koa',
        density: '130',
        seconds: 2,
        userId: 2,
        userName: 'Robin Diaz',
      }),
    ]);

    expect(saves).toHaveLength(2);
    expect(saves.map((save) => save.userName)).toEqual(['Robin Diaz', 'Alex Edwards']);
  });

  it('counts each plot and stratum once however many of its densities changed', () => {
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 0 }),
      densitySet({ plotNumber: 1, speciesName: 'Carex meyenii', density: '80', seconds: 1 }),
      observationChanged({ plotNumber: 1, toDate: '2026-03-01', seconds: 2 }),
      densitySet({ plotNumber: 2, speciesName: 'Acacia koa', density: '120', seconds: 3 }),
      densitySet({ stratumName: 'North', speciesName: 'Acacia koa', density: '95', seconds: 4 }),
      densitySet({ stratumName: 'North', speciesName: 'Carex meyenii', density: '60', seconds: 5 }),
    ]);

    expect(saves).toHaveLength(1);
    expect(saves[0]).toMatchObject({ includesSiteSetting: false, plotCount: 2, stratumCount: 1 });
    expect(saves[0].groups).toHaveLength(3);
  });

  it('lists saves most recent first', () => {
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '100', seconds: 0 }),
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '200', seconds: 600 }),
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '300', seconds: 1200 }),
    ]);

    expect(saves.map((save) => save.timestamp)).toEqual([at(1200), at(600), at(0)]);
  });

  it('orders a save as plots by number, then strata by name, then the site setting', () => {
    const saves = groupT0EventsIntoSaves([
      temporaryPlotSettingChanged({ from: 'false', to: 'true', seconds: 0 }),
      densitySet({ stratumName: 'South', speciesName: 'Acacia koa', density: '95', seconds: 1 }),
      densitySet({ stratumName: 'North', speciesName: 'Acacia koa', density: '95', seconds: 2 }),
      densitySet({ plotNumber: 12, speciesName: 'Acacia koa', density: '120', seconds: 3 }),
      densitySet({ plotNumber: 2, speciesName: 'Acacia koa', density: '120', seconds: 4 }),
    ]);

    expect(saves[0].groups.map((group) => group.key)).toEqual([
      'plot-102',
      'plot-112',
      'stratum-21',
      'stratum-22',
      'site',
    ]);
    expect(saves[0].groups.map((group) => (group.kind === 'stratum' ? group.stratumName : group.kind))).toEqual([
      'plot',
      'plot',
      'North',
      'South',
      'site',
    ]);
  });

  it('puts the observation change before the densities, and orders densities by species name', () => {
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Carex meyenii', density: '80', seconds: 0 }),
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 1 }),
      observationChanged({ plotNumber: 1, toDate: '2026-03-01', seconds: 2 }),
    ]);

    expect(saves[0].groups[0].changes).toEqual([
      { fromDate: undefined, toDate: '2026-03-01', type: 'observation' },
      { speciesName: 'Acacia koa', to: '120', type: 'density' },
      { speciesName: 'Carex meyenii', to: '80', type: 'density' },
    ]);
  });

  it('reads a created density as the value it was set to', () => {
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 0 }),
    ]);

    expect(saves[0].groups[0].changes[0]).toEqual({ speciesName: 'Acacia koa', to: '120', type: 'density' });
  });

  it('reads a changed density from its values rather than its localized field name', () => {
    const saves = groupT0EventsIntoSaves([
      densityChanged({ plotNumber: 1, speciesName: 'Acacia koa', from: '120', to: '95.5', seconds: 0 }),
      densityChanged({
        stratumName: 'North',
        speciesName: 'Carex meyenii',
        fieldName: 'Pflanzdichte',
        from: '60',
        to: '70',
        seconds: 1,
      }),
    ]);

    expect(saves[0].groups[0].changes[0]).toEqual({
      from: '120',
      speciesName: 'Acacia koa',
      to: '95.5',
      type: 'density',
    });
    expect(saves[0].groups[1].changes[0]).toEqual({
      from: '60',
      speciesName: 'Carex meyenii',
      to: '70',
      type: 'density',
    });
  });

  it('reads a density with no new value as the density being removed', () => {
    const saves = groupT0EventsIntoSaves([
      densityChanged({ plotNumber: 1, speciesName: 'Acacia koa', from: '120', seconds: 0 }),
    ]);

    const change = saves[0].groups[0].changes[0] as T0DensityChange;
    expect(change).toMatchObject({ from: '120', speciesName: 'Acacia koa', type: 'density' });
    expect(change.to).toBeUndefined();
  });

  it('reads an observation assigned to a plot that had none', () => {
    const saves = groupT0EventsIntoSaves([observationChanged({ plotNumber: 1, toDate: '2026-03-01', seconds: 0 })]);

    expect(saves[0].groups[0].changes[0]).toEqual({
      fromDate: undefined,
      toDate: '2026-03-01',
      type: 'observation',
    });
  });

  it('reads an observation replaced by manual densities', () => {
    const saves = groupT0EventsIntoSaves([
      observationChanged({ plotNumber: 1, fromDate: '2026-03-01', seconds: 0 }),
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 1 }),
    ]);

    const change = saves[0].groups[0].changes[0] as T0ObservationChange;
    expect(change).toMatchObject({ fromDate: '2026-03-01', type: 'observation' });
    expect(change.toDate).toBeUndefined();
  });

  it('merges the observation ids the server logs separately into the one observation change', () => {
    // Both observations started on the same date, so the server adds an entry holding their ids.
    const saves = groupT0EventsIntoSaves([
      observationChanged({ plotNumber: 1, fromDate: '2026-03-01', toDate: '2026-03-01', seconds: 0 }),
      observationIdsChanged({ plotNumber: 1, fromId: '123', toId: '456', seconds: 0 }),
    ]);

    expect(saves[0].groups[0].changes).toEqual([
      {
        fromDate: '2026-03-01',
        fromObservationId: '123',
        toDate: '2026-03-01',
        toObservationId: '456',
        type: 'observation',
      },
    ]);
  });

  it('keeps the ids with the observation change of their own plot', () => {
    const saves = groupT0EventsIntoSaves([
      observationChanged({ plotNumber: 1, fromDate: '2026-03-01', toDate: '2026-03-01', seconds: 0 }),
      observationChanged({ plotNumber: 2, fromDate: '2026-04-01', toDate: '2026-05-01', seconds: 1 }),
      observationIdsChanged({ plotNumber: 1, fromId: '123', toId: '456', seconds: 2 }),
    ]);

    expect(saves[0].groups[0].changes).toEqual([
      {
        fromDate: '2026-03-01',
        fromObservationId: '123',
        toDate: '2026-03-01',
        toObservationId: '456',
        type: 'observation',
      },
    ]);
    expect(saves[0].groups[1].changes).toEqual([{ fromDate: '2026-04-01', toDate: '2026-05-01', type: 'observation' }]);
  });

  it('reads the temporary plot setting from the planting site subject', () => {
    const saves = groupT0EventsIntoSaves([
      temporaryPlotSettingChanged({ fieldName: 'parcelles temporaires', from: 'false', to: 'true', seconds: 0 }),
    ]);

    expect(saves[0].includesSiteSetting).toBe(true);
    expect(saves[0].groups[0].changes[0] as T0SettingChange).toEqual({
      fieldName: 'parcelles temporaires',
      from: 'false',
      to: 'true',
      type: 'setting',
    });
  });

  it('ignores entries about other kinds of subjects', () => {
    // The unrelated entry sits between two t0 entries of one save and must not split it.
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 0 }),
      unrelatedEntry({ seconds: 1 }),
      densitySet({ plotNumber: 2, speciesName: 'Acacia koa', density: '130', seconds: 2 }),
    ]);

    expect(saves).toHaveLength(1);
    expect(saves[0].plotCount).toBe(2);
    expect(saves[0].groups.flatMap((group) => group.changes)).toHaveLength(2);
  });

  it('drops a save that produced nothing to show', () => {
    const saves = groupT0EventsIntoSaves([
      densityDeleted({ plotNumber: 1, speciesName: 'Acacia koa', seconds: 0 }),
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '120', seconds: 600 }),
    ]);

    expect(saves).toHaveLength(1);
    expect(saves[0].timestamp).toBe(at(600));
  });

  it('orders the log by timestamp itself', () => {
    const events = [
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '100', seconds: 0 }),
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '200', seconds: 600 }),
    ];

    expect(groupT0EventsIntoSaves([...events].reverse()).map((save) => save.timestamp)).toEqual([at(600), at(0)]);
  });

  it('gives each save of a log its own key', () => {
    const saves = groupT0EventsIntoSaves([
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '100', seconds: 0 }),
      densitySet({ plotNumber: 1, speciesName: 'Acacia koa', density: '200', seconds: 600 }),
    ]);

    expect(new Set(saves.map((save) => save.key)).size).toBe(2);
  });

  it('handles no events', () => {
    expect(groupT0EventsIntoSaves([])).toEqual([]);
    expect(groupT0EventsIntoSaves(undefined)).toEqual([]);
  });
});
