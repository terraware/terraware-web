import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Page from 'src/components/Page';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import useListModules from 'src/hooks/useListModules';
import { requestCohort, requestCohortUpdate } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohort, selectCohortRequest } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UpdateCohortRequestPayload } from 'src/types/Cohort';
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

  const { modules, listModules } = useListModules();

  useEffect(() => {
    if (cohortId) {
      void dispatch(requestCohort({ cohortId }));
      void listModules({ cohortId });
    }
  }, [cohortId, dispatch]);

  useEffect(() => {
    if (!cohort) {
      dispatch(requestCohort({ cohortId }));
    }
  }, [cohortId, cohort, dispatch]);

  const saveCohort = useCallback(
    (_cohort: UpdateCohortRequestPayload) => {
      const dispatched = dispatch(requestCohortUpdate({ cohortId, cohort: _cohort }));
      setRequestId(dispatched.requestId);
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
    <PageWithModuleTimeline
      title={strings.EDIT_COHORT}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
      modules={modules ?? []}
      cohortPhase={cohort.phase}
    >
      <CohortForm<UpdateCohortRequestPayload>
        busy={cohortUpdateRequest?.status === 'pending'}
        cohortId={cohortId}
        onCancel={goToCohortView}
        onSave={saveCohort}
        record={cohort}
      />
    </PageWithModuleTimeline>
  );
}
