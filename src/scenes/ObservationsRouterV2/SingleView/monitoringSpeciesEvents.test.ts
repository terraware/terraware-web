import { EventLogEntryPayload, MonitoringSpeciesSubjectPayload } from 'src/queries/generated/events';

import { getMonitoringSpeciesKey, summarizeMonitoringSpeciesEvents } from './monitoringSpeciesEvents';

// The API localizes fieldName before sending it ("live count", not "totalLive"), so these are the
// values the grouping actually has to cope with.
const EXISTING = 'existing count';
const LIVE = 'live count';
const DEAD = 'dead count';
/** The order the API reports counts in; position is the slot each one holds in `Counts`. */
const COUNT_FIELDS: { name: string; position: number }[] = [
  { name: EXISTING, position: 0 },
  { name: LIVE, position: 1 },
  { name: DEAD, position: 2 },
];

/** Plant counts in the order the fixtures below list them: existing, live, dead. */
type Counts = [number, number, number];

type Edit = {
  from: Counts;
  speciesName?: string;
  to: Counts;
  userId?: number;
};

let nextTimestamp = 0;
const nextTimestampValue = () => `2026-10-02T12:00:00.${String(nextTimestamp++).padStart(3, '0')}Z`;

const total = (counts: Counts) => counts[0] + counts[1] + counts[2];

const countEntry = (
  speciesName: string | undefined,
  fieldName: string,
  changedFrom: number,
  changedTo: number,
  timestamp: string,
  userId: number
): EventLogEntryPayload => ({
  action: {
    type: 'FieldUpdated',
    fieldName,
    changedFrom: [String(changedFrom)],
    changedTo: [String(changedTo)],
  },
  subject: {
    type: 'MonitoringSpecies',
    scientificName: speciesName,
    monitoringPlotId: 9,
    observationId: 7,
    plantingSiteId: 1,
    fullText: `Species ${speciesName ?? 'Unknown'}`,
    shortText: 'Species',
  },
  timestamp,
  userId,
  userName: 'Alex Edwards',
});

/** The API reports a count only when it changed, and stamps one edit's entries with one timestamp. */
const speciesEdit = ({ from, speciesName, to, userId = 1 }: Edit): EventLogEntryPayload[] => {
  const timestamp = nextTimestampValue();
  return COUNT_FIELDS.map(({ name: fieldName, position }) => ({
    after: to[position],
    before: from[position],
    fieldName,
  }))
    .filter(({ after, before }) => after !== before)
    .map(({ after, before, fieldName }) => countEntry(speciesName, fieldName, before, after, timestamp, userId));
};

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
  timestamp: nextTimestampValue(),
  userId: 1,
  userName: 'Alex Edwards',
});

/** A plot's history, oldest edit first, with the counts those edits leave behind. */
const history = (...edits: (Edit | 'other')[]) => {
  const events: EventLogEntryPayload[] = [];
  const currentTotals = new Map<string, number>();
  edits.forEach((edit) => {
    if (edit === 'other') {
      events.push(otherEntry());
      return;
    }
    events.push(...speciesEdit(edit));
    currentTotals.set(getMonitoringSpeciesKey(undefined, edit.speciesName), total(edit.to));
  });
  return { currentTotals, events };
};

const summarize = (events: EventLogEntryPayload[], currentTotals: Map<string, number>) =>
  summarizeMonitoringSpeciesEvents(
    events,
    (subject: MonitoringSpeciesSubjectPayload) => subject.scientificName ?? 'Unknown',
    currentTotals
  );

const summariesOf = (result: ReturnType<typeof summarize>) =>
  result.events.flatMap((entry) => result.summaries.get(entry) ?? []);

describe('summarizeMonitoringSpeciesEvents', () => {
  it('reads an add of a single count as the species being added', () => {
    const { currentTotals, events } = history({ speciesName: 'Carex meyenii', from: [0, 0, 0], to: [0, 5, 0] });
    expect(events).toHaveLength(1);

    const result = summarize(events, currentTotals);
    expect(summariesOf(result)).toMatchObject([{ kind: 'added', speciesName: 'Carex meyenii' }]);
    expect(result.redundant.size).toBe(0);
    expect(result.events).toHaveLength(2);
  });

  it('reads an edit that emptied the species as it being removed', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Carex meyenii', from: [0, 0, 0], to: [2, 5, 1] },
      { speciesName: 'Carex meyenii', from: [2, 5, 1], to: [0, 0, 0] }
    );

    const result = summarize(events, currentTotals);
    expect(summariesOf(result)).toMatchObject([
      { kind: 'added', speciesName: 'Carex meyenii' },
      { kind: 'removed', speciesName: 'Carex meyenii' },
    ]);
    expect(result.events.indexOf(events[2])).toBeLessThan(result.events.length - 4);
    expect(result.redundant.size).toBe(0);
  });

  it('does not read raising one count from zero as the species being added', () => {
    // The species already had live plants; only its dead count changed.
    const { currentTotals, events } = history(
      { speciesName: 'Acacia koa', from: [0, 0, 0], to: [0, 4, 0] },
      { speciesName: 'Acacia koa', from: [0, 4, 0], to: [0, 4, 2] }
    );

    expect(summariesOf(summarize(events, currentTotals))).toMatchObject([{ kind: 'added', speciesName: 'Acacia koa' }]);
  });

  it('does not read dropping one count to zero as the species being removed', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Acacia koa', from: [0, 0, 0], to: [0, 4, 2] },
      { speciesName: 'Acacia koa', from: [0, 4, 2], to: [0, 4, 0] }
    );

    expect(summariesOf(summarize(events, currentTotals))).toMatchObject([{ kind: 'added', speciesName: 'Acacia koa' }]);
  });

  it('reads a removal next to an addition of the same counts as the species being changed', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }
    );
    const result = summarize(events, currentTotals);
    expect(summariesOf(result)).toMatchObject([
      { kind: 'added', speciesName: 'Duosperma angolense' },
      { kind: 'changed', speciesName: 'Duosperma angolense', toSpeciesName: 'Abutilon eremitopetalum' },
    ]);
    expect(events.slice(3).every((entry) => result.redundant.has(entry))).toBe(true);
  });

  it('pairs a change the same way when the list runs newest first', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }
    );

    // The replay orders the log by timestamp itself, so display order does not affect it.
    const changed = summariesOf(summarize([...events].reverse(), currentTotals)).find(
      (summary) => summary.kind === 'changed'
    );
    expect(changed).toMatchObject({
      kind: 'changed',
      speciesName: 'Duosperma angolense',
      toSpeciesName: 'Abutilon eremitopetalum',
    });
  });

  it('does not read adding a species and later removing it as a species change', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Carex meyenii', from: [0, 0, 0], to: [2, 5, 1] },
      { speciesName: 'Carex meyenii', from: [2, 5, 1], to: [0, 0, 0] }
    );

    expect(summariesOf(summarize(events, currentTotals))).toMatchObject([
      { kind: 'added', speciesName: 'Carex meyenii' },
      { kind: 'removed', speciesName: 'Carex meyenii' },
    ]);
  });

  it('does not pair a removal with an addition that carries different counts', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [3, 7, 2] }
    );

    expect(summariesOf(summarize(events, currentTotals))).toMatchObject([
      { kind: 'added', speciesName: 'Duosperma angolense' },
      { kind: 'removed', speciesName: 'Duosperma angolense' },
      { kind: 'added', speciesName: 'Abutilon eremitopetalum' },
    ]);
  });

  it('keeps a removal and an addition separate when something else was logged between them', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      'other',
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }
    );

    expect(summariesOf(summarize(events, currentTotals))).toMatchObject([
      { kind: 'added', speciesName: 'Duosperma angolense' },
      { kind: 'removed', speciesName: 'Duosperma angolense' },
      { kind: 'added', speciesName: 'Abutilon eremitopetalum' },
    ]);
  });

  it('does not pair edits made by different people', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0], userId: 1 },
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1], userId: 2 }
    );

    expect(summariesOf(summarize(events, currentTotals))).toMatchObject([
      { kind: 'added', speciesName: 'Duosperma angolense' },
      { kind: 'removed', speciesName: 'Duosperma angolense' },
      { kind: 'added', speciesName: 'Abutilon eremitopetalum' },
    ]);
  });

  it('leaves an ordinary count edit to render as a value change', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Acacia koa', from: [0, 0, 0], to: [0, 4, 1] },
      { speciesName: 'Acacia koa', from: [0, 4, 1], to: [0, 9, 1] }
    );

    expect(summariesOf(summarize(events, currentTotals))).toMatchObject([{ kind: 'added', speciesName: 'Acacia koa' }]);
  });

  it('says nothing about a species whose counts cannot be replayed', () => {
    const { events } = history({ speciesName: 'Acacia koa', from: [0, 0, 0], to: [0, 5, 0] });

    // Merging species moves plants without logging an event, leaving the log unable to account for
    // the counts the plot ends up with. Describing that species from a bad replay is not an option.
    const driftedTotals = new Map([[getMonitoringSpeciesKey(undefined, 'Acacia koa'), 2]]);
    const { summaries, redundant } = summarize(events, driftedTotals);
    expect(summaries.size).toBe(0);
    expect(redundant.size).toBe(0);
  });

  it('reports the counts the edit put in, labelled as the API named them', () => {
    const { currentTotals, events } = history({
      speciesName: 'Abutilon eremitopetalum',
      from: [0, 0, 0],
      to: [3, 4, 5],
    });

    const [summary] = summariesOf(summarize(events, currentTotals));
    expect(summary.counts).toEqual([
      { label: EXISTING, value: '3' },
      { label: LIVE, value: '4' },
      { label: DEAD, value: '5' },
    ]);
  });

  it('reports the counts the edit took out, leaving out the ones that were already zero', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Acacia koa', from: [0, 0, 0], to: [0, 4, 1] },
      { speciesName: 'Acacia koa', from: [0, 4, 1], to: [0, 0, 0] }
    );

    // Pre-existing was zero throughout, so no plants were removed under it.
    const removal = summariesOf(summarize(events, currentTotals)).find((item) => item.kind === 'removed');
    expect(removal?.counts).toEqual([
      { label: LIVE, value: '4' },
      { label: DEAD, value: '1' },
    ]);
  });

  it('handles no events', () => {
    expect(summarize([], new Map()).summaries.size).toBe(0);
    expect(summarizeMonitoringSpeciesEvents(undefined, () => '', new Map()).summaries.size).toBe(0);
  });
});
