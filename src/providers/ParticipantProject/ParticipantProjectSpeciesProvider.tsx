import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import _ from 'lodash';

import useNavigateTo from 'src/hooks/useNavigateTo';
import {
  requestGetParticipantProjectSpecies,
  requestUpdateParticipantProjectSpecies,
} from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import {
  selectParticipantProjectSpeciesGetRequest,
  selectParticipantProjectSpeciesUpdateRequest,
} from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { requestGetOneSpecies, requestUpdateSpecies } from 'src/redux/features/species/speciesAsyncThunks';
import { selectSpeciesGetOneRequest, selectSpeciesUpdateRequest } from 'src/redux/features/species/speciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ParticipantProjectSpecies } from 'src/types/ParticipantProjectSpecies';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

import { useDeliverableData } from '../Deliverable/DeliverableContext';
import { useProjectData } from '../Project/ProjectContext';
import { ParticipantProjectSpeciesContext, ParticipantProjectSpeciesData } from './ParticipantProjectSpeciesContext';

export type Props = {
  children: React.ReactNode;
};

const isEqual = (a: ParticipantProjectSpecies | undefined, b: ParticipantProjectSpecies | undefined): boolean =>
  !!(
    a &&
    b &&
    (a.feedback || null) === (b.feedback || null) &&
    (a.internalComment || null) === (b.internalComment || null) &&
    (a.speciesNativeCategory || null) === (b.speciesNativeCategory || null) &&
    (a.rationale || null) === (b.rationale || null) &&
    a.submissionStatus === b.submissionStatus
  );

const ParticipantProjectSpeciesProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { currentDeliverable, deliverableId } = useDeliverableData();
  const { projectId } = useProjectData();
  const { goToAcceleratorProjectSpecies: _goToParticipantProjectSpecies } = useNavigateTo();
  const params = useParams<{ acceleratorProjectSpeciesId?: string }>();

  const participantProjectSpeciesId = Number(params.acceleratorProjectSpeciesId);
  const [currentParticipantProjectSpecies, setCurrentParticipantProjectSpecies] = useState<ParticipantProjectSpecies>();
  const [currentSpecies, setCurrentSpecies] = useState<Species>();

  const [getPPSRequestId, setGetPPSRequestId] = useState('');
  const getPPSResponse = useAppSelector(selectParticipantProjectSpeciesGetRequest(getPPSRequestId));

  const [getSpeciesRequestId, setGetSpeciesRequestId] = useState('');
  const getSpeciesResponse = useAppSelector(selectSpeciesGetOneRequest(getSpeciesRequestId));

  const [updatePPSRequestId, setUpdatePPSRequestId] = useState('');
  const updatePPSResponse = useAppSelector(selectParticipantProjectSpeciesUpdateRequest(updatePPSRequestId));

  const [updateSpeciesRequestId, setUpdateSpeciesRequestId] = useState('');
  const updateSpeciesResponse = useAppSelector(selectSpeciesUpdateRequest(updateSpeciesRequestId));

  const [newStatus, setNewStatus] = useState('');
  const [ppsNeedsReload, setPpsNeedsReload] = useState(true);

  const goToParticipantProjectSpecies = useCallback(() => {
    _goToParticipantProjectSpecies(deliverableId, projectId, participantProjectSpeciesId);
  }, [_goToParticipantProjectSpecies, deliverableId, projectId, participantProjectSpeciesId]);

  const reloadPPS = useCallback(() => {
    if (isNaN(participantProjectSpeciesId)) {
      return;
    }

    const request = dispatch(requestGetParticipantProjectSpecies(participantProjectSpeciesId));
    setGetPPSRequestId(request.requestId);
  }, [dispatch, participantProjectSpeciesId]);

  const reloadSpecies = useCallback(() => {
    if (!(currentParticipantProjectSpecies?.speciesId && currentDeliverable?.organizationId)) {
      return;
    }

    const request = dispatch(
      requestGetOneSpecies({
        organizationId: currentDeliverable.organizationId,
        speciesId: currentParticipantProjectSpecies.speciesId,
      })
    );

    setGetSpeciesRequestId(request.requestId);
  }, [dispatch, currentDeliverable, currentParticipantProjectSpecies]);

  const reload = useCallback(() => {
    reloadPPS();
    reloadSpecies();
  }, [reloadPPS, reloadSpecies]);

  const update = useCallback(
    (species?: Species, participantProjectSpecies?: ParticipantProjectSpecies) => {
      if (participantProjectSpecies && !isEqual(participantProjectSpecies, currentParticipantProjectSpecies)) {
        // If the request is successful, and the status was changed, we will want to use the snackbar to tell the user it was approved
        if (
          currentParticipantProjectSpecies?.submissionStatus !== 'Approved' &&
          participantProjectSpecies.submissionStatus === 'Approved'
        ) {
          setNewStatus('Approved');
        }

        const updatePPSRequest = dispatch(requestUpdateParticipantProjectSpecies({ participantProjectSpecies }));
        setUpdatePPSRequestId(updatePPSRequest.requestId);
      } else {
        // If there are no changes, just send them back to the single view
        goToParticipantProjectSpecies();
      }

      if (species && currentDeliverable && !_.isEqual(species, currentSpecies)) {
        const updateSpeciesRequest = dispatch(
          requestUpdateSpecies({
            organizationId: currentDeliverable.organizationId,
            species,
          })
        );
        setUpdateSpeciesRequestId(updateSpeciesRequest.requestId);
      }
      setPpsNeedsReload(true);
    },
    [currentDeliverable, currentParticipantProjectSpecies, currentSpecies, dispatch, goToParticipantProjectSpecies]
  );

  const [participantProjectSpeciesData, setParticipantProjectSpeciesData] = useState<ParticipantProjectSpeciesData>({
    isBusy: updatePPSResponse?.status === 'pending' || updateSpeciesResponse?.status === 'pending',
    participantProjectSpeciesId,
    reload,
    update,
  });

  useEffect(() => {
    if (!updatePPSResponse) {
      return;
    }

    if (updatePPSResponse.status === 'success' && ppsNeedsReload) {
      reloadPPS();
      setPpsNeedsReload(false);

      if (currentParticipantProjectSpecies && currentSpecies) {
        if (newStatus === 'Approved') {
          snackbar.pageSuccess(
            strings.formatString(strings.YOU_APPROVED_SPECIES, currentSpecies.scientificName).toString(),
            strings.SPECIES_APPROVED
          );
          setNewStatus('');
        } else {
          snackbar.toastSuccess(strings.CHANGES_SAVED);
        }
      }

      goToParticipantProjectSpecies();
    } else if (updatePPSResponse.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [
    currentParticipantProjectSpecies,
    currentSpecies,
    goToParticipantProjectSpecies,
    newStatus,
    ppsNeedsReload,
    reloadPPS,
    snackbar,
    updatePPSResponse,
  ]);

  useEffect(() => {
    if (!updateSpeciesResponse) {
      return;
    }

    if (updateSpeciesResponse.status === 'success') {
      reloadSpecies();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else if (updateSpeciesResponse.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [reloadSpecies, snackbar, updateSpeciesResponse]);

  useEffect(() => {
    if (!getPPSResponse) {
      return;
    }

    if (getPPSResponse.status === 'success' && getPPSResponse.data) {
      setCurrentParticipantProjectSpecies(getPPSResponse.data);
    } else if (getPPSResponse.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getPPSResponse, snackbar]);

  useEffect(() => {
    if (!getSpeciesResponse) {
      return;
    }

    if (getSpeciesResponse.status === 'success' && getSpeciesResponse.data) {
      setCurrentSpecies(getSpeciesResponse.data);
    } else if (getSpeciesResponse.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getSpeciesResponse, snackbar]);

  useEffect(() => {
    if (participantProjectSpeciesId) {
      reloadPPS();
    }
  }, [participantProjectSpeciesId, reloadPPS]);

  useEffect(() => {
    if (currentParticipantProjectSpecies?.speciesId) {
      reloadSpecies();
    }
  }, [currentParticipantProjectSpecies, reloadSpecies]);

  useEffect(() => {
    // This way we only update consumers when we have both
    if (!(currentParticipantProjectSpecies && currentSpecies)) {
      return;
    }

    setParticipantProjectSpeciesData({
      currentParticipantProjectSpecies,
      currentSpecies,
      isBusy: updatePPSResponse?.status === 'pending' || updateSpeciesResponse?.status === 'pending',
      participantProjectSpeciesId,
      reload,
      update,
    });
  }, [
    currentParticipantProjectSpecies,
    currentSpecies,
    participantProjectSpeciesId,
    reload,
    update,
    updatePPSResponse,
    updateSpeciesResponse,
  ]);

  return (
    <ParticipantProjectSpeciesContext.Provider value={participantProjectSpeciesData}>
      {children}
    </ParticipantProjectSpeciesContext.Provider>
  );
};

export default ParticipantProjectSpeciesProvider;
