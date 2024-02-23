import { Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import CohortForm from 'src/scenes/AcceleratorRouter/CohortForm';
import CohortService from 'src/services/CohortService';
import strings from 'src/strings';
import { CreateCohortRequest } from 'src/types/Cohort';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

type AcceleratorCohortNewViewProps = {
  reloadData?: () => void;
};

export default function AcceleratorCohortNewView({ reloadData }: AcceleratorCohortNewViewProps): JSX.Element {
  const history = useHistory();
  const theme = useTheme();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const snackbar = useSnackbar();

  const [record, setRecord] = useForm<CreateCohortRequest>({
    phase: 'Phase 0 - Due Diligence',
    name: '',
  });

  const goToAcceleratorOverview = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_OVERVIEW });
  }, [history]);

  const createNewCohort = useCallback(
    async (cohort: CreateCohortRequest) => {
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
      snackbar.toastSuccess(strings.COHORT_ADDED, strings.formatString(strings.PROJECT_ADDED, record.name) as string);

      // navigate to accelerator overview
      goToAcceleratorOverview();
    },
    [setIsBusy, record, snackbar, goToAcceleratorOverview]
  );

  const onCohortConfigured = useCallback(
    (cohort: CreateCohortRequest) => {
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

      {isBusy && <BusySpinner withSkrim={true} />}

      <CohortForm<CreateCohortRequest> cohort={record} onCancel={goToAcceleratorOverview} onNext={onCohortConfigured} />
    </AcceleratorMain>
  );
}
