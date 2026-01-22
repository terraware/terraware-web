import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, FormControlLabel, Grid, Radio, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, FileChooser, Textfield } from '@terraware/web-components';

import PhotoPreview from 'src/components/Photo/PhotoPreview';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { ActivityMediaFile, AdminActivityMediaFile } from 'src/types/Activity';
import { shouldShowHeicPlaceholder } from 'src/utils/images';

type NewActivityMediaFile = Omit<ActivityMediaFile, 'capturedDate' | 'fileId'> & {
  file: File;
};

export type NewActivityMediaItem = {
  type: 'new';
  data: NewActivityMediaFile;
};

export type ExistingActivityMediaItem = {
  type: 'existing';
  data: ActivityMediaFile | AdminActivityMediaFile;
  isModified?: boolean;
  isDeleted?: boolean;
};

export type ActivityMediaItem = NewActivityMediaItem | ExistingActivityMediaItem;

export const isVideoFile = (file: File): boolean => file.type.startsWith('video/');

const MAX_FILES = 100;

type ActivityPhotoPreviewProps = {
  activityId?: number;
  currentPosition: number;
  focused?: boolean;
  isLast?: boolean;
  maxPosition: number;
  mediaItem: ActivityMediaItem;
  onClick?: () => void;
  onCoverPhotoChange: (isCover: boolean) => void;
  onDelete: () => void;
  onHiddenOnMapChange: (isHidden: boolean) => void;
  onPositionChange: (newPosition: number) => void;
  setCaption: (caption: string) => void;
};

const ActivityPhotoPreview = ({
  activityId,
  currentPosition,
  focused,
  isLast,
  maxPosition,
  mediaItem,
  onClick,
  onCoverPhotoChange,
  onDelete,
  onHiddenOnMapChange,
  onPositionChange,
  setCaption,
}: ActivityPhotoPreviewProps) => {
  const { strings } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const theme = useTheme();

  const [showPlaceholder, setShowPlaceholder] = useState<boolean | undefined>();

  useEffect(() => {
    const checkPlaceholder = async () => {
      if (mediaItem.type === 'new') {
        const shouldShow = mediaItem.data.type === 'Video' || (await shouldShowHeicPlaceholder(mediaItem.data.file));
        setShowPlaceholder(shouldShow);
      } else {
        setShowPlaceholder(false);
      }
    };

    void checkPlaceholder();
  }, [mediaItem]);

  const url = useMemo(() => {
    if (mediaItem.type === 'new') {
      return showPlaceholder ? '/assets/activity-media.svg' : URL.createObjectURL(mediaItem.data.file);
    } else if (mediaItem.type === 'existing' && activityId) {
      return ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activityId.toString()).replace(
        '{fileId}',
        mediaItem.data.fileId.toString()
      );
    } else {
      return '';
    }
  }, [activityId, mediaItem, showPlaceholder]);

  const isVideo = useMemo(() => mediaItem.data.type === 'Video', [mediaItem]);

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
      bgcolor={focused ? theme.palette.TwClrBgSecondary : undefined}
      borderBottom={isLast ? 'none' : `1px solid ${theme.palette.TwClrBgSecondary}`}
      id={mediaItem.type === 'existing' ? `activity-media-item-${mediaItem.data.fileId}` : undefined}
      marginBottom='24px'
      onClick={onClick}
      paddingBottom='24px'
      width='100%'
    >
      <Grid container spacing={2} textAlign='left'>
        <Grid item sm='auto' xs={12}>
          <Box position='relative'>
            <PhotoPreview imgUrl={url} includeTrashIcon={false} onTrashClick={onDelete} />
            {isVideo && (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  height: '100%',
                  justifyContent: 'center',
                  left: 0,
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: 0,
                  width: '100%',
                }}
              >
                <img alt='video file' src='/assets/video-icon.svg' style={{ height: '56px', width: '56px' }} />
              </Box>
            )}
            {showPlaceholder && (
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 1,
                  bottom: 4,
                  color: 'white',
                  fontSize: '10px',
                  left: 4,
                  padding: '2px 6px',
                  position: 'absolute',
                  right: 4,
                  textAlign: 'center',
                }}
              >
                {strings.PREVIEW_WILL_DISPLAY_AFTER_SAVING}
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item sm={true} xs={12}>
          <Box display='flex' flexDirection='column'>
            <Box alignItems='center' display='flex' flexDirection='row' gap={1} marginBottom={theme.spacing(2)}>
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

              {!isVideo && (
                <FormControlLabel
                  control={<Radio checked={isCoverPhoto} name='coverPhoto' onChange={onCoverPhotoToggle} />}
                  label={strings.COVER_PHOTO}
                  sx={{ paddingLeft: '8px' }}
                />
              )}
            </Box>

            <Box
              display='flex'
              flexDirection='row'
              flexWrap='wrap'
              sx={{
                '& .MuiButtonBase-root': {
                  marginBottom: 0,
                },
                '& .MuiFormControlLabel-root': {
                  marginBottom: theme.spacing(1),
                  marginTop: 0,
                },
              }}
            >
              <Typography
                fontSize='14px'
                lineHeight='24px'
                marginBottom={theme.spacing(2)}
                marginRight={theme.spacing(1)}
                sx={{ opacity: mediaItem.data.isHiddenOnMap ? 0.5 : 1 }}
              >
                {coordinatesLabel}
              </Typography>

              {isAcceleratorRoute && (
                <Checkbox
                  id={`activity-media-id-${activityId}-hide-on-map`}
                  label={strings.HIDE_ON_MAP}
                  name='isHiddenOnMap'
                  onChange={onHiddenOnMapToggle}
                  sx={{ marginBottom: theme.spacing(1) }}
                  value={isHiddenOnMap}
                />
              )}
            </Box>

            <Button
              icon='iconTrashCan'
              label={strings.DELETE}
              onClick={onDelete}
              priority='ghost'
              style={{
                justifyContent: 'flex-start',
                marginBottom: 0,
                marginLeft: '-8px',
                marginTop: 0,
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
            maxLength={200}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export interface ActivityMediaFormProps {
  activityId?: number;
  focusedFileId?: number;
  maxFiles?: number;
  mediaItems: ActivityMediaItem[];
  onClickMediaItem: (fileId: number) => () => void;
  onChangeMediaItems: React.Dispatch<React.SetStateAction<ActivityMediaItem[]>>;
}

export default function ActivityMediaForm({
  activityId,
  focusedFileId,
  maxFiles = MAX_FILES,
  mediaItems,
  onClickMediaItem,
  onChangeMediaItems,
}: ActivityMediaFormProps): JSX.Element {
  const { strings } = useLocalization();

  const visibleMediaItems = useMemo(
    () => mediaItems.filter((item) => item.type === 'new' || !item.isDeleted),
    [mediaItems]
  );

  const fileLimitReached = useMemo(
    () => (maxFiles ? visibleMediaItems.length >= maxFiles : false),
    [visibleMediaItems.length, maxFiles]
  );

  const onSetFiles = useCallback(
    (files: File[]) => {
      const newPhotos: ActivityMediaItem[] = files.map((file, index) => ({
        data: {
          isCoverPhoto: false,
          isHiddenOnMap: false,
          file,
          fileName: file.name,
          listPosition: mediaItems.length + index + 1,
          type: isVideoFile(file) ? 'Video' : 'Photo',
        },
        type: 'new' as const,
      }));
      onChangeMediaItems((prevPhotos) => [...prevPhotos, ...newPhotos]);
    },
    [mediaItems.length, onChangeMediaItems]
  );

  const getUpdatePhotoCaption = useCallback(
    (index: number) => (caption: string) => {
      const updatedPhotos = mediaItems.map((mediaItem, i) => {
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
      onChangeMediaItems(updatedPhotos);
    },
    [mediaItems, onChangeMediaItems]
  );

  const getSetCoverPhoto = useCallback(
    (index: number) => (isCover: boolean) => {
      // update all photos to ensure only one is cover photo
      const updatedPhotos = mediaItems.map((mediaItem, i) => {
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
      onChangeMediaItems(updatedPhotos);
    },
    [mediaItems, onChangeMediaItems]
  );

  const getSetHiddenOnMap = useCallback(
    (index: number) => (isHidden: boolean) => {
      const updatedPhotos = mediaItems.map((mediaItem, i) => {
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
      onChangeMediaItems(updatedPhotos);
    },
    [mediaItems, onChangeMediaItems]
  );

  const getDeletePhoto = useCallback(
    (index: number) => () => {
      const mediaItem = mediaItems[index];
      if (mediaItem.type === 'new') {
        // remove new photos completely
        const updatedPhotos = mediaItems.filter((_, i) => index !== i);
        onChangeMediaItems(updatedPhotos);
      } else {
        // mark existing photos as deleted
        const updatedPhotos = mediaItems.map((item, i) => {
          if (index === i) {
            return {
              ...item,
              isDeleted: true,
            };
          }
          return item;
        });
        onChangeMediaItems(updatedPhotos);
      }
    },
    [mediaItems, onChangeMediaItems]
  );

  const getUpdatePosition = useCallback(
    (currentIndex: number) => (newPosition: number) => {
      const targetIndex = newPosition - 1;
      if (targetIndex < 0 || targetIndex >= visibleMediaItems.length || currentIndex === targetIndex) {
        return;
      }

      // reorder the visible files
      const reorderedFiles = [...visibleMediaItems];
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
      const deletedItems = mediaItems.filter((item) => item.type === 'existing' && item.isDeleted);
      const finalFiles = [...updatedFiles, ...deletedItems];

      onChangeMediaItems(finalFiles);
    },
    [mediaItems, onChangeMediaItems, visibleMediaItems]
  );

  return (
    <>
      <Grid item xs={12}>
        {!fileLimitReached && (
          <FileChooser
            acceptFileType={'image/heic, image/jpeg, image/png, video/*'}
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
        {mediaItems.map((mediaItem, index) => {
          // skip deleted existing photos
          if (mediaItem.type === 'existing' && mediaItem.isDeleted) {
            return null;
          }

          // Calculate position excluding deleted items (this is the index in visibleMediaItems)
          const visibleIndex = mediaItems
            .slice(0, index)
            .filter((item) => !(item.type === 'existing' && item.isDeleted)).length;

          const currentPosition = visibleIndex + 1;

          return (
            <ActivityPhotoPreview
              activityId={activityId}
              currentPosition={currentPosition}
              focused={mediaItem.type === 'existing' && mediaItem.data.fileId === focusedFileId}
              isLast={visibleIndex === visibleMediaItems.length - 1}
              key={`photo-${index}`}
              maxPosition={visibleMediaItems.length}
              onClick={mediaItem.type === 'existing' ? onClickMediaItem(mediaItem.data.fileId) : undefined}
              onCoverPhotoChange={getSetCoverPhoto(index)}
              onDelete={getDeletePhoto(index)}
              onHiddenOnMapChange={getSetHiddenOnMap(index)}
              onPositionChange={getUpdatePosition(visibleIndex)}
              mediaItem={mediaItem}
              setCaption={getUpdatePhotoCaption(index)}
            />
          );
        })}
      </Grid>
    </>
  );
}
