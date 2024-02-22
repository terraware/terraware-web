import { Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import CohortForm from 'src/scenes/AcceleratorRouter/CohortForm';
import strings from 'src/strings';
import { CreateProjectRequest } from 'src/types/Project';
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

  const [record, setRecord] = useForm<CreateProjectRequest>({
    // currentPhase: '',
    name: '',
    organizationId: 1,
  });

  const createNewCohort = async (_cohort: unknown) => {
    // // first create the cohort
    // let cohortId = -1;
    // const response = await CohortService.createCohort(record);
    // if (!response.requestSucceeded) {
    //   snackbar.toastError();
    //   return;
    // } else {
    //   cohortId = response.data.id;
    // }

    // if (!cohortId) {
    //   snackbar.toastError();
    //   return;
    // }

    // send request to create cohort
    setIsBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsBusy(false);

    // set snackbar with status
    snackbar.toastSuccess(strings.COHORT_ADDED, strings.formatString(strings.PROJECT_ADDED, record.name) as string);

    // navigate to accelerator overview
    goToAcceleratorOverview();
  };

  const goToAcceleratorOverview = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_OVERVIEW });
  }, [history]);

  return (
    <AcceleratorMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
        {strings.ADD_COHORT}
      </Typography>

      {isBusy && <BusySpinner withSkrim={true} />}

      <CohortForm<CreateProjectRequest> cohort={record} onCancel={goToAcceleratorOverview} onNext={createNewCohort} />
    </AcceleratorMain>
  );
}
