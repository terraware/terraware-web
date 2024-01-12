import strings from 'src/strings';
import { labSubstrates, accessionNurserySubstrates } from 'src/types/Accession';

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
    return labSubstrates();
  } else if (type === 'Nursery') {
    return accessionNurserySubstrates();
  } else {
    return [];
  }
};
