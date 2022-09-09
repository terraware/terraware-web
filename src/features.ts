import env from 'src/utils/useEnvironment';

export type Feature = {
  name: string;
  preferenceName: string;
  enabled: boolean;
  description: string[];
  disclosure: string[];
};

// list of feature names and associated properties
export const OPT_IN_FEATURES: Feature[] = [
  {
    name: 'V2 Accessions',
    preferenceName: 'enableUIV2Accessions',
    enabled: true,
    description: [
      'Shows V2 accession workflows (instead of V1).',
      'You can switch between V2 and V1 flows by turning this option on or off.',
    ],
    disclosure: [
      'Saving V2 accessions and re-editing them in V1 workflows may cause some data loss, and vice versa.',
      'Withdrawal quantities tracked may appear different across V1/V2 workflows.',
    ],
  },
];

type Preferences = { [key: string]: unknown };

const PREFERENCE_NAMES: { [key: string]: string } = {};

// create a reverse map of feature name to preference name
OPT_IN_FEATURES.forEach((feature) => {
  PREFERENCE_NAMES[feature.name] = feature.preferenceName;
});

/**
 * Utility function to check if a feature is enabled
 */
export default function isEnabled(name: string, preferences?: Preferences) {
  const { isProduction } = env();
  const preferenceName = PREFERENCE_NAMES[name];
  const preferenceEnabled = preferences && preferences[preferenceName] === true;

  return !isProduction && preferenceEnabled;
}
