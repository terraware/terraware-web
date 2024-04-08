import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { requestCohort, requestCohortUpdate } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohort, selectCohortRequest } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UpdateCohortRequestPayload } from 'src/types/Cohort';
import useSnackbar from 'src/utils/useSnackbar';

import CohortForm from './CohortForm';

export default function CohortEditView(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const snackbar = useSnackbar();

  const pathParams = useParams<{ cohortId: string }>();
  const cohortId = Number(pathParams.cohortId);

  const cohort = useAppSelector(selectCohort(cohortId));
  const [requestId, setRequestId] = useState<string>('');
  const cohortUpdateRequest = useAppSelector((state) => selectCohortRequest(state, requestId));

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
    history.push({ pathname: APP_PATHS.ACCELERATOR_COHORTS_VIEW.replace(':cohortId', `${cohortId}`) });
  }, [history, cohortId]);

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

  return (
    <Page title={strings.EDIT_COHORT} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      {cohort && (
        <CohortForm<UpdateCohortRequestPayload>
          busy={cohortUpdateRequest?.status === 'pending'}
          cohort={cohort}
          onCancel={goToCohortView}
          onSave={saveCohort}
        />
      )}
    </Page>
  );
}
