import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Button, DropdownItem, Textfield } from '@terraware/web-components';

import PageDialog from 'src/components/DocumentProducer/PageDialog';
import VariableWorkflowDetails from 'src/components/DocumentProducer/VariableWorkflowDetails';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { useLocalization, useUser } from 'src/providers';
import {
  selectUpdateVariableValues,
  selectUploadImageValue,
} from 'src/redux/features/documentProducer/values/valuesSelector';
import {
  requestUpdateVariableValues,
  requestUploadImageValue,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ImageVariableWithValues, UpdateVariableWorkflowDetailsPayload } from 'src/types/documentProducer/Variable';
import {
  DeleteVariableValueOperation,
  Operation,
  UpdateVariableValueOperation,
  VariableValue,
  VariableValueImageValue,
} from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

import PhotoSelector, { PhotoWithAttributes } from './PhotoSelector';

export type EditImagesModalProps = {
  display?: boolean;
  variable: ImageVariableWithValues;
  onFinish: (edited: boolean) => void;
  onCancel: () => void;
  projectId: number;
  setUpdateWorkflowRequestId?: (requestId: string) => void;
  showVariableHistory: () => void;
};

const EditImagesModal = (props: EditImagesModalProps): JSX.Element => {
  const {
    display: displayProp = false,
    variable,
    onFinish,
    onCancel,
    projectId,
    setUpdateWorkflowRequestId,
    showVariableHistory,
  } = props;
  const activeLocale = useLocalization();
  const theme = useTheme();
  const [imagesCopy, setImagesCopy] = useState(variable.values);
  const [deletedImages, setDeletedImages] = useState<VariableValueImageValue[]>();
  const [newImages, setNewImages] = useState<PhotoWithAttributes[]>();
  const dispatch = useAppDispatch();
  const [updateVariableValueRequestId, setUpdateVariableValueRequestId] = useState<string>('');
  const [uploadImageRequestId, setUploadImageRequestId] = useState<string>('');
  const { isAllowed } = useUser();
  const [display, setDisplay] = useState<boolean>(displayProp);

  const updateVariableValuesRequest = useAppSelector(selectUpdateVariableValues(updateVariableValueRequestId));
  const uploadImageRequest = useAppSelector(selectUploadImageValue(uploadImageRequestId));

  const [updateVariableWorkflowDetailsRequestId, setUpdateVariableWorkflowDetailsRequestId] = useState<string>('');
  const updateVariableWorkflowDetailsRequest = useAppSelector(
    selectUpdateVariableWorkflowDetails(updateVariableWorkflowDetailsRequestId)
  );

  const variableValue: VariableValue | undefined = (variable?.variableValues || []).find(
    (value) => value.variableId === variable.id
  );

  const [variableWorkflowDetails, setVariableWorkflowDetails] = useState<UpdateVariableWorkflowDetailsPayload>({
    feedback: variableValue?.feedback,
    internalComment: variableValue?.internalComment,
    status: variableValue?.status || 'Not Submitted',
  });

  useEffect(() => {
    if (updateVariableValuesRequest?.status === 'success' && !updateVariableWorkflowDetailsRequestId) {
      const request = dispatch(
        requestUpdateVariableWorkflowDetails({
          feedback: variableWorkflowDetails?.feedback,
          internalComment: variableWorkflowDetails?.internalComment,
          projectId,
          status: variableWorkflowDetails.status,
          variableId: variable.id,
        })
      );
      setUpdateVariableWorkflowDetailsRequestId(request.requestId);
      setUpdateWorkflowRequestId?.(request.requestId);
    }
  }, [
    dispatch,
    projectId,
    setUpdateWorkflowRequestId,
    updateVariableValuesRequest,
    updateVariableWorkflowDetailsRequestId,
    variable.id,
    variableWorkflowDetails,
  ]);

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

    // upload new images
    if (newImages) {
      newImages.forEach((newImage, index) => {
        const upRequest = dispatch(
          requestUploadImageValue({
            variableId: variable.id,
            file: newImage.file,
            caption: newImage.caption,
            citation: newImage.citation,
            projectId,
          })
        );

        // set request id with last image request
        if (newImages.length - 1 === index) {
          setUploadImageRequestId(upRequest.requestId);
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
        projectId,
      })
    );
    setUpdateVariableValueRequestId(request.requestId);
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
    setUploadImageRequestId('');
    setUpdateVariableValueRequestId('');
    onCancel();
  };

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.VIEW_HISTORY,
              value: 'view_history',
            },
          ]
        : [],
    [activeLocale]
  );

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'view_history': {
          showVariableHistory();
          break;
        }
      }
    },
    [showVariableHistory]
  );

  return (
    <PageDialog
      workflowState={
        uploadImageRequestId
          ? uploadImageRequest
          : updateVariableValuesRequest?.status === 'success'
            ? updateVariableWorkflowDetailsRequest
            : updateVariableValuesRequest
      }
      onSuccess={onFinish}
      onClose={onCloseHandler}
      open={true}
      title={strings.VARIABLE_DETAILS}
      size='large'
      scrolled={true}
      middleButtons={
        display
          ? undefined
          : [
              <Button
                id='edit-images-cancel'
                label={strings.CANCEL}
                priority='secondary'
                type='passive'
                onClick={onCancel}
                key='button-1'
              />,
              <Button id='edit-images-save' label={strings.SAVE} onClick={handleSave} key='button-2' />,
            ]
      }
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12} sx={{ position: 'relative' }}>
          <>
            <OptionsMenu
              onOptionItemClick={onOptionItemClick}
              optionItems={optionItems}
              priority='secondary'
              size='small'
              sx={{ float: 'right' }}
              type='passive'
            />
            {display && isAllowed('UPDATE_DELIVERABLE') && (
              <Button
                icon='iconEdit'
                id='edit-variable'
                label={strings.EDIT}
                onClick={() => {
                  setDisplay(false);
                }}
                priority='secondary'
                sx={{ float: 'right' }}
                type='passive'
              />
            )}
          </>
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
        {(variable.isList || (!variable.isList && (!newImages || newImages?.length === 0))) &&
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
                {!display && (
                  <Button
                    icon='iconTrashCan'
                    onClick={() => removeFileAtIndex(index)}
                    size='small'
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: theme.palette.TwClrBgDanger,
                    }}
                  />
                )}

                <img
                  height='120px'
                  src={getImagePath(projectId, image.id, 120, 120)}
                  alt='doc'
                  style={{
                    margin: 'auto auto',
                    objectFit: 'contain',
                    display: 'flex',
                    maxWidth: '120px',
                    maxHeight: '120px',
                  }}
                />
              </Box>
              <Box paddingLeft={theme.spacing(3)} width='100%'>
                <Grid>
                  <Textfield
                    display={display}
                    type='text'
                    label={strings.CAPTION}
                    id='citation'
                    value={image.caption}
                    onChange={
                      display ? undefined : (newValue) => onUpdateImage({ ...image, caption: newValue as string })
                    }
                  />
                </Grid>
                <Grid paddingTop={theme.spacing(2)}>
                  <Textfield
                    display={display}
                    type='text'
                    label={strings.CITATION}
                    id='citation'
                    value={image.citation}
                    onChange={
                      display ? undefined : (newValue) => onUpdateImage({ ...image, citation: newValue as string })
                    }
                  />
                </Grid>
              </Box>
            </Box>
          ))}
        {!display && (
          <Grid item xs={12}>
            <PhotoSelector onPhotosChanged={onFilesChanged} multipleSelection={variable.isList} />
          </Grid>
        )}

        <VariableWorkflowDetails
          display={display}
          setVariableWorkflowDetails={setVariableWorkflowDetails}
          variableWorkflowDetails={variableWorkflowDetails}
        />
      </Grid>
    </PageDialog>
  );
};

export default EditImagesModal;
