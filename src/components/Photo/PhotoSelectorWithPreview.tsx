import React, { useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { ErrorBox } from '@terraware/web-components';

import PhotoDragDrop, { PhotoDragDropProps } from 'src/components/Photo/PhotoDragDrop';

import PhotoPreview from './PhotoPreview';

export type PhotoSelectorWithPreviewErrorType = {
  title: string;
  text: string;
};

export type PhotoSelectorWithPreviewProps = Omit<PhotoDragDropProps, 'files' | 'setFiles' | 'multipleSelection'> & {
  title?: string;
  description?: string | string[];
  onPhotoChanged: (photo?: FileWithUrl) => void;
  error?: PhotoSelectorWithPreviewErrorType;
  previewUrl?: string;
};

export type FileWithUrl = {
  file: File;
  url: string;
};

export default function PhotoSelectorWithPreview(props: PhotoSelectorWithPreviewProps): JSX.Element {
  const { title, description, onPhotoChanged, error, previewUrl, ...dragDropProps } = props;
  const [fileData, setFileData] = useState<FileWithUrl | undefined>();
  const theme = useTheme();

  useEffect(() => {
    onPhotoChanged(fileData);
    return () => {
      if (fileData) {
        URL.revokeObjectURL(fileData.url);
      }
    };
  }, [fileData, onPhotoChanged]);

  const handleSetFiles = (files: File[]) => {
    if (files.length > 0) {
      if (fileData) {
        URL.revokeObjectURL(fileData.url);
      }
      const file = files[0];
      const fileUrl = URL.createObjectURL(file);
      setFileData({ file, url: fileUrl });
    } else {
      setFileData(undefined);
    }
  };

  return (
    <Box
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

        <Box display='flex' flexDirection='row' flexWrap='wrap' marginBottom={theme.spacing(2)}>
          <Box display='flex' width='100%'>
            {fileData ? (
              <PhotoPreview
                imgUrl={fileData.url}
                imgAlt={fileData.file.name}
                includeTrashIcon={true}
                onTrashClick={() => handleSetFiles([])}
              />
            ) : (
              previewUrl && (
                <PhotoPreview
                  imgUrl={previewUrl}
                  imgAlt={''}
                  includeTrashIcon={false}
                  onTrashClick={() => handleSetFiles([])}
                />
              )
            )}
          </Box>
        </Box>
      </Box>

      <PhotoDragDrop {...dragDropProps} files={fileData ? [fileData.file] : []} setFiles={handleSetFiles} />
    </Box>
  );
}
