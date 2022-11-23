import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ErrorBox } from '@terraware/web-components';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';

export type ErrorType = {
  title: string;
  text: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  removePhoto: {
    position: 'absolute',
    width: theme.spacing(3),
    height: theme.spacing(3),
    top: -6,
    right: -6,
    backgroundColor: theme.palette.TwClrBgDanger,
    '& > svg': {
      position: 'relative',
      top: '-4px',
      right: '4px',
    },
  },
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
  error: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
}));

type SelectPhotosProps = {
  title: string;
  description: string;
  onPhotosChanged: (photos: File[]) => void;
  multipleSelection?: boolean;
  error?: ErrorType;
};

export default function SelectPhotos(props: SelectPhotosProps): JSX.Element {
  const { title, description, onPhotosChanged, multipleSelection, error } = props;
  const classes = useStyles();
  const [files, setFiles] = useState<File[]>([]);
  const [filesData, setFilesData] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const addFiles = (fileList: FileList) => {
    const newFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const fileItem = fileList.item(i);
      if (fileItem) {
        newFiles.push(fileItem);
      }
    }

    if (newFiles.length) {
      updateSelection([...files, ...newFiles]);
    }
  };

  const removeFileAtIndex = (index: number) => {
    const filesList = [...files];
    filesList.splice(index, 1);
    updateSelection(filesList);
  };

  const updateSelection = (selected: File[]) => {
    setFiles(selected);
    onPhotosChanged(selected);
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
    if (event.currentTarget.files) {
      addFiles(event.currentTarget.files);
    }
  };

  useEffect(() => {
    const filesDataList = files.map((file) => URL.createObjectURL(file));

    setFilesData(filesDataList);

    return () => {
      // we need to clean this up to avoid a memory leak
      filesDataList.forEach((fileData) => URL.revokeObjectURL(fileData));
    };
  }, [files]);

  return (
    <Box ref={divRef} tabIndex={0} width='100%'>
      <Box>
        <Typography fontSize={20} fontWeight={600}>
          {title}
        </Typography>
        <Typography fontSize={14} fontWeight={400} marginTop={theme.spacing(1)} marginBottom={theme.spacing(2)}>
          {description}
        </Typography>
        {error && <ErrorBox title={error.title} text={error.text} className={classes.error} />}
        {filesData.length > 0 && (
          <Box display='flex' flexDirection='row' flexWrap='wrap' marginBottom={theme.spacing(2)}>
            {filesData.map((fileData, index) => (
              <Box
                key={index}
                position='relative'
                height={122}
                marginRight={theme.spacing(3)}
                marginTop={theme.spacing(1)}
                border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
              >
                <Button
                  icon='iconTrashCan'
                  onClick={() => removeFileAtIndex(index)}
                  size='small'
                  className={classes.removePhoto}
                />
                <img height='120px' src={fileData} alt={files[index]?.name} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Box
        onDrop={dropHandler}
        onDragOver={enableDropping}
        border={`1px dashed ${theme.palette.TwClrBrdrTertiary}`}
        borderRadius={theme.spacing(1)}
        display='flex'
        flexDirection='column'
        alignItems='center'
        padding={theme.spacing(3)}
        sx={{ background: theme.palette.TwClrBg }}
      >
        <Icon name='blobbyGrayIconImage' className={classes.icon} size='xlarge' />
        <Typography color={theme.palette.TwClrTxt} fontSize={14} fontWeight={600} margin={theme.spacing(0, 0, 1)}>
          {strings.UPLOAD_PHOTOS}
        </Typography>
        <Typography color={theme.palette.TwClrTxt} fontSize={12} fontWeight={400} margin={0}>
          {strings.UPLOAD_PHOTO_DESCRIPTION}
        </Typography>
        <input
          type='file'
          ref={inputRef}
          className={classes.hiddenInput}
          onChange={onFileChosen}
          accept='image/jpeg,image/png'
          multiple={multipleSelection || false}
        />
        <Button
          onClick={onChooseFileHandler}
          label={strings.UPLOAD_PHOTO}
          priority='secondary'
          type='passive'
          className={classes.button}
        />
      </Box>
    </Box>
  );
}
