import { useMemo } from 'react';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { EditorPlantingSite, OptionalSiteEditStep, SiteType } from 'src/types/PlantingSite';

import { PlantingSiteStep } from './EditorStepper';

/**
 * Check if user has already completed certain steps and mark them as completed.
 */
export const initializeOptionalStepsStatus = (site: EditorPlantingSite): Record<OptionalSiteEditStep, boolean> => {
  const status: Record<OptionalSiteEditStep, boolean> = {
    exclusion_areas: false,
    stratum_boundaries: false,
    substratum_boundaries: false,
  };

  if (site.exclusion) {
    // if we have an exclusion, mark this optional step as completed
    status.exclusion_areas = true;
  }

  if (site.strata) {
    const numStrata = site.strata.length;
    const numSubstrata = site.strata.flatMap((stratum) => stratum.substrata).length;

    // if we have more than just the default stratum, mark this optional step as completed
    status.stratum_boundaries = numStrata > 1;
    // if we have more than just the default substrata, mark this optional step as completed
    status.substratum_boundaries = numSubstrata > numStrata;
  }

  return status;
};

export const useEditorSteps = (
  siteType: SiteType,
  completedOptionalSteps: Record<OptionalSiteEditStep, boolean>
): PlantingSiteStep[] => {
  const { activeLocale } = useLocalization();

  return useMemo<PlantingSiteStep[]>(() => {
    if (!activeLocale) {
      return [];
    }

    const isCompleted = (optionalStep: OptionalSiteEditStep) => completedOptionalSteps[optionalStep] ?? false;

    const simpleSiteSteps: PlantingSiteStep[] = [
      {
        type: 'site_boundary',
        label: strings.SITE_BOUNDARY,
      },
      {
        type: 'exclusion_areas',
        label: strings.EXCLUSION_AREAS,
        optional: { completed: isCompleted('exclusion_areas') },
      },
    ];

    if (siteType === 'Simple') {
      return simpleSiteSteps;
    }

    return [
      ...simpleSiteSteps,
      {
        type: 'stratum_boundaries',
        label: strings.STRATUM_BOUNDARIES,
        optional: { completed: isCompleted('stratum_boundaries') },
      },
      {
        type: 'substratum_boundaries',
        label: strings.SUBSTRATUM_BOUNDARIES,
        optional: { completed: isCompleted('substratum_boundaries') },
      },
    ];
  }, [activeLocale, siteType, completedOptionalSteps]);
};
