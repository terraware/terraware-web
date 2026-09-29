import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { skipToken } from '@reduxjs/toolkit/query';
import _ from 'lodash';

import useNavigateTo from 'src/hooks/useNavigateTo';
import useUpdateAcceleratorProjectSpecies from 'src/hooks/useUpdateAcceleratorProjectSpecies';
import { useGetParticipantProjectSpeciesQuery } from 'src/queries/generated/acceleratorProjectSpecies';
import { useLazyGetSpeciesQuery, useUpdateSpeciesMutation } from 'src/queries/generated/species';
import strings from 'src/strings';
import { AcceleratorProjectSpecies } from 'src/types/AcceleratorProjectSpecies';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

import { useDeliverableData } from '../Deliverable/DeliverableContext';
import { useProjectData } from '../Project/ProjectContext';
import { AcceleratorProjectSpeciesContext, AcceleratorProjectSpeciesData } from './AcceleratorProjectSpeciesContext';

type Props = {
  children: React.ReactNode;
};

const isEqual = (a: AcceleratorProjectSpecies | undefined, b: AcceleratorProjectSpecies | undefined): boolean =>
  !!(
    a &&
    b &&
    (a.feedback || null) === (b.feedback || null) &&
    (a.internalComment || null) === (b.internalComment || null) &&
    (a.speciesNativeCategory || null) === (b.speciesNativeCategory || null) &&
    (a.rationale || null) === (b.rationale || null) &&
    a.submissionStatus === b.submissionStatus
  );

const AcceleratorProjectSpeciesProvider = ({ children }: Props) => {
  const snackbar = useSnackbar();
  const { currentDeliverable, deliverableId } = useDeliverableData();
  const { projectId } = useProjectData();
  const { goToAcceleratorProjectSpecies: _goToAcceleratorProjectSpecies } = useNavigateTo();
  const params = useParams<{ acceleratorProjectSpeciesId?: string }>();

  const acceleratorProjectSpeciesId = Number(params.acceleratorProjectSpeciesId);
  const [currentSpecies, setCurrentSpecies] = useState<Species>();

  const {
    currentData: ppsData,
    isError: getPPSFailed,
    refetch: refetchPPS,
  } = useGetParticipantProjectSpeciesQuery(
    isNaN(acceleratorProjectSpeciesId) ? skipToken : acceleratorProjectSpeciesId
  );
  const currentAcceleratorProjectSpecies = ppsData?.participantProjectSpecies;

  const [getSpecies, getSpeciesResponse] = useLazyGetSpeciesQuery();

  const { update: updateAcceleratorProjectSpecies, isLoading: isUpdatingPPS } = useUpdateAcceleratorProjectSpecies();

  const [updateSpecies, updateSpeciesResponse] = useUpdateSpeciesMutation();

  const goToAcceleratorProjectSpecies = useCallback(() => {
    _goToAcceleratorProjectSpecies(deliverableId, projectId, acceleratorProjectSpeciesId);
  }, [_goToAcceleratorProjectSpecies, deliverableId, projectId, acceleratorProjectSpeciesId]);

  const reloadPPS = useCallback(() => {
    if (!isNaN(acceleratorProjectSpeciesId)) {
      void refetchPPS();
    }
  }, [acceleratorProjectSpeciesId, refetchPPS]);

  const reloadSpecies = useCallback(() => {
    if (!(currentAcceleratorProjectSpecies?.speciesId && currentDeliverable?.organizationId)) {
      return;
    }

    void getSpecies(
      {
        organizationId: currentDeliverable.organizationId,
        speciesId: currentAcceleratorProjectSpecies.speciesId,
      },
      false
    );
  }, [getSpecies, currentDeliverable, currentAcceleratorProjectSpecies]);

  const reload = useCallback(() => {
    reloadPPS();
    reloadSpecies();
  }, [reloadPPS, reloadSpecies]);

  const update = useCallback(
    (species?: Species, acceleratorProjectSpecies?: AcceleratorProjectSpecies) => {
      if (acceleratorProjectSpecies && !isEqual(acceleratorProjectSpecies, currentAcceleratorProjectSpecies)) {
        const approved =
          currentAcceleratorProjectSpecies?.submissionStatus !== 'Approved' &&
          acceleratorProjectSpecies.submissionStatus === 'Approved';

        void updateAcceleratorProjectSpecies(acceleratorProjectSpecies)
          .then(() => {
            if (approved && currentSpecies) {
              snackbar.pageSuccess(
                strings.formatString(strings.YOU_APPROVED_SPECIES, currentSpecies.scientificName).toString(),
                strings.SPECIES_APPROVED
              );
            } else if (currentSpecies) {
              snackbar.toastSuccess(strings.CHANGES_SAVED);
            }
            goToAcceleratorProjectSpecies();
          })
          .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
      } else {
        // If there are no changes, just send them back to the single view
        goToAcceleratorProjectSpecies();
      }

      if (species && currentDeliverable && !_.isEqual(species, currentSpecies)) {
        void updateSpecies({
          speciesId: species.id,
          updateSpeciesRequestPayload: {
            organizationId: currentDeliverable.organizationId,
            scientificName: species.scientificName,
            averageWoodDensity: species.averageWoodDensity,
            commonName: species.commonName,
            conservationCategory: species.conservationCategory,
            dbhSource: species.dbhSource,
            dbhValue: species.dbhValue,
            ecologicalRoleKnown: species.ecologicalRoleKnown,
            ecosystemTypes: species.ecosystemTypes,
            familyName: species.familyName,
            growthForms: species.growthForms,
            heightAtMaturitySource: species.heightAtMaturitySource,
            heightAtMaturityValue: species.heightAtMaturityValue,
            localUsesKnown: species.localUsesKnown,
            nativeEcosystem: species.nativeEcosystem,
            otherFacts: species.otherFacts,
            plantMaterialSourcingMethods: species.plantMaterialSourcingMethods,
            rare: species.rare,
            seedStorageBehavior: species.seedStorageBehavior,
            successionalGroups: species.successionalGroups,
            woodDensityLevel: species.woodDensityLevel,
          },
        });
      }
    },
    [
      currentDeliverable,
      currentAcceleratorProjectSpecies,
      currentSpecies,
      goToAcceleratorProjectSpecies,
      snackbar,
      updateAcceleratorProjectSpecies,
      updateSpecies,
    ]
  );

  const acceleratorProjectSpeciesData = useMemo<AcceleratorProjectSpeciesData>(
    () => ({
      currentAcceleratorProjectSpecies,
      currentSpecies,
      isBusy: isUpdatingPPS || updateSpeciesResponse.isLoading,
      acceleratorProjectSpeciesId,
      reload,
      update,
    }),
    [
      currentAcceleratorProjectSpecies,
      currentSpecies,
      acceleratorProjectSpeciesId,
      reload,
      update,
      isUpdatingPPS,
      updateSpeciesResponse,
    ]
  );

  useEffect(() => {
    if (updateSpeciesResponse.isSuccess) {
      reloadSpecies();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else if (updateSpeciesResponse.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [reloadSpecies, snackbar, updateSpeciesResponse.isSuccess, updateSpeciesResponse.isError]);

  useEffect(() => {
    if (getPPSFailed) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getPPSFailed, snackbar]);

  useEffect(() => {
    if (getSpeciesResponse.isSuccess && getSpeciesResponse.currentData?.species) {
      setCurrentSpecies(getSpeciesResponse.currentData.species);
    } else if (getSpeciesResponse.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getSpeciesResponse.isSuccess, getSpeciesResponse.currentData, getSpeciesResponse.isError, snackbar]);

  useEffect(() => {
    if (acceleratorProjectSpeciesId) {
      reloadPPS();
    }
  }, [acceleratorProjectSpeciesId, reloadPPS]);

  useEffect(() => {
    if (currentAcceleratorProjectSpecies?.speciesId) {
      reloadSpecies();
    }
  }, [currentAcceleratorProjectSpecies, reloadSpecies]);

  return (
    <AcceleratorProjectSpeciesContext.Provider value={acceleratorProjectSpeciesData}>
      {children}
    </AcceleratorProjectSpeciesContext.Provider>
  );
};

export default AcceleratorProjectSpeciesProvider;
