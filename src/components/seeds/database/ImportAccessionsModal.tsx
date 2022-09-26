import { Link } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DialogBox, Icon, ProgressCircle } from '@terraware/web-components';
import React, { useEffect, useRef, useState } from 'react';
import {
  downloadAccessionsTemplate,
  getAccessionsUploadStatus,
  GetAccessionsUploadStatusResponsePayload,
  resolveAccessionsUpload,
  uploadAccessionsFile,
} from 'src/api/accessions2/accession';
import { Facility } from 'src/api/types/facilities';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginRight: theme.spacing(2),
  },
  dropContainer: {
    background: '#F9FAFA',
    border: '1px dashed #A9B7B8',
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
    color: '#3A4445',
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 8px 0',
  },
  description: {
    color: '#3A4445',
    fontSize: '12px',
    fontWeight: 400,
    margin: 0,
  },
  link: {
    color: '#0067C8',
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
    color: '#3A4445',
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

export const downloadCsvTemplate = async () => {
  const apiResponse = await downloadAccessionsTemplate();
  const csvContent = 'data:text/csv;charset=utf-8,' + apiResponse;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `template.csv`);
  link.click();
};

export type ImportAccessionsModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  facility: Facility;
};

export default function ImportAccessionsModal(props: ImportAccessionsModalProps): JSX.Element {
  const classes = useStyles();
  const { open, onClose, facility } = props;
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [fileStatus, setFileStatus] = useState<GetAccessionsUploadStatusResponsePayload>();
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
    setFileStatus(await getAccessionsUploadStatus(id));
  };

  const importDataHandler = async () => {
    if (file) {
      setUploadId(undefined);
      setFileStatus(undefined);
      const response = await uploadAccessionsFile(file, facility.id.toString());
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

  const resolveAccessionsUploadHandler = async (overwriteValues: boolean) => {
    if (uploadId) {
      const serverResponse = await resolveAccessionsUpload(uploadId, overwriteValues);
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
            label={strings.CANCEL_IMPORT}
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
          <Button onClick={importDataHandler} label={strings.IMPORT_DATA} key='mb-2' />,
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
      title={strings.IMPORT_ACCESSIONS}
      size={getSize()}
      middleButtons={getMiddleButtons()}
      leftButton={
        warning ? (
          <Button
            onClick={handleCancel}
            label={strings.CANCEL_IMPORT}
            priority='secondary'
            type='passive'
            size='medium'
          />
        ) : undefined
      }
      rightButtons={
        warning
          ? [
              <Button
                onClick={() => resolveAccessionsUploadHandler(true)}
                label={strings.REPLACE}
                priority='secondary'
                type='passive'
                key='button-1'
              />,
              <Button
                onClick={() => resolveAccessionsUploadHandler(false)}
                label={strings.KEEP_ORIGINAL}
                priority='secondary'
                type='passive'
                key='button-2'
              />,
            ]
          : undefined
      }
    >
      <div ref={divRef} tabIndex={0}>
        {error && !loading && <p>{error}</p>}
        {!error && !loading && !completed && !warning && (
          <div onDrop={dropHandler} onDragOver={enableDropping} className={classes.dropContainer}>
            <Icon name='blobbyGrayIconUploadToTheCloud' className={classes.icon} size='xlarge' />
            <p className={classes.title}>{file ? file.name : strings.IMPORT_ACCESSIONS}</p>
            <p className={classes.description}>{file ? strings.FILE_SELECTED : strings.IMPORT_ACCESSIONS_DESC}</p>
            {!file && (
              <Link
                href='#'
                onClick={() => {
                  downloadCsvTemplate();
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
            <p className={classes.loadingText}>{strings.ACCESSIONS_IMPORT_COMPLETE}</p>
            <Icon name='blobbyIconLeaf' className={classes.icon} />
          </div>
        )}
        {loading && (
          <div className={classes.container}>
            <p className={classes.loadingText}>{strings.IMPORTING_ACCESSIONS}</p>
            <div className={classes.spinnerContainer}>
              <ProgressCircle determinate={false} />
            </div>
          </div>
        )}
        {warning && fileStatus?.details.warnings?.length && (
          <div className={classes.warningContent}>
            <p>{strings.formatString(strings.DUPLICATED_ACCESSION_NUMBER, fileStatus?.details.warnings?.length)}</p>
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
