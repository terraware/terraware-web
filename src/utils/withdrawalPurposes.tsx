import strings from 'src/strings';

export function withdrawalPurposes() {
  return [
    { label: strings.NURSERY, value: 'Nursery' },
    { label: strings.OUT_PLANTING, value: 'Out-planting' },
    { label: strings.VIABILITY_TESTING, value: 'Viability Testing' },
    { label: strings.OTHER, value: 'Other' },
  ];
}
