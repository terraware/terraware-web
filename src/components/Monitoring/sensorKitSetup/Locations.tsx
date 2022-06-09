import strings from 'src/strings';

const FRIDGE_LOCATIONS = Array(3)
  .fill('')
  .map((_, i) => ({
    name: `Fridge ${i + 1}`,
    label: `${strings.FRIDGE} ${i + 1}`,
  }));
const FREEZER_LOCATIONS = Array(3)
  .fill('')
  .map((_, i) => ({
    name: `Freezer ${i + 1}`,
    label: `${strings.FREEZER} ${i + 1}`,
  }));
const DRY_CABINET_LOCATIONS = Array(4)
  .fill('')
  .map((_, i) => ({
    name: `Dry Cabinet ${i + 1}`,
    label: `${strings.DRY_CABINET} ${i + 1}`,
  }));

export const LOCATIONS = [
  ...FRIDGE_LOCATIONS,
  ...FREEZER_LOCATIONS,
  ...DRY_CABINET_LOCATIONS,
  {
    name: 'Drying Racks',
    label: strings.DRYING_RACKS,
  },
  {
    name: 'Ambient Front',
    label: strings.FRONT_OF_SEED_BANK,
  },
  {
    name: 'Ambient Middle',
    label: strings.MIDDLE_OF_SEED_BANK,
  },
  {
    name: 'Ambient Rear',
    label: strings.BACK_OF_SEED_BANK,
  },
];
