import React, { type JSX, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Button, Textfield } from '@terraware/web-components';

import PageDialog from 'src/components/DocumentProducer/PageDialog';
import { useCreateSavedDocumentVersionMutation } from 'src/queries/generated/documentProducerDocuments';
import strings from 'src/strings';
import { toWorkflowState } from 'src/utils/mutationStatus';

type SaveVersionProps = {
  docId: number;
  onFinish: (saved: boolean) => void;
};

const SaveVersion = ({ docId, onFinish }: SaveVersionProps): JSX.Element => {
  const theme = useTheme();

  const [versionName, setVersionName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [saveVersion, saveVersionResult] = useCreateSavedDocumentVersionMutation();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!versionName) {
      newErrors.versionName = strings.REQUIRED_FIELD;
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const save = () => {
    if (validate()) {
      void saveVersion({ documentId: docId, createSavedDocumentVersionRequestPayload: { name: versionName } });
    }
  };

  const cancel = () => onFinish(false);

  return (
    <PageDialog
      workflowState={toWorkflowState(saveVersionResult)}
      onSuccess={() => onFinish(true)}
      onClose={cancel}
      open={true}
      title={strings.SAVE_VERSION}
      size='medium'
      middleButtons={[
        <Button
          id='save-version-cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={cancel}
          key='button-1'
        />,
        <Button id='save-version' label={strings.SAVE} onClick={save} key='button-2' />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid size={12}>
          <Typography fontSize='16px' fontWeight='400' textAlign='center' color={theme.palette.TwClrBaseGray800}>
            {strings.SAVE_VERSION_MESSAGE}
          </Typography>
        </Grid>
        <Grid size={12}>
          <Textfield
            label={strings.NAME}
            type='text'
            id='versionName'
            onChange={(value) => setVersionName(value as string)}
            errorText={errors.versionName}
            value={versionName}
          />
        </Grid>
      </Grid>
    </PageDialog>
  );
};

export default SaveVersion;
