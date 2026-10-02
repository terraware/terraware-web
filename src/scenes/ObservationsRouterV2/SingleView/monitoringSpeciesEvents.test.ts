import { EventLogEntryPayload, MonitoringSpeciesSubjectPayload } from 'src/queries/generated/events';

import { summarizeMonitoringSpeciesEvents } from './monitoringSpeciesEvents';

// The API localizes fieldName before sending it ("live count", not "totalLive"), so these are the
// values the grouping actually has to cope with.
const EXISTING = 'existing count';
const LIVE = 'live count';
const DEAD = 'dead count';

/** Plant counts in the order the fixtures below list them: existing, live, dead. */
type Counts = [number, number, number];

let nextTimestamp = 0;
const nextTimestampValue = () => `2026-10-02T12:00:00.${String(nextTimestamp++).padStart(3, '0')}Z`;

const countEntry = ({
  changedFrom,
  changedTo,
  fieldName,
  speciesName,
  timestamp,
  userId,
}: {
  changedFrom: string;
  changedTo: string;
  fieldName: string;
  speciesName: string;
  timestamp: string;
  userId: number;
}): EventLogEntryPayload => ({
  action: { type: 'FieldUpdated', fieldName, changedFrom: [changedFrom], changedTo: [changedTo] },
  subject: {
    type: 'MonitoringSpecies',
    scientificName: speciesName,
    monitoringPlotId: 9,
    observationId: 7,
    plantingSiteId: 1,
    fullText: `Species ${speciesName}`,
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
const speciesEdit = ({
  from,
  speciesName,
  timestamp = nextTimestampValue(),
  to,
  userId = 1,
}: {
  from: Counts;
  speciesName: string;
  timestamp?: string;
  to: Counts;
  userId?: number;
}): EventLogEntryPayload[] =>
  [EXISTING, LIVE, DEAD]
    .map((fieldName, position) => ({ after: to[position], before: from[position], fieldName }))
    .filter(({ after, before }) => after !== before)
    .map(({ after, before, fieldName }) =>
      countEntry({
        changedFrom: String(before),
        changedTo: String(after),
        fieldName,
        speciesName,
        timestamp,
        userId,
      })
    );

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

const summarize = (events: EventLogEntryPayload[]) =>
  summarizeMonitoringSpeciesEvents(events, (subject: MonitoringSpeciesSubjectPayload) => subject.scientificName ?? '');

describe('summarizeMonitoringSpeciesEvents', () => {
  it('reads an edit that raised every count from zero as the species being added', () => {
    const events = speciesEdit({ speciesName: 'Acacia koa', from: [0, 0, 0], to: [2, 6, 1] });
    expect(events).toHaveLength(3);

    const { summaries, redundant } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Acacia koa' });
    // The other counts are already accounted for by the one message.
    expect(redundant.has(events[1])).toBe(true);
    expect(redundant.has(events[2])).toBe(true);
    expect(summaries.size).toBe(1);
  });

  it('reads an edit that dropped every count to zero as the species being removed', () => {
    const events = speciesEdit({ speciesName: 'Unknown', from: [2, 6, 1], to: [0, 0, 0] });

    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Unknown' });
  });

  it('does not read raising one count from zero as the species being added', () => {
    // The species already had live plants; only its dead count changed.
    const events = speciesEdit({ speciesName: 'Acacia koa', from: [0, 4, 0], to: [0, 4, 2] });
    expect(events).toHaveLength(1);

    // The edit says nothing about the counts it left alone, so it cannot be read as an addition.
    const { summaries, redundant } = summarize(events);
    expect(summaries.size).toBe(0);
    expect(redundant.size).toBe(0);
  });

  it('does not read dropping one count to zero as the species being removed', () => {
    const events = speciesEdit({ speciesName: 'Acacia koa', from: [0, 4, 2], to: [0, 4, 0] });

    const { summaries } = summarize(events);
    expect(summaries.size).toBe(0);
  });

  it('leaves an add that kept a count at zero as its plain field changes', () => {
    // Adding with 5 live plants and nothing else reports only the live count, which an edit of
    // that one count would report identically. The two cannot be told apart.
    const events = speciesEdit({ speciesName: 'Carex meyenii', from: [0, 0, 0], to: [0, 5, 0] });
    expect(events).toHaveLength(1);

    const { summaries } = summarize(events);
    expect(summaries.size).toBe(0);
  });

  it('reads a removal next to an addition of the same counts as the species being changed', () => {
    const events = [
      ...speciesEdit({ speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] }),
      ...speciesEdit({ speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }),
    ];

    const { summaries, redundant } = summarize(events);
    expect(summaries.get(events[0])).toEqual({
      kind: 'changed',
      speciesName: 'Duosperma angolense',
      toSpeciesName: 'Abutilon eremitopetalum',
    });
    expect(summaries.size).toBe(1);
    expect(redundant.size).toBe(events.length - 1);
  });

  it('pairs a change the same way when the list runs newest first', () => {
    const removal = speciesEdit({ speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] });
    const addition = speciesEdit({ speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] });
    const events = [...addition, ...removal];

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
      ...speciesEdit({ speciesName: 'Carex meyenii', from: [0, 0, 0], to: [2, 5, 1] }),
      ...speciesEdit({ speciesName: 'Carex meyenii', from: [2, 5, 1], to: [0, 0, 0] }),
    ];

    // Two separate actions on one species. A species cannot be changed into itself.
    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'added', speciesName: 'Carex meyenii' });
    expect(summaries.get(events[3])).toEqual({ kind: 'removed', speciesName: 'Carex meyenii' });
  });

  it('does not pair a removal with an addition that carries different counts', () => {
    const events = [
      ...speciesEdit({ speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] }),
      ...speciesEdit({ speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [3, 7, 2] }),
    ];

    // A species change moves the counts across unchanged, so differing counts are two edits.
    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[3])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('keeps a removal and an addition separate when something else was logged between them', () => {
    const events = [
      ...speciesEdit({ speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] }),
      otherEntry(),
      ...speciesEdit({ speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }),
    ];

    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[4])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('does not pair edits made by different people', () => {
    const events = [
      ...speciesEdit({ speciesName: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0], userId: 1 }),
      ...speciesEdit({ speciesName: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1], userId: 2 }),
    ];

    const { summaries } = summarize(events);
    expect(summaries.get(events[0])).toEqual({ kind: 'removed', speciesName: 'Duosperma angolense' });
    expect(summaries.get(events[3])).toEqual({ kind: 'added', speciesName: 'Abutilon eremitopetalum' });
  });

  it('leaves an ordinary count edit to render as a value change', () => {
    const events = speciesEdit({ speciesName: 'Acacia koa', from: [0, 4, 1], to: [0, 9, 1] });

    const { summaries, redundant } = summarize(events);
    expect(summaries.size).toBe(0);
    expect(redundant.size).toBe(0);
  });

  it('leaves an edit that changed every count but emptied none of them alone', () => {
    const events = speciesEdit({ speciesName: 'Acacia koa', from: [1, 4, 1], to: [2, 9, 3] });
    expect(events).toHaveLength(3);

    const { summaries } = summarize(events);
    expect(summaries.size).toBe(0);
  });

  it('handles no events', () => {
    expect(summarize([]).summaries.size).toBe(0);
    expect(summarizeMonitoringSpeciesEvents(undefined, () => '').summaries.size).toBe(0);
  });
});
