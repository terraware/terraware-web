import React, { useRef, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import strings from 'src/strings';

export type PhotoDragDropProps = {
  files: File[];
  setFiles: (files: File[]) => void;
  uploadText?: string;
  uploadDescription?: string;
  uploadMobileDescription?: string;
  photoSelectedText?: string;
  chooseFileText?: string;
  replaceFileText?: string;
  maxPhotos?: number;
  multipleSelection?: boolean;
};

const PhotoDragDrop = (props: PhotoDragDropProps) => {
  const {
    multipleSelection,
    uploadText = strings.UPLOAD_PHOTOS,
    uploadMobileDescription = strings.UPLOAD_PHOTO_DESCRIPTION,
    uploadDescription,
    photoSelectedText,
    chooseFileText = strings.CHOOSE_FILE,
    replaceFileText = strings.REPLACE_FILE,
    maxPhotos,
    files,
    setFiles,
  } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<boolean>(false);

  const addFiles = (fileList: FileList) => {
    const newFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const fileItem = fileList.item(i);
      if (fileItem) {
        newFiles.push(fileItem);
      }
    }

    if (newFiles.length) {
      setFiles([...files, ...newFiles].slice(0, maxPhotos));
    }
  };

  const dropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const onFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editing) {
      setEditing(false);
    }
    if (event.currentTarget.files) {
      addFiles(event.currentTarget.files);
    }
  };

  const onChooseFileHandler = () => {
    inputRef.current?.click();
    document.querySelectorAll<HTMLElement>('.photo-button').forEach((el) => el.blur());
  };

  return (
    <Box
      onDrop={dropHandler}
      border={`1px dashed ${theme.palette.TwClrBrdrTertiary}`}
      borderRadius={theme.spacing(2)}
      display='flex'
      flexDirection='column'
      alignItems='center'
      padding={theme.spacing(3)}
      sx={{ background: theme.palette.TwClrBg }}
    >
      <Icon
        name='blobbyGrayIconImage'
        size='xlarge'
        style={{
          height: '120px',
          width: '120px',
        }}
      />
      <Typography color={theme.palette.TwClrTxt} fontSize={14} fontWeight={600} margin={theme.spacing(0, 0, 1)}>
        {!editing && (files.length > 0 && !multipleSelection ? files[0].name : uploadText)}
      </Typography>
      <Typography
        color={theme.palette.TwClrTxt}
        fontSize={12}
        fontWeight={400}
        margin={0}
        textAlign='center'
        maxWidth={500}
      >
        {(editing || files.length > 0) && !multipleSelection
          ? photoSelectedText
          : isMobile && uploadMobileDescription
            ? uploadMobileDescription
            : uploadDescription}
      </Typography>
      <input
        type='file'
        ref={inputRef}
        onChange={onFileChosen}
        accept='image/jpeg,image/png'
        multiple={multipleSelection || false}
        style={{ display: 'none' }}
      />
      <Button
        className={'photo-button'}
        onClick={onChooseFileHandler}
        disabled={maxPhotos !== undefined ? files.length >= maxPhotos : false}
        label={!multipleSelection && (files.length === 1 || editing) ? replaceFileText : chooseFileText}
        priority='secondary'
        type='passive'
        style={{ marginTop: theme.spacing(3) }}
      />
    </Box>
  );
};

export default PhotoDragDrop;
