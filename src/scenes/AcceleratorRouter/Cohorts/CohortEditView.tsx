import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import useListCohortModules from 'src/hooks/useListCohortModules';
import {
  requestDeleteManyCohortModule,
  requestUpdateManyCohortModule,
} from 'src/redux/features/cohortModules/cohortModulesAsyncThunks';
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
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const pathParams = useParams<{ cohortId: string }>();
  const cohortId = Number(pathParams.cohortId);

  const cohort = useAppSelector(selectCohort(cohortId));
  const { cohortModules, listCohortModules } = useListCohortModules();
  const [requestId, setRequestId] = useState<string>('');
  const cohortUpdateRequest = useAppSelector((state) => selectCohortRequest(state, requestId));

  useEffect(() => {
    if (!cohort) {
      dispatch(requestCohort({ cohortId }));
      void listCohortModules(cohortId);
    }
  }, [cohortId, cohort, dispatch]);

  const saveCohort = useCallback(
    (_cohort: UpdateCohortRequestPayload, pendingModules?: CohortModule[]) => {
      const dispatched = dispatch(requestCohortUpdate({ cohortId, cohort: _cohort }));
      setRequestId(dispatched.requestId);

      if (pendingModules?.length !== undefined && pendingModules.length > 0) {
        if (cohortModules.length > 0) {
          // determine modules to add, and modules to delete
          const toDelete = cohortModules.filter(
            (oldModule) => pendingModules.find((newModule) => newModule.id === oldModule.id) === undefined
          );

          const toAdd = pendingModules.filter(
            (newModule) => cohortModules.find((oldModule) => oldModule.id === newModule.id) === undefined
          );

          const toUpdate = pendingModules.filter((newModule) => {
            const oldModule = cohortModules.find((oldModule) => oldModule.id === newModule.id);
            return (
              oldModule !== undefined &&
              !(
                oldModule.title === newModule.title &&
                oldModule.startDate === newModule.startDate &&
                oldModule.endDate === newModule.endDate
              )
            );
          });

          dispatch(requestUpdateManyCohortModule({ cohortId, modules: [...toAdd, ...toUpdate] }));
          dispatch(requestDeleteManyCohortModule({ cohortId, moduleIds: toDelete.map((module) => module.id) }));
        } else {
          // add every module since there is none
          dispatch(requestUpdateManyCohortModule({ cohortId, modules: pendingModules }));
        }
      }
    },
    [cohortId, cohortModules, dispatch]
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
