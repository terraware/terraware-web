const WITHDRAWAL_PURPOSES = ['Out-planting', 'Other', 'Nursery', 'Viability Testing'];

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
