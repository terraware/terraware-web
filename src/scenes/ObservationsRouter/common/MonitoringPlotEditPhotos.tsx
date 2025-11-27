import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { FileChooser, PageForm } from '@terraware/web-components';

import { isVideoFile } from 'src/components/ActivityLog/ActivityMediaForm';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import MonitoringPlotPhotoPreview from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotoPreview';
import strings from 'src/strings';
import { MonitoringPlotMediaItem, ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

const MonitoringPlotEditPhotos = () => {
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    monitoringPlotId: string;
  }>();

  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);
  const [mediaItems, setMediaItems] = useState<MonitoringPlotMediaItem[]>([]);
  const theme = useTheme();
  const navigate = useSyncNavigate();

  const [monitoringPlotResult, setMonitoringPlotResult] = useState<ObservationMonitoringPlotResultsPayload>();

  const { data: GetObservationResultsApiResponse } = useGetObservationResultsQuery({ observationId });

  const observationResults = useMemo(
    () => GetObservationResultsApiResponse?.observation,
    [GetObservationResultsApiResponse]
  );

  const visibleMediaItems = useMemo(
    () => mediaItems.filter((item) => item.type === 'new' || !item.isDeleted),
    [mediaItems]
  );

  const onSetFiles = useCallback((files: File[]) => {
    const newPhotos: MonitoringPlotMediaItem[] = files.map((file) => ({
      data: { file, isOriginal: false, type: 'Plot', mediaKind: isVideoFile(file) ? 'Video' : 'Photo' },
      type: 'new' as const,
    }));
    setMediaItems((prevPhotos) => [...prevPhotos, ...newPhotos]);
  }, []);

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
      setMediaItems(updatedPhotos);
    },
    [mediaItems]
  );

  const getDeletePhoto = useCallback(
    (index: number) => () => {
      const mediaItem = mediaItems[index];
      if (mediaItem.type === 'new') {
        // remove new photos completely
        const updatedPhotos = mediaItems.filter((_, i) => index !== i);
        setMediaItems(updatedPhotos);
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
        setMediaItems(updatedPhotos);
      }
    },
    [mediaItems]
  );

  useEffect(() => {
    if (observationResults) {
      observationResults.plantingZones.forEach((zone) =>
        zone.plantingSubzones.forEach((subzone) =>
          subzone.monitoringPlots.forEach((plot) => {
            if (plot.monitoringPlotId === monitoringPlotId) {
              setMonitoringPlotResult(plot);
              setMediaItems(plot.media.map((mediaElement) => ({ type: 'existing', data: mediaElement })));
              return;
            }
          })
        )
      );
    }
  }, [observationResults, monitoringPlotId]);

  const goToPhotosTab = useCallback(() => {
    navigate(APP_PATHS.OBSERVATIONS);
  }, [navigate]);

  const saveActivity = useCallback(() => {
    // save media items to backend
  }, []);

  return (
    <Page title={monitoringPlotResult?.monitoringPlotName}>
      <PageForm
        cancelID='cancelSaveActivity'
        onCancel={goToPhotosTab}
        onSave={saveActivity}
        saveButtonText={strings.SAVE}
        saveID='saveActivity'
        cancelButtonText={strings.CANCEL}
        style={{ width: '100%' }}
      >
        <Card radius={'24px'} style={{ padding: '24px', width: '100%' }}>
          <Typography fontSize={'20px'} fontWeight={600}>
            {strings.EDIT_PHOTOS_AND_VIDEOS}
          </Typography>
          <Box display='flex' gap={3} paddingTop={theme.spacing(3)}>
            <Box width='40%'>
              <FileChooser
                acceptFileType={'image/heic, image/jpeg, image/png, video/*'}
                chooseFileText={strings.CHOOSE_FILES}
                multipleSelection
                setFiles={onSetFiles}
                uploadDescription={strings.UPLOAD_FILES_DESCRIPTION_FORMATS}
                uploadText={strings.UPLOAD_FILES}
              />
            </Box>
            <Box width='60%'>
              {mediaItems.map((mediaItem, index) => {
                // skip deleted existing photos
                if (mediaItem.type === 'existing' && mediaItem.isDeleted) {
                  return null;
                }

                // Calculate position excluding deleted items (this is the index in visibleMediaItems)
                const visibleIndex = mediaItems
                  .slice(0, index)
                  .filter((item) => !(item.type === 'existing' && item.isDeleted)).length;

                return (
                  <MonitoringPlotPhotoPreview
                    isLast={visibleIndex === visibleMediaItems.length - 1}
                    key={`photo-${index}`}
                    mediaItem={mediaItem}
                    monitoringPlotId={monitoringPlotId}
                    observationId={observationId}
                    onDelete={getDeletePhoto(index)}
                    setCaption={getUpdatePhotoCaption(index)}
                  />
                );
              })}
            </Box>
          </Box>
        </Card>
      </PageForm>
    </Page>
  );
};

export default MonitoringPlotEditPhotos;
