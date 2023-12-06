import React from 'react';
import strings from 'src/strings';
import { SearchResponseBatches } from 'src/services/NurseryBatchService';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { SearchResponseAccession } from './flow/SelectAccessions';

export const getFormattedSuccessMessages = (
  projectName: string,
  projectAccessions: SearchResponseAccession[],
  projectBatches: SearchResponseBatches[],
  projectPlantingSites: PlantingSiteSearchResult[]
): (JSX.Element | string)[] => {
  if (!projectAccessions?.length && !projectBatches?.length && !projectPlantingSites?.length) {
    return [''];
  } else {
    return [
      <p key='msg-title'>{strings.formatString(strings.PROJECT_ADDED_DETAILS, projectName)}</p>,
      <ul key='msg-body'>
        {!!projectAccessions?.length && (
          <li>{strings.formatString(strings.PROJECT_ADDED_ACCESSIONS, projectAccessions.length.toString())}</li>
        )}
        {!!projectBatches?.length && (
          <li>{strings.formatString(strings.PROJECT_ADDED_BATCHES, projectBatches.length.toString())}</li>
        )}
        {!!projectPlantingSites?.length && (
          <li>{strings.formatString(strings.PROJECT_ADDED_PLANTING_SITES, projectPlantingSites.length.toString())}</li>
        )}
      </ul>,
    ];
  }
};
