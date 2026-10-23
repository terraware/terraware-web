import { ACCESSION_2_STATES, AccessionState } from 'src/types/Accession';

export const getTransitionToStates = (from: AccessionState): AccessionState[] => {
  switch (from) {
    case 'Awaiting Check-In': {
      return ['Awaiting Processing', 'Processing', 'Drying', 'In Storage', 'Used Up'];
    }
    case 'Awaiting Processing':
    case 'Processing':
    case 'Drying':
    case 'In Storage': {
      return ['Awaiting Processing', 'Processing', 'Drying', 'In Storage'];
    }
    default:
      return ACCESSION_2_STATES;
  }
};
