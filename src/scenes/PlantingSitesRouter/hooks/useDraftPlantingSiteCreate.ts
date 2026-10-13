import { useCallback, useMemo } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useCreateDraftPlantingSiteMutation } from 'src/queries/generated/draftPlantingSites';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { fromDraft } from 'src/utils/draftPlantingSiteUtils';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  createDraft: (draft: DraftPlantingSite) => void;
  isCreating: boolean;
};

/**
 * Hook to create a draft planting site and continue its setup in the site editor.
 */
export default function useDraftPlantingSiteCreate(): Response {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const [createDraftPlantingSite, { isLoading: isCreating }] = useCreateDraftPlantingSiteMutation();

  const createDraft = useCallback(
    (draft: DraftPlantingSite) => {
      const create = async () => {
        try {
          const { id } = await createDraftPlantingSite(fromDraft(draft)).unwrap();
          navigate(APP_PATHS.PLANTING_SITES_DRAFT_EDIT.replace(':plantingSiteId', `${id}`));
        } catch {
          snackbar.toastError(strings.GENERIC_ERROR);
        }
      };

      void create();
    },
    [createDraftPlantingSite, navigate, snackbar]
  );

  return useMemo<Response>(() => ({ createDraft, isCreating }), [createDraft, isCreating]);
}
