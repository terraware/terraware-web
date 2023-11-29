import React, { useState } from 'react';
import strings from 'src/strings';
import { Container, Grid, Theme, useTheme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Textfield } from '@terraware/web-components';
import PageForm from 'src/components/common/PageForm';
import { CreateProjectRequest } from 'src/types/Project';

type SelectPurposeFormProps = {
  onNext: (project: CreateProjectRequest) => void;
  project: CreateProjectRequest;
  onCancel: () => void;
  saveText: string;
};

export default function CreateProjectForm(props: SelectPurposeFormProps): JSX.Element {
  const { onNext, onCancel, saveText, project } = props;
  const [localRecord, setLocalRecord] = useState<CreateProjectRequest>(project);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const updateField = (field: keyof CreateProjectRequest, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onNextHandler = () => {
    onNext({
      ...localRecord,
    });
  };

  return (
    <PageForm
      cancelID='cancelNewProject'
      saveID='createNewProject'
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
              label={strings.NAME_REQUIRED}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Textfield
              id='description'
              value={localRecord.description}
              onChange={(value) => updateField('description', value)}
              type='text'
              label={strings.DESCRIPTION}
            />
          </Grid>
        </Grid>
      </Container>
    </PageForm>
  );
}
