import { useCallback } from 'react';

import { useLocalization } from 'src/providers';
import { MergeOtherSpeciesRequestPayload, useMergeOtherSpeciesMutation } from 'src/queries/generated/observations';
import { MergeOtherSpeciesPayloadPartial } from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import useSnackbar from 'src/utils/useSnackbar';

type UseOnSaveMergedSpeciesProps = {
  observationId: number;
  onComplete?: () => void;
};

/**
 * Returns a callback function for the onSave property of MatchSpeciesModal.
 */
export function useOnSaveMergedSpeciesRtk(
  props: UseOnSaveMergedSpeciesProps
): (mergedSpeciesPayloads: MergeOtherSpeciesPayloadPartial[]) => void {
  const snackbar = useSnackbar();
  const { strings } = useLocalization();
  const [mergeOtherSpecies] = useMergeOtherSpeciesMutation();
  const { observationId, onComplete } = props;

  return useCallback(
    (mergedSpeciesPayloads: MergeOtherSpeciesPayloadPartial[]) => {
      const mergeManySpecies = async () => {
        const mergeSpeciesPayloads = mergedSpeciesPayloads.filter(
          (payload): payload is MergeOtherSpeciesRequestPayload => !!payload.otherSpeciesName && !!payload.speciesId
        );
        const promises = mergeSpeciesPayloads.map((payload) => {
          return mergeOtherSpecies({
            observationId,
            mergeOtherSpeciesRequestPayload: {
              otherSpeciesName: payload.otherSpeciesName,
              speciesId: payload.speciesId,
            },
          }).unwrap();
        });

        try {
          const results = await Promise.all(promises);
          if (results.every((result) => result.status === 'ok')) {
            snackbar.toastSuccess(strings.SPECIES_MATCHED);
            onComplete?.();
          } else {
            snackbar.toastError();
          }
        } catch (error) {
          snackbar.toastError();
        }
      };

      void mergeManySpecies();
    },
    [mergeOtherSpecies, observationId, onComplete, snackbar, strings.SPECIES_MATCHED]
  );
}
