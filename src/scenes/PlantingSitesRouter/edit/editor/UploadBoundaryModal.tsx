import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DialogBox, FileChooser } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import {
  ParseDraftPlantingSiteBoundaryResponsePayload,
  useParseDraftPlantingSiteBoundaryMutation,
} from 'src/queries/generated/draftPlantingSites';
import strings from 'src/strings';

export const BOUNDARY_FILE_EXTENSIONS = '.kml,.kmz,.geojson,.json,.zip';

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;

const fileSizeText = (bytes: number): string =>
  bytes < BYTES_PER_MB
    ? (strings.formatString(strings.FILE_SIZE_KB, `${Math.round(bytes / BYTES_PER_KB)}`) as string)
    : (strings.formatString(strings.FILE_SIZE_MB, (bytes / BYTES_PER_MB).toFixed(1)) as string);

export type UploadBoundaryModalProps = {
  onClose: () => void;
  onSuccess: (parsed: ParseDraftPlantingSiteBoundaryResponsePayload) => void;
};

/**
 * Dialog to pick a spatial file and have the server parse it into a site boundary.
 */
export default function UploadBoundaryModal({ onClose, onSuccess }: UploadBoundaryModalProps): JSX.Element {
  const theme = useTheme();
  const [files, setFiles] = useState<File[]>([]);
  const [parseBoundary, { isLoading }] = useParseDraftPlantingSiteBoundaryMutation();

  const selectedFileText = useMemo<string | undefined>(
    () => (files[0] ? fileSizeText(files[0].size) : undefined),
    [files]
  );

  const onUpload = useCallback(() => {
    const file = files[0];
    if (!file) {
      return;
    }

    const upload = async () => {
      const parsed = await parseBoundary({ file }).unwrap();
      onSuccess(parsed);
    };

    void upload();
  }, [files, onSuccess, parseBoundary]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.UPLOAD_SITE_BOUNDARY}
      size='large'
      skrim
      style={{ position: 'absolute' }}
      middleButtons={[
        <Button
          id='cancel-upload-boundary'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='confirm-upload-boundary'
          label={strings.UPLOAD}
          onClick={onUpload}
          disabled={files.length === 0 || isLoading}
          key='button-2'
        />,
      ]}
    >
      {isLoading && <BusySpinner withSkrim={true} />}
      <Box display='flex' flexDirection='column' textAlign='left'>
        <FileChooser
          acceptFileType={BOUNDARY_FILE_EXTENSIONS}
          chooseFileText={strings.CHOOSE_FILE}
          files={files}
          fileSelectedText={selectedFileText}
          maxFiles={1}
          setFiles={setFiles}
          uploadDescription={strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION}
          uploadText={strings.UPLOAD_SITE_BOUNDARY}
        />
        <Typography
          fontSize='12px'
          fontWeight={400}
          lineHeight='18px'
          color={theme.palette.TwClrTxtSecondary}
          margin={theme.spacing(2, 0, 1)}
        >
          {strings.UPLOAD_SITE_BOUNDARY_ACCEPTED_FORMATS}
        </Typography>
        {/* TODO: point this at the real support article once the doc link exists. */}
        <Link fontSize='13px' to=''>
          {strings.UPLOAD_SITE_BOUNDARY_HELP_LINK}
        </Link>
      </Box>
    </DialogBox>
  );
}
