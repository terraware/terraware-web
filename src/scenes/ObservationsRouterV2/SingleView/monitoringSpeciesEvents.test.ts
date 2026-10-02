import { EventLogEntryPayload, MonitoringSpeciesSubjectPayload } from 'src/queries/generated/events';

import { getMonitoringSpeciesKey, summarizeMonitoringSpeciesEvents } from './monitoringSpeciesEvents';

// The API localizes fieldName before sending it ("live count", not "totalLive"), so these are the
// values the grouping actually has to cope with.
const COUNT_FIELD_NAMES = ['existing count', 'live count', 'dead count'];

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

/**
 * The entries one plant count edit produces. The API reports a count only when it changed, and
 * stamps the entries of a single edit with one timestamp, so the fixtures do the same.
 */
const speciesEdit = ({ from, speciesName, to, userId = 1 }: Edit): EventLogEntryPayload[] => {
  const timestamp = nextTimestampValue();
  return COUNT_FIELD_NAMES.map((fieldName, position) => ({
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

/**
 * A plot's history, oldest edit first, along with the plant counts those edits leave behind. The
 * summary replays the log backwards from those counts, so the two have to agree the way the API
 * and the observation results do.
 */
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

describe('summarizeMonitoringSpeciesEvents', () => {
  it('reads an add that left two counts at zero as the species being added', () => {
    // The edit reports only the live count, because the others went from 0 to 0.
    const { currentTotals, events } = history({ speciesName: 'Vigna owahuensis', from: [0, 0, 0], to: [0, 2, 1] });
    expect(events).toHaveLength(2);

    const { summaries, redundant } = summarize(events, currentTotals);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Vigna owahuensis' });
    expect(redundant.has(events[1])).toBe(true);
  });

  it('reads an add of a single count as the species being added', () => {
    const { currentTotals, events } = history({ speciesName: 'Carex meyenii', from: [0, 0, 0], to: [0, 5, 0] });
    expect(events).toHaveLength(1);

    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Carex meyenii' });
  });

  it('reads an edit that emptied the species as it being removed', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Carex meyenii', from: [0, 0, 0], to: [0, 5, 0] },
      { speciesName: 'Carex meyenii', from: [0, 5, 0], to: [0, 0, 0] }
    );

    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Carex meyenii' });
    expect(summaries.get(events[1])).toEqual({ kind: 'removed', speciesName: 'Carex meyenii' });
  });

  it('does not read raising one count from zero as the species being added', () => {
    // The species already had live plants; only its dead count changed.
    const { currentTotals, events } = history(
      { speciesName: 'Acacia koa', from: [0, 0, 0], to: [0, 4, 0] },
      { speciesName: 'Acacia koa', from: [0, 4, 0], to: [0, 4, 2] }
    );

    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Acacia koa' });
    expect(summaries.get(events[1])).toBeUndefined();
  });

  it('does not read dropping one count to zero as the species being removed', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Acacia koa', from: [0, 0, 0], to: [0, 4, 2] },
      { speciesName: 'Acacia koa', from: [0, 4, 2], to: [0, 4, 0] }
    );

    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[2])).toBeUndefined();
  });

  it('reads a removal next to an addition of the same counts as the species being changed', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }
    );
    // The first edit is the original add; the change is the last two.
    const changeEntries = events.slice(3);

    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(changeEntries[0])).toEqual({
      kind: 'changed',
      speciesName: 'Duosperma angolense',
      toSpeciesName: 'Abutilon eremitopetalum',
    });
  });

  it('pairs a change the same way when the list runs newest first', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }
    );

    // The replay orders the log by timestamp itself, so display order does not affect it.
    const { summaries } = summarize([...events].reverse(), currentTotals);
    const changed = [...summaries.values()].find((summary) => summary.kind === 'changed');
    expect(changed).toEqual({
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

    // Two separate actions on one species. A species cannot be changed into itself.
    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Carex meyenii' });
    expect(summaries.get(events[3])).toEqual({ kind: 'removed', speciesName: 'Carex meyenii' });
  });

  it('does not pair a removal with an addition that carries different counts', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [3, 7, 2] }
    );

    // A species change moves the counts across unchanged, so differing counts are two edits.
    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[3])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[6])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('keeps a removal and an addition separate when something else was logged between them', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      'other',
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }
    );

    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[3])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[7])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('does not pair edits made by different people', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0], userId: 1 },
      { speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1], userId: 2 }
    );

    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[3])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[6])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('leaves an ordinary count edit to render as a value change', () => {
    const { currentTotals, events } = history(
      { speciesName: 'Acacia koa', from: [0, 0, 0], to: [0, 4, 1] },
      { speciesName: 'Acacia koa', from: [0, 4, 1], to: [0, 9, 1] }
    );

    const { summaries } = summarize(events, currentTotals);
    expect(summaries.get(events[2])).toBeUndefined();
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

  it('handles no events', () => {
    expect(summarize([], new Map()).summaries.size).toBe(0);
    expect(summarizeMonitoringSpeciesEvents(undefined, () => '', new Map()).summaries.size).toBe(0);
  });
});
