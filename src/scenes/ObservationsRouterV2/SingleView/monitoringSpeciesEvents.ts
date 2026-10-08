import {
  EventLogEntryPayload,
  FieldUpdatedActionPayload,
  MonitoringSpeciesSubjectPayload,
} from 'src/queries/generated/events';

export type MonitoringSpeciesEventCount = { label: string; value: string };

export type MonitoringSpeciesEventSummary = { counts: MonitoringSpeciesEventCount[] } & (
  | { kind: 'added' | 'removed'; speciesName: string }
  | { kind: 'changed'; speciesName: string; toSpeciesName: string }
);

export type MonitoringSpeciesEventSummaries = {
  events: EventLogEntryPayload[];
  summaries: Map<EventLogEntryPayload, MonitoringSpeciesEventSummary>;
  redundant: Set<EventLogEntryPayload>;
};

export const NO_MONITORING_SPECIES_SUMMARIES = {
  redundant: new Set<EventLogEntryPayload>(),
  summaries: new Map<EventLogEntryPayload, MonitoringSpeciesEventSummary>(),
};

type CountEntry = {
  entry: EventLogEntryPayload;
  index: number;
};

type SpeciesGroup = {
  counts: Map<string, string>;
  delta: number;
  entries: CountEntry[];
  kind?: 'added' | 'removed';
  speciesKey: string;
  speciesName: string;
  timestamp: string;
  total: { after: number; before: number };
  userId: number;
};

export const getMonitoringSpeciesKey = (speciesId?: number, speciesName?: string): string =>
  String(speciesId ?? speciesName ?? 'unknown');

/** Values arrive localized; counts are non-negative integers. */
const toCount = (value?: string[]): number => {
  const digits = (value ?? []).join('').replace(/\D/g, '');
  return digits === '' ? 0 : Number(digits);
};

const toEventCounts = (group: SpeciesGroup): MonitoringSpeciesEventCount[] =>
  [...group.counts].map(([label, value]) => ({ label, value }));

const fieldUpdates = (group: SpeciesGroup): FieldUpdatedActionPayload[] =>
  group.entries
    .map(({ entry }) => entry.action)
    .filter((action): action is FieldUpdatedActionPayload => action.type === 'FieldUpdated');

const getGroupKey = (entry: EventLogEntryPayload, subject: MonitoringSpeciesSubjectPayload): string =>
  [entry.timestamp, entry.userId, getMonitoringSpeciesKey(subject.speciesId, subject.scientificName)].join('|');

const areAdjacent = (first: SpeciesGroup, second: SpeciesGroup): boolean => {
  const indexes = [...first.entries, ...second.entries].map(({ index }) => index);
  return Math.max(...indexes) - Math.min(...indexes) + 1 === indexes.length;
};

const haveMirroredCounts = (removed: SpeciesGroup, added: SpeciesGroup): boolean =>
  removed.total.before === added.total.after &&
  removed.counts.size === added.counts.size &&
  [...removed.counts].every(([fieldName, value]) => added.counts.get(fieldName) === value);

/** Heuristic: the API gives no id joining the two events of a species change. */
const isSpeciesChange = (removed: SpeciesGroup, added: SpeciesGroup): boolean =>
  removed.speciesKey !== added.speciesKey &&
  removed.userId === added.userId &&
  haveMirroredCounts(removed, added) &&
  areAdjacent(removed, added);

/**
 * Collapses an edit's per-count entries into one added/removed/changed message.
 *
 * An edit reports only the counts that changed, so raising one count from 0 is indistinguishable
 * from adding a species. The untouched values are recovered by replaying the plot's history
 * backwards from `currentTotals`. A total replaying negative means something moved plants without
 * logging an event (merging species does), so that species is left unsummarized.
 */
export const summarizeMonitoringSpeciesEvents = (
  events: EventLogEntryPayload[] | undefined,
  resolveSpeciesName: (subject: MonitoringSpeciesSubjectPayload) => string,
  currentTotals: Map<string, number>
): MonitoringSpeciesEventSummaries => {
  const summaries = new Map<EventLogEntryPayload, MonitoringSpeciesEventSummary>();
  const redundant = new Set<EventLogEntryPayload>();

  const entriesByGroup = new Map<string, { entries: CountEntry[]; subject: MonitoringSpeciesSubjectPayload }>();
  // `fieldName` arrives localized, so the subject type is all there is to match on.
  (events ?? []).forEach((entry, index) => {
    if (entry.action.type !== 'FieldUpdated' || entry.subject.type !== 'MonitoringSpecies') {
      return;
    }
    const subject = entry.subject;
    const key = getGroupKey(entry, subject);
    const group = entriesByGroup.get(key) ?? { entries: [], subject };
    group.entries.push({ entry, index });
    entriesByGroup.set(key, group);
  });

  const groups: SpeciesGroup[] = [];
  entriesByGroup.forEach(({ entries, subject }) => {
    const group: SpeciesGroup = {
      counts: new Map(),
      delta: 0,
      entries,
      speciesKey: getMonitoringSpeciesKey(subject.speciesId, subject.scientificName),
      speciesName: resolveSpeciesName(subject),
      timestamp: entries[0].entry.timestamp,
      total: { after: 0, before: 0 },
      userId: entries[0].entry.userId,
    };
    group.delta = fieldUpdates(group).reduce(
      (total, action) => total + toCount(action.changedTo) - toCount(action.changedFrom),
      0
    );
    groups.push(group);
  });

  // Each edit's "before" is the total the edit before it ended at.
  const runningTotals = new Map(currentTotals);
  const unreliableSpecies = new Set<string>();
  groups
    .toSorted((a, b) => b.timestamp.localeCompare(a.timestamp))
    .forEach((group) => {
      const after = runningTotals.get(group.speciesKey) ?? 0;
      const before = after - group.delta;
      if (before < 0 || after < 0) {
        unreliableSpecies.add(group.speciesKey);
      }
      group.total = { after, before };
      runningTotals.set(group.speciesKey, before);
    });

  groups.forEach((group) => {
    const { after, before } = group.total;
    if (unreliableSpecies.has(group.speciesKey)) {
      return;
    }
    if (before === 0 && after > 0) {
      group.kind = 'added';
    } else if (after === 0 && before > 0) {
      group.kind = 'removed';
    } else {
      return;
    }
    group.counts = new Map(
      fieldUpdates(group).map((action) => [
        action.fieldName,
        (group.kind === 'added' ? action.changedTo : action.changedFrom)?.join('') ?? '',
      ])
    );
  });

  const addSummary = (entries: CountEntry[], summary: MonitoringSpeciesEventSummary) => {
    const ordered = entries.toSorted((a, b) => a.index - b.index);
    const entry = { ...ordered[0].entry };
    summaries.set(entry, summary);
    summaryEntriesByIndex.set(ordered[ordered.length - 1].index, entry);
  };

  const summaryEntriesByIndex = new Map<number, EventLogEntryPayload>();
  const summarized = groups.filter((group) => group.kind !== undefined);
  const paired = new Set<SpeciesGroup>();
  summarized.forEach((group) => {
    if (group.kind !== 'removed' || paired.has(group)) {
      return;
    }
    const addition = summarized.find(
      (candidate) => candidate.kind === 'added' && !paired.has(candidate) && isSpeciesChange(group, candidate)
    );
    if (!addition) {
      return;
    }
    paired.add(group);
    paired.add(addition);

    const allEntries = [...group.entries, ...addition.entries];
    addSummary(allEntries, {
      counts: toEventCounts(group),
      kind: 'changed',
      speciesName: group.speciesName,
      toSpeciesName: addition.speciesName,
    });
    allEntries.forEach(({ entry }) => redundant.add(entry));
  });

  summarized.forEach((group) => {
    if (paired.has(group)) {
      return;
    }
    addSummary(group.entries, {
      counts: toEventCounts(group),
      kind: group.kind as 'added' | 'removed',
      speciesName: group.speciesName,
    });
  });

  const withSummaries: EventLogEntryPayload[] = [];
  (events ?? []).forEach((entry, index) => {
    withSummaries.push(entry);
    const summaryEntry = summaryEntriesByIndex.get(index);
    if (summaryEntry) {
      withSummaries.push(summaryEntry);
    }
  });

  return { events: withSummaries, summaries, redundant };
};
