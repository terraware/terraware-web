import strings from 'src/strings';
import { LAB_SUBSTRATES, NURSERY_SUBSTRATES } from 'src/types/Accession';

export const getFullTestType = (testType: 'Lab' | 'Nursery' | 'Cut') => {
  if (testType === 'Lab') {
    return strings.LAB_GERMINATION;
  } else if (testType === 'Nursery') {
    return strings.NURSERY_GERMINATION;
  } else {
    return strings.CUT_TEST;
  }
};

export const getSubstratesAccordingToType = (type?: string) => {
  if (type === 'Lab') {
    return LAB_SUBSTRATES;
  } else if (type === 'Nursery') {
    return NURSERY_SUBSTRATES;
  } else {
    return [];
  }
};
