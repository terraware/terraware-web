import strings from 'src/strings';

import { FlowStates } from '../index';

export const getSaveText = (
  flowState: FlowStates,
  hasAccessions: boolean,
  hasBatches: boolean,
  hasPlantingSites: boolean
): string => {
  let saveText = strings.NEXT;
  switch (flowState) {
    case 'label': {
      if (!hasAccessions && !hasBatches && !hasPlantingSites) {
        saveText = strings.SAVE;
      }
      break;
    }
    case 'accessions': {
      if (!hasBatches && !hasPlantingSites) {
        saveText = strings.SAVE;
      }
      break;
    }
    case 'batches': {
      if (!hasPlantingSites) {
        saveText = strings.SAVE;
      }
      break;
    }
    case 'plantingSites': {
      saveText = strings.SAVE;
      break;
    }
  }
  return saveText;
};
