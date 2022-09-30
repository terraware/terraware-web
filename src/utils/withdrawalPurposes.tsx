export const WITHDRAWAL_PURPOSES = ['Nursery', 'Out-planting', 'Viability Testing', 'Other'];

export const getSelectedPurpose = (value: string | undefined) => {
  if (value && WITHDRAWAL_PURPOSES.indexOf(value) > -1) {
    return value;
  } else {
    switch (value) {
      case 'Propagation':
        return 'Out-planting';
      default:
        return 'Other';
    }
  }
};
