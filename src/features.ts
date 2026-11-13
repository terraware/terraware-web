import { useGetUserPreferencesQuery } from 'src/queries/generated/preferences';
import { useGetMyselfQuery } from 'src/queries/generated/users';
import env from 'src/utils/useEnvironment';
import { isTerraformationEmail } from 'src/utils/user';

export type FeatureName =
  | 'Show Production View'
  | 'Virtual Monitoring Plots'
  | 'Scheduled Biomass Monitoring Observations'
  | 'Baseline Survey'
  | 'Assign Plots When Scheduling'
  | 'Nursery Batch Time Per Stage';

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
    name: 'Scheduled Biomass Monitoring Observations',
    preferenceName: 'scheduledBiomassMonitoringObservations',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Support for scheduling biomass monitoring observations.'],
    disclosure: ['This is a WIP'],
  },
  {
    name: 'Baseline Survey',
    preferenceName: 'baselineSurveyObservations',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Schedule Baseline Survey observations. Requires Scheduled Biomass Monitoring Observations.'],
    disclosure: ['This is a WIP'],
  },
  {
    name: 'Assign Plots When Scheduling',
    preferenceName: 'assignPlotsWhenScheduling',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Assign monitoring plots when an observation is scheduled instead of when it starts.'],
    disclosure: ['This is a WIP'],
  },
  {
    name: 'Nursery Batch Time Per Stage',
    preferenceName: 'nurseryBatchTimePerStage',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Track how long nursery batches spend in each stage.'],
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
