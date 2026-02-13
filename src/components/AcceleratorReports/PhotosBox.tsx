import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import useBoolean from 'src/hooks/useBoolean';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { useBatchReportPhotosMutation } from 'src/queries/reports/photos';
import strings from 'src/strings';
import { AcceleratorReportPhoto, NewAcceleratorReportPhoto, isAcceleratorReport } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import PhotoDragDrop from '../Photo/PhotoDragDrop';
import PhotoPreview from '../Photo/PhotoPreview';
import EditableReportBox from './EditableReportBox';
import { ReportBoxProps } from './ReportBox';

type ExistingPhotoProp = {
  imageUrl: string;
  includeBorder: boolean;
  caption: string | undefined;
  editing: boolean;
  setCaption: (caption: string | undefined) => void;
  onDelete: () => void;
};

const ExistingPhoto = ({ imageUrl, includeBorder, caption, editing, setCaption, onDelete }: ExistingPhotoProp) => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const setCaptionCallback = useCallback(
    (value: any) => {
      setCaption(value as string);
    },
    [setCaption]
  );

  if (editing) {
    return (
      <Box display='flex' width='100%' padding={theme.spacing(1)}>
        <Box marginRight={isMobile ? theme.spacing(2) : theme.spacing(3)} marginTop={theme.spacing(1)}>
          <PhotoPreview imgUrl={imageUrl} includeTrashIcon onTrashClick={onDelete} />
        </Box>

        <Box width='100%'>
          <Textfield type='text' label={strings.CAPTION} id='citation' value={caption} onChange={setCaptionCallback} />
        </Box>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          padding: theme.spacing(1),
        }}
        borderBottom={includeBorder ? `1px solid ${theme.palette.TwClrBgTertiary}` : ''}
      >
        <img src={imageUrl} alt={caption} />
        <p style={{ fontSize: '16px' }}>{caption}</p>
      </Box>
    );
  }
};

type NewPhotoProp = {
  photo: NewAcceleratorReportPhoto;
  setCaption: (caption: string) => void;
  onDelete: () => void;
};

const NewPhoto = ({ photo, setCaption, onDelete }: NewPhotoProp) => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const url = useMemo(() => URL.createObjectURL(photo.file), [photo]);

  const setCaptionCallback = useCallback(
    (value: any) => {
      setCaption(value as string);
    },
    [setCaption]
  );

  return (
    <Box display='flex' width='100%'>
      <Box marginRight={isMobile ? theme.spacing(2) : theme.spacing(3)} marginTop={theme.spacing(1)}>
        <PhotoPreview imgUrl={url} includeTrashIcon onTrashClick={onDelete} />
      </Box>

      <Box width='100%'>
        <Textfield
          type='text'
          label={strings.CAPTION}
          id='citation'
          value={photo.caption}
          onChange={setCaptionCallback}
        />
      </Box>
    </Box>
  );
};

const PhotosBox = (props: ReportBoxProps) => {
  const { report, projectId, isConsoleView, editing, onChange, onEditChange, canEdit, funderReportView } = props;

  const [internalEditing, setInternalEditing, setInternalEditingTrue] = useBoolean(false);
  const [photos, setPhotos] = useState<AcceleratorReportPhoto[]>(report?.photos || []);
  const [newPhotos, setNewPhotos] = useState<NewAcceleratorReportPhoto[]>([]);

  const [batchReportPhotos, { isLoading }] = useBatchReportPhotosMutation();
  const snackbar = useSnackbar();

  const files = useMemo(() => {
    return newPhotos.map((photo) => photo.file);
  }, [newPhotos]);

  const setFiles = useCallback((newFiles: File[]) => {
    setNewPhotos((_photos) => {
      return newFiles.map((newFile) => {
        return {
          file: newFile,
          caption: _photos.find(({ file }) => file === newFile)?.caption,
        };
      });
    });
  }, []);

  useEffect(() => {
    if (!editing) {
      setPhotos(report?.photos || []);
    }
  }, [editing, report?.photos]);

  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  const toDelete = useMemo(() => {
    return (
      report?.photos.filter((existingPhoto) => !photos.some((newPhoto) => newPhoto.fileId === existingPhoto.fileId)) ??
      []
    );
  }, [photos, report?.photos]);

  const toUpdate = useMemo(() => {
    return (
      photos.filter((newPhoto) =>
        report?.photos.some(
          (existingPhoto) => newPhoto.fileId === existingPhoto.fileId && newPhoto.caption !== existingPhoto.caption
        )
      ) ?? []
    );
  }, [photos, report?.photos]);

  useEffect(() => {
    if (onChange) {
      onChange({
        toAdd: newPhotos,
        toDelete,
        toUpdate,
      });
    }
  }, [onChange, toDelete, toUpdate, newPhotos]);

  const onSave = useCallback(async () => {
    if (isAcceleratorReport(report)) {
      if (toDelete.length === 0 && toUpdate.length === 0 && newPhotos.length === 0) {
        setInternalEditing(false);
        return;
      }

      try {
        await batchReportPhotos({
          projectId,
          reportId: report.id,
          photosToUpdate: toUpdate,
          photosToUpload: newPhotos,
          fileIdsToDelete: toDelete.map((photo) => photo.fileId),
        }).unwrap();

        snackbar.toastSuccess(strings.CHANGES_SAVED);
        setInternalEditing(false);
        setNewPhotos([]);
      } catch (error) {
        snackbar.toastError();
      }
    }
  }, [report, toDelete, toUpdate, newPhotos, batchReportPhotos, projectId, setInternalEditing, snackbar]);

  const onCancel = useCallback(() => {
    setInternalEditing(false);
    setPhotos(report?.photos || []);
    setNewPhotos([]);
  }, [report?.photos, setInternalEditing]);

  const deleteNewPhoto = useCallback(
    (index: number) => () => {
      setNewPhotos((_photos) => _photos.filter((_, i) => index !== i));
    },
    []
  );

  const deletePhoto = useCallback(
    (index: number) => () => {
      setPhotos((_photos) => _photos.filter((_, i) => index !== i));
    },
    []
  );

  const updateNewPhoto = useCallback(
    (index: number) => (caption: string | undefined) => {
      setNewPhotos((_photos) => _photos.map((photo, i) => (index === i ? { ...photo, caption } : photo)));
    },
    []
  );

  const updatePhoto = useCallback(
    (index: number) => (caption: string | undefined) => {
      setPhotos((_photos) => _photos.map((photo, i) => (index === i ? { ...photo, caption } : photo)));
    },
    []
  );

  const getImageUrl = useCallback(
    (fileId: number, maxHeight?: number, maxWidth?: number) => {
      if (report) {
        let path = isAcceleratorReport(report)
          ? `/api/v1/accelerator/projects/${projectId}/reports/${report.id}/photos/${fileId}`
          : `/api/v1/funder/reports/${report.reportId}/photos/${fileId}`;

        if (maxHeight !== undefined || maxWidth !== undefined) {
          path += '?';
          if (maxHeight !== undefined) {
            path += `maxHeight=${maxHeight}&`;
          }
          if (maxWidth !== undefined) {
            path += `maxWidth=${maxWidth}`;
          }
        }

        return path;
      } else {
        return '';
      }
    },
    [projectId, report]
  );

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  return (
    <EditableReportBox
      name={funderReportView ? '' : strings.PHOTOS}
      busy={isLoading}
      canEdit={!!canEdit}
      editing={isEditing}
      onEdit={setInternalEditingTrue}
      onCancel={onCancel}
      onSave={() => void onSave()}
      isConsoleView={isConsoleView}
      includeBorder={false}
    >
      {photos.map((photo, idx) => (
        <ExistingPhoto
          key={`photo-${idx}`}
          imageUrl={getImageUrl(photo.fileId, 500, 500)}
          includeBorder={idx < photos.length - 1}
          editing={isEditing}
          caption={photo.caption}
          setCaption={updatePhoto(idx)}
          onDelete={deletePhoto(idx)}
        />
      ))}

      {newPhotos.map((photo, idx) => (
        <NewPhoto key={`photo-${idx}`} photo={photo} setCaption={updateNewPhoto(idx)} onDelete={deleteNewPhoto(idx)} />
      ))}

      {isEditing && (
        <Box width={'100%'} alignItems={'center'}>
          <PhotoDragDrop multipleSelection={true} files={files} setFiles={setFiles} />
        </Box>
      )}
    </EditableReportBox>
  );
};

export default PhotosBox;
