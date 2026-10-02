import {
  EventLogEntryPayload,
  FieldUpdatedActionPayload,
  MonitoringSpeciesSubjectPayload,
} from 'src/queries/generated/events';

export type MonitoringSpeciesEventSummary =
  | { kind: 'added' | 'removed'; speciesName: string }
  | { kind: 'changed'; speciesName: string; toSpeciesName: string };

export type MonitoringSpeciesEventSummaries = {
  /** The one entry of a collapsed group that should carry the summary message. */
  summaries: Map<EventLogEntryPayload, MonitoringSpeciesEventSummary>;
  /** The remaining entries of a collapsed group, which the summary already accounts for. */
  redundant: Set<EventLogEntryPayload>;
};

type CountEntry = {
  entry: EventLogEntryPayload;
  index: number;
};

type SpeciesGroup = {
  /** What this edit added or removed, keyed by field, for comparing the two sides of a change. */
  counts: Map<string, string>;
  /** How much the species' plant count changed, summed across the counts this edit reported. */
  delta: number;
  entries: CountEntry[];
  kind?: 'added' | 'removed';
  speciesKey: string;
  speciesName: string;
  timestamp: string;
  /** The species' plant count before and after this edit, recovered by replaying the log. */
  total: { after: number; before: number };
  userId: number;
};

/**
 * Identifies the species an edit refers to. Observation results and event subjects name a species
 * the same way, so both sides of the replay can be keyed with this.
 */
export const getMonitoringSpeciesKey = (speciesId?: number, speciesName?: string): string =>
  String(speciesId ?? speciesName ?? 'unknown');

/**
 * Values arrive from the API localized. Plant counts are non-negative integers, so dropping
 * everything that is not a digit leaves the number itself, group separators and all.
 */
const toCount = (value?: string[]): number => {
  const digits = (value ?? []).join('').replace(/\D/g, '');
  return digits === '' ? 0 : Number(digits);
};

const fieldUpdates = (group: SpeciesGroup): FieldUpdatedActionPayload[] =>
  group.entries
    .map(({ entry }) => entry.action)
    .filter((action): action is FieldUpdatedActionPayload => action.type === 'FieldUpdated');

/** Groups the entries of one edit together: one species, in one plot, edited by one person at once. */
const getGroupKey = (entry: EventLogEntryPayload, subject: MonitoringSpeciesSubjectPayload): string =>
  [entry.timestamp, entry.userId, getMonitoringSpeciesKey(subject.speciesId, subject.scientificName)].join('|');

/**
 * True when the two groups hold every entry between the first and the last of them, meaning nothing
 * else was logged in between.
 */
const areAdjacent = (first: SpeciesGroup, second: SpeciesGroup): boolean => {
  const indexes = [...first.entries, ...second.entries].map(({ index }) => index);
  return Math.max(...indexes) - Math.min(...indexes) + 1 === indexes.length;
};

/**
 * True when what one group removed is exactly what the other added, count for count. Moving plants
 * from one species to another is how a species change is carried out, so the two sides mirror each
 * other; two unrelated edits that happen to sit next to each other almost never will.
 */
const haveMirroredCounts = (removed: SpeciesGroup, added: SpeciesGroup): boolean =>
  removed.total.before === added.total.after &&
  removed.counts.size === added.counts.size &&
  [...removed.counts].every(([fieldName, value]) => added.counts.get(fieldName) === value);

/**
 * Pairs a removal with an addition only when the two really do look like one species change: a
 * different species, the same plants moved across, nothing logged in between, and the same person.
 *
 * The API gives no transaction or request id to join the two events on, and their timestamps are
 * separate clock readings, so there is nothing authoritative to match on. Anything that fails these
 * checks renders as a separate removal and addition, which is still accurate.
 */
const isSpeciesChange = (removed: SpeciesGroup, added: SpeciesGroup): boolean =>
  removed.speciesKey !== added.speciesKey &&
  removed.userId === added.userId &&
  haveMirroredCounts(removed, added) &&
  areAdjacent(removed, added);

/**
 * Collapses the per-field entries of a plant count edit into one message when the edit added,
 * removed, or re-speciesed an entry.
 *
 * An edit reports only the counts that changed, so its entries never state what the untouched
 * counts were: raising one count from 0 looks exactly like adding a species whose other counts are
 * 0. The missing values are recovered instead by replaying the plot's history backwards from each
 * species' current plant count, which the API returns in full and unpaginated. Only the species'
 * total is needed, since every count being zero is the same as the total being zero — which also
 * avoids having to tell the localized count names apart.
 *
 * A total that replays to a negative value means something moved plants without logging an event —
 * merging species does this — so that species is left to render its plain field changes rather than
 * be described from a reconstruction known to be wrong.
 */
export const summarizeMonitoringSpeciesEvents = (
  events: EventLogEntryPayload[] | undefined,
  resolveSpeciesName: (subject: MonitoringSpeciesSubjectPayload) => string,
  /** Each species' current plant count, summed across every count, keyed by species. */
  currentTotals: Map<string, number>
): MonitoringSpeciesEventSummaries => {
  const summaries = new Map<EventLogEntryPayload, MonitoringSpeciesEventSummary>();
  const redundant = new Set<EventLogEntryPayload>();

  const entriesByGroup = new Map<string, { entries: CountEntry[]; subject: MonitoringSpeciesSubjectPayload }>();
  // The three plant counts are the only fields a MonitoringSpecies subject reports, so every
  // field update on one is a count. `fieldName` arrives localized and is no use for matching.
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

  // Replay backwards from today's counts. Each edit's "before" is the running total less its delta,
  // which is then the total the edit before it ended at.
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

    const allEntries = [...group.entries, ...addition.entries].toSorted((a, b) => a.index - b.index);
    summaries.set(allEntries[0].entry, {
      kind: 'changed',
      speciesName: group.speciesName,
      toSpeciesName: addition.speciesName,
    });
    allEntries.slice(1).forEach(({ entry }) => redundant.add(entry));
  });

  summarized.forEach((group) => {
    if (paired.has(group)) {
      return;
    }
    const allEntries = group.entries.toSorted((a, b) => a.index - b.index);
    summaries.set(allEntries[0].entry, { kind: group.kind as 'added' | 'removed', speciesName: group.speciesName });
    allEntries.slice(1).forEach(({ entry }) => redundant.add(entry));
  });

  return { summaries, redundant };
};
