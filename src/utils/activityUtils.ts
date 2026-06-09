import { components } from 'src/api/types/generated-schema';
import { TypedActivity } from 'src/components/ActivityLog/types';
import defaultStrings from 'src/strings';
import { getPositionLabel, getQuadratLabel } from 'src/types/Observations';

export type GroupedActivities = {
  quarter: string;
  activities: TypedActivity[];
};

/**
 * Groups activities by quarter and year, sorting them in descending order (most recent first).
 * Within each quarter, activities are also sorted by date in descending order.
 *
 * @param activities - Array of activities to group
 * @param strings - Localization strings object
 * @returns Array of grouped activities with quarter labels
 */
export function groupActivitiesByQuarter(
  activities: TypedActivity[],
  strings: typeof defaultStrings
): GroupedActivities[] {
  const groups: Record<string, TypedActivity[]> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.payload.date);
    const year = date.getFullYear();
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    const quarterKey = strings.formatString(strings.QUARTER_YEAR, quarter, year)?.toString() || '';

    if (!groups[quarterKey]) {
      groups[quarterKey] = [];
    }
    groups[quarterKey].push(activity);
  });

  // sort quarters in descending order (most recent first)
  const sortedQuarters = Object.keys(groups).sort((a, b) => {
    const [aQuarter, aYear] = a.split(' ');
    const [bQuarter, bYear] = b.split(' ');

    if (aYear !== bYear) {
      return parseInt(bYear, 10) - parseInt(aYear, 10);
    }
    return parseInt(bQuarter.substring(1), 10) - parseInt(aQuarter.substring(1), 10);
  });

  // sort activities within each quarter by date (most recent first)
  sortedQuarters.forEach((quarterKey) => {
    groups[quarterKey].sort((a, b) => new Date(b.payload.date).getTime() - new Date(a.payload.date).getTime());
  });

  return sortedQuarters.map((quarterKey) => ({
    quarter: quarterKey,
    activities: groups[quarterKey],
  }));
}

// All three observation media payload variants (Activity, Admin, Funder) are structurally identical;
// we alias one of them as the canonical type for the shared helpers below.
export type ObservationActivityMedia = components['schemas']['AdminActivityObservationMediaFilePayload'];

/**
 * Returns true when the activity was automatically created from a TW observation.
 * Use this (not `type === 'Monitoring'`) to gate observation-specific behavior — users can
 * also create Monitoring activities manually, which should not be treated as observation activities.
 */
export const isObservationActivity = (activity: {
  observation?: { observationId?: number };
}): activity is typeof activity & { observation: { observationId: number } } =>
  activity.observation?.observationId !== undefined;

/** Returns true when the given activity media file originated from an observation. */
export const isObservationMedia = (media: {
  observation?: ObservationActivityMedia;
}): media is typeof media & { observation: ObservationActivityMedia } => media.observation !== undefined;

/** Returns true for corner photos (position is set). Corner captions are read-only and undeletable. */
export const isCornerPhoto = (media: { observation?: ObservationActivityMedia }): boolean =>
  media.observation?.position !== undefined;

/**
 * Returns true for media types that cannot be deleted per PRD: corner, quadrat, and soil photos.
 * Plot-type photos without a corner position may be deletable depending on whether they were
 * uploaded as part of the original observation (determined from observation results by fileId).
 */
export const isUndeletableObservationPhoto = (media: { observation?: ObservationActivityMedia }): boolean => {
  if (!media.observation) {
    return false;
  }
  return (
    media.observation.position !== undefined ||
    media.observation.type === 'Quadrat' ||
    media.observation.type === 'Soil'
  );
};

/**
 * Returns true for media types whose captions are not editable per PRD: corner and quadrat photos.
 * Soil and plot-type photos have editable captions.
 */
export const isCaptionReadOnly = (media: { observation?: ObservationActivityMedia }): boolean => {
  if (!media.observation) {
    return false;
  }
  return media.observation.position !== undefined || media.observation.type === 'Quadrat';
};

export const getObsPhotoTypeLabel = (
  media: { observation?: ObservationActivityMedia },
  strings: typeof defaultStrings
): string | undefined => {
  const obs = media.observation;
  if (!obs || !isUndeletableObservationPhoto(media)) {
    return undefined;
  }
  const plotPrefix = `${obs.monitoringPlotNumber} `;
  if (obs.type === 'Plot' && obs.position) {
    return `${plotPrefix}${getPositionLabel(obs.position)}`;
  }
  if (obs.type === 'Quadrat' && obs.position) {
    return `${plotPrefix}${getQuadratLabel(obs.position)}`;
  }
  if (obs.type === 'Soil') {
    return `${plotPrefix}${strings.SOIL}`;
  }
  return undefined;
};
