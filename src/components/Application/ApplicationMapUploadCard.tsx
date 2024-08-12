import React, { useCallback, useEffect, useState } from 'react';

import { Card, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import { FileChooser } from '@terraware/web-components';

import { requestUploadApplicationBoundary } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationUploadBoundary } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Application } from 'src/types/Application';
import useSnackbar from 'src/utils/useSnackbar';

type ApplicationMapUploadCardProps = {
  application: Application;
  onSuccess: () => void;
};

const ApplicationMapUploadCard = ({ application, onSuccess }: ApplicationMapUploadCardProps) => {
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');

  const result = useAppSelector(selectApplicationUploadBoundary(requestId));
  const { toastError, toastSuccess } = useSnackbar();

  const handleFiles = useCallback(
    (files: File[]) => {
      if (!application || files.length !== 1) {
        return;
      }
      const dispatched = dispatch(requestUploadApplicationBoundary({ applicationId: application.id, file: files[0] }));
      setRequestId(dispatched.requestId);
    },
    [dispatch, application, setRequestId]
  );

  useEffect(() => {
    if (!result) {
      return;
    }

    if (result.status === 'success') {
      toastSuccess(strings.SUCCESS);
      onSuccess();
    } else if (result.status === 'error') {
      // TODO make more meaningful error messages
      toastError(strings.GENERIC_ERROR);
    }
  }, [result, onSuccess, toastError, toastError]);

  return (
    <Card style={{ width: '100%', padding: theme.spacing(2), borderRadius: theme.spacing(3) }}>
      <h3>{strings.UPLOAD_FILE}</h3>
      {result?.status === 'pending' && <BusySpinner />}
      <FileChooser
        chooseFileText={strings.CHOOSE_FILE}
        maxFiles={1}
        setFiles={handleFiles}
        uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
        uploadText={strings.UPLOAD_SHAPEFILE_DESCRIPTION}
      />
    </Card>
  );
};

export default ApplicationMapUploadCard;
