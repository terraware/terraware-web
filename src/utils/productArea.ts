export type ProductArea =
  | 'Seed Bank'
  | 'Nursery'
  | 'Planting'
  | 'Observations'
  | 'Species'
  | 'Projects'
  | 'Accelerator Console'
  | 'Accelerator Participant'
  | 'Funder'
  | 'Seed Fund Reports'
  | 'Org & Settings'
  | 'Home'
  | 'Help'
  | 'Other';

// Keyed by the first segment of the URL path. See APP_PATHS in src/constants.ts.
const AREA_BY_FIRST_SEGMENT: Record<string, ProductArea> = {
  '': 'Home',
  home: 'Home',
  welcome: 'Home',

  accessions: 'Seed Bank',
  checkin: 'Seed Bank',
  seedbanks: 'Seed Bank',
  seeds: 'Seed Bank',
  'seeds-dashboard': 'Seed Bank',

  batch: 'Nursery',
  inventory: 'Nursery',
  'inventory-planning': 'Nursery',
  nurseries: 'Nursery',
  nursery: 'Nursery',
  'seedlings-dashboard': 'Nursery',

  'planting-plans': 'Planting',
  'planting-sites': 'Planting',
  plants: 'Planting',

  observations: 'Observations',

  species: 'Species',

  projects: 'Projects',

  accelerator: 'Accelerator Console',

  'activity-log': 'Accelerator Participant',
  applications: 'Accelerator Participant',
  deliverables: 'Accelerator Participant',
  reports: 'Accelerator Participant',

  funder: 'Funder',

  'seed-fund-reports': 'Seed Fund Reports',

  myaccount: 'Org & Settings',
  organization: 'Org & Settings',
  people: 'Org & Settings',
  settings: 'Org & Settings',

  'help-support': 'Help',
  'learn-more': 'Help',
  'virtual-walkthroughs': 'Help',
};

// Project module pages are Accelerator curriculum, even though they live under /projects.
const PROJECT_MODULES_PATTERN = /^\/projects\/[^/]+\/modules(\/|$)/;

export const getProductArea = (pathname: string): ProductArea => {
  if (PROJECT_MODULES_PATTERN.test(pathname)) {
    return 'Accelerator Participant';
  }
  const firstSegment = pathname.split('/')[1] ?? '';
  return AREA_BY_FIRST_SEGMENT[firstSegment] ?? 'Other';
};

type MixpanelEventPayload = {
  properties?: Record<string, unknown>;
};

const getEventPathname = (properties: Record<string, unknown>): string | undefined => {
  if (typeof properties.current_url_path === 'string') {
    return properties.current_url_path;
  }
  if (typeof properties.$current_url === 'string') {
    try {
      return new URL(properties.$current_url).pathname;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

// Mixpanel `before_send_events` hook. Batched events are sent after the user may have navigated away, so the area is
// derived from the URL recorded on the event itself rather than from the current location.
export const addProductAreaToEvent = (event: MixpanelEventPayload): MixpanelEventPayload => {
  const pathname = event.properties ? getEventPathname(event.properties) : undefined;
  if (!event.properties || pathname === undefined) {
    return event;
  }
  return { ...event, properties: { ...event.properties, product_area: getProductArea(pathname) } };
};
