import React, { type JSX } from 'react';

import { SearchResponseAccession } from 'src/components/ProjectNewView/flow/SelectAccessions';
import { SearchResponseBatches } from 'src/services/NurseryBatchService';
import strings from 'src/strings';
import { PlantingSiteSearchResult } from 'src/types/Tracking';

const singularOrPlural = (renderNumber: number, singular: string, plural: string): string =>
  renderNumber === 1
    ? (strings.formatString(singular, renderNumber.toString()) as string)
    : (strings.formatString(plural, renderNumber.toString()) as string);

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
          <li>
            {singularOrPlural(
              projectAccessions.length,
              strings.PROJECT_ADDED_ACCESSION,
              strings.PROJECT_ADDED_ACCESSIONS
            )}
          </li>
        )}
        {!!projectBatches?.length && (
          <li>{singularOrPlural(projectBatches.length, strings.PROJECT_ADDED_BATCH, strings.PROJECT_ADDED_BATCHES)}</li>
        )}
        {!!projectPlantingSites?.length && (
          <li>
            {singularOrPlural(
              projectPlantingSites.length,
              strings.PROJECT_ADDED_PLANTING_SITE,
              strings.PROJECT_ADDED_PLANTING_SITES
            )}
          </li>
        )}
      </ul>,
    ];
  }
};
