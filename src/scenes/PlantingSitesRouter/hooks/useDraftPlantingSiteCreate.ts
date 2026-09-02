import { useCallback, useMemo, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useCreateDraftPlantingSiteMutation } from 'src/queries/generated/draftPlantingSites';
import strings from 'src/strings';
import { DraftPlantingSite, SiteEditStep } from 'src/types/PlantingSite';
import { fromDraft } from 'src/utils/draftPlantingSiteUtils';
import useSnackbar from 'src/utils/useSnackbar';

/**
 * Data type for request and response in hook functions.
 * Also is a container to pass state data back to client.
 * @param draft
 * The draft planting site to be created
 * @param nextStep
 * Next step to use in the flow if create was successful.
 */
type Data = {
  draft: DraftPlantingSite;
  nextStep: SiteEditStep;
};

export type Response = {
  createDraft: (draft: Data, redirectToDraft: boolean) => void;
  createdDraft?: Data;
  isCreating: boolean;
  onFinishCreate: () => void;
};

/**
 * Hook to isolate workflow logic to create a draft planting site.
 * Returns create function, whether the request is in flight and the created draft site.
 * Optionally redirects to the created draft.
 */
export default function useDraftPlantingSiteCreate(): Response {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const [createdDraft, setCreatedDraft] = useState<Data | undefined>();

  const [createDraftPlantingSite, { isLoading: isCreating }] = useCreateDraftPlantingSiteMutation();

  const createDraft = useCallback(
    (request: Data, redirectToDraft: boolean) => {
      const create = async () => {
        try {
          const { id } = await createDraftPlantingSite(fromDraft(request.draft)).unwrap();

          // the draft has an id now, so drop the 'new site' url from the history
          navigate(APP_PATHS.PLANTING_SITES_DRAFT_EDIT.replace(':plantingSiteId', `${id}`), { replace: true });

          if (redirectToDraft) {
            snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
            navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', `${id}`));
          } else {
            setCreatedDraft({ ...request, draft: { ...request.draft, id } });
          }
        } catch {
          snackbar.toastError(strings.GENERIC_ERROR);
        }
      };

      void create();
    },
    [createDraftPlantingSite, navigate, snackbar]
  );

  const onFinishCreate = useCallback(() => setCreatedDraft(undefined), []);

  return useMemo<Response>(
    () => ({
      createDraft,
      createdDraft,
      isCreating,
      onFinishCreate,
    }),
    [createDraft, createdDraft, isCreating, onFinishCreate]
  );
}
