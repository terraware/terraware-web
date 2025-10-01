import React, { useCallback, useMemo } from 'react';

import { Box, FormControlLabel, Grid, Radio, Typography, useTheme } from '@mui/material';
import { Button, FileChooser, Textfield } from '@terraware/web-components';

import PhotoPreview from 'src/components/Photo/PhotoPreview';
import { useLocalization } from 'src/providers/hooks';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { ActivityMediaFile, AdminActivityMediaFile } from 'src/types/Activity';

export type ActivityMediaPhoto = {
  caption?: string;
  file: File;
  isCoverPhoto: boolean;
  isHiddenOnMap: boolean;
  listPosition: number;
};

// Unified type for handling both new photos and existing media files
export type ActivityMediaItem =
  | { type: 'new'; data: ActivityMediaPhoto }
  | { type: 'existing'; data: ActivityMediaFile | AdminActivityMediaFile; isModified?: boolean; isDeleted?: boolean };

const MAX_FILES = 20;

type ActivityPhotoPreviewProps = {
  activityId?: number;
  isLast?: boolean;
  mediaItem: ActivityMediaItem;
  onCoverPhotoChange: (isCover: boolean) => void;
  onDelete: () => void;
  setCaption: (caption: string) => void;
};

const ActivityPhotoPreview = ({
  activityId,
  isLast,
  mediaItem,
  onCoverPhotoChange,
  onDelete,
  setCaption,
}: ActivityPhotoPreviewProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const url = useMemo(() => {
    if (mediaItem.type === 'new') {
      return URL.createObjectURL(mediaItem.data.file);
    } else if (mediaItem.type === 'existing' && activityId) {
      return ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activityId.toString()).replace(
        '{fileId}',
        mediaItem.data.fileId.toString()
      );
    } else {
      return '';
    }
  }, [activityId, mediaItem]);

  const caption = useMemo(() => mediaItem.data.caption || '', [mediaItem]);

  const isCoverPhoto = useMemo(() => !!mediaItem.data.isCoverPhoto, [mediaItem]);

  const setCaptionCallback = useCallback(
    (value: any) => {
      setCaption(value as string);
    },
    [setCaption]
  );

  const onCoverPhotoToggle = useCallback(() => {
    onCoverPhotoChange(!isCoverPhoto);
  }, [onCoverPhotoChange, isCoverPhoto]);

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
                control={<Radio checked={isCoverPhoto} name='coverPhoto' onChange={onCoverPhotoToggle} />}
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
            id={`caption-${mediaItem.type === 'new' ? mediaItem.data.file.name : mediaItem.data.fileId}`}
            label={strings.CAPTION}
            onChange={setCaptionCallback}
            type='text'
            value={caption}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export interface ActivityMediaFormProps {
  activityId?: number;
  maxFiles?: number;
  mediaFiles: ActivityMediaItem[];
  onMediaFilesChange: React.Dispatch<React.SetStateAction<ActivityMediaItem[]>>;
}

export default function ActivityMediaForm({
  activityId,
  maxFiles = MAX_FILES,
  mediaFiles,
  onMediaFilesChange,
}: ActivityMediaFormProps): JSX.Element {
  const { strings } = useLocalization();

  const onSetFiles = useCallback(
    (files: File[]) => {
      const newPhotos: ActivityMediaItem[] = files.map((file) => ({
        data: {
          isCoverPhoto: false,
          isHiddenOnMap: false,
          file,
          listPosition: mediaFiles.length + 1,
        },
        type: 'new' as const,
      }));
      onMediaFilesChange((prevPhotos) => [...prevPhotos, ...newPhotos]);
    },
    [mediaFiles.length, onMediaFilesChange]
  );

  const getUpdatePhotoCaption = useCallback(
    (index: number) => (caption: string) => {
      const updatedPhotos = mediaFiles.map((mediaItem, i) => {
        if (index !== i) {
          return mediaItem;
        }

        if (mediaItem.type === 'new') {
          return {
            ...mediaItem,
            data: { ...mediaItem.data, caption },
          };
        } else {
          return {
            ...mediaItem,
            data: { ...mediaItem.data, caption },
            isModified: true,
          };
        }
      });
      onMediaFilesChange(updatedPhotos);
    },
    [mediaFiles, onMediaFilesChange]
  );

  const getSetCoverPhoto = useCallback(
    (index: number) => (isCover: boolean) => {
      // update all photos to ensure only one is cover photo
      const updatedPhotos = mediaFiles.map((mediaItem, i) => {
        const shouldBeCover = i === index ? isCover : false;

        if (mediaItem.type === 'new') {
          return {
            ...mediaItem,
            data: { ...mediaItem.data, isCoverPhoto: shouldBeCover },
          };
        } else {
          // for existing items, mark as modified if cover photo status changed
          const isChanged = mediaItem.data.isCoverPhoto !== shouldBeCover;
          return {
            ...mediaItem,
            data: { ...mediaItem.data, isCoverPhoto: shouldBeCover },
            ...(isChanged && { isModified: true }),
          };
        }
      });
      onMediaFilesChange(updatedPhotos);
    },
    [mediaFiles, onMediaFilesChange]
  );

  const getDeletePhoto = useCallback(
    (index: number) => () => {
      const mediaItem = mediaFiles[index];
      if (mediaItem.type === 'new') {
        // remove new photos completely
        const updatedPhotos = mediaFiles.filter((_, i) => index !== i);
        onMediaFilesChange(updatedPhotos);
      } else {
        // mark existing photos as deleted
        const updatedPhotos = mediaFiles.map((item, i) => {
          if (index === i) {
            return {
              ...item,
              isDeleted: true,
            };
          }
          return item;
        });
        onMediaFilesChange(updatedPhotos);
      }
    },
    [mediaFiles, onMediaFilesChange]
  );

  const visibleMediaFiles = useMemo(
    () => mediaFiles.filter((item) => item.type === 'new' || !item.isDeleted),
    [mediaFiles]
  );

  const fileLimitReached = useMemo(
    () => (maxFiles ? visibleMediaFiles.length >= maxFiles : false),
    [visibleMediaFiles.length, maxFiles]
  );

  return (
    <>
      <Grid item xs={12}>
        {!fileLimitReached && (
          <FileChooser
            acceptFileType='image/jpeg, image/png'
            chooseFileText={strings.CHOOSE_FILE}
            maxFiles={maxFiles}
            multipleSelection
            setFiles={onSetFiles}
            uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
            uploadText={strings.ATTACH_IMAGES_OR_VIDEOS}
          />
        )}
      </Grid>

      <Grid item xs={12}>
        {mediaFiles.map((photo, index) => {
          // skip deleted existing photos
          if (photo.type === 'existing' && photo.isDeleted) {
            return null;
          }

          return (
            <ActivityPhotoPreview
              activityId={activityId}
              isLast={index === visibleMediaFiles.length - 1}
              key={`photo-${index}`}
              onCoverPhotoChange={getSetCoverPhoto(index)}
              onDelete={getDeletePhoto(index)}
              mediaItem={photo}
              setCaption={getUpdatePhotoCaption(index)}
            />
          );
        })}
      </Grid>
    </>
  );
}
