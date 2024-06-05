import React, { useEffect, useRef, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, ErrorBox, Icon, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import strings from 'src/strings';

export type PhotoChooserErrorType = {
  title: string;
  text: string;
};

export type PhotoChooserProps = {
  title?: string;
  description?: string | string[];
  onPhotosChanged: (photos: PhotoWithAttributes[]) => void;
  multipleSelection?: boolean;
  error?: PhotoChooserErrorType;
  selectedFile?: any;
  uploadText?: string;
  uploadDescription?: string;
  uploadMobileDescription?: string;
  photoSelectedText?: string;
  chooseFileText?: string;
  replaceFileText?: string;
  maxPhotos?: number;
};

export type PhotoWithAttributes = {
  file: File;
  caption: string;
  citation: string;
};

export type PhotoWithAttributesAndUrl = PhotoWithAttributes & {
  url: string;
};

export default function PhotoChooser(props: PhotoChooserProps): JSX.Element {
  const {
    title,
    description,
    onPhotosChanged,
    multipleSelection,
    error,
    selectedFile,
    uploadText = strings.UPLOAD_PHOTOS,
    uploadMobileDescription = strings.UPLOAD_PHOTO_DESCRIPTION,
    uploadDescription,
    photoSelectedText,
    chooseFileText = strings.CHOOSE_FILE,
    replaceFileText = strings.REPLACE_FILE,
    maxPhotos,
  } = props;
  const { isMobile } = useDeviceInfo();
  const [files, setFiles] = useState<File[]>([]);
  const [filesData, setFilesData] = useState<PhotoWithAttributesAndUrl[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [editing, setEditing] = useState<boolean>(false);

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
      updateSelection([...files, ...newFiles].slice(0, maxPhotos));
    }
  };

  const removeFileAtIndex = (index: number) => {
    const filesList = [...files];
    filesList.splice(index, 1);
    updateSelection(filesList);
  };

  const updateSelection = (selected: File[]) => {
    setFiles(selected);
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
    divRef.current?.focus();
  };

  const onFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editing) {
      setEditing(false);
    }
    if (event.currentTarget.files) {
      addFiles(event.currentTarget.files);
    }
  };

  useEffect(() => {
    const filesDataList = files.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        file,
        url,
        caption: '',
        citation: '',
      };
    });

    if (multipleSelection) {
      setFilesData(filesDataList);
    } else {
      const lastUploadedIndex = files.length - 1;
      const lastImage = filesDataList[lastUploadedIndex];

      if (lastImage) {
        setFilesData([lastImage]);
      }
    }

    return () => {
      // we need to clean this up to avoid a memory leak
      filesDataList.forEach((fileData) => URL.revokeObjectURL(fileData.url));
    };
  }, [files, multipleSelection]);

  useEffect(() => {
    onPhotosChanged(filesData);
  }, [filesData, onPhotosChanged]);

  const updateFileData = (index: number, idToUpdate: string, newValue: string) => {
    const newFile = { ...filesData[index], [idToUpdate]: newValue };
    const newFilesData = [...filesData];
    newFilesData[index] = newFile;
    setFilesData(newFilesData);
  };

  return (
    <Box
      ref={divRef}
      tabIndex={0}
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderRadius: theme.spacing(4),
        padding: theme.spacing(3),
      }}
    >
      <Box>
        {title && (
          <Typography fontSize={20} fontWeight={600}>
            {title}
          </Typography>
        )}
        {description && (
          <Typography fontSize={14} fontWeight={400} marginTop={theme.spacing(1)} marginBottom={theme.spacing(2)}>
            {Array.isArray(description) ? description.map((txt, i) => <div key={i}>{txt}</div>) : description}
          </Typography>
        )}
        {error && (
          <ErrorBox
            title={error.title}
            text={error.text}
            sx={{
              width: 'auto',
              marginBottom: theme.spacing(2),
              '&.mobile': {
                width: 'auto',
              },
            }}
          />
        )}
        {filesData.length > 0 && (
          <Box display='flex' flexDirection='row' flexWrap='wrap' marginBottom={theme.spacing(2)}>
            {filesData.map((fileData, index) => (
              <Box display='flex' width='100%' key={`photo-${index}`}>
                <Box
                  key={index}
                  position='relative'
                  height={122}
                  width={122}
                  marginRight={isMobile ? theme.spacing(2) : theme.spacing(3)}
                  marginTop={theme.spacing(1)}
                  border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
                >
                  <Button
                    icon='iconTrashCan'
                    onClick={() => removeFileAtIndex(index)}
                    size='small'
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: theme.palette.TwClrBgDanger,
                    }}
                  />
                  <img
                    height='120px'
                    src={fileData.url}
                    alt={files[index]?.name}
                    style={{
                      margin: 'auto auto',
                      objectFit: 'contain',
                      display: 'flex',
                      maxWidth: '120px',
                      maxHeight: '120px',
                    }}
                  />
                </Box>

                <Box width='100%'>
                  <Grid>
                    <Textfield
                      type='text'
                      label={strings.CAPTION}
                      id='citation'
                      value={fileData.caption}
                      onChange={(newValue) => updateFileData(index, 'caption', newValue as string)}
                    />
                  </Grid>
                  <Grid paddingTop={theme.spacing(2)}>
                    <Textfield
                      type='text'
                      label={strings.CITATION}
                      id='citation'
                      value={fileData.citation}
                      onChange={(newValue) => updateFileData(index, 'citation', newValue as string)}
                    />
                  </Grid>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
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
        <Typography color={theme.palette.TwClrTxt} fontSize={12} fontWeight={400} margin={0}>
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
          onClick={onChooseFileHandler}
          disabled={maxPhotos !== undefined ? files.length >= maxPhotos : false}
          label={!multipleSelection && (files.length === 1 || editing) ? replaceFileText : chooseFileText}
          priority='secondary'
          type='passive'
          style={{ marginTop: theme.spacing(3) }}
        />
      </Box>
    </Box>
  );
}
