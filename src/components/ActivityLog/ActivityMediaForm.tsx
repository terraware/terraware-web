import React, { useCallback, useMemo } from 'react';

import { Box, FormControlLabel, Grid, Radio, Typography, useTheme } from '@mui/material';
import { Button, FileChooser, Textfield } from '@terraware/web-components';

import PhotoPreview from 'src/components/Photo/PhotoPreview';
import { useLocalization } from 'src/providers/hooks';

export type ActivityMediaPhoto = {
  caption?: string;
  file: File;
  isCoverPhoto?: boolean;
};

const MAX_FILES = 20;

type ActivityPhotoPreviewProps = {
  isLast?: boolean;
  onCoverPhotoChange: (isCover: boolean) => void;
  onDelete: () => void;
  photo: ActivityMediaPhoto;
  setCaption: (caption: string) => void;
};

const ActivityPhotoPreview = ({
  isLast,
  onCoverPhotoChange,
  onDelete,
  photo,
  setCaption,
}: ActivityPhotoPreviewProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const url = useMemo(() => URL.createObjectURL(photo.file), [photo]);

  const setCaptionCallback = useCallback(
    (value: any) => {
      setCaption(value as string);
    },
    [setCaption]
  );

  const onCoverPhotoToggle = useCallback(() => {
    onCoverPhotoChange(!photo.isCoverPhoto);
  }, [onCoverPhotoChange, photo.isCoverPhoto]);

  return (
    <Box
      borderBottom={isLast ? 'none' : `1px solid ${theme.palette.TwClrBgSecondary}`}
      marginBottom='24px'
      paddingBottom='24px'
      width='100%'
    >
      <Grid container spacing={2} textAlign='left'>
        <Grid item sm='auto' xs={12}>
          <PhotoPreview imgUrl={url} includeTrashIcon={false} onTrashClick={onDelete} />
        </Grid>

        <Grid item sm={true} xs={12}>
          <Box display='flex' flexDirection='column'>
            <Box alignItems='center' display='flex' flexDirection='row'>
              <Typography>TODO: list position</Typography>

              <FormControlLabel
                control={<Radio checked={!!photo.isCoverPhoto} name='coverPhoto' onChange={onCoverPhotoToggle} />}
                label={strings.COVER_PHOTO}
                sx={{ paddingLeft: '8px' }}
              />
            </Box>

            <Typography>TODO: GPS coordinates, hide on map</Typography>

            <Button
              icon='iconTrashCan'
              label={strings.DELETE}
              onClick={onDelete}
              priority='ghost'
              style={{
                justifyContent: 'flex-start',
                marginLeft: '-8px',
                maxWidth: '160px',
                paddingLeft: '8px',
              }}
              type='destructive'
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Textfield
            id={`caption-${photo.file.name}`}
            label={strings.CAPTION}
            onChange={setCaptionCallback}
            type='text'
            value={photo.caption || ''}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export interface ActivityMediaFormProps {
  maxFiles?: number;
  mediaFiles: ActivityMediaPhoto[];
  onMediaFilesChange: React.Dispatch<React.SetStateAction<ActivityMediaPhoto[]>>;
}

export default function ActivityMediaForm({
  maxFiles = MAX_FILES,
  mediaFiles,
  onMediaFilesChange,
}: ActivityMediaFormProps): JSX.Element {
  const { strings } = useLocalization();

  const onSetFiles = useCallback(
    (files: File[]) => {
      const newPhotos = files.map((file) => {
        const existingPhoto = mediaFiles.find(
          (photo) => photo.file.name === file.name && photo.file.size === file.size
        );

        return {
          caption: existingPhoto?.caption,
          file,
          isCoverPhoto: existingPhoto?.isCoverPhoto,
        };
      });
      onMediaFilesChange((prevPhotos) => [...prevPhotos, ...newPhotos]);
    },
    [mediaFiles, onMediaFilesChange]
  );

  const getUpdatePhotoCaption = useCallback(
    (index: number) => (caption: string) => {
      const updatedPhotos = mediaFiles.map((photo, i) => (index === i ? { ...photo, caption } : photo));
      onMediaFilesChange(updatedPhotos);
    },
    [mediaFiles, onMediaFilesChange]
  );

  const getSetCoverPhoto = useCallback(
    (index: number) => (isCover: boolean) => {
      const updatedPhotos = mediaFiles.map((photo, i) => ({
        ...photo,
        // only one photo can be cover photo
        isCoverPhoto: i === index ? isCover : false,
      }));
      onMediaFilesChange(updatedPhotos);
    },
    [mediaFiles, onMediaFilesChange]
  );

  const getDeletePhoto = useCallback(
    (index: number) => () => {
      const updatedPhotos = mediaFiles.filter((_, i) => index !== i);
      onMediaFilesChange(updatedPhotos);
    },
    [mediaFiles, onMediaFilesChange]
  );

  const fileLimitReached = useMemo(
    () => (maxFiles ? mediaFiles.length >= maxFiles : false),
    [mediaFiles.length, maxFiles]
  );

  return (
    <>
      <Grid item xs={12}>
        {!fileLimitReached && (
          <FileChooser
            acceptFileType='image/jpeg, image/png'
            chooseFileText={strings.CHOOSE_FILE}
            maxFiles={MAX_FILES}
            multipleSelection
            setFiles={onSetFiles}
            uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
            uploadText={strings.ATTACH_IMAGES_OR_VIDEOS}
          />
        )}
      </Grid>

      <Grid item xs={12}>
        {mediaFiles.map((photo, index) => (
          <ActivityPhotoPreview
            isLast={index === mediaFiles.length - 1}
            key={`photo-${index}`}
            onCoverPhotoChange={getSetCoverPhoto(index)}
            onDelete={getDeletePhoto(index)}
            photo={photo}
            setCaption={getUpdatePhotoCaption(index)}
          />
        ))}
      </Grid>
    </>
  );
}
