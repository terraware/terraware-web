import { Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { UpdateCohortRequestPayload } from 'src/types/Cohort';
import useSnackbar from 'src/utils/useSnackbar';
import { requestCohort, requestCohortUpdate } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohort, selectCohortRequest } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import CohortForm from 'src/scenes/AcceleratorRouter/CohortForm';

export default function CohortEditView(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const theme = useTheme();
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
    <AcceleratorMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
        {strings.EDIT_COHORT}
      </Typography>

      {cohort && (
        <CohortForm<UpdateCohortRequestPayload>
          busy={cohortUpdateRequest?.status === 'pending'}
          cohort={cohort}
          onCancel={goToCohortView}
          onSave={saveCohort}
        />
      )}
    </AcceleratorMain>
  );
}
