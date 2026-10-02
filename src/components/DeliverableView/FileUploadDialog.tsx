import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, CircularProgress, useTheme } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';

import useApplicationPortal from 'src/hooks/useApplicationPortal';
import { useApplicationData } from 'src/providers/Application/Context';
import { useUploadDeliverableDocumentMutation } from 'src/queries/generated/deliverables';
import strings from 'src/strings';
import { DeliverableWithOverdue } from 'src/types/Deliverables';
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
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState<string[]>(files.map(() => ''));
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [uploadDeliverableDocument] = useUploadDeliverableDocumentMutation();

  const submit = useCallback(async () => {
    setValidate(true);
    if (description.some((d) => !d.trim())) {
      return;
    }

    setUploading(true);
    const results = await Promise.all(
      files.map((file, index) =>
        uploadDeliverableDocument({
          deliverableId: deliverable.id,
          body: { description: description[index], file, projectId: `${deliverable.projectId}` },
        })
      )
    );
    setUploading(false);

    const errors = results.flatMap((result) => ('error' in result ? [result.error] : []));
    if (errors.some((error) => 'status' in error && error.status === 507)) {
      snackbar.toastError(strings.ERROR_SUPPORT_NOTIFIED);
    } else if (errors.length > 0) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
    // close the modal even in case of error, there may have been partial successes
    onClose();
    if (isApplicationPortal) {
      reload();
    }
  }, [
    deliverable.id,
    deliverable.projectId,
    description,
    files,
    isApplicationPortal,
    onClose,
    reload,
    snackbar,
    uploadDeliverableDocument,
  ]);

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
      onClose={() => !uploading && onClose()}
      open={true}
      middleButtons={[
        <Button
          disabled={uploading}
          id='cancel'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button
          disabled={uploading}
          id='submit'
          key='button-2'
          label={strings.SUBMIT}
          onClick={() => void submit()}
          priority='primary'
        />,
      ]}
      scrolled
      size='large'
      title={strings.SUBMIT_DOCUMENT}
    >
      <Box display='flex' flexDirection='column'>
        {uploading && (
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
