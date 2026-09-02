import { useCallback, useEffect, useMemo } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useGetDraftPlantingSiteQuery } from 'src/queries/generated/draftPlantingSites';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { toDraft } from 'src/utils/draftPlantingSiteUtils';
import useSnackbar from 'src/utils/useSnackbar';

export type Props = {
  draftId: number;
};

export type Response = {
  isLoading: boolean;
  site?: DraftPlantingSite;
};

/**
 * Hook to fetch a draft planting site.
 * Returns the fetched draft site and whether the request is still in flight.
 */
export default function useDraftPlantingSiteGet({ draftId }: Props): Response {
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();

  const draftIdIsValid = useMemo(() => !isNaN(draftId), [draftId]);

  const { currentData, isError, isLoading } = useGetDraftPlantingSiteQuery(draftId, { skip: !draftIdIsValid });

  const goToPlantingSites = useCallback(() => {
    navigate(APP_PATHS.PLANTING_SITES);
  }, [navigate]);

  useEffect(() => {
    if (!draftIdIsValid) {
      goToPlantingSites();
    }
  }, [draftIdIsValid, goToPlantingSites]);

  useEffect(() => {
    if (isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
      goToPlantingSites();
    }
  }, [goToPlantingSites, isError, snackbar]);

  return useMemo<Response>(
    () => ({
      // an invalid id is redirecting away, so keep callers in their loading state
      isLoading: isLoading || !draftIdIsValid,
      site: currentData ? toDraft(currentData.site) : undefined,
    }),
    [currentData, draftIdIsValid, isLoading]
  );
}
