import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, FileChooser, PageForm } from '@terraware/web-components';

import { isVideoFile } from 'src/components/ActivityLog/ActivityMediaForm';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import {
  DeletePlotPhotoApiArg,
  UpdatePlotPhotoApiArg,
  UploadOtherPlotMediaApiArg,
  useDeletePlotPhotoMutation,
  useGetObservationResultsQuery,
  useUpdatePlotPhotoMutation,
  useUploadOtherPlotMediaMutation,
} from 'src/queries/generated/observations';
import MonitoringPlotPhotoPreview from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotoPreview';
import strings from 'src/strings';
import { MonitoringPlotMediaItem, ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import useSnackbar from 'src/utils/useSnackbar';

const MonitoringPlotEditPhotos = ({ reload }: { reload: () => void }) => {
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    monitoringPlotId: string;
  }>();

  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);
  const plantingSiteId = params.plantingSiteId;
  const [upload] = useUploadOtherPlotMediaMutation();
  const [update] = useUpdatePlotPhotoMutation();
  const [deleteQuery] = useDeletePlotPhotoMutation();
  const [mediaItems, setMediaItems] = useState<MonitoringPlotMediaItem[]>([]);
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [plantingZoneName, setPlantingZoneName] = useState<string>();
  const [showWarning, setShowWarning] = useState(false);

  const [monitoringPlotResult, setMonitoringPlotResult] = useState<ObservationMonitoringPlotResultsPayload>();

  const snackbar = useSnackbar();

  const { data: getObservationResultsApiResponse } = useGetObservationResultsQuery({ observationId });

  const observationResults = useMemo(
    () => getObservationResultsApiResponse?.observation,
    [getObservationResultsApiResponse]
  );

  const visibleMediaItems = useMemo(
    () => mediaItems.filter((item) => item.type === 'new' || !item.isDeleted),
    [mediaItems]
  );

  const onSetFiles = useCallback((files: File[]) => {
    const newPhotos: MonitoringPlotMediaItem[] = files.map((file) => {
      return {
        data: { file, isOriginal: false, type: undefined, mediaKind: isVideoFile(file) ? 'Video' : 'Photo' },
        type: 'new' as const,
      };
    });
    setMediaItems((prevPhotos) => [...newPhotos, ...prevPhotos]);
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
      observationResults.strata.forEach((zone) =>
        zone.substrata.forEach((subzone) =>
          subzone.monitoringPlots.forEach((plot) => {
            if (plot.monitoringPlotId === monitoringPlotId) {
              setMonitoringPlotResult(plot);
              setPlantingZoneName(zone.name);
              setMediaItems(plot.media.map((mediaElement) => ({ type: 'existing', data: mediaElement })));
              return;
            }
          })
        )
      );
      if (observationResults.adHocPlot && observationResults.adHocPlot.monitoringPlotId === monitoringPlotId) {
        setMonitoringPlotResult(observationResults.adHocPlot);
        setMediaItems(
          observationResults.adHocPlot.media.map((mediaElement) => ({ type: 'existing', data: mediaElement }))
        );
      }
    }
  }, [observationResults, monitoringPlotId]);

  const goToPhotosTab = useCallback(() => {
    if (observationResults?.type === 'Biomass Measurements') {
      navigate(
        APP_PATHS.OBSERVATION_BIOMASS_MEASUREMENTS_DETAILS.replace(':plantingSiteId', `${plantingSiteId}`)
          .replace(':observationId', `${observationId}`)
          .replace(':monitoringPlotId', `${monitoringPlotId}`)
      );
    } else {
      if (monitoringPlotResult?.isAdHoc) {
        navigate(
          APP_PATHS.OBSERVATION_AD_HOC_PLOT_DETAILS.replace(':plantingSiteId', `${plantingSiteId}`)
            .replace(':observationId', `${observationId}`)
            .replace(':monitoringPlotId', `${monitoringPlotId}`)
        );
      } else if (plantingZoneName) {
        navigate(
          APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS.replace(':plantingSiteId', `${plantingSiteId}`)
            .replace(':observationId', `${observationId}`)
            .replace(':plantingZoneName', plantingZoneName)
            .replace(':monitoringPlotId', `${monitoringPlotId}`)
        );
      }
    }
  }, [
    monitoringPlotId,
    monitoringPlotResult,
    navigate,
    observationId,
    observationResults,
    plantingSiteId,
    plantingZoneName,
  ]);

  const savePhotos = useCallback(() => {
    void (async () => {
      try {
        const promises = mediaItems.map((mediaItem) => {
          if (mediaItem.type === 'new') {
            const formData = new FormData();
            formData.append('file', mediaItem.data.file);

            const payloadData = {
              caption: mediaItem.data.caption,
              type: undefined,
            };
            formData.append('payload', new Blob([JSON.stringify(payloadData)], { type: 'application/json' }));

            const payload: UploadOtherPlotMediaApiArg = {
              observationId,
              plotId: monitoringPlotId,
              body: formData as any,
            };
            return upload(payload).unwrap();
          } else if (mediaItem.type === 'existing' && mediaItem.isDeleted) {
            const payload: DeletePlotPhotoApiArg = {
              observationId,
              plotId: monitoringPlotId,
              fileId: mediaItem.data.fileId,
            };
            return deleteQuery(payload).unwrap();
          } else if (mediaItem.type === 'existing' && mediaItem.isModified) {
            const payload: UpdatePlotPhotoApiArg = {
              observationId,
              plotId: monitoringPlotId,
              fileId: mediaItem.data.fileId,
              updatePlotPhotoRequestPayload: { caption: mediaItem.data.caption },
            };
            return update(payload).unwrap();
          }
          return Promise.resolve();
        });

        await Promise.all(promises);
        reload();
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        goToPhotosTab();
      } catch (error) {
        snackbar.toastError();
      }
    })();
  }, [deleteQuery, mediaItems, monitoringPlotId, observationId, update, upload, goToPhotosTab, snackbar, reload]);

  const showModal = useCallback(() => {
    setShowWarning(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowWarning(false);
  }, []);

  const onConfirmSave = useCallback(() => {
    savePhotos();
  }, [savePhotos]);

  return (
    <Page title={monitoringPlotResult?.monitoringPlotName}>
      {showWarning && (
        <DialogBox
          onClose={onCloseModal}
          open={true}
          title={strings.SAVE_PHOTOS_AND_VIDEOS}
          size='medium'
          middleButtons={[
            <Button
              id='cancelSave'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              onClick={onCloseModal}
              key='button-1'
            />,
            <Button
              id='confirmSave'
              label={strings.CONTINUE}
              onClick={onConfirmSave}
              key='button-2'
              type='destructive'
            />,
          ]}
          message={strings.SAVE_PHOTOS_AND_VIDEOS_DESCRIPTION}
        />
      )}
      <PageForm
        cancelID='cancelUploadPhotos'
        onCancel={goToPhotosTab}
        onSave={showModal}
        saveButtonText={strings.SAVE}
        saveID='savePhotos'
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
                    monitoringPlotName={monitoringPlotResult?.monitoringPlotName}
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
