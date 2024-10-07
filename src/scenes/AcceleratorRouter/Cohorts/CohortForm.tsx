import React, { useEffect, useMemo, useState } from 'react';

import { Container, Grid, useTheme } from '@mui/material';
import { Dropdown, Textfield } from '@terraware/web-components';

import PageForm from 'src/components/common/PageForm';
import useListModules from 'src/hooks/useListModules';
import { useLocalization } from 'src/providers/hooks';
import { selectCohort } from 'src/redux/features/cohorts/cohortsSelectors';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CreateCohortRequestPayload, UpdateCohortRequestPayload } from 'src/types/Cohort';
import { CohortModule } from 'src/types/Module';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import CohortModulesTable from '../Modules/CohortModulesTable';

type CohortFormProps<T extends CreateCohortRequestPayload | UpdateCohortRequestPayload> = {
  busy?: boolean;
  cohortId?: number;
  onCancel: () => void;
  onSave: (cohort: T, modulesToAdd?: CohortModule[], modulesToDelete?: CohortModule[]) => void;
  record: T;
};

export default function CohortForm<T extends CreateCohortRequestPayload | UpdateCohortRequestPayload>(
  props: CohortFormProps<T>
): JSX.Element {
  const { busy, cohortId = -1, onCancel, onSave, record } = props;

  const dispatch = useAppDispatch();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const [localRecord, setLocalRecord] = useState<T>(record);
  const [validateFields, setValidateFields] = useState<boolean>(false);

  const cohort = useAppSelector(selectCohort(cohortId));

  const { modules, listModules } = useListModules();

  const [modulesToAdd, setModulesToAdd] = useState<CohortModule[]>();
  const [modulesToDelete, setModulesToDelete] = useState<CohortModule[]>();

  useEffect(() => {
    if (cohortId) {
      void listModules({ cohortId });
    }
  }, [cohortId, dispatch]);

  const currentPhaseDropdownOptions = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      { label: strings.COHORT_PHASE_DUE_DILIGENCE, value: 'Phase 0 - Due Diligence' },
      { label: strings.COHORT_PHASE_FEASIBILITY_STUDY, value: 'Phase 1 - Feasibility Study' },
      { label: strings.COHORT_PHASE_PLAN_AND_SCALE, value: 'Phase 2 - Plan and Scale' },
      { label: strings.COHORT_PHASE_IMPLEMENT_AND_MONITOR, value: 'Phase 3 - Implement and Monitor' },
    ];
  }, [activeLocale]);

  const updateField = (field: keyof T, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!localRecord.name) {
      return false;
    }

    if (!localRecord.phase) {
      return false;
    }

    return true;
  };

  const onSaveHandler = () => {
    if (!validateForm()) {
      setValidateFields(true);
      return;
    }

    onSave(
      {
        ...localRecord,
      },
      modulesToAdd,
      modulesToDelete
    );
  };

  useEffect(() => {
    // update local record when cohort changes
    setLocalRecord(record);
  }, [record]);

  useEffect(() => {
    const userIds = new Set([cohort?.createdBy, cohort?.modifiedBy]);
    userIds.forEach((userId) => {
      if (userId) {
        dispatch(requestGetUser(userId));
      }
    });
  }, [dispatch, cohort?.createdBy, cohort?.modifiedBy]);

  return (
    <PageForm
      busy={busy}
      cancelID='cancelNewCohort'
      onCancel={onCancel}
      onSave={onSaveHandler}
      saveID='createNewCohort'
    >
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          margin: '0 auto',
          paddingLeft: theme.spacing(isMobile ? 0 : 4),
          paddingRight: theme.spacing(isMobile ? 0 : 4),
          paddingTop: theme.spacing(5),
          width: '100%',
        }}
      >
        <Grid
          container
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: theme.spacing(4),
            padding: theme.spacing(3),
          }}
          width={'100%'}
        >
          <Grid container spacing={theme.spacing(3)} width={'100%'}>
            <Grid item xs={isMobile ? 12 : 4} sx={{ marginTop: theme.spacing(2) }}>
              <Textfield
                errorText={validateFields && !localRecord?.name ? strings.REQUIRED_FIELD : ''}
                id='name'
                label={strings.NAME}
                onChange={(value) => updateField('name', value)}
                required
                type='text'
                value={localRecord.name}
              />
            </Grid>
            <Grid item xs={isMobile ? 12 : 4} sx={{ marginTop: theme.spacing(2) }}>
              <Dropdown
                fullWidth={true}
                label={strings.CURRENT_PHASE}
                onChange={(value) => updateField('phase', value)}
                options={currentPhaseDropdownOptions}
                required
                selectedValue={localRecord.phase}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <CohortModulesTable
              modules={modules}
              editing={true}
              modulesToAdd={modulesToAdd}
              setModulesToAdd={setModulesToAdd}
              modulesToDelete={modulesToDelete}
              setModulesToDelete={setModulesToDelete}
            />
          </Grid>
        </Grid>
      </Container>
    </PageForm>
  );
}
