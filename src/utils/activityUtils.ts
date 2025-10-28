import defaultStrings from 'src/strings';
import { Activity } from 'src/types/Activity';

export type GroupedActivities = {
  quarter: string;
  activities: Activity[];
};

/**
 * Groups activities by quarter and year, sorting them in descending order (most recent first).
 * Within each quarter, activities are also sorted by date in descending order.
 *
 * @param activities - Array of activities to group
 * @param strings - Localization strings object
 * @returns Array of grouped activities with quarter labels
 */
export function groupActivitiesByQuarter(activities: Activity[], strings: typeof defaultStrings): GroupedActivities[] {
  const groups: Record<string, Activity[]> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.date);
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
    groups[quarterKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  return sortedQuarters.map((quarterKey) => ({
    quarter: quarterKey,
    activities: groups[quarterKey],
  }));
}
