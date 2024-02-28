import { Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import CohortForm from 'src/scenes/AcceleratorRouter/CohortForm';
import CohortService from 'src/services/CohortService';
import strings from 'src/strings';
import { CreateCohortRequestPayload } from 'src/types/Cohort';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export default function AcceleratorCohortNewView(): JSX.Element {
  const history = useHistory();
  const theme = useTheme();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const snackbar = useSnackbar();

  const [record, setRecord] = useForm<CreateCohortRequestPayload>({
    phase: 'Phase 0 - Due Diligence',
    name: '',
  });

  const goToCohortsList = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_COHORTS });
  }, [history]);

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
      goToCohortsList();
    },
    [setIsBusy, snackbar, goToCohortsList]
  );

  const onCohortSaved = useCallback(
    (cohort: CreateCohortRequestPayload) => {
      setRecord(cohort);
      createNewCohort(cohort);
    },
    [setRecord, createNewCohort]
  );

  return (
    <AcceleratorMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
        {strings.ADD_COHORT}
      </Typography>

      <CohortForm<CreateCohortRequestPayload>
        busy={isBusy}
        cohort={record}
        onCancel={goToCohortsList}
        onSave={onCohortSaved}
      />
    </AcceleratorMain>
  );
}
