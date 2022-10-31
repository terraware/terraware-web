import { Box, Link } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useRef, useState } from 'react';
import { Facility } from 'src/api/types/facilities';
import { GetUploadStatusResponsePayload, ResolveResponse, UploadFileResponse } from 'src/api/types/uploadFile';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Button from './button/Button';
import DialogBox from './DialogBox/DialogBox';
import Icon from './icon/Icon';
import ProgressCircle from './ProgressCircle/ProgressCircle';

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginRight: theme.spacing(2),
  },
  dropContainer: {
    background: theme.palette.TwClrBg,
    border: `1px dashed ${theme.palette.TwClrBrdrTertiary}`,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
  },
  hiddenInput: {
    display: 'none',
  },
  title: {
    color: theme.palette.TwClrTxt,
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 8px 0',
  },
  description: {
    color: theme.palette.TwClrTxt,
    fontSize: '12px',
    fontWeight: 400,
    margin: 0,
  },
  link: {
    color: theme.palette.TwClrTxtBrand,
    fontSize: '12px',
    fontWeight: 400,
    margin: 0,
  },
  icon: {
    height: '120px',
    width: '120px',
  },
  importButton: {
    marginTop: '24px',
  },
  loadingText: {
    fontSie: '16px',
    margin: 0,
    color: theme.palette.TwClrTxt,
  },
  spinnerContainer: {
    margin: '40px auto',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  warningContent: {
    textAlign: 'left',
  },
}));

export type ImportSpeciesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  organization?: ServerOrganization;
  facility?: Facility;
  setCheckDataModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  resolveApi: (uploadId: number, overwriteExisting: boolean) => Promise<ResolveResponse>;
  uploaderTitle: string;
  uploaderDescription: string;
  uploadApi: (file: File, orgOrFacilityId: string) => Promise<UploadFileResponse>;
  templateApi: () => Promise<any>;
  statusApi: (uploadId: number) => Promise<GetUploadStatusResponsePayload>;
  importCompleteLabel: string;
  importingLabel: string;
  duplicatedLabel: string;
  children?: React.ReactNode;
  reloadData?: () => void;
};

export const downloadCsvTemplateHandler = async (templateApi: () => Promise<any>) => {
  const apiResponse = await templateApi();
  const csvContent = 'data:text/csv;charset=utf-8,' + apiResponse;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `template.csv`);
  link.click();
};

export default function ImportSpeciesModal(props: ImportSpeciesModalProps): JSX.Element {
  const classes = useStyles();
  const {
    open,
    onClose,
    organization,
    facility,
    setCheckDataModalOpen,
    title,
    resolveApi,
    uploaderTitle,
    uploaderDescription,
    uploadApi,
    templateApi,
    statusApi,
    importCompleteLabel,
    importingLabel,
    duplicatedLabel,
    children,
    reloadData,
  } = props;
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [fileStatus, setFileStatus] = useState<GetUploadStatusResponsePayload>();
  const [uploadInterval, setUploadInterval] = useState<NodeJS.Timer>();
  const [completed, setCompleted] = useState(false);
  const [warning, setWarning] = useState(false);
  const [uploadId, setUploadId] = useState<number>();

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
      let errors = strings.DATA_IMPORT_FAILED;
      if (fileStatus?.details.errors && fileStatus?.details.errors[0]) {
        errors += ': ' + fileStatus?.details.errors[0].message;
      }
      return errors;
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
    setFileStatus(await statusApi(id));
  };

  const importDataHandler = async () => {
    if (file) {
      setUploadId(undefined);
      setFileStatus(undefined);
      let response: UploadFileResponse = {
        id: 0,
        requestSucceeded: false,
      };
      if (organization) {
        response = await uploadApi(file, organization.id.toString());
      }
      if (facility) {
        response = await uploadApi(file, facility.id.toString());
      }
      if (response) {
        if (response.requestSucceeded === false) {
          setError(strings.DATA_IMPORT_FAILED);
        } else {
          if (response.id) {
            setUploadId(response.id);
            setLoading(true);
            setUploadInterval(setInterval(() => getFileStatus(response.id), 2000));
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
        setUploadInterval(setInterval(() => getFileStatus(uploadId), 2000));
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
            className={classes.spacing}
            key='mb-1'
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
            className={classes.spacing}
            key='mb-1'
          />,
          <Button onClick={importDataHandler} icon='iconImport' label={strings.IMPORT_DATA} key='mb-2' />,
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
                onClick={() => resolveSpeciesUploadHandler(true)}
                label={strings.REPLACE}
                priority='secondary'
                type='passive'
                key='button-1'
              />,
              <Button
                onClick={() => resolveSpeciesUploadHandler(false)}
                label={strings.KEEP_ORIGINAL}
                priority='secondary'
                type='passive'
                key='button-2'
              />,
            ]
          : undefined
      }
    >
      {children && <Box sx={{ paddingBottom: 3, color: '#3A4445' }}> {children} </Box>}
      <div ref={divRef} tabIndex={0}>
        {error && !loading && <p>{error}</p>}
        {!error && !loading && !completed && !warning && (
          <div onDrop={dropHandler} onDragOver={enableDropping} className={classes.dropContainer}>
            <Icon name='blobbyGrayIconUploadToTheCloud' className={classes.icon} size='xlarge' />
            <p className={classes.title}>{file ? file.name : uploaderTitle}</p>
            <p className={classes.description}>{file ? strings.FILE_SELECTED : uploaderDescription}</p>
            {!file && (
              <Link
                href='#'
                onClick={() => {
                  downloadCsvTemplateHandler(templateApi);
                }}
              >
                <p className={classes.link}>{strings.DOWNLOAD_CSV_TEMPLATE}</p>
              </Link>
            )}
            <input type='file' ref={inputRef} className={classes.hiddenInput} onChange={onFileChosen} />
            <Button
              onClick={onChooseFileHandler}
              label={file ? strings.REPLACE_FILE : strings.CHOOSE_FILE}
              priority='secondary'
              type='passive'
              className={classes.importButton}
            />
          </div>
        )}
        {completed && (
          <div className={classes.container}>
            <p className={classes.loadingText}>{importCompleteLabel}</p>
            <Icon name='blobbyIconLeaf' className={classes.icon} />
          </div>
        )}
        {loading && (
          <div className={classes.container}>
            <p className={classes.loadingText}>{importingLabel}</p>
            <div className={classes.spinnerContainer}>
              <ProgressCircle determinate={false} />
            </div>
          </div>
        )}
        {warning && fileStatus?.details.warnings?.length && (
          <div className={classes.warningContent}>
            <p>{strings.formatString(duplicatedLabel, fileStatus?.details.warnings?.length)}</p>
            <ul>
              {fileStatus?.details.warnings?.map((wr, index) => (
                <li key={`duplicate-sp-${index}`}>{wr.value}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DialogBox>
  );
}
