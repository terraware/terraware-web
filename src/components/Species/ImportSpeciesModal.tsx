import { Box, Link, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useRef, useState } from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Button from '../common/button/Button';
import DialogCloseButton from '../common/DialogCloseButton';
import Icon from '../common/icon/Icon';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(1),
    },
    paper: {
      minWidth: '500px',
    },
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
  })
);

export type ImportSpeciesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  organization: ServerOrganization;
  onError?: (snackbarMessage: string) => void;
};

export default function ImportSpeciesModal(props: ImportSpeciesModalProps): JSX.Element {
  const classes = useStyles();
  const { open, onClose } = props;
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCancel = () => {
    onClose(false);
    setFile(undefined);
  };

  const dropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
  };

  const enableDropping = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const importDataHanlder = () => {};

  const onChooseFileHandler = () => {
    inputRef.current?.click();
  };

  const onFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.currentTarget.files);
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      setFile(event.currentTarget.files[0]);
    }
  };

  const downloadCsvTemplate = () => {};

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='md' classes={{ paper: classes.paper }}>
      <DialogTitle>
        <Typography variant='h6'>{strings.IMPORT_SPECIES}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
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
      </DialogContent>
      <DialogActions>
        {file && (
          <Box width={'100%'} className={classes.actions}>
            <Box>
              <Button
                onClick={handleCancel}
                id='cancel'
                label={strings.CANCEL}
                priority='secondary'
                type='passive'
                className={classes.spacing}
              />
              <Button onClick={importDataHanlder} label={strings.IMPORT_DATA} />
            </Box>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}
