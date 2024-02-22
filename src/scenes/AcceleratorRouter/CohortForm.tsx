import React, { useState } from 'react';
import { Container, Grid, useTheme } from '@mui/material';
import { Dropdown, Textfield } from '@terraware/web-components';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import { CreateCohortRequest, UpdateCohortRequest } from 'src/types/Cohort';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type CohortFormProps<T extends CreateCohortRequest | UpdateCohortRequest> = {
  cohort: T;
  onCancel: () => void;
  onNext: (cohort: T) => void;
  saveText?: string;
};

export default function CohortForm<T extends CreateCohortRequest | UpdateCohortRequest>(
  props: CohortFormProps<T>
): JSX.Element {
  const { cohort, onCancel, onNext, saveText = strings.SAVE } = props;

  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const [localRecord, setLocalRecord] = useState<T>(cohort);
  const [validateFields, setValidateFields] = useState<boolean>(false);

  const currentPhaseDropdownOptions = [
    { label: strings.COHORT_PHASE_DUE_DILIGENCE, value: 'Phase 0 - Due Diligence' },
    { label: strings.COHORT_PHASE_FEASIBILITY_STUDY, value: 'Phase 1 - Feasibility Study' },
    { label: strings.COHORT_PHASE_PLAN_AND_SCALE, value: 'Phase 2 - Plan and Scale' },
    { label: strings.COHORT_PHASE_IMPLEMENT_AND_MONITOR, value: 'Phase 3 - Implement and Monitor' },
  ];

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

  const onNextHandler = () => {
    if (!validateForm()) {
      setValidateFields(true);
      return;
    }

    onNext({
      ...localRecord,
    });
  };

  return (
    <PageForm
      cancelID='cancelNewCohort'
      saveID='createNewCohort'
      onCancel={onCancel}
      onSave={onNextHandler}
      saveButtonText={saveText}
    >
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          margin: '0 auto',
          width: isMobile ? '100%' : '700px',
          paddingLeft: theme.spacing(isMobile ? 0 : 4),
          paddingRight: theme.spacing(isMobile ? 0 : 4),
          paddingTop: theme.spacing(5),
        }}
      >
        <Grid
          container
          width={isMobile ? '100%' : '700px'}
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: theme.spacing(4),
            padding: theme.spacing(3),
          }}
        >
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Textfield
              id='name'
              value={localRecord.name}
              onChange={(value) => updateField('name', value)}
              type='text'
              label={strings.NAME}
              errorText={validateFields && !localRecord?.name ? strings.REQUIRED_FIELD : ''}
              required
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Dropdown
              required
              label={strings.CREATE_ORGANIZATION_QUESTION_ORGANIZATION_TYPE}
              onChange={(value) => updateField('phase', value)}
              selectedValue={localRecord.phase}
              options={currentPhaseDropdownOptions}
              fullWidth={true}
              errorText={validateFields && !localRecord?.phase ? strings.REQUIRED_FIELD : ''}
            />
          </Grid>
        </Grid>
      </Container>
    </PageForm>
  );
}
