import React, { useEffect, useRef, useState } from 'react';

import { Box, Link, Typography, useTheme } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import Button from './common/button/Button';

const useStyles = makeStyles((theme: Theme) => ({
  hiddenInput: {
    display: 'none',
  },
  icon: {
    height: '120px',
    width: '120px',
  },
  button: {
    marginTop: theme.spacing(3),
  },
  link: {
    color: theme.palette.TwClrTxtBrand,
    fontFamily: 'Inter',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '16px',
    marginTop: theme.spacing(2),
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export type FileTemplate = {
  text: string;
  url: string;
};

export type FileChooserProps = {
  acceptFileType: string;
  chooseFileText?: string;
  files?: File[];
  fileSelectedText?: string;
  maxFiles?: number;
  multipleSelection?: boolean;
  onChoosingFiles?: () => void;
  replaceFileText?: string;
  selectedFile?: any;
  setFiles: (files: File[]) => void;
  template?: FileTemplate;
  uploadDescription?: string;
  uploadMobileDescription?: string;
  uploadText?: string;
};

export default function FileChooser(props: FileChooserProps): JSX.Element {
  const {
    acceptFileType,
    chooseFileText,
    files,
    fileSelectedText,
    maxFiles,
    multipleSelection,
    onChoosingFiles,
    replaceFileText,
    selectedFile,
    setFiles,
    template,
    uploadDescription,
    uploadMobileDescription,
    uploadText,
  } = props;
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const [editing, setEditing] = useState<boolean>(false);
  const [localFiles, setLocalFiles] = useState('');

  useEffect(() => {
    setEditing(!!selectedFile);
  }, [selectedFile]);

  const addFiles = (fileList: FileList) => {
    const newFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const fileItem = fileList.item(i);
      if (fileItem) {
        newFiles.push(fileItem);
      }
    }

    if (newFiles.length) {
      setFiles([...(files ?? []), ...newFiles].slice(0, maxFiles));
    }
  };

  const dropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const enableDropping = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onChooseFileHandler = () => {
    inputRef.current?.click();
    onChoosingFiles?.();
  };

  const onFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editing) {
      setEditing(false);
    }
    console.log(event.currentTarget.files);
    if (event.currentTarget.files) {
      addFiles(event.currentTarget.files);
    }
  };

  return (
    <Box
      onDrop={dropHandler}
      onDragOver={enableDropping}
      border={`1px dashed ${theme.palette.TwClrBrdrTertiary}`}
      borderRadius={theme.spacing(2)}
      display='flex'
      flexDirection='column'
      alignItems='center'
      padding={theme.spacing(3)}
      sx={{ background: theme.palette.TwClrBg }}
    >
      <Typography color={theme.palette.TwClrTxt} fontSize={14} fontWeight={600} margin={theme.spacing(0, 0, 1)}>
        {!editing && ((files || []).length > 0 && !multipleSelection ? files?.[0].name : uploadText)}
      </Typography>
      <Typography color={theme.palette.TwClrTxt} fontSize={12} fontWeight={400} margin={0}>
        {(editing || (files || []).length > 0) && !multipleSelection
          ? fileSelectedText
          : isMobile && uploadMobileDescription
          ? uploadMobileDescription
          : uploadDescription}
      </Typography>
      <input
        type='file'
        ref={inputRef}
        className={classes.hiddenInput}
        onChange={onFileChosen}
        accept={acceptFileType}
        multiple={multipleSelection || false}
        value={localFiles}
      />
      <Button
        onClick={onChooseFileHandler}
        disabled={maxFiles !== undefined ? (files || []).length >= maxFiles : false}
        label={!multipleSelection && ((files || []).length === 1 || editing) ? replaceFileText : chooseFileText}
        priority='secondary'
        type='passive'
        className={classes.button}
      />
      {template && (
        <Link href={template.url} target='_blank' className={classes.link}>
          {template.text}
        </Link>
      )}
    </Box>
  );
}
