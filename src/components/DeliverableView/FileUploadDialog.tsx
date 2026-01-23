import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, useTheme } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';

import useApplicationPortal from 'src/hooks/useApplicationPortal';
import { useApplicationData } from 'src/providers/Application/Context';
import {
  requestGetDeliverable,
  requestUploadDeliverableDocument,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesEditRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DeliverableWithOverdue, UploadDeliverableDocumentRequest } from 'src/types/Deliverables';
import useSnackbar from 'src/utils/useSnackbar';

export type FileUploadDialogProps = {
  deliverable: DeliverableWithOverdue;
  files: File[];
  onClose: () => void;
};

export default function FileUploadDialog({ deliverable, files, onClose }: FileUploadDialogProps): JSX.Element {
  const { isApplicationPortal } = useApplicationPortal();
  const { reload } = useApplicationData();
  const [validate, setValidate] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');
  const [description, setDescription] = useState<string[]>(files.map(() => ''));
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const uploadResult = useAppSelector(selectDeliverablesEditRequest(requestId));

  useEffect(() => {
    if (!uploadResult?.status || uploadResult?.status === 'pending') {
      return;
    }
    if (uploadResult?.status === 'error') {
      if (typeof uploadResult?.data === 'string') {
        snackbar.toastError(uploadResult.data);
      } else {
        snackbar.toastError();
      }
    }
    // close the modal and refresh deliverable even in case of error, there may have been partial successes
    onClose();
    if (!isApplicationPortal) {
      void dispatch(requestGetDeliverable({ deliverableId: deliverable.id, projectId: deliverable.projectId }));
    } else {
      reload();
    }
  }, [
    deliverable.id,
    deliverable.projectId,
    dispatch,
    isApplicationPortal,
    onClose,
    reload,
    snackbar,
    uploadResult?.data,
    uploadResult?.status,
  ]);

  const submit = useCallback(() => {
    setValidate(true);
    if (description.some((d) => !d.trim())) {
      return;
    }
    const documents = files.map(
      (file, index): UploadDeliverableDocumentRequest => ({
        description: description[index],
        file,
        projectId: deliverable.projectId,
      })
    );
    const request = dispatch(requestUploadDeliverableDocument({ deliverableId: deliverable.id, documents }));
    setRequestId(request.requestId);
  }, [deliverable.id, deliverable.projectId, description, dispatch, files]);

  const changeDescription = (index: number, val: string) => {
    setDescription((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const blockStyle = useMemo<Record<string, string | number>>(
    () => ({
      borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
      marginBottom: theme.spacing(3),
      paddingBottom: theme.spacing(3),
    }),
    [theme]
  );

  return (
    <DialogBox
      onClose={() => uploadResult?.status !== 'pending' && onClose()}
      open={true}
      middleButtons={[
        <Button
          disabled={uploadResult?.status === 'pending'}
          id='cancel'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button
          disabled={uploadResult?.status === 'pending'}
          id='submit'
          key='button-2'
          label={strings.SUBMIT}
          onClick={submit}
          priority='primary'
        />,
      ]}
      scrolled
      size='large'
      title={strings.SUBMIT_DOCUMENT}
    >
      <Box display='flex' flexDirection='column'>
        {uploadResult?.status === 'pending' && (
          <CircularProgress
            size='100'
            sx={{
              height: '100px',
              width: '100px',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              margin: 'auto',
              '& .MuiCircularProgress-svg': {
                color: theme.palette.TwClrIcnBrand,
                height: '100px',
                width: '100px',
              },
            }}
          />
        )}
        {files.map((file, index) => (
          <Box key={`${file.name}_${index}`} textAlign='left' sx={index < files.length - 1 ? blockStyle : {}}>
            <Textfield display id={`name_${index}`} label={strings.FILE_NAME} type='text' value={file.name} />
            <Textfield
              errorText={validate && !description[index] ? strings.REQUIRED_FIELD : ''}
              id={`description_${index}`}
              label={strings.DESCRIPTION}
              onChange={(val) => changeDescription(index, val as string)}
              required
              type='text'
              value={description[index]}
              sx={{ marginTop: theme.spacing(2) }}
            />
          </Box>
        ))}
      </Box>
    </DialogBox>
  );
}
