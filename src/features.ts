import { CachedUserService } from 'src/services';
import env from 'src/utils/useEnvironment';

export type FeatureName = 'Show Production View' | 'New Observation View';

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
    name: 'New Observation View',
    preferenceName: 'newObservationView',
    active: true,
    enabled: false,
    allowInternalProduction: false,
    description: ['Support for new observation view'],
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
 * Utility function to check if a feature is enabled
 */
export default function isEnabled(name: FeatureName, organizationId?: number) {
  const { isProduction } = env();
  const feature = FEATURE_MAP[name];

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
    const preferences =
      organizationId !== undefined
        ? CachedUserService.getUserOrgPreferences(organizationId)
        : CachedUserService.getUserPreferences();
    const preferenceName = feature.preferenceName;

    return preferences && preferences[preferenceName] === true;
  }

  return feature.allowInternalProduction && CachedUserService.getUser().isTerraformation;
}

export function isRouteEnabled(name: FeatureName) {
  const { isProduction } = env();
  const feature = FEATURE_MAP[name];

  if (!feature) {
    return false;
  }

  if (!feature.active || feature.enabled) {
    return feature.enabled;
  }

  return !isProduction || (feature.allowInternalProduction && CachedUserService.getUser().isTerraformation);
}
