import { APP_PATHS } from 'src/constants';

export const PLANTING_SITES_TABS = {
  active: 'plantingSites',
  drafts: 'draftPlantingSites',
} as const;

export type PlantingSitesTab = (typeof PLANTING_SITES_TABS)[keyof typeof PLANTING_SITES_TABS];

export const plantingSitesListPath = (tab: PlantingSitesTab) => `${APP_PATHS.PLANTING_SITES}?tab=${tab}`;
