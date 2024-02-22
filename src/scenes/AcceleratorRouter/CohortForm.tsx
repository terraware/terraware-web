import React, { useState } from 'react';
import { Container, Grid, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageForm from 'src/components/common/PageForm';
import { CreateProjectRequest, UpdateProjectRequest } from 'src/types/Project';

type CohortFormProps<T extends CreateProjectRequest | UpdateProjectRequest> = {
  onNext: (cohort: T) => void;
  cohort: T;
  onCancel: () => void;
  saveText?: string;
};

export default function CohortForm<T extends CreateProjectRequest | UpdateProjectRequest>(
  props: CohortFormProps<T>
): JSX.Element {
  const { onNext, onCancel, saveText = strings.SAVE, cohort } = props;

  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const [localRecord, setLocalRecord] = useState<T>(cohort);
  const [validateFields, setValidateFields] = useState<boolean>(false);

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

    // TODO: check for currentPhase value

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
            TODO: Add "Current Phase" dropdown here
          </Grid>
        </Grid>
      </Container>
    </PageForm>
  );
}
