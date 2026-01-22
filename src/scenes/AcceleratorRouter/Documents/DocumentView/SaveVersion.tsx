import React, { type JSX, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Button, Textfield } from '@terraware/web-components';

import PageDialog from 'src/components/DocumentProducer/PageDialog';
import { selectDocumentRequest } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestSaveVersion } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

export type SaveVersionProps = {
  docId: number;
  onFinish: (saved: boolean) => void;
};

const SaveVersion = ({ docId, onFinish }: SaveVersionProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [versionName, setVersionName] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selector = useAppSelector(selectDocumentRequest(requestId));

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
      const request = dispatch(
        requestSaveVersion({
          docId,
          payload: {
            name: versionName,
          },
        })
      );
      setRequestId(request.requestId);
    }
  };

  const cancel = () => onFinish(false);

  return (
    <PageDialog
      workflowState={requestId ? selector : undefined}
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
        <Grid item xs={12}>
          <Typography fontSize='16px' fontWeight='400' textAlign='center' color={theme.palette.TwClrBaseGray800}>
            {strings.SAVE_VERSION_MESSAGE}
          </Typography>
        </Grid>
        <Grid item xs={12}>
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
