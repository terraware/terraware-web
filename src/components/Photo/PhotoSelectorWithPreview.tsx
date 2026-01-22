import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, TooltipProps, Typography, useTheme } from '@mui/material';
import { ErrorBox, PlacementWrapper } from '@terraware/web-components';

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
  previewPlacement?: TooltipProps['placement'];
  previewWidth?: number;
  previewAspectRatio?: number;
};

export type FileWithUrl = {
  file: File;
  url: string;
};

export default function PhotoSelectorWithPreview({
  title,
  description,
  onPhotoChanged,
  error,
  previewUrl,
  previewPlacement = 'top-start',
  previewWidth,
  previewAspectRatio,
  ...dragDropProps
}: PhotoSelectorWithPreviewProps): JSX.Element {
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

  const handleSetFiles = useCallback(
    (files: File[]) => {
      if (fileData) {
        URL.revokeObjectURL(fileData.url);
      }
      if (files.length > 0) {
        const file = files[files.length - 1];
        const fileUrl = URL.createObjectURL(file);
        setFileData({ file, url: fileUrl });
      } else {
        setFileData(undefined);
      }
    },
    [fileData]
  );

  const preview = useMemo(() => {
    const args = {
      imageWidth: previewWidth,
      aspectRatio: previewAspectRatio,
      onTrashClick: () => handleSetFiles([]),
    };
    return fileData ? (
      <PhotoPreview imgUrl={fileData.url} imgAlt={fileData.file.name} includeTrashIcon={true} {...args} />
    ) : (
      previewUrl && <PhotoPreview imgUrl={previewUrl} imgAlt={''} includeTrashIcon={false} {...args} />
    );
  }, [fileData, previewUrl, handleSetFiles, previewAspectRatio, previewWidth]);

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

        <PlacementWrapper placedObject={preview} objectPlacement={previewPlacement || 'top-start'}>
          <Box width={'100%'}>
            <PhotoDragDrop
              {...dragDropProps}
              multipleSelection={false}
              files={fileData ? [fileData.file] : []}
              setFiles={handleSetFiles}
            />
          </Box>
        </PlacementWrapper>
      </Box>
    </Box>
  );
}
