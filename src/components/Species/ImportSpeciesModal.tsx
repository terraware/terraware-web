import { Link } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useRef, useState } from 'react';
import {
  downloadSpeciesTemplate,
  GetSpeciesUploadStatusResponsePayload,
  getUploadStatus,
  resolveSpeciesUpload,
  uploadSpeciesFile,
} from 'src/api/species/species';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import Icon from '../common/icon/Icon';
import ProgressCircle from '../common/ProgressCircle/ProgressCircle';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  })
);

export const downloadCsvTemplate = async () => {
  const apiResponse = await downloadSpeciesTemplate();
  const csvContent = 'data:text/csv;charset=utf-8,' + apiResponse;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `template.csv`);
  link.click();
};

export type ImportSpeciesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  organization: ServerOrganization;
  onError?: (snackbarMessage: string) => void;
  setCheckDataModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ImportSpeciesModal(props: ImportSpeciesModalProps): JSX.Element {
  const classes = useStyles();
  const { open, onClose, organization, setCheckDataModalOpen } = props;
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [fileStatus, setFileStatus] = useState<GetSpeciesUploadStatusResponsePayload>();
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
    setFileStatus(await getUploadStatus(id));
  };

  const importDataHandler = async () => {
    if (file) {
      setUploadId(undefined);
      setFileStatus(undefined);
      const response = await uploadSpeciesFile(file, organization.id);
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

  const resolveSpeciesUploadHandler = async (overwriteValues: boolean) => {
    if (uploadId) {
      const serverResponse = await resolveSpeciesUpload(uploadId, overwriteValues);
      if (serverResponse.requestSucceeded) {
        setFileStatus(undefined);
        setWarning(false);
        setLoading(true);
        setUploadInterval(setInterval(() => getFileStatus(uploadId), 2000));
      }
    }
  };

  const getMiddleButtons = () => {
    if (file && !completed && !warning && !loading) {
      return [
        <Button
          onClick={handleCancel}
          id='cancel'
          label={error ? strings.CANCEL_IMPORT : strings.CANCEL}
          priority='secondary'
          type='passive'
          className={classes.spacing}
          key='mb-1'
        />,
        <Button onClick={importDataHandler} label={error ? strings.TRY_AGAIN : strings.IMPORT_DATA} key='mb-2' />,
      ];
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
      title={strings.IMPORT_SPECIES}
      size={getSize()}
      middleButtons={getMiddleButtons()}
      leftButton={
        warning ? (
          <Button onClick={handleCancel} label={strings.CANCEL_IMPORT} priority='secondary' type='passive' />
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
      <div ref={divRef} tabIndex={0}>
        {error && !loading && <p>{error}</p>}
        {!error && !loading && !completed && !warning && (
          <div onDrop={dropHandler} onDragOver={enableDropping} className={classes.dropContainer}>
            <Icon name='blobbyGrayIconUploadToTheCloud' className={classes.icon} size='xlarge' />
            <p className={classes.title}>{file ? file.name : strings.IMPORT_SPECIES_LIST}</p>
            <p className={classes.description}>{file ? strings.FILE_SELECTED : strings.IMPORT_SPECIES_LIST_DESC}</p>
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
            <p className={classes.loadingText}>{strings.SPECIES_IMPORT_COMPLETE}</p>
            <Icon name='blobbyIconLeaf' className={classes.icon} />
          </div>
        )}
        {loading && (
          <div className={classes.container}>
            <p className={classes.loadingText}>{strings.IMPORTING_SPECIES}</p>
            <div className={classes.spinnerContainer}>
              <ProgressCircle determinate={false} />
            </div>
          </div>
        )}
        {warning && fileStatus?.details.warnings?.length && (
          <div className={classes.warningContent}>
            <p>{strings.formatString(strings.DUPLICATED_SPECIES, fileStatus?.details.warnings?.length)}</p>
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
