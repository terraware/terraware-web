import { APP_PATHS } from 'src/constants';
import { Organization } from 'src/types/Organization';
import { isAdmin } from 'src/utils/organization';

export type SettingsSection = 'organization' | 'people';
// | 'projects';

export const SETTINGS_TAB_SESSION_KEY = 'tab-org-settings';

export const SECTION_PATHS: Record<SettingsSection, string> = {
  organization: APP_PATHS.ORGANIZATION,
  people: APP_PATHS.PEOPLE,
  // projects: APP_PATHS.PROJECTS,
};

export const getAllowedSections = (organization?: Organization): SettingsSection[] => {
  const sections: SettingsSection[] = [];
  if (isAdmin(organization)) {
    sections.push('organization');
  }
  sections.push('people');
  // if (isManagerOrHigher(organization)) {
  //   sections.push('projects');
  // }
  return sections;
};

export const readStoredSection = (): SettingsSection | undefined => {
  try {
    const stored = sessionStorage.getItem(SETTINGS_TAB_SESSION_KEY);
    return stored && stored in SECTION_PATHS ? (stored as SettingsSection) : undefined;
  } catch (e) {
    return undefined;
  }
};

export const writeStoredSection = (section: SettingsSection): void => {
  try {
    sessionStorage.setItem(SETTINGS_TAB_SESSION_KEY, section);
  } catch (e) {
    /* empty */
  }
};

export const getSettingsLandingSection = (organization?: Organization): SettingsSection => {
  const allowed = getAllowedSections(organization);
  const stored = readStoredSection();
  return (stored && allowed.includes(stored) ? stored : allowed[0]) ?? 'people';
};

export const getSettingsLandingPath = (organization?: Organization): string =>
  SECTION_PATHS[getSettingsLandingSection(organization)] ?? SECTION_PATHS.people;
