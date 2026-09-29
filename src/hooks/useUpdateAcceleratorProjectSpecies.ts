import { useCallback } from 'react';

import { useUpdateParticipantProjectSpeciesMutation } from 'src/queries/generated/acceleratorProjectSpecies';
import { AcceleratorProjectSpecies } from 'src/types/AcceleratorProjectSpecies';

const useUpdateAcceleratorProjectSpecies = () => {
  const [updateParticipantProjectSpecies, result] = useUpdateParticipantProjectSpeciesMutation();

  const update = useCallback(
    (acceleratorProjectSpecies: AcceleratorProjectSpecies) =>
      updateParticipantProjectSpecies({
        participantProjectSpeciesId: acceleratorProjectSpecies.id,
        updateParticipantProjectSpeciesPayload: {
          feedback: acceleratorProjectSpecies.feedback,
          internalComment: acceleratorProjectSpecies.internalComment,
          rationale: acceleratorProjectSpecies.rationale,
          speciesNativeCategory: acceleratorProjectSpecies.speciesNativeCategory,
          submissionStatus: acceleratorProjectSpecies.submissionStatus,
        },
      }).unwrap(),
    [updateParticipantProjectSpecies]
  );

  return { update, isLoading: result.isLoading };
};

export default useUpdateAcceleratorProjectSpecies;
