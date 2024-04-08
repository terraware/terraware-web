import { useCallback, useEffect, useState } from 'react';

import { useOrganization } from 'src/providers';
import { SpeciesService } from 'src/services';
import { AllSpeciesResponse } from 'src/services/SpeciesService';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

export const useSpecies = (record?: { speciesId?: number }) => {
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();

  const [availableSpecies, setAvailableSpecies] = useState<Species[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const initSpecies = useCallback(async () => {
    const result: AllSpeciesResponse = await SpeciesService.getAllSpecies(selectedOrganization.id);
    if (!result.requestSucceeded || !result.species) {
      snackbar.toastError(strings.ERROR_LOAD_SPECIES);
      return;
    }

    setAvailableSpecies(result.species);
  }, [selectedOrganization.id, snackbar]);

  useEffect(() => {
    if (availableSpecies && record?.speciesId) {
      setSelectedSpecies(availableSpecies.find((singleSpecies) => singleSpecies.id === record.speciesId));
    }
  }, [availableSpecies, record?.speciesId]);

  useEffect(() => {
    if (!availableSpecies) {
      void initSpecies();
    }
  }, [availableSpecies, initSpecies]);

  return { availableSpecies, selectedSpecies };
};
