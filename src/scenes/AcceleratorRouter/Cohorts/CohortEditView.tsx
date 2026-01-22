import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import {
  requestDeleteManyCohortModule,
  requestUpdateManyCohortModule,
} from 'src/redux/features/cohortModules/cohortModulesAsyncThunks';
import {
  selectDeleteManyCohortModules,
  selectUpdateManyCohortModules,
} from 'src/redux/features/cohortModules/cohortModulesSelectors';
import { requestCohort, requestCohortUpdate } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohort, selectCohortRequest } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UpdateCohortRequestPayload } from 'src/types/Cohort';
import { CohortModule } from 'src/types/Module';
import useSnackbar from 'src/utils/useSnackbar';

import CohortForm from './CohortForm';

export default function CohortEditView(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const pathParams = useParams<{ cohortId: string }>();
  const cohortId = Number(pathParams.cohortId);

  const cohort = useAppSelector(selectCohort(cohortId));
  const [isLoading, setIsLoading] = useState(false);
  const [updateCohortRequestId, setUpdateCohortRequestId] = useState<string>('');
  const [updateCohortModulesRequestId, setUpdateCohortModulesRequestId] = useState<string>('');
  const [deleteCohortModulesRequestId, setDeleteCohortModulesRequestId] = useState<string>('');

  const updateCohortRequest = useAppSelector((state) => selectCohortRequest(state, updateCohortRequestId));
  const updateCohortModulesRequest = useAppSelector(selectUpdateManyCohortModules(updateCohortModulesRequestId));
  const deleteCohortModulesRequest = useAppSelector(selectDeleteManyCohortModules(deleteCohortModulesRequestId));

  useEffect(() => {
    if (!cohort) {
      void dispatch(requestCohort({ cohortId }));
    }
  }, [cohortId, cohort, dispatch]);

  const saveCohort = useCallback(
    (_cohort: UpdateCohortRequestPayload, modulesToUpdate?: CohortModule[], modulesToDelete?: CohortModule[]) => {
      const dispatched = dispatch(requestCohortUpdate({ cohortId, cohort: _cohort }));
      setUpdateCohortRequestId(dispatched.requestId);

      if (modulesToUpdate && modulesToUpdate.length > 0) {
        const updateRequest = dispatch(requestUpdateManyCohortModule({ cohortId, modules: modulesToUpdate }));
        setUpdateCohortModulesRequestId(updateRequest.requestId);
      }

      if (modulesToDelete && modulesToDelete.length > 0) {
        const deleteRequest = dispatch(
          requestDeleteManyCohortModule({ cohortId, moduleIds: modulesToDelete.map((module) => module.id) })
        );
        setDeleteCohortModulesRequestId(deleteRequest.requestId);
      }

      setIsLoading(true);
    },
    [cohortId, dispatch]
  );

  const goToCohortView = useCallback(() => {
    navigate({ pathname: APP_PATHS.ACCELERATOR_COHORTS_VIEW.replace(':cohortId', `${cohortId}`) });
  }, [navigate, cohortId]);

  useEffect(() => {
    if (!isLoading) {
      // If there is no pending requests, or if not all requests are done firing yet
      return;
    }

    if (
      updateCohortRequest?.status === 'error' ||
      updateCohortModulesRequest?.status === 'error' ||
      deleteCohortModulesRequest?.status === 'error'
    ) {
      // If any dispatches fail, errors.
      snackbar.toastError();
      setIsLoading(false);
      goToCohortView();
      return;
    }

    if (
      (updateCohortRequest === undefined || updateCohortRequest.status === 'success') &&
      (updateCohortModulesRequest === undefined || updateCohortModulesRequest.status === 'success') &&
      (deleteCohortModulesRequest === undefined || deleteCohortModulesRequest.status === 'success')
    ) {
      // If all non-null requests are successful, show success snackbar and navigate.
      snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
      void dispatch(requestCohort({ cohortId }));
      goToCohortView();
    }
  }, [
    cohortId,
    deleteCohortModulesRequest,
    updateCohortRequest,
    updateCohortModulesRequest,
    isLoading,
    dispatch,
    goToCohortView,
    snackbar,
  ]);

  if (!cohort) {
    return <Page isLoading />;
  }

  return (
    <Page title={strings.EDIT_COHORT} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <CohortForm<UpdateCohortRequestPayload>
        busy={isLoading}
        cohortId={cohortId}
        onCancel={goToCohortView}
        onSave={saveCohort}
        record={cohort}
      />
    </Page>
  );
}
