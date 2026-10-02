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
  /** The non-zero side of the edit, keyed by field: what was removed, or what was added. */
  counts: Map<string, string>;
  entries: CountEntry[];
  kind: 'added' | 'removed';
  speciesKey: string;
  speciesName: string;
  userId: number;
};

/**
 * Values arrive from the API already localized. Zero is written with a single zero digit in every
 * locale the app ships, so dropping the formatting is enough to recognize it.
 */
const isZero = (value?: string[]): boolean => {
  const digits = (value ?? []).join('').replace(/\D/g, '');
  return digits !== '' && /^0+$/.test(digits);
};

/** Identifies the species a MonitoringSpecies subject refers to. */
const getSpeciesKey = (subject: MonitoringSpeciesSubjectPayload): string =>
  String(subject.speciesId ?? subject.scientificName ?? 'unknown');

/** Groups the entries of one edit together: one species, in one plot, edited by one person at once. */
const getGroupKey = (entry: EventLogEntryPayload, subject: MonitoringSpeciesSubjectPayload): string =>
  [entry.timestamp, entry.userId, getSpeciesKey(subject)].join('|');

/**
 * True when the two groups hold every entry between the first and the last of them, meaning nothing
 * else was logged in between.
 */
const areAdjacent = (first: SpeciesGroup, second: SpeciesGroup): boolean => {
  const indexes = [...first.entries, ...second.entries].map(({ index }) => index);
  return Math.max(...indexes) - Math.min(...indexes) + 1 === indexes.length;
};

/**
 * True when what one group removed is exactly what the other added, field for field. Moving counts
 * from one species to another is how a species change is carried out, so the two sides mirror each
 * other; two unrelated edits that happen to sit next to each other almost never will.
 */
const haveMirroredCounts = (removed: SpeciesGroup, added: SpeciesGroup): boolean =>
  removed.counts.size === added.counts.size &&
  [...removed.counts].every(([fieldName, value]) => added.counts.get(fieldName) === value);

/**
 * Pairs a removal with an addition only when the two really do look like one species change: a
 * different species, the same counts moved across, nothing logged in between, and the same person.
 */
const isSpeciesChange = (removed: SpeciesGroup, added: SpeciesGroup): boolean =>
  removed.speciesKey !== added.speciesKey &&
  removed.userId === added.userId &&
  haveMirroredCounts(removed, added) &&
  areAdjacent(removed, added);

/**
 * Collapses the per-field entries of a plant count edit into one message when the edit added,
 * removed, or re-speciesed an entry.
 */
export const summarizeMonitoringSpeciesEvents = (
  events: EventLogEntryPayload[] | undefined,
  resolveSpeciesName: (subject: MonitoringSpeciesSubjectPayload) => string
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
    const actions = entries
      .map(({ entry }) => entry.action)
      .filter((action): action is FieldUpdatedActionPayload => action.type === 'FieldUpdated');
    const fromAllZero = actions.every((action) => isZero(action.changedFrom));
    const toAllZero = actions.every((action) => isZero(action.changedTo));
    // Zero on both sides changed nothing worth summarizing; leave it to the default rendering.
    if (fromAllZero === toAllZero) {
      return;
    }
    const kind = fromAllZero ? 'added' : 'removed';
    groups.push({
      counts: new Map(
        actions.map((action) => [
          action.fieldName,
          (kind === 'added' ? action.changedTo : action.changedFrom)?.join(''),
        ])
      ) as Map<string, string>,
      entries,
      kind,
      speciesKey: getSpeciesKey(subject),
      speciesName: resolveSpeciesName(subject),
      userId: entries[0].entry.userId,
    });
  });

  const paired = new Set<SpeciesGroup>();
  groups.forEach((group) => {
    if (group.kind !== 'removed' || paired.has(group)) {
      return;
    }
    const addition = groups.find(
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

  groups.forEach((group) => {
    if (paired.has(group)) {
      return;
    }
    const allEntries = group.entries.toSorted((a, b) => a.index - b.index);
    summaries.set(allEntries[0].entry, { kind: group.kind, speciesName: group.speciesName });
    allEntries.slice(1).forEach(({ entry }) => redundant.add(entry));
  });

  return { summaries, redundant };
};
