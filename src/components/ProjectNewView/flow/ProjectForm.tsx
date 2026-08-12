import React, { type JSX, useState } from 'react';

import { Container, Grid, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import CountryAndBotanicalCountrySelect from 'src/components/CountryAndBotanicalCountrySelect';
import PageForm from 'src/components/common/PageForm';
import isEnabled from 'src/features';
import { useProjects } from 'src/hooks/useProjects';
import strings from 'src/strings';
import { CreateProjectRequest, UpdateProjectRequest } from 'src/types/Project';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type ProjectFormProps<T extends CreateProjectRequest | UpdateProjectRequest> = {
  onNext: (project: T) => void;
  project: T;
  onCancel: () => void;
  saveText: string;
};

export default function ProjectForm<T extends CreateProjectRequest | UpdateProjectRequest>(
  props: ProjectFormProps<T>
): JSX.Element {
  const { onNext, onCancel, saveText, project } = props;

  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const { availableProjects } = useProjects();
  const showProjectLocation = isEnabled('Species Intelligence') && (availableProjects?.length ?? 0) > 0;
  const [localRecord, setLocalRecord] = useState<T>(project);
  const [validateFields, setValidateFields] = useState<boolean>(false);

  const updateField = (field: keyof T, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onNextHandler = () => {
    if (!localRecord.name) {
      setValidateFields(true);
      return;
    }

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
              label={strings.NAME}
              errorText={validateFields && !localRecord?.name ? strings.REQUIRED_FIELD : ''}
              required
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
          {showProjectLocation && (
            <Grid item xs={12} container spacing={2} sx={{ marginTop: theme.spacing(1) }}>
              <CountryAndBotanicalCountrySelect
                countryCode={localRecord.countryCode ?? undefined}
                botanicalCountryCode={localRecord.botanicalCountryCode ?? undefined}
                onChange={({ countryCode, botanicalCountryCode }) => {
                  setLocalRecord((prev) => ({ ...prev, countryCode, botanicalCountryCode }));
                }}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </PageForm>
  );
}
