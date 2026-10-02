import { EventLogEntryPayload, MonitoringSpeciesSubjectPayload } from 'src/queries/generated/events';

import { summarizeMonitoringSpeciesEvents } from './monitoringSpeciesEvents';

let nextTimestamp = 0;

// The API localizes fieldName before sending it ("live count", not "totalLive"), so these are the
// values the grouping actually has to cope with.
const LIVE = 'live count';
const DEAD = 'dead count';
const EXISTING = 'existing count';

/** One event log entry: the API reports a species edit as one of these per changed count. */
const countEntry = ({
  changedFrom,
  changedTo,
  fieldName = LIVE,
  speciesName,
  timestamp,
  userId = 1,
}: {
  changedFrom?: string;
  changedTo?: string;
  fieldName?: string;
  speciesName: string;
  timestamp?: string;
  userId?: number;
}): EventLogEntryPayload => ({
  action: {
    type: 'FieldUpdated',
    fieldName,
    changedFrom: changedFrom === undefined ? undefined : [changedFrom],
    changedTo: changedTo === undefined ? undefined : [changedTo],
  },
  subject: {
    type: 'MonitoringSpecies',
    scientificName: speciesName,
    monitoringPlotId: 9,
    observationId: 7,
    plantingSiteId: 1,
    fullText: speciesName,
    shortText: speciesName,
  },
  // Each event row gets its own clock reading, so entries of one edit share a timestamp but
  // separate edits do not.
  timestamp: timestamp ?? `2026-10-02T12:00:00.${String(nextTimestamp++).padStart(3, '0')}Z`,
  userId,
  userName: 'Alex Edwards',
});

const otherEntry = (): EventLogEntryPayload => ({
  action: { type: 'FieldUpdated', fieldName: 'notes', changedFrom: ['a'], changedTo: ['b'] },
  subject: {
    type: 'ObservationPlot',
    monitoringPlotId: 9,
    observationId: 7,
    plantingSiteId: 1,
    fullText: 'Plot',
    shortText: 'Plot',
  },
  timestamp: '2026-10-02T12:00:00.500Z',
  userId: 1,
  userName: 'Alex Edwards',
});

const summarize = (events: EventLogEntryPayload[]) =>
  summarizeMonitoringSpeciesEvents(events, (subject: MonitoringSpeciesSubjectPayload) => subject.scientificName ?? '');

describe('summarizeMonitoringSpeciesEvents', () => {
  it('reads an edit whose old counts are all zero as the species being added', () => {
    const at = '2026-10-02T12:00:00.100Z';
    const events = [
      countEntry({ speciesName: 'Acacia koa', fieldName: LIVE, changedFrom: '0', changedTo: '6', timestamp: at }),
      countEntry({
        speciesName: 'Acacia koa',
        fieldName: EXISTING,
        changedFrom: '0',
        changedTo: '2',
        timestamp: at,
      }),
    ];

    const { summaries, redundant } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Acacia koa' });
    // The second count is already accounted for by the one message.
    expect(redundant.has(events[1])).toBe(true);
    expect(summaries.size).toBe(1);
  });

  it('reads an edit whose new counts are all zero as the species being removed', () => {
    const at = '2026-10-02T12:00:00.100Z';
    const events = [
      countEntry({ speciesName: 'Unknown', fieldName: LIVE, changedFrom: '2', changedTo: '0', timestamp: at }),
      countEntry({ speciesName: 'Unknown', fieldName: DEAD, changedFrom: '1', changedTo: '0', timestamp: at }),
    ];

    const { summaries, redundant } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Unknown' });
    expect(redundant.has(events[1])).toBe(true);
  });

  it('reads a removal next to an addition of the same counts as the species being changed', () => {
    const removedAt = '2026-10-02T12:00:00.100Z';
    const addedAt = '2026-10-02T12:00:00.101Z';
    const events = [
      countEntry({ speciesName: 'Duosperma angolense', changedFrom: '6', changedTo: '0', timestamp: removedAt }),
      countEntry({ speciesName: 'Abutilon eremitopetalum', changedFrom: '0', changedTo: '6', timestamp: addedAt }),
    ];

    const { summaries, redundant } = summarize(events);
    expect(summaries.get(events[0])).toEqual({
      kind: 'changed',
      speciesName: 'Duosperma angolense',
      toSpeciesName: 'Abutilon eremitopetalum',
    });
    expect(redundant.has(events[1])).toBe(true);
    expect(summaries.size).toBe(1);
  });

  it('pairs a change the same way when the list runs newest first', () => {
    const removedAt = '2026-10-02T12:00:00.100Z';
    const addedAt = '2026-10-02T12:00:00.101Z';
    const events = [
      countEntry({ speciesName: 'Abutilon eremitopetalum', changedFrom: '0', changedTo: '6', timestamp: addedAt }),
      countEntry({ speciesName: 'Duosperma angolense', changedFrom: '6', changedTo: '0', timestamp: removedAt }),
    ];

    // The removed species is the old one either way, so the message does not depend on list order.
    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({
      kind: 'changed',
      speciesName: 'Duosperma angolense',
      toSpeciesName: 'Abutilon eremitopetalum',
    });
  });

  it('does not read adding a species and later removing it as a species change', () => {
    const events = [
      countEntry({ speciesName: 'Carex meyenii', changedFrom: '0', changedTo: '5' }),
      countEntry({ speciesName: 'Carex meyenii', changedFrom: '5', changedTo: '0' }),
    ];

    // Two separate actions on one species. A species cannot be changed into itself.
    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Carex meyenii' });
    expect(summaries.get(events[1])).toEqual({ kind: 'removed', speciesName: 'Carex meyenii' });
  });

  it('does not pair a removal with an addition that carries different counts', () => {
    const events = [
      countEntry({ speciesName: 'Duosperma angolense', changedFrom: '6', changedTo: '0' }),
      countEntry({ speciesName: 'Abutilon eremitopetalum', changedFrom: '0', changedTo: '3' }),
    ];

    // A species change moves the counts across unchanged, so differing counts are two edits.
    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[1])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('does not pair a removal with an addition that touches different counts', () => {
    const events = [
      countEntry({ speciesName: 'Duosperma angolense', fieldName: LIVE, changedFrom: '6', changedTo: '0' }),
      countEntry({ speciesName: 'Abutilon eremitopetalum', fieldName: DEAD, changedFrom: '0', changedTo: '6' }),
    ];

    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[1])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('keeps a removal and an addition separate when something else was logged between them', () => {
    const events = [
      countEntry({ speciesName: 'Duosperma angolense', changedFrom: '6', changedTo: '0' }),
      otherEntry(),
      countEntry({ speciesName: 'Abutilon eremitopetalum', changedFrom: '0', changedTo: '6' }),
    ];

    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[2])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('leaves an ordinary count edit to render as a value change', () => {
    const events = [countEntry({ speciesName: 'Acacia koa', changedFrom: '4', changedTo: '9' })];

    const { summaries, redundant } = summarize(events);
    expect(summaries.size).toBe(0);
    expect(redundant.size).toBe(0);
  });

  it('leaves an edit that only touches some counts to render as a value change', () => {
    const at = '2026-10-02T12:00:00.100Z';
    const events = [
      countEntry({ speciesName: 'Acacia koa', fieldName: LIVE, changedFrom: '0', changedTo: '6', timestamp: at }),
      countEntry({ speciesName: 'Acacia koa', fieldName: DEAD, changedFrom: '3', changedTo: '1', timestamp: at }),
    ];

    // The species already had plants recorded against it, so this added nothing.
    const { summaries } = summarize(events);
    expect(summaries.size).toBe(0);
  });

  it('does not pair edits made by different people', () => {
    const events = [
      countEntry({ speciesName: 'Duosperma angolense', changedFrom: '6', changedTo: '0', userId: 1 }),
      countEntry({ speciesName: 'Abutilon eremitopetalum', changedFrom: '0', changedTo: '6', userId: 2 }),
    ];

    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[1])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('handles no events', () => {
    expect(summarize([]).summaries.size).toBe(0);
    expect(summarizeMonitoringSpeciesEvents(undefined, () => '').summaries.size).toBe(0);
  });
});
