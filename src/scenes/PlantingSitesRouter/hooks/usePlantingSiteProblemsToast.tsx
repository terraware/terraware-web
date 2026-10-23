import React, { useCallback } from 'react';

import strings from 'src/strings';
import { PlantingSiteProblem } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

const problemText = ({ conflictsWith, problemType, stratum, substratum }: PlantingSiteProblem): string => {
  const conflicts = conflictsWith?.join(', ') ?? '';

  switch (problemType) {
    case 'DuplicateStratumName':
      return strings.formatString(strings.PLANTING_SITE_PROBLEM_DUPLICATE_STRATUM_NAME, stratum ?? '') as string;
    case 'DuplicateSubstratumName':
      return strings.formatString(
        strings.PLANTING_SITE_PROBLEM_DUPLICATE_SUBSTRATUM_NAME,
        stratum ?? '',
        substratum ?? ''
      ) as string;
    case 'ExclusionWithoutBoundary':
      return strings.PLANTING_SITE_PROBLEM_EXCLUSION_WITHOUT_BOUNDARY;
    case 'SiteTooLarge':
      return strings.PLANTING_SITE_PROBLEM_SITE_TOO_LARGE;
    case 'StrataWithoutSiteBoundary':
      return strings.PLANTING_SITE_PROBLEM_STRATA_WITHOUT_SITE_BOUNDARY;
    case 'StratumBoundaryOverlaps':
      return strings.formatString(
        strings.PLANTING_SITE_PROBLEM_STRATUM_BOUNDARY_OVERLAPS,
        stratum ?? '',
        conflicts
      ) as string;
    case 'StratumHasNoSubstrata':
      return strings.formatString(strings.PLANTING_SITE_PROBLEM_STRATUM_HAS_NO_SUBSTRATA, stratum ?? '') as string;
    case 'StratumNotInSite':
      return strings.formatString(strings.PLANTING_SITE_PROBLEM_STRATUM_NOT_IN_SITE, stratum ?? '') as string;
    case 'StratumTooSmall':
      return strings.formatString(strings.PLANTING_SITE_PROBLEM_STRATUM_TOO_SMALL, stratum ?? '') as string;
    case 'SubstratumBoundaryOverlaps':
      return strings.formatString(
        strings.PLANTING_SITE_PROBLEM_SUBSTRATUM_BOUNDARY_OVERLAPS,
        stratum ?? '',
        substratum ?? '',
        conflicts
      ) as string;
    case 'SubstratumInExclusionArea':
      return strings.formatString(
        strings.PLANTING_SITE_PROBLEM_SUBSTRATUM_IN_EXCLUSION_AREA,
        stratum ?? '',
        substratum ?? ''
      ) as string;
    case 'SubstratumNotInStratum':
      return strings.formatString(
        strings.PLANTING_SITE_PROBLEM_SUBSTRATUM_NOT_IN_STRATUM,
        stratum ?? '',
        substratum ?? ''
      ) as string;
  }
};

/**
 * Hook to show planting site validation problems as an error toast.
 */
export default function usePlantingSiteProblemsToast(): (problems: PlantingSiteProblem[]) => void {
  const snackbar = useSnackbar();

  return useCallback(
    (problems: PlantingSiteProblem[]) => {
      snackbar.toastError(
        problems.map((problem, index) => <p key={index}>{problemText(problem)}</p>),
        strings.PLANTING_SITE_MAP_HAS_PROBLEMS
      );
    },
    [snackbar]
  );
}
