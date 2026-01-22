import React, { type JSX, useCallback, useEffect, useState } from 'react';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { requestUpdateManyCohortModule } from 'src/redux/features/cohortModules/cohortModulesAsyncThunks';
import { selectUpdateManyCohortModules } from 'src/redux/features/cohortModules/cohortModulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import CohortService from 'src/services/CohortService';
import strings from 'src/strings';
import { CreateCohortRequestPayload } from 'src/types/Cohort';
import { CohortModule } from 'src/types/Module';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import CohortForm from './CohortForm';

export default function CohortNewView(): JSX.Element {
  const navigate = useSyncNavigate();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const [cohortName, setCohortName] = useState('');
  const [newCohortId, setNewCohortId] = useState<number>();
  const [createCohortModulesRequestId, setCreateCohortModulesRequestId] = useState<string>('');
  const updateCohortModulesRequest = useAppSelector(selectUpdateManyCohortModules(createCohortModulesRequestId));

  const [record, setRecord] = useForm<CreateCohortRequestPayload>({
    phase: 'Phase 0 - Due Diligence',
    name: '',
  });

  const goToCohortsList = useCallback(() => {
    navigate({ pathname: APP_PATHS.ACCELERATOR_COHORTS });
  }, [navigate]);

  const goToCohortView = useCallback(
    (cohortId: number) => {
      navigate({ pathname: APP_PATHS.ACCELERATOR_COHORTS_VIEW.replace(':cohortId', `${cohortId}`) });
    },
    [navigate]
  );

  useEffect(() => {
    if (updateCohortModulesRequest?.status === 'success' && newCohortId) {
      setIsBusy(false);
      snackbar.toastSuccess(strings.formatString(strings.COHORT_ADDED, cohortName) as string);
      goToCohortView(newCohortId);
    } else if (updateCohortModulesRequest?.status === 'error') {
      setIsBusy(false);
      snackbar.toastError();
    }
  }, [cohortName, goToCohortView, newCohortId, snackbar, updateCohortModulesRequest?.status]);

  const createNewCohort = useCallback(
    async (cohort: CreateCohortRequestPayload, modulesToUpdate?: CohortModule[]) => {
      // first create the cohort
      let cohortId = -1;
      setIsBusy(true);
      const response = await CohortService.createCohort(cohort);
      if (!response.requestSucceeded) {
        snackbar.toastError();
        setIsBusy(false);
        return;
      } else {
        cohortId = response.data?.cohort?.id;
        if (cohortId && modulesToUpdate && modulesToUpdate.length > 0) {
          setNewCohortId(cohortId);
          setCohortName(cohort.name);
          const createModulesRequest = dispatch(requestUpdateManyCohortModule({ cohortId, modules: modulesToUpdate }));
          setCreateCohortModulesRequestId(createModulesRequest.requestId);
        } else {
          if (!cohortId) {
            snackbar.toastError();
            setIsBusy(false);
            return;
          }
          setIsBusy(false);
          // set snackbar with status
          snackbar.toastSuccess(strings.formatString(strings.COHORT_ADDED, cohort.name) as string);

          // navigate to cohorts list
          goToCohortView(cohortId);
        }
      }
    },
    [snackbar, dispatch, goToCohortView]
  );

  const onCohortSaved = useCallback(
    (cohort: CreateCohortRequestPayload, modulesToUpdate?: CohortModule[]) => {
      setRecord(cohort);
      void createNewCohort(cohort, modulesToUpdate);
    },
    [setRecord, createNewCohort]
  );

  return (
    <Page title={strings.ADD_COHORT} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <CohortForm<CreateCohortRequestPayload>
        busy={isBusy}
        onCancel={goToCohortsList}
        onSave={onCohortSaved}
        record={record}
      />
    </Page>
  );
}
