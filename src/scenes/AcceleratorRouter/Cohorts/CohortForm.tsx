import React, { useEffect, useMemo, useState } from 'react';

import { Container, Grid, useTheme } from '@mui/material';
import { Dropdown, Textfield } from '@terraware/web-components';

import PageForm from 'src/components/common/PageForm';
// import ProjectFieldMeta from 'src/components/ProjectField/Meta';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { CreateCohortRequestPayload, UpdateCohortRequestPayload } from 'src/types/Cohort';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type CohortFormProps<T extends CreateCohortRequestPayload | UpdateCohortRequestPayload> = {
  busy?: boolean;
  cohort: T;
  onCancel: () => void;
  onSave: (cohort: T) => void;
};

export default function CohortForm<T extends CreateCohortRequestPayload | UpdateCohortRequestPayload>(
  props: CohortFormProps<T>
): JSX.Element {
  const { busy, cohort, onCancel, onSave } = props;

  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const [localRecord, setLocalRecord] = useState<T>(cohort);
  const [validateFields, setValidateFields] = useState<boolean>(false);

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

    onSave({
      ...localRecord,
    });
  };

  useEffect(() => {
    // update local record when cohort changes
    setLocalRecord(cohort);
  }, [cohort]);

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

          {/* TODO: uncomment this section once createdTime & modifiedTime are available in Cohort records */}
          {/* <Grid container>
            <ProjectFieldMeta
              date={cohort.createdTime || 'Mar 2, 2024'}
              dateLabel={strings.CREATED_ON}
              user={cohort.createdBy || 'Weese Ritherspoon'}
              userLabel={strings.CREATED_BY}
            />
            <ProjectFieldMeta
              date={cohort.modifiedTime || 'Mar 2, 2024'}
              dateLabel={strings.LAST_MODIFIED_ON}
              user={cohort.modifiedBy || 'Weese Ritherspoon'}
              userLabel={strings.LAST_MODIFIED_BY}
            />
          </Grid> */}
        </Grid>
      </Container>
    </PageForm>
  );
}
