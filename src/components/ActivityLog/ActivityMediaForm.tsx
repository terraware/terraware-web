import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, FormControlLabel, Grid, Radio, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, FileChooser, Textfield } from '@terraware/web-components';

import PhotoPreview from 'src/components/Photo/PhotoPreview';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { ActivityMediaFile, AdminActivityMediaFile } from 'src/types/Activity';
import { shouldShowHeicPlaceholder } from 'src/utils/images';

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

  const [isHeicPlaceholder, setIsHeicPlaceholder] = useState<boolean | undefined>();

  useEffect(() => {
    if (isHeicPlaceholder !== undefined) {
      return;
    }

    const checkHeicPlaceholder = async () => {
      if (mediaItem.type === 'new') {
        const shouldShow = await shouldShowHeicPlaceholder(mediaItem.data.file);
        setIsHeicPlaceholder(shouldShow);
      } else {
        setIsHeicPlaceholder(false);
      }
    };

    void checkHeicPlaceholder();
  }, [isHeicPlaceholder, mediaItem]);

  const url = useMemo(() => {
    if (mediaItem.type === 'new') {
      return isHeicPlaceholder ? '/assets/activity-media.svg' : URL.createObjectURL(mediaItem.data.file);
    } else if (mediaItem.type === 'existing' && activityId) {
      return ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activityId.toString()).replace(
        '{fileId}',
        mediaItem.data.fileId.toString()
      );
    } else {
      return '';
    }
  }, [activityId, mediaItem, isHeicPlaceholder]);

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
            {isHeicPlaceholder && (
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
                {strings.HEIC_PREVIEW}
              </Box>
            )}
          </Box>
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
  focusedFileId?: number;
  maxFiles?: number;
  mediaFiles: ActivityMediaItem[];
  onMediaFileClick: (fileId: number) => () => void;
  onMediaFilesChange: React.Dispatch<React.SetStateAction<ActivityMediaItem[]>>;
}

export default function ActivityMediaForm({
  activityId,
  focusedFileId,
  maxFiles = MAX_FILES,
  mediaFiles,
  onMediaFileClick,
  onMediaFilesChange,
}: ActivityMediaFormProps): JSX.Element {
  const { strings } = useLocalization();

  const visibleMediaFiles = useMemo(
    () => mediaFiles.filter((item) => item.type === 'new' || !item.isDeleted),
    [mediaFiles]
  );

  const fileLimitReached = useMemo(
    () => (maxFiles ? visibleMediaFiles.length >= maxFiles : false),
    [visibleMediaFiles.length, maxFiles]
  );

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
      const targetIndex = newPosition - 1;
      if (targetIndex < 0 || targetIndex >= visibleMediaFiles.length || currentIndex === targetIndex) {
        return;
      }

      // reorder the visible files
      const reorderedFiles = [...visibleMediaFiles];
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
    [mediaFiles, onMediaFilesChange, visibleMediaFiles]
  );

  return (
    <>
      <Grid item xs={12}>
        {!fileLimitReached && (
          <FileChooser
            acceptFileType='image/heic, image/jpeg, image/png'
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
              currentPosition={index + 1}
              focused={photo.type === 'existing' && photo.data.fileId === focusedFileId}
              isLast={index === visibleMediaFiles.length - 1}
              key={`photo-${index}`}
              maxPosition={visibleMediaFiles.length}
              onClick={photo.type === 'existing' ? onMediaFileClick(photo.data.fileId) : undefined}
              onCoverPhotoChange={getSetCoverPhoto(index)}
              onDelete={getDeletePhoto(index)}
              onHiddenOnMapChange={getSetHiddenOnMap(index)}
              onPositionChange={getUpdatePosition(index)}
              mediaItem={photo}
              setCaption={getUpdatePhotoCaption(index)}
            />
          );
        })}
      </Grid>
    </>
  );
}
