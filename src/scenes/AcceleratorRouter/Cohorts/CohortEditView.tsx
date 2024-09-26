import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { requestCohort, requestCohortUpdate } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohort, selectCohortRequest } from 'src/redux/features/cohorts/cohortsSelectors';
import {
  requestDeleteManyCohortModule,
  requestUpdateManyCohortModule,
} from 'src/redux/features/modules/modulesAsyncThunks';
import {
  selectDeleteManyCohortModule,
  selectUpdateManyCohortModule,
} from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UpdateCohortRequestPayload } from 'src/types/Cohort';
import { CohortModule } from 'src/types/Module';
import useSnackbar from 'src/utils/useSnackbar';

import CohortForm from './CohortForm';

export default function CohortEditView(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const pathParams = useParams<{ cohortId: string }>();
  const cohortId = Number(pathParams.cohortId);

  const cohort = useAppSelector(selectCohort(cohortId));
  const [requestId, setRequestId] = useState<string>('');
  const cohortUpdateRequest = useAppSelector((state) => selectCohortRequest(state, requestId));
  const [updateRequestId, setUpdateRequestId] = useState<string>('');
  const [deleteRequestId, setDeleteRequestId] = useState<string>('');
  const modulesAddedRequest = useAppSelector(selectUpdateManyCohortModule(updateRequestId));
  const modulesDeletedRequest = useAppSelector(selectDeleteManyCohortModule(deleteRequestId));

  useEffect(() => {
    if (!cohort) {
      dispatch(requestCohort({ cohortId }));
    }
  }, [cohortId, cohort, dispatch]);

  const saveCohort = useCallback(
    (_cohort: UpdateCohortRequestPayload, modulesToAdd?: CohortModule[], modulesToDelete?: CohortModule[]) => {
      const dispatched = dispatch(requestCohortUpdate({ cohortId, cohort: _cohort }));
      setRequestId(dispatched.requestId);
      if (modulesToAdd) {
        const requests = modulesToAdd.map((mta) => ({
          moduleId: mta.id || -1,
          title: mta.title || '',
          startDate: mta.startDate || '',
          endDate: mta.endDate || '',
        }));
        const dispatched2 = dispatch(requestUpdateManyCohortModule({ cohortId, requests }));
        setUpdateRequestId(dispatched2.requestId);
      }
      if (modulesToDelete) {
        const idsToDelete = modulesToDelete.map((mtd) => mtd.id || -1);
        const dispatched3 = dispatch(requestDeleteManyCohortModule({ cohortId, modulesId: idsToDelete }));
        setDeleteRequestId(dispatched3.requestId);
      }
    },
    [cohortId, dispatch]
  );

  const goToCohortView = useCallback(() => {
    navigate({ pathname: APP_PATHS.ACCELERATOR_COHORTS_VIEW.replace(':cohortId', `${cohortId}`) });
  }, [navigate, cohortId]);

  useEffect(() => {
    if (!cohortUpdateRequest) {
      return;
    }

    if (cohortUpdateRequest.status === 'error') {
      snackbar.toastError();
    } else if (cohortUpdateRequest.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
      dispatch(requestCohort({ cohortId }));
      goToCohortView();
    }
  }, [cohortId, cohortUpdateRequest, dispatch, goToCohortView, snackbar]);

  if (!cohort) {
    return <Page isLoading />;
  }

  return (
    <Page title={strings.EDIT_COHORT} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <CohortForm<UpdateCohortRequestPayload>
        busy={cohortUpdateRequest?.status === 'pending'}
        cohortId={cohortId}
        onCancel={goToCohortView}
        onSave={saveCohort}
        record={cohort}
      />
    </Page>
  );
}
