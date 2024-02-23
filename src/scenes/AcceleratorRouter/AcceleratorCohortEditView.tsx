import { Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import CohortForm from 'src/scenes/AcceleratorRouter/CohortForm';
import CohortService from 'src/services/CohortService';
import strings from 'src/strings';
import { UpdateCohortRequestPayload } from 'src/types/Cohort';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

type AcceleratorCohortEditViewProps = {
  reloadData?: () => void;
};

export default function AcceleratorCohortEditView({ reloadData }: AcceleratorCohortEditViewProps): JSX.Element {
  const history = useHistory();
  const theme = useTheme();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const snackbar = useSnackbar();
  const pathParams = useParams<{ cohortId: string }>();
  const cohortId = Number(pathParams.cohortId);

  const [record, setRecord] = useForm<UpdateCohortRequestPayload>({
    phase: 'Phase 0 - Due Diligence',
    name: '',
  });

  const goToAcceleratorOverview = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_OVERVIEW });
  }, [history]);

  const updateCohort = useCallback(
    async (cohort: UpdateCohortRequestPayload) => {
      if (!cohortId) {
        snackbar.toastError();
        return;
      }

      // update the cohort
      setIsBusy(true);
      const response = await CohortService.updateCohort(cohortId, cohort);
      setIsBusy(false);
      if (!response.requestSucceeded) {
        snackbar.toastError();
        return;
      }

      // set snackbar with status
      snackbar.toastSuccess(strings.formatString(strings.COHORT_UPDATED, cohort.name) as string);

      // navigate to accelerator overview
      goToAcceleratorOverview();
    },
    [cohortId, setIsBusy, snackbar, goToAcceleratorOverview]
  );

  const onCohortSaved = useCallback(
    (cohort: UpdateCohortRequestPayload) => {
      setRecord(cohort);
      updateCohort(cohort);
    },
    [setRecord, updateCohort]
  );

  useEffect(() => {
    const getCohort = async () => {
      if (!cohortId) {
        return;
      }

      setIsBusy(true);
      const response = await CohortService.getCohort(cohortId);
      setIsBusy(false);
      if (!response.requestSucceeded || !response.data) {
        snackbar.toastError();
        return;
      }

      setRecord({
        phase: response.data.phase,
        name: response.data.name,
      });
    };

    getCohort();
  }, [cohortId, setIsBusy, setRecord, snackbar]);

  return (
    <AcceleratorMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
        {strings.EDIT_COHORT}
      </Typography>

      {record?.name && (
        <CohortForm<UpdateCohortRequestPayload>
          busy={isBusy}
          cohort={record}
          onCancel={goToAcceleratorOverview}
          onSave={onCohortSaved}
        />
      )}
    </AcceleratorMain>
  );
}
