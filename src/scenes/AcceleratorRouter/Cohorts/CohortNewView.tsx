import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import CohortService from 'src/services/CohortService';
import strings from 'src/strings';
import { CreateCohortRequestPayload } from 'src/types/Cohort';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import CohortForm from './CohortForm';

export default function CohortNewView(): JSX.Element {
  const history = useHistory();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const snackbar = useSnackbar();

  const [record, setRecord] = useForm<CreateCohortRequestPayload>({
    phase: 'Phase 0 - Due Diligence',
    name: '',
  });

  const goToCohortsList = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_COHORTS });
  }, [history]);

  const goToCohortView = useCallback(
    (cohortId: number) => {
      history.push({ pathname: APP_PATHS.ACCELERATOR_COHORTS_VIEW.replace(':cohortId', `${cohortId}`) });
    },
    [history]
  );

  const createNewCohort = useCallback(
    async (cohort: CreateCohortRequestPayload) => {
      // first create the cohort
      let cohortId = -1;
      setIsBusy(true);
      const response = await CohortService.createCohort(cohort);
      setIsBusy(false);
      if (!response.requestSucceeded) {
        snackbar.toastError();
        return;
      } else {
        cohortId = response.data?.cohort?.id;
      }

      if (!cohortId) {
        snackbar.toastError();
        return;
      }

      // set snackbar with status
      snackbar.toastSuccess(strings.formatString(strings.COHORT_ADDED, cohort.name) as string);

      // navigate to cohorts list
      goToCohortView(cohortId);
    },
    [setIsBusy, snackbar, goToCohortView]
  );

  const onCohortSaved = useCallback(
    (cohort: CreateCohortRequestPayload) => {
      setRecord(cohort);
      createNewCohort(cohort);
    },
    [setRecord, createNewCohort]
  );

  return (
    <Page title={strings.ADD_COHORT} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <CohortForm<CreateCohortRequestPayload>
        busy={isBusy}
        cohort={record}
        onCancel={goToCohortsList}
        onSave={onCohortSaved}
      />
    </Page>
  );
}
