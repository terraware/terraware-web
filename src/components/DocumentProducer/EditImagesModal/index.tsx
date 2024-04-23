import React, { useState } from 'react';

import { Box, Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Textfield } from '@terraware/web-components';

import PageDialog from 'src/components/DocumentProducer/PageDialog';
import {
  selectUpdateVariableValues,
  selectUploadImageValue,
} from 'src/redux/features/documentProducer/values/valuesSelector';
import {
  requestUpdateVariableValues,
  requestUploadImageValue,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ImageVariableWithValues } from 'src/types/documentProducer/Variable';
import {
  DeleteVariableValueOperation,
  Operation,
  UpdateVariableValueOperation,
  VariableValueImageValue,
} from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

import PhotoSelector, { PhotoWithAttributes } from './PhotoSelector';

const useStyles = makeStyles((theme: Theme) => ({
  removePhoto: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: theme.palette.TwClrBgDanger,
  },
  thumbnail: {
    margin: 'auto auto',
    objectFit: 'contain',
    display: 'flex',
    maxWidth: '120px',
    maxHeight: '120px',
  },
}));

export type EditImagesModalProps = {
  variable: ImageVariableWithValues;
  onFinish: () => void;
  onCancel: () => void;
  docId: number;
};

const EditImagesModal = (props: EditImagesModalProps): JSX.Element => {
  const { variable, onFinish, onCancel, docId } = props;
  const theme = useTheme();
  const classes = useStyles();
  const [imagesCopy, setImagesCopy] = useState(variable.values);
  const [deletedImages, setDeletedImages] = useState<VariableValueImageValue[]>();
  const [newImages, setNewImages] = useState<PhotoWithAttributes[]>();
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const [uploadRequestId, setUploadRequestId] = useState<string>('');

  const selector = useAppSelector(selectUpdateVariableValues(requestId));
  const uploadSelector = useAppSelector(selectUploadImageValue(uploadRequestId));

  const handleSave = () => {
    // update old images
    const operations: Operation[] = imagesCopy.map((imageCpy) => {
      const newValue = { type: imageCpy.type, citation: imageCpy.citation, caption: imageCpy.caption };
      const operation: UpdateVariableValueOperation = {
        operation: 'Update',
        valueId: imageCpy.id,
        value: newValue,
        existingValueId: imageCpy.id,
      };
      return operation;
    });

    // upload new imagess
    if (newImages) {
      newImages.forEach((newImage, index) => {
        const upRequest = dispatch(
          requestUploadImageValue({
            variableId: variable.id,
            file: newImage.file,
            caption: newImage.caption,
            citation: newImage.citation,
            docId,
          })
        );

        // set request id with last image request
        if (newImages.length - 1 === index) {
          setUploadRequestId(upRequest.requestId);
        }
      });
    }

    // remove deleted images
    if (deletedImages) {
      const deleteOperations = deletedImages.map((deletedImage) => {
        const operation: DeleteVariableValueOperation = {
          operation: 'Delete',
          valueId: deletedImage.id,
          existingValueId: deletedImage.id,
        };
        return operation;
      });
      operations.push(...deleteOperations);
    }

    const request = dispatch(
      requestUpdateVariableValues({
        operations,
        docId,
      })
    );
    setRequestId(request.requestId);
  };

  const onUpdateImage = (newImage: VariableValueImageValue) => {
    if (imagesCopy) {
      const newImagesCopy = [...imagesCopy];
      const updatedImageIndex = imagesCopy.findIndex((iImage) => iImage.id === newImage.id);
      newImagesCopy[updatedImageIndex] = newImage;
      setImagesCopy(newImagesCopy);
    }
  };

  const onFilesChanged = (addedImages: PhotoWithAttributes[]) => {
    setNewImages(addedImages);
  };

  const removeFileAtIndex = (index: number) => {
    const newImagesCopy = [...imagesCopy];
    const deleted = newImagesCopy.splice(index, 1);
    setImagesCopy(newImagesCopy);
    setDeletedImages((prev) => {
      if (prev) {
        return [...prev, ...deleted];
      }
      return deleted;
    });
  };

  const onCloseHandler = () => {
    setUploadRequestId('');
    setRequestId('');
    onCancel();
  };

  return (
    <PageDialog
      workflowState={uploadRequestId ? uploadSelector : requestId ? selector : undefined}
      onSuccess={onFinish}
      onClose={onCloseHandler}
      open={true}
      title={strings.VARIABLE_DETAILS}
      size='large'
      scrolled={true}
      middleButtons={[
        <Button
          id='edit-images-cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCancel}
          key='button-1'
        />,
        <Button id='edit-images-save' label={strings.SAVE} onClick={handleSave} key='button-2' />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <Textfield label={strings.NAME} type='text' id='name' value={variable.name} display={true} />
        </Grid>
        <Grid item xs={12}>
          <Textfield
            label={strings.DESCRIPTION}
            type='text'
            id='description'
            value={variable.description}
            display={true}
          />
        </Grid>
        {(variable.isList || (!variable.isList && newImages?.length === 0)) &&
          imagesCopy.map((image, index) => (
            <Box key={`image-${index}`} display='flex' padding={theme.spacing(2, 3)} width='100%'>
              <Box
                position='relative'
                height={122}
                width={122}
                marginLeft={theme.spacing(3)}
                marginTop={theme.spacing(1)}
                border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
              >
                <Button
                  icon='iconTrashCan'
                  onClick={() => removeFileAtIndex(index)}
                  size='small'
                  className={classes.removePhoto}
                />
                <img
                  height='120px'
                  src={getImagePath(docId, image.id, 120, 120)}
                  className={classes.thumbnail}
                  alt='doc'
                />
              </Box>
              <Box paddingLeft={theme.spacing(3)} width='100%'>
                <Grid>
                  <Textfield
                    type='text'
                    label={strings.CAPTION}
                    id='citation'
                    value={image.caption}
                    onChange={(newValue) => onUpdateImage({ ...image, caption: newValue as string })}
                  />
                </Grid>
                <Grid paddingTop={theme.spacing(2)}>
                  <Textfield
                    type='text'
                    label={strings.CITATION}
                    id='citation'
                    value={image.citation}
                    onChange={(newValue) => onUpdateImage({ ...image, citation: newValue as string })}
                  />
                </Grid>
              </Box>
            </Box>
          ))}
        <Grid item xs={12}>
          <PhotoSelector onPhotosChanged={onFilesChanged} multipleSelection={variable.isList} />
        </Grid>
      </Grid>
    </PageDialog>
  );
};

export default EditImagesModal;
