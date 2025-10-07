import React, { useCallback, useMemo } from 'react';

import { Box, FormControlLabel, Grid, Radio, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, FileChooser, Textfield } from '@terraware/web-components';

import PhotoPreview from 'src/components/Photo/PhotoPreview';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
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
  currentPosition: number;
  isLast?: boolean;
  maxPosition: number;
  mediaItem: ActivityMediaItem;
  onCoverPhotoChange: (isCover: boolean) => void;
  onDelete: () => void;
  onHiddenOnMapChange: (isHidden: boolean) => void;
  onPositionChange: (newPosition: number) => void;
  setCaption: (caption: string) => void;
};

const ActivityPhotoPreview = ({
  activityId,
  currentPosition,
  isLast,
  maxPosition,
  mediaItem,
  onCoverPhotoChange,
  onDelete,
  onHiddenOnMapChange,
  onPositionChange,
  setCaption,
}: ActivityPhotoPreviewProps) => {
  const { strings } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
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

  const isCoverPhoto = useMemo(() => mediaItem.data.isCoverPhoto, [mediaItem]);

  const coordinatesLabel = useMemo(() => {
    const coordinates = mediaItem.type === 'existing' ? mediaItem.data.geolocation?.coordinates : undefined;

    if (mediaItem.type === 'new') {
      return strings.LOCATION_WILL_BE_ADDED_TO_MAP_AFTER_SAVING;
    } else if (mediaItem.type === 'existing' && coordinates) {
      return `${coordinates[1].toFixed(7)}, ${coordinates[0].toFixed(7)}`;
    } else {
      return strings.LOCATION_DATA_UNAVAILABLE;
    }
  }, [mediaItem, strings]);

  const isHiddenOnMap = useMemo(() => mediaItem.data.isHiddenOnMap, [mediaItem]);

  const setCaptionCallback = useCallback(
    (value: any) => {
      setCaption(value as string);
    },
    [setCaption]
  );

  const onCoverPhotoToggle = useCallback(() => {
    onCoverPhotoChange(!isCoverPhoto);
  }, [onCoverPhotoChange, isCoverPhoto]);

  const onHiddenOnMapToggle = useCallback(() => {
    onHiddenOnMapChange(!isHiddenOnMap);
  }, [onHiddenOnMapChange, isHiddenOnMap]);

  const onMoveUp = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      if (currentPosition > 1) {
        onPositionChange(currentPosition - 1);
        event?.currentTarget?.blur();
      }
    },
    [currentPosition, onPositionChange]
  );

  const onMoveDown = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      if (currentPosition < maxPosition) {
        onPositionChange(currentPosition + 1);
        event?.currentTarget?.blur();
      }
    },
    [currentPosition, maxPosition, onPositionChange]
  );

  const onPositionInputChange = useCallback(
    (value: any) => {
      const stringValue = value as string;
      // only allow numeric values
      if (/^\d*$/.test(stringValue)) {
        const numericValue = parseInt(stringValue, 10);
        if (!isNaN(numericValue)) {
          // clamp the value between 1 and maxPosition
          const clampedValue = Math.max(1, Math.min(maxPosition, numericValue));
          onPositionChange(clampedValue);
        } else if (stringValue === '') {
          // allow empty string for editing
          return;
        }
      }
    },
    [maxPosition, onPositionChange]
  );

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
            <Box alignItems='center' display='flex' flexDirection='row' gap={1}>
              <Button
                disabled={currentPosition <= 1}
                icon='caretUp'
                onClick={onMoveUp}
                priority='ghost'
                size='medium'
                style={{ margin: 0, minWidth: '32px', padding: 0 }}
                type='passive'
              />
              <Button
                disabled={currentPosition >= maxPosition}
                icon='caretDown'
                onClick={onMoveDown}
                priority='ghost'
                size='medium'
                style={{ margin: 0, minWidth: '32px', padding: 0 }}
                type='passive'
              />
              <Textfield
                id={`position-${mediaItem.type === 'new' ? mediaItem.data.file.name : mediaItem.data.fileId}`}
                label=''
                onChange={onPositionInputChange}
                sx={{ width: '60px', '& input': { textAlign: 'center' } }}
                type='text'
                value={currentPosition.toString()}
              />

              <FormControlLabel
                control={<Radio checked={isCoverPhoto} name='coverPhoto' onChange={onCoverPhotoToggle} />}
                label={strings.COVER_PHOTO}
                sx={{ paddingLeft: '8px' }}
              />
            </Box>

            <Typography fontSize='14px'>{coordinatesLabel}</Typography>

            {isAcceleratorRoute && (
              <Checkbox
                id={`activity-media-id-${activityId}-hide-on-map`}
                label={strings.HIDE_ON_MAP}
                name='isHiddenOnMap'
                onChange={onHiddenOnMapToggle}
                value={isHiddenOnMap}
              />
            )}

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
      const newPhotos: ActivityMediaItem[] = files.map((file, index) => ({
        data: {
          isCoverPhoto: false,
          isHiddenOnMap: false,
          file,
          listPosition: mediaFiles.length + index + 1,
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

  const getSetHiddenOnMap = useCallback(
    (index: number) => (isHidden: boolean) => {
      const updatedPhotos = mediaFiles.map((mediaItem, i) => {
        if (index !== i) {
          return mediaItem;
        }

        if (mediaItem.type === 'new') {
          return {
            ...mediaItem,
            data: { ...mediaItem.data, isHiddenOnMap: isHidden },
          };
        } else {
          // for existing items, mark as modified if hidden on map status changed
          const isChanged = mediaItem.data.isHiddenOnMap !== isHidden;

          return {
            ...mediaItem,
            data: { ...mediaItem.data, isHiddenOnMap: isHidden },
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

  const getUpdatePosition = useCallback(
    (currentIndex: number) => (newPosition: number) => {
      // create a copy of visible media files for reordering
      const visibleFiles = mediaFiles.filter((item) => item.type === 'new' || !item.isDeleted);
      const targetIndex = newPosition - 1; // Convert to 0-based index

      if (targetIndex < 0 || targetIndex >= visibleFiles.length || currentIndex === targetIndex) {
        return;
      }

      // reorder the visible files
      const reorderedFiles = [...visibleFiles];
      const [movedItem] = reorderedFiles.splice(currentIndex, 1);
      reorderedFiles.splice(targetIndex, 0, movedItem);

      // update list positions for new items
      const updatedFiles = reorderedFiles.map((item, index) => {
        if (item.type === 'new') {
          return {
            ...item,
            data: { ...item.data, listPosition: index + 1 },
          };
        } else {
          return {
            ...item,
            data: { ...item.data, listPosition: index + 1 },
            isModified: true,
          };
        }
      });

      // merge back with deleted items (they maintain their original position in the array)
      const deletedItems = mediaFiles.filter((item) => item.type === 'existing' && item.isDeleted);
      const finalFiles = [...updatedFiles, ...deletedItems];

      onMediaFilesChange(finalFiles);
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
        {visibleMediaFiles.map((photo, visibleIndex) => {
          const originalIndex = mediaFiles.findIndex((item) => item === photo);

          return (
            <ActivityPhotoPreview
              activityId={activityId}
              currentPosition={visibleIndex + 1}
              isLast={visibleIndex === visibleMediaFiles.length - 1}
              key={`photo-${originalIndex}`}
              maxPosition={visibleMediaFiles.length}
              onCoverPhotoChange={getSetCoverPhoto(originalIndex)}
              onDelete={getDeletePhoto(originalIndex)}
              onHiddenOnMapChange={getSetHiddenOnMap(originalIndex)}
              onPositionChange={getUpdatePosition(visibleIndex)}
              mediaItem={photo}
              setCaption={getUpdatePhotoCaption(originalIndex)}
            />
          );
        })}
      </Grid>
    </>
  );
}
