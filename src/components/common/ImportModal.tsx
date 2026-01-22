import React, { type JSX, useEffect, useRef, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import { useOrganization } from 'src/providers/hooks';
import { ImportModuleResponsePayload } from 'src/services/ModuleService';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { GetUploadStatusResponsePayload, ResolveResponse, UploadFileResponse, UploadResponse } from 'src/types/File';
import { downloadCsv } from 'src/utils/csv';
import useSnackbar from 'src/utils/useSnackbar';

import DialogBox from './DialogBox/DialogBox';
import ProgressCircle from './ProgressCircle/ProgressCircle';
import Button from './button/Button';
import Icon from './icon/Icon';

export type ImportProblemElement = {
  problem: string;
  row: number;
};

export type ImportResponsePayload = Omit<ImportModuleResponsePayload, 'problems'> & {
  problems: ImportProblemElement[];
};

export type ImportSpeciesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  facility?: Facility;
  setCheckDataModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  resolveApi: (uploadId: number, overwriteExisting: boolean) => Promise<ResolveResponse>;
  uploaderTitle: string;
  uploaderDescription: string;
  uploadApi?: (file: File, orgOrFacilityId: string) => Promise<UploadFileResponse>;
  templateApi?: () => Promise<any>;
  statusApi?: (uploadId: number) => Promise<UploadResponse>;
  simpleUploadApi?: (file: File) => Promise<ImportResponsePayload | null>;
  importCompleteLabel: string;
  importingLabel: string;
  duplicatedLabel: string;
  children?: React.ReactNode;
  reloadData?: () => void;
  isImportValid?: () => boolean;
};

export const downloadCsvTemplateHandler = async (templateApi: () => Promise<any>) => {
  const apiResponse = await templateApi();
  const data = apiResponse?.template ?? apiResponse; // TODO, make all API return a { template: <string> } type
  downloadCsv('template', data);
};

const warningContentStyles = {
  textAlign: 'left',
};

export default function ImportSpeciesModal(props: ImportSpeciesModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const {
    open,
    onClose,
    facility,
    setCheckDataModalOpen,
    title,
    resolveApi,
    uploaderTitle,
    uploaderDescription,
    uploadApi,
    templateApi,
    statusApi,
    simpleUploadApi,
    importCompleteLabel,
    importingLabel,
    duplicatedLabel,
    children,
    reloadData,
    isImportValid,
  } = props;
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<JSX.Element>();
  const [loading, setLoading] = useState(false);
  const [fileStatus, setFileStatus] = useState<GetUploadStatusResponsePayload>();
  const [uploadInterval, setUploadInterval] = useState<ReturnType<typeof setInterval>>();
  const [completed, setCompleted] = useState(false);
  const [warning, setWarning] = useState(false);
  const [uploadId, setUploadId] = useState<number>();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const spacingStyles = { marginRight: theme.spacing(2) };

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const loadingTextStyles = {
    fontSize: '16px',
    margin: 0,
    color: theme.palette.TwClrTxt,
  };

  const handleCancel = () => {
    onClose(completed);
    if (uploadInterval) {
      clearInterval(uploadInterval);
      setUploadInterval(undefined);
    }
    setError(undefined);
    setCompleted(false);
    setFile(undefined);
    setFileStatus(undefined);
    setLoading(false);
    setWarning(false);
  };

  const handleFinishImport = () => {
    handleCancel();
    if (setCheckDataModalOpen) {
      setCheckDataModalOpen(true);
    }
    if (reloadData) {
      reloadData();
    }
  };

  useEffect(() => {
    const getErrors = () => {
      return (
        <Box key='import-error-1' sx={warningContentStyles}>
          {strings.DATA_IMPORT_FAILED}
          <ul>
            {fileStatus?.details.errors?.map((err, index) => (
              <li key={`import-error-item-${index}`}>
                {strings.formatString(
                  strings.DATA_IMPORT_ROW_MESSAGE,
                  `${err.position}`,
                  err.message || strings.GENERIC_ERROR
                )}
              </li>
            ))}
          </ul>
        </Box>
      );
    };

    const clearUploadInterval = () => {
      if (uploadInterval) {
        clearInterval(uploadInterval);
        setUploadInterval(undefined);
      }
    };

    if (fileStatus?.details.finished) {
      setLoading(false);
      clearUploadInterval();
      if (fileStatus.details.status === 'Invalid') {
        setError(getErrors());
      } else if (fileStatus.details.status === 'Completed') {
        setCompleted(true);
      }
    } else if (fileStatus?.details.status === 'Awaiting User Action') {
      setLoading(false);
      clearUploadInterval();
      setWarning(true);
    }
  }, [fileStatus, uploadInterval]);

  const dropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
  };

  const enableDropping = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const getFileStatus = async (id: number) => {
    if (statusApi) {
      const status: any = await statusApi(id);
      if (status?.requestSucceeded === true) {
        setFileStatus(status.uploadStatus as GetUploadStatusResponsePayload);
      }
    }
  };

  const importDataHandler = async () => {
    if (isImportValid && !isImportValid()) {
      return;
    }
    if (file) {
      if (simpleUploadApi) {
        setLoading(true);
        const response = await simpleUploadApi(file);
        if (response) {
          if (response.status === 'error') {
            setLoading(false);
            snackbar.toastError(
              response.problems?.length > 0
                ? [
                    <ul key='errors'>
                      {response.problems.map((problem, index) => (
                        <li key={`import-error-item-${index}`}>
                          {strings.formatString(
                            strings.DATA_IMPORT_ROW_MESSAGE,
                            `${problem.row}`,
                            problem.problem || strings.GENERIC_ERROR
                          )}
                        </li>
                      ))}
                    </ul>,
                  ]
                : [<Typography key='error-message'>{response.message}</Typography>],
              strings.UPLOAD_FAILED
            );
            onClose(false);
          } else {
            setLoading(false);
            setCompleted(true);
          }
        }
      } else {
        setUploadId(undefined);
        setFileStatus(undefined);
        let response: UploadFileResponse = {
          id: 0,
          requestSucceeded: false,
        };
        if (facility) {
          if (uploadApi) {
            response = await uploadApi(file, facility.id.toString());
          }
        } else if (selectedOrganization) {
          if (uploadApi) {
            response = await uploadApi(file, selectedOrganization.id.toString());
          }
        }
        if (response) {
          if (response.requestSucceeded === false) {
            setError(<>{strings.DATA_IMPORT_FAILED}</>);
          } else {
            if (response.id) {
              setUploadId(response.id);
              setLoading(true);
              setUploadInterval(setInterval(() => void getFileStatus(response.id), 2000));
            }
          }
        }
      }
    }
  };

  const onChooseFileHandler = () => {
    inputRef.current?.click();
    divRef.current?.focus();
  };

  const onFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      setFile(event.currentTarget.files[0]);
    }
  };

  const resolveSpeciesUploadHandler = async (overwriteValues: boolean) => {
    if (uploadId) {
      const serverResponse = await resolveApi(uploadId, overwriteValues);
      if (serverResponse.requestSucceeded) {
        setFileStatus(undefined);
        setWarning(false);
        setLoading(true);
        setUploadInterval(setInterval(() => void getFileStatus(uploadId), 2000));
      }
    }
  };

  const tryAgainHandler = () => {
    setError(undefined);
    setCompleted(false);
    setFile(undefined);
    setFileStatus(undefined);
    setLoading(false);
    setWarning(false);
  };

  const getMiddleButtons = () => {
    if (file && !completed && !warning && !loading) {
      if (error) {
        return [
          <Button
            onClick={handleCancel}
            id='cancel'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            key='mb-1'
            style={spacingStyles}
          />,
          <Button onClick={tryAgainHandler} label={strings.TRY_AGAIN} key='mb-2' />,
        ];
      } else {
        return [
          <Button
            onClick={handleCancel}
            id='cancel'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            key='mb-1'
            style={spacingStyles}
          />,
          <Button onClick={() => void importDataHandler()} label={strings.IMPORT} key='mb-2' />,
        ];
      }
    }
    if (completed) {
      return [<Button onClick={handleFinishImport} label={strings.NICE} key='mb-1' />];
    }
  };

  const getSize = () => {
    if (loading || warning || error) {
      return 'medium';
    }
    if (completed) {
      return 'small';
    }
    return 'large';
  };

  return (
    <DialogBox
      scrolled={true}
      onClose={handleCancel}
      open={open}
      title={title}
      size={getSize()}
      middleButtons={getMiddleButtons()}
      leftButton={
        warning ? (
          <Button onClick={handleCancel} label={strings.CANCEL} priority='secondary' type='passive' size='medium' />
        ) : undefined
      }
      rightButtons={
        warning
          ? [
              <Button
                onClick={() => void resolveSpeciesUploadHandler(true)}
                label={strings.REPLACE}
                priority='secondary'
                type='passive'
                key='button-1'
              />,
              <Button
                onClick={() => void resolveSpeciesUploadHandler(false)}
                label={strings.KEEP_ORIGINAL}
                priority='secondary'
                type='passive'
                key='button-2'
              />,
            ]
          : undefined
      }
    >
      {!!children && !error && !loading && !completed && !warning && (
        <Box sx={{ paddingBottom: 3, color: theme.palette.TwClrTxt, textAlign: 'left' }}> {children} </Box>
      )}
      <div ref={divRef} tabIndex={0}>
        {error && !loading && <p>{error}</p>}
        {!error && !loading && !completed && !warning && (
          <Box
            onDrop={dropHandler}
            onDragOver={enableDropping}
            sx={{
              background: theme.palette.TwClrBg,
              border: `1px dashed ${theme.palette.TwClrBrdrTertiary}`,
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px',
            }}
          >
            <Icon
              name='blobbyGrayIconUploadToTheCloud'
              size='xlarge'
              style={{
                height: '120px',
                width: '120px',
              }}
            />
            <p
              style={{
                color: theme.palette.TwClrTxt,
                fontSize: '14px',
                fontWeight: 600,
                margin: '0 0 8px 0',
              }}
            >
              {file ? file.name : uploaderTitle}
            </p>
            <p
              style={{
                color: theme.palette.TwClrTxt,
                fontSize: '12px',
                fontWeight: 400,
                margin: 0,
              }}
            >
              {file ? strings.FILE_SELECTED : uploaderDescription}
            </p>
            {templateApi && !file && (
              <Link
                fontSize='12px'
                onClick={() => {
                  void downloadCsvTemplateHandler(templateApi);
                }}
              >
                {strings.DOWNLOAD_CSV_TEMPLATE}
              </Link>
            )}
            <input type='file' ref={inputRef} onChange={onFileChosen} style={{ display: 'none' }} />
            <Button
              onClick={onChooseFileHandler}
              label={file ? strings.REPLACE_FILE : strings.CHOOSE_FILE}
              priority='secondary'
              style={{ marginTop: '24px' }}
              type='passive'
            />
          </Box>
        )}
        {completed && (
          <Box sx={containerStyles}>
            <p style={loadingTextStyles}>{importCompleteLabel}</p>
            <Icon
              name='blobbyIconLeaf'
              style={{
                height: '120px',
                width: '120px',
              }}
            />
          </Box>
        )}
        {loading && (
          <Box sx={containerStyles}>
            <p style={loadingTextStyles}>{importingLabel}</p>
            <Box sx={{ margin: '40px auto' }}>
              <ProgressCircle determinate={false} />
            </Box>
          </Box>
        )}
        {warning && fileStatus?.details.warnings?.length && (
          <Box sx={warningContentStyles}>
            <p>{strings.formatString(duplicatedLabel, fileStatus?.details.warnings?.length)}</p>
            <ul>
              {fileStatus?.details.warnings?.map((wr, index) => <li key={`duplicate-sp-${index}`}>{wr.value}</li>)}
            </ul>
          </Box>
        )}
      </div>
    </DialogBox>
  );
}
