import { useCallback, useEffect, useState } from 'react';

import { useOrganization } from 'src/providers';
import { selectMergeOtherSpecies, selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { MergeOtherSpeciesRequestData, requestMergeOtherSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import MergedSuccessMessage from 'src/scenes/ObservationsRouter/common/MergedSuccessMessage';
import { MergeOtherSpeciesPayloadPartial } from 'src/scenes/ObservationsRouter/details/MatchSpeciesModal';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

type UseOnSaveMergedSpeciesProps = {
  observationId: string | number | undefined;
  reload: () => void;
  setShowMatchSpeciesModal: (showMatchSpeciesModal: boolean) => void;
};

/**
 * Returns a callback function for the onSave property of MatchSpeciesModal. The function closes the
 * modal, submits the merge-species API request, shows a success or failure toast, and triggers a
 * reload of the page's data.
 */
export function useOnSaveMergedSpecies(
  props: UseOnSaveMergedSpeciesProps
): (mergedSpeciesPayloads: MergeOtherSpeciesPayloadPartial[]) => void {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const [mergeRequestId, setMergeRequestId] = useState<string>('');
  const matchResponse = useAppSelector(selectMergeOtherSpecies(mergeRequestId));
  const speciesResponse = useAppSelector(selectSpecies(selectedOrganization.id));
  const { observationId, reload, setShowMatchSpeciesModal } = props;

  useEffect(() => {
    if (matchResponse?.status === 'success' && matchResponse?.data && matchResponse.data.length > 0) {
      // Force reload page to show updated data
      reload();
      snackbar.toastSuccess([MergedSuccessMessage(matchResponse.data)], strings.SPECIES_MATCHED);
    }
    if (matchResponse?.status === 'error') {
      snackbar.toastError();
    }
  }, [matchResponse, snackbar]);

  return useCallback(
    (mergedSpeciesPayloads: MergeOtherSpeciesPayloadPartial[]) => {
      const mergeOtherSpeciesRequestData: MergeOtherSpeciesRequestData[] = mergedSpeciesPayloads
        .filter((sp) => !!sp.otherSpeciesName && !!sp.speciesId)
        .map((sp) => ({
          newName:
            speciesResponse?.data?.species?.find((existing) => existing.id === sp.speciesId)?.scientificName || '',
          otherSpeciesName: sp.otherSpeciesName!,
          speciesId: sp.speciesId!,
        }));

      if (observationId && mergeOtherSpeciesRequestData.length > 0) {
        const request = dispatch(
          requestMergeOtherSpecies({
            mergeOtherSpeciesRequestData,
            observationId: Number(observationId),
          })
        );
        setMergeRequestId(request.requestId);
      }

      setShowMatchSpeciesModal(false);
    },
    [observationId, dispatch]
  );
}
