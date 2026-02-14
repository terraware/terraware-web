import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import _ from 'lodash';

import useNavigateTo from 'src/hooks/useNavigateTo';
import {
  requestGetAcceleratorProjectSpecies,
  requestUpdateAcceleratorProjectSpecies,
} from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesAsyncThunks';
import {
  selectAcceleratorProjectSpeciesGetRequest,
  selectAcceleratorProjectSpeciesUpdateRequest,
} from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesSelectors';
import { requestGetOneSpecies, requestUpdateSpecies } from 'src/redux/features/species/speciesAsyncThunks';
import { selectSpeciesGetOneRequest, selectSpeciesUpdateRequest } from 'src/redux/features/species/speciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorProjectSpecies } from 'src/types/AcceleratorProjectSpecies';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

import { useDeliverableData } from '../Deliverable/DeliverableContext';
import { useProjectData } from '../Project/ProjectContext';
import { AcceleratorProjectSpeciesContext, AcceleratorProjectSpeciesData } from './AcceleratorProjectSpeciesContext';

export type Props = {
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
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { currentDeliverable, deliverableId } = useDeliverableData();
  const { projectId } = useProjectData();
  const { goToAcceleratorProjectSpecies: _goToAcceleratorProjectSpecies } = useNavigateTo();
  const params = useParams<{ acceleratorProjectSpeciesId?: string }>();

  const acceleratorProjectSpeciesId = Number(params.acceleratorProjectSpeciesId);
  const [currentAcceleratorProjectSpecies, setCurrentAcceleratorProjectSpecies] = useState<AcceleratorProjectSpecies>();
  const [currentSpecies, setCurrentSpecies] = useState<Species>();

  const [getPPSRequestId, setGetPPSRequestId] = useState('');
  const getPPSResponse = useAppSelector(selectAcceleratorProjectSpeciesGetRequest(getPPSRequestId));

  const [getSpeciesRequestId, setGetSpeciesRequestId] = useState('');
  const getSpeciesResponse = useAppSelector(selectSpeciesGetOneRequest(getSpeciesRequestId));

  const [updatePPSRequestId, setUpdatePPSRequestId] = useState('');
  const updatePPSResponse = useAppSelector(selectAcceleratorProjectSpeciesUpdateRequest(updatePPSRequestId));

  const [updateSpeciesRequestId, setUpdateSpeciesRequestId] = useState('');
  const updateSpeciesResponse = useAppSelector(selectSpeciesUpdateRequest(updateSpeciesRequestId));

  const [newStatus, setNewStatus] = useState('');
  const [ppsNeedsReload, setPpsNeedsReload] = useState(true);

  const goToAcceleratorProjectSpecies = useCallback(() => {
    _goToAcceleratorProjectSpecies(deliverableId, projectId, acceleratorProjectSpeciesId);
  }, [_goToAcceleratorProjectSpecies, deliverableId, projectId, acceleratorProjectSpeciesId]);

  const reloadPPS = useCallback(() => {
    if (isNaN(acceleratorProjectSpeciesId)) {
      return;
    }

    const request = dispatch(requestGetAcceleratorProjectSpecies(acceleratorProjectSpeciesId));
    setGetPPSRequestId(request.requestId);
  }, [dispatch, acceleratorProjectSpeciesId]);

  const reloadSpecies = useCallback(() => {
    if (!(currentAcceleratorProjectSpecies?.speciesId && currentDeliverable?.organizationId)) {
      return;
    }

    const request = dispatch(
      requestGetOneSpecies({
        organizationId: currentDeliverable.organizationId,
        speciesId: currentAcceleratorProjectSpecies.speciesId,
      })
    );

    setGetSpeciesRequestId(request.requestId);
  }, [dispatch, currentDeliverable, currentAcceleratorProjectSpecies]);

  const reload = useCallback(() => {
    reloadPPS();
    reloadSpecies();
  }, [reloadPPS, reloadSpecies]);

  const update = useCallback(
    (species?: Species, acceleratorProjectSpecies?: AcceleratorProjectSpecies) => {
      if (acceleratorProjectSpecies && !isEqual(acceleratorProjectSpecies, currentAcceleratorProjectSpecies)) {
        // If the request is successful, and the status was changed, we will want to use the snackbar to tell the user it was approved
        if (
          currentAcceleratorProjectSpecies?.submissionStatus !== 'Approved' &&
          acceleratorProjectSpecies.submissionStatus === 'Approved'
        ) {
          setNewStatus('Approved');
        }

        const updatePPSRequest = dispatch(requestUpdateAcceleratorProjectSpecies({ acceleratorProjectSpecies }));
        setUpdatePPSRequestId(updatePPSRequest.requestId);
      } else {
        // If there are no changes, just send them back to the single view
        goToAcceleratorProjectSpecies();
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
    [currentDeliverable, currentAcceleratorProjectSpecies, currentSpecies, dispatch, goToAcceleratorProjectSpecies]
  );

  const [acceleratorProjectSpeciesData, setAcceleratorProjectSpeciesData] = useState<AcceleratorProjectSpeciesData>({
    isBusy: updatePPSResponse?.status === 'pending' || updateSpeciesResponse?.status === 'pending',
    acceleratorProjectSpeciesId,
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

      if (currentAcceleratorProjectSpecies && currentSpecies) {
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

      goToAcceleratorProjectSpecies();
    } else if (updatePPSResponse.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [
    currentAcceleratorProjectSpecies,
    currentSpecies,
    goToAcceleratorProjectSpecies,
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
      setCurrentAcceleratorProjectSpecies(getPPSResponse.data);
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
    if (acceleratorProjectSpeciesId) {
      reloadPPS();
    }
  }, [acceleratorProjectSpeciesId, reloadPPS]);

  useEffect(() => {
    if (currentAcceleratorProjectSpecies?.speciesId) {
      reloadSpecies();
    }
  }, [currentAcceleratorProjectSpecies, reloadSpecies]);

  useEffect(() => {
    // This way we only update consumers when we have both
    if (!(currentAcceleratorProjectSpecies && currentSpecies)) {
      return;
    }

    setAcceleratorProjectSpeciesData({
      currentAcceleratorProjectSpecies,
      currentSpecies,
      isBusy: updatePPSResponse?.status === 'pending' || updateSpeciesResponse?.status === 'pending',
      acceleratorProjectSpeciesId,
      reload,
      update,
    });
  }, [
    currentAcceleratorProjectSpecies,
    currentSpecies,
    acceleratorProjectSpeciesId,
    reload,
    update,
    updatePPSResponse,
    updateSpeciesResponse,
  ]);

  return (
    <AcceleratorProjectSpeciesContext.Provider value={acceleratorProjectSpeciesData}>
      {children}
    </AcceleratorProjectSpeciesContext.Provider>
  );
};

export default AcceleratorProjectSpeciesProvider;
