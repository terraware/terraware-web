import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, FormControlLabel, Grid, Radio, Typography, useTheme } from '@mui/material';
import {
  Button,
  Checkbox,
  DialogBox,
  Dropdown,
  FileChooser,
  Icon,
  IconTooltip,
  Textfield,
} from '@terraware/web-components';

import PhotoPreview from 'src/components/Photo/PhotoPreview';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { ActivityMediaFile, AdminActivityMediaFile } from 'src/types/Activity';
import {
  getObsPhotoTypeLabel,
  isCornerPhoto,
  isObservationMedia,
  isUndeletableObservationPhoto,
} from 'src/utils/activityUtils';
import { shouldShowHeicPlaceholder } from 'src/utils/images';

type NewActivityMediaFile = Omit<ActivityMediaFile, 'capturedDate' | 'fileId'> & {
  file: File;
  monitoringPlotId?: number;
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
  monitoringPlotId?: number;
};

export type ActivityMediaItem = NewActivityMediaItem | ExistingActivityMediaItem;

export const isVideoFile = (file: File): boolean => file.type.startsWith('video/');

const MAX_FILES = 100;

type ActivityPhotoPreviewProps = {
  activityId?: number;
  currentPosition: number;
  focused?: boolean;
  isAdHoc?: boolean;
  isLast?: boolean;
  isObsActivity: boolean;
  maxPosition: number;
  mediaItem: ActivityMediaItem;
  onClick?: () => void;
  onCoverPhotoChange: (isCover: boolean) => void;
  onDelete: () => void;
  onHiddenOnMapChange: (isHidden: boolean) => void;
  onPlotChange: (plotId: number | null) => void;
  onPositionChange: (newPosition: number) => void;
  plotOptions?: { plotId: number; plotNumber: number }[];
  setCaption: (caption: string) => void;
  validateFields?: boolean;
};

const ActivityPhotoPreview = ({
  activityId,
  currentPosition,
  focused,
  isAdHoc,
  isLast,
  isObsActivity,
  maxPosition,
  mediaItem,
  onClick,
  onCoverPhotoChange,
  onDelete,
  onHiddenOnMapChange,
  onPlotChange,
  onPositionChange,
  plotOptions,
  setCaption,
  validateFields,
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

  const isObsMedia = useMemo(() => mediaItem.type === 'existing' && isObservationMedia(mediaItem.data), [mediaItem]);

  const isUndeletable = useMemo(
    () => isObsMedia && mediaItem.type === 'existing' && isUndeletableObservationPhoto(mediaItem.data),
    [isObsMedia, mediaItem]
  );

  const undeletableMessage = useMemo(() => {
    if (!isUndeletable || mediaItem.type !== 'existing') {
      return undefined;
    }
    if (isCornerPhoto(mediaItem.data)) {
      return strings.OBSERVATION_PHOTO_CANNOT_DELETE_INFO;
    }
    if (mediaItem.data.observation?.type === 'Quadrat') {
      return strings.QUADRAT_PHOTO_CANNOT_DELETE_INFO;
    }
    if (mediaItem.data.observation?.type === 'Soil') {
      return strings.SOIL_PHOTO_CANNOT_DELETE_INFO;
    }
    return strings.OBSERVATION_PHOTO_CANNOT_DELETE_INFO;
  }, [isUndeletable, mediaItem, strings]);

  const obsPhotoTypeLabel = useMemo(
    () => (isUndeletable && mediaItem.type === 'existing' ? getObsPhotoTypeLabel(mediaItem.data, strings) : undefined),
    [isUndeletable, mediaItem, strings]
  );

  const obsMonitoringPlotNumber = useMemo(() => {
    if (mediaItem.type === 'existing' && isObsMedia) {
      return mediaItem.data.observation?.monitoringPlotNumber;
    }
    return undefined;
  }, [isObsMedia, mediaItem]);

  const selectedPlotId = useMemo(() => {
    if (mediaItem.type === 'new') {
      return mediaItem.data.monitoringPlotId;
    }
    if (mediaItem.monitoringPlotId !== undefined) {
      return mediaItem.monitoringPlotId;
    }
    if (obsMonitoringPlotNumber !== undefined) {
      return plotOptions?.find((p) => p.plotNumber === obsMonitoringPlotNumber)?.plotId;
    }
    return undefined;
  }, [mediaItem, obsMonitoringPlotNumber, plotOptions]);

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
      {obsPhotoTypeLabel && (
        <Typography fontSize='16px' fontWeight={500} marginBottom={theme.spacing(2)}>
          {obsPhotoTypeLabel}
        </Typography>
      )}
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
            {isUndeletable && undeletableMessage && (
              <Box display='flex' alignItems='center' gap={1} marginBottom={theme.spacing(2)} width='100%'>
                <Icon name='info' fillColor={theme.palette.TwClrTxtSecondary} size='medium' />
                <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
                  {undeletableMessage}
                </Typography>
              </Box>
            )}
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

            {isUndeletable ? (
              isObsActivity ? null : (
                <Box alignItems='center' display='flex' gap={1}>
                  <Button
                    disabled
                    icon='iconTrashCan'
                    label={strings.DELETE}
                    onClick={() => undefined}
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
                  <IconTooltip title={strings.OBSERVATION_PHOTO_CANNOT_DELETE_TOOLTIP} />
                </Box>
              )
            ) : (
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
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box alignItems='flex-start' display='flex' gap={1}>
            <Box flex={1}>
              <Textfield
                id={`caption-${mediaItem.type === 'new' ? mediaItem.data.file.name : mediaItem.data.fileId}`}
                label={strings.CAPTION}
                onChange={setCaptionCallback}
                type='text'
                value={caption}
                maxLength={200}
              />
            </Box>
            {isObsActivity && !isUndeletable && !isAdHoc && mediaItem.type === 'new' && (
              <Box flexShrink={0} width='120px'>
                <Dropdown
                  errorText={validateFields && selectedPlotId === undefined ? strings.REQUIRED_FIELD : ''}
                  fullWidth
                  label={strings.MONITORING_PLOT}
                  onChange={(value) => onPlotChange(value !== null && value !== undefined ? Number(value) : null)}
                  options={plotOptions?.map((p) => ({ label: String(p.plotNumber), value: String(p.plotId) })) ?? []}
                  required
                  selectedValue={selectedPlotId !== undefined ? String(selectedPlotId) : null}
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export interface ActivityMediaFormProps {
  activityId?: number;
  focusedFileId?: number;
  isAdHoc?: boolean;
  maxFiles?: number;
  mediaItems: ActivityMediaItem[];
  obsConfirmContext?: { monthYear: string; projectName: string };
  observationId?: number;
  plotOptions?: { plotId: number; plotNumber: number }[];
  onClickMediaItem: (fileId: number) => () => void;
  onChangeMediaItems: React.Dispatch<React.SetStateAction<ActivityMediaItem[]>>;
  validateFields?: boolean;
}

export default function ActivityMediaForm({
  activityId,
  focusedFileId,
  isAdHoc,
  maxFiles = MAX_FILES,
  mediaItems,
  obsConfirmContext,
  observationId,
  plotOptions,
  onClickMediaItem,
  onChangeMediaItems,
  validateFields,
}: ActivityMediaFormProps): JSX.Element {
  const { strings } = useLocalization();

  const isObsActivity = observationId !== undefined;

  // Auto-select the plot when there is exactly one option available
  useEffect(() => {
    if (!plotOptions || plotOptions.length !== 1) {
      return;
    }
    const soloPlotId = plotOptions[0].plotId;
    const hasUnassigned = mediaItems.some((item) => item.type === 'new' && item.data.monitoringPlotId === undefined);
    if (!hasUnassigned) {
      return;
    }
    onChangeMediaItems((prev) =>
      prev.map((item) =>
        item.type === 'new' && item.data.monitoringPlotId === undefined
          ? { ...item, data: { ...item.data, monitoringPlotId: soloPlotId } }
          : item
      )
    );
  }, [plotOptions, mediaItems, onChangeMediaItems]);

  const [deleteConfirmationIndex, setDeleteConfirmationIndex] = useState<number | undefined>();

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

  const handleDeleteRequest = useCallback(
    (index: number) => () => {
      const mediaItem = mediaItems[index];
      const needsConfirmation =
        mediaItem.type === 'existing' &&
        (obsConfirmContext !== undefined ||
          (isObservationMedia(mediaItem.data) && !isUndeletableObservationPhoto(mediaItem.data)));
      if (needsConfirmation) {
        setDeleteConfirmationIndex(index);
      } else {
        getDeletePhoto(index)();
      }
    },
    [mediaItems, getDeletePhoto, obsConfirmContext]
  );

  const confirmDeleteObservationMedia = useCallback(() => {
    if (deleteConfirmationIndex !== undefined) {
      getDeletePhoto(deleteConfirmationIndex)();
      setDeleteConfirmationIndex(undefined);
    }
  }, [deleteConfirmationIndex, getDeletePhoto]);

  const getUpdatePlotId = useCallback(
    (index: number) => (plotId: number | null) => {
      const updatedItems = mediaItems.map((mediaItem, i) => {
        if (index !== i) {
          return mediaItem;
        }
        if (mediaItem.type === 'new') {
          return {
            ...mediaItem,
            data: { ...mediaItem.data, monitoringPlotId: plotId ?? undefined },
          };
        } else {
          return {
            ...mediaItem,
            monitoringPlotId: plotId ?? undefined,
            isModified: true,
          };
        }
      });
      onChangeMediaItems(updatedItems);
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
      {deleteConfirmationIndex !== undefined && (
        <DialogBox
          onClose={() => setDeleteConfirmationIndex(undefined)}
          open={true}
          title={obsConfirmContext ? strings.SAVE_PHOTOS_AND_VIDEOS : strings.DELETE_OBSERVATION_PHOTO_TITLE}
          size='medium'
          middleButtons={[
            <Button
              id='cancelDeleteObservationPhoto'
              key='button-cancel'
              label={strings.CANCEL}
              onClick={() => setDeleteConfirmationIndex(undefined)}
              priority='secondary'
              type='passive'
            />,
            <Button
              id='confirmDeleteObservationPhoto'
              key='button-confirm'
              label={obsConfirmContext ? strings.CONTINUE : strings.DELETE}
              onClick={confirmDeleteObservationMedia}
              type='destructive'
            />,
          ]}
          message={
            obsConfirmContext
              ? strings.formatString(
                  strings.DELETE_OBSERVATION_ACTIVITY_PHOTO_MESSAGE,
                  obsConfirmContext.monthYear,
                  obsConfirmContext.projectName
                )
              : strings.DELETE_OBSERVATION_PHOTO_MESSAGE
          }
        />
      )}
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
              isAdHoc={isAdHoc}
              isLast={visibleIndex === visibleMediaItems.length - 1}
              isObsActivity={isObsActivity}
              key={`photo-${index}`}
              maxPosition={visibleMediaItems.length}
              onClick={mediaItem.type === 'existing' ? onClickMediaItem(mediaItem.data.fileId) : undefined}
              onCoverPhotoChange={getSetCoverPhoto(index)}
              onDelete={handleDeleteRequest(index)}
              onHiddenOnMapChange={getSetHiddenOnMap(index)}
              onPlotChange={getUpdatePlotId(index)}
              onPositionChange={getUpdatePosition(visibleIndex)}
              mediaItem={mediaItem}
              plotOptions={plotOptions}
              setCaption={getUpdatePhotoCaption(index)}
              validateFields={validateFields}
            />
          );
        })}
      </Grid>
    </>
  );
}
