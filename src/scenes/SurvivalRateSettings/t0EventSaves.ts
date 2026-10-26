import {
  EventLogEntryPayload,
  PlantingSiteSubjectPayload,
  PlotT0DensitySubjectPayload,
  PlotT0ObservationSubjectPayload,
  StratumT0DensitySubjectPayload,
} from 'src/queries/generated/events';

type T0Subject =
  | PlantingSiteSubjectPayload
  | PlotT0DensitySubjectPayload
  | PlotT0ObservationSubjectPayload
  | StratumT0DensitySubjectPayload;

type T0Entry = {
  entry: EventLogEntryPayload;
  subject: T0Subject;
};

/**
 * The server has no id for a save operation, so saves are reconstructed from timestamps: entries
 * written by the same user within this window of the save's first entry belong to that save. One
 * save sends the plot densities, the stratum densities and the temporary plot setting as separate
 * requests, so the window has to be wider than a single request, and it is measured from the first
 * entry so that a run of saves can never chain into one unbounded row.
 *
 * A slow connection can still split a save in two, which costs a duplicated row but no entries.
 * That is the cheaper error: merging two real saves would hide the earlier one's time and read as
 * a single contradictory save.
 */
export const SAVE_WINDOW_MS = 30_000;

/** Observation start dates are ISO dates; observation ids are plain numbers. */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;

/** `Created` field names are not localized, unlike the field names of `FieldUpdated` actions. */
const DENSITY_FIELD_NAME = 'density';

export type T0ObservationChange = {
  fromDate?: string;
  fromObservationId?: string;
  toDate?: string;
  toObservationId?: string;
  type: 'observation';
};

export type T0DensityChange = {
  from?: string;
  speciesName: string;
  to?: string;
  type: 'density';
};

export type T0SettingChange = {
  fieldName: string;
  from?: string;
  to?: string;
  type: 'setting';
};

export type T0Change = T0ObservationChange | T0DensityChange | T0SettingChange;

export type T0ChangeGroup = { changes: T0Change[]; key: string } & (
  { kind: 'plot'; plotNumber: number } | { kind: 'site' } | { kind: 'stratum'; stratumName: string }
);

export type T0Save = {
  groups: T0ChangeGroup[];
  includesSiteSetting: boolean;
  key: string;
  plotCount: number;
  stratumCount: number;
  timestamp: string;
  userName: string;
};

const toT0Entry = (entry: EventLogEntryPayload): T0Entry | undefined => {
  switch (entry.subject.type) {
    case 'PlantingSite':
    case 'PlotT0Density':
    case 'PlotT0Observation':
    case 'StratumT0Density':
      return { entry, subject: entry.subject };
    default:
      return undefined;
  }
};

const groupKeyOf = (subject: T0Subject): string => {
  switch (subject.type) {
    case 'PlantingSite':
      return 'site';
    case 'PlotT0Density':
    case 'PlotT0Observation':
      return `plot-${subject.monitoringPlotId}`;
    case 'StratumT0Density':
      return `stratum-${subject.stratumId}`;
  }
};

const newGroup = (subject: T0Subject): T0ChangeGroup => {
  const key = groupKeyOf(subject);
  switch (subject.type) {
    case 'PlantingSite':
      return { changes: [], key, kind: 'site' };
    case 'PlotT0Density':
    case 'PlotT0Observation':
      return { changes: [], key, kind: 'plot', plotNumber: subject.plotNumber };
    case 'StratumT0Density':
      return { changes: [], key, kind: 'stratum', stratumName: subject.stratumName };
  }
};

const firstValue = (values?: string[]): string | undefined => values?.[0];

const hasDateValue = (...values: (string[] | undefined)[]): boolean =>
  values.some((value) => (value ?? []).some((entry) => ISO_DATE_PATTERN.test(entry)));

const densityChange = (
  entry: EventLogEntryPayload,
  subject: PlotT0DensitySubjectPayload | StratumT0DensitySubjectPayload
): T0DensityChange | undefined => {
  const speciesName = subject.scientificName;

  if (entry.action.type === 'Created') {
    const field = entry.action.fields.find(({ fieldName }) => fieldName === DENSITY_FIELD_NAME);
    return field ? { speciesName, to: firstValue(field.value), type: 'density' } : undefined;
  }

  if (entry.action.type === 'FieldUpdated') {
    return {
      from: firstValue(entry.action.changedFrom),
      speciesName,
      to: firstValue(entry.action.changedTo),
      type: 'density',
    };
  }

  return undefined;
};

/**
 * Folds an entry into its group. An observation change can arrive as two entries: the start dates,
 * and the observation ids when both observations started on the same day. They describe one change,
 * so the ids are merged into the change the dates created.
 */
const addEntry = (group: T0ChangeGroup, { entry, subject }: T0Entry): void => {
  if (subject.type === 'PlantingSite') {
    if (entry.action.type === 'FieldUpdated') {
      group.changes.push({
        fieldName: entry.action.fieldName,
        from: firstValue(entry.action.changedFrom),
        to: firstValue(entry.action.changedTo),
        type: 'setting',
      });
    }
    return;
  }

  if (subject.type === 'PlotT0Observation') {
    if (entry.action.type !== 'FieldUpdated') {
      return;
    }

    const { changedFrom, changedTo } = entry.action;

    if (hasDateValue(changedFrom, changedTo)) {
      group.changes.push({
        fromDate: firstValue(changedFrom),
        toDate: firstValue(changedTo),
        type: 'observation',
      });
      return;
    }

    const observationChange = group.changes.find(
      (existing): existing is T0ObservationChange => existing.type === 'observation'
    );
    const ids = {
      fromObservationId: firstValue(changedFrom),
      toObservationId: firstValue(changedTo),
    };

    if (observationChange) {
      Object.assign(observationChange, ids);
    } else {
      group.changes.push({ ...ids, type: 'observation' });
    }
    return;
  }

  const change = densityChange(entry, subject);
  if (change) {
    group.changes.push(change);
  }
};

const sortGroups = (groups: T0ChangeGroup[]): T0ChangeGroup[] => {
  const kindOrder = { plot: 0, stratum: 1, site: 2 };

  return groups.toSorted((a, b) => {
    if (a.kind !== b.kind) {
      return kindOrder[a.kind] - kindOrder[b.kind];
    }
    if (a.kind === 'plot' && b.kind === 'plot') {
      return a.plotNumber - b.plotNumber;
    }
    if (a.kind === 'stratum' && b.kind === 'stratum') {
      return a.stratumName.localeCompare(b.stratumName);
    }
    return 0;
  });
};

const sortChanges = (changes: T0Change[]): T0Change[] =>
  changes.toSorted((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'observation' ? -1 : 1;
    }
    return a.type === 'density' && b.type === 'density' ? a.speciesName.localeCompare(b.speciesName) : 0;
  });

const toSave = (entries: T0Entry[]): T0Save => {
  const groupsByKey = new Map<string, T0ChangeGroup>();

  entries.forEach((t0Entry) => {
    const key = groupKeyOf(t0Entry.subject);
    const group = groupsByKey.get(key) ?? newGroup(t0Entry.subject);
    groupsByKey.set(key, group);
    addEntry(group, t0Entry);
  });

  const groups = sortGroups([...groupsByKey.values()].filter((group) => group.changes.length > 0)).map((group) => ({
    ...group,
    changes: sortChanges(group.changes),
  }));

  const lastEntry = entries[entries.length - 1].entry;

  return {
    groups,
    includesSiteSetting: groups.some((group) => group.kind === 'site'),
    key: `${entries[0].entry.userId}-${entries[0].entry.timestamp}`,
    plotCount: groups.filter((group) => group.kind === 'plot').length,
    stratumCount: groups.filter((group) => group.kind === 'stratum').length,
    timestamp: lastEntry.timestamp,
    userName: lastEntry.userName,
  };
};

const isSameSave = (first: EventLogEntryPayload, next: EventLogEntryPayload): boolean =>
  first.userId === next.userId &&
  new Date(next.timestamp).getTime() - new Date(first.timestamp).getTime() <= SAVE_WINDOW_MS;

/**
 * Turns the site's t0 event log into one entry per save, most recent first. Entries arrive oldest
 * first; saves that produced no displayable change are dropped.
 */
export const groupT0EventsIntoSaves = (events?: EventLogEntryPayload[]): T0Save[] => {
  const entries = (events ?? [])
    .toSorted((a, b) => a.timestamp.localeCompare(b.timestamp))
    .flatMap((event) => toT0Entry(event) ?? []);

  const buckets: T0Entry[][] = [];

  entries.forEach((t0Entry) => {
    const bucket = buckets[buckets.length - 1];

    if (bucket && isSameSave(bucket[0].entry, t0Entry.entry)) {
      bucket.push(t0Entry);
    } else {
      buckets.push([t0Entry]);
    }
  });

  return buckets
    .map(toSave)
    .filter((save) => save.groups.length > 0)
    .reverse();
};
