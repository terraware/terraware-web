import strings from 'src/strings';

export const getFullTestType = (testType: 'Lab' | 'Nursery' | 'Cut') => {
  if (testType === 'Lab') {
    return strings.LAB_GERMINATION;
  } else if (testType === 'Nursery') {
    return strings.NURSERY_GERMINATION;
  } else {
    return strings.CUT_TEST;
  }
};
