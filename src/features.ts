import { useGetUserPreferencesQuery } from 'src/queries/generated/preferences';
import { useGetMyselfQuery } from 'src/queries/generated/users';
import env from 'src/utils/useEnvironment';
import { isTerraformationEmail } from 'src/utils/user';

export type FeatureName =
  | 'Show Production View'
  | 'Virtual Monitoring Plots'
  | 'Report Updates July 2026'
  | 'New Observation Filters';

export type Feature = {
  name: FeatureName;
  preferenceName: string;
  // whether this feature check is active
  active: boolean;
  // whether this feature is enabled for all, if not, check user preference
  // feature is usually enabled prior to release - gives devs time to clean up code
  enabled: boolean;
  // whether this feature is open to Terraformation employees on production (matches user email)
  allowInternalProduction: boolean;
  description: string[];
  disclosure: string[];
  get?: () => boolean;
  set?: (val: boolean) => void;
};

// list of feature names and associated properties
export const OPT_IN_FEATURES: Feature[] = [
  {
    name: 'Show Production View',
    preferenceName: 'showProductionUIView',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Allow testing production view without any WIP UI features.'],
    disclosure: [
      'Does not test against production servers.',
      'Clear "productionView" from session storage to clear this preference.',
    ],
    get: env().isForcedProductionView,
    set: env().forceProductionView,
  },
  {
    name: 'Virtual Monitoring Plots',
    preferenceName: 'virtualMonitoringPlots',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Support for virtual monitoring plots'],
    disclosure: ['This is a WIP'],
  },
  {
    name: 'Report Updates July 2026',
    preferenceName: 'reportUpdatesJuly2026',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Redesigned report tab for participants, accelerator admins, and funders.'],
    disclosure: ['This is a WIP'],
  },
  {
    name: 'New Observation Filters',
    preferenceName: 'newObservationFilters',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Redesigned filters for observation results.'],
    disclosure: ['This is a WIP'],
  },
];

type FeatureMap = { [key: string]: Feature };

const FEATURE_MAP: FeatureMap = {};

// create a reverse map of feature name to feature map
OPT_IN_FEATURES.forEach((feature) => {
  FEATURE_MAP[feature.name] = feature;
});

/**
 * Hook to check if a feature is enabled
 */
export const useFeatureEnabled = (name: FeatureName): boolean => {
  const { isProduction } = env();
  const feature = FEATURE_MAP[name];

  const { currentData: preferencesData } = useGetUserPreferencesQuery(undefined);
  const { currentData: userData } = useGetMyselfQuery();

  if (!feature) {
    return false;
  }

  if (feature.get) {
    return feature.get();
  }

  if (!feature.active || feature.enabled) {
    return feature.enabled;
  }

  if (!isProduction) {
    return preferencesData?.preferences?.[feature.preferenceName] === true;
  }

  return feature.allowInternalProduction && isTerraformationEmail(userData?.user.email);
};
