import { useCallback, useEffect, useState } from 'react';

import { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import { VariableTableCell } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import {
  selectUpdateVariableValues,
  selectUploadImageValue,
} from 'src/redux/features/documentProducer/values/valuesSelector';
import {
  requestUpdateVariableValues,
  requestUploadManyImageValues,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  Operation,
  UploadImageValueRequestPayloadWithProjectId,
  VariableValueImageValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';
import useSnackbar from 'src/utils/useSnackbar';

import { makeVariableValueOperations } from './util';

type ProjectVariablesUpdate = {
  pendingVariableValues: Map<number, VariableValueValue[]>;
  setCellValues: (variableId: number, values: VariableTableCell[][]) => void;
  setDeletedImages: (variableId: number, values: VariableValueImageValue[]) => void;
  setImages: (variableId: number, values: VariableValueImageValue[]) => void;
  setNewImages: (variableId: number, values: PhotoWithAttributes[]) => void;
  setRemovedValue: (variableId: number, value: VariableValueValue) => void;
  setValues: (variableId: number, values: VariableValueValue[]) => void;
  updateSuccess: boolean;
  uploadSuccess: boolean;
  update: () => void;
};

export const useProjectVariablesUpdate = (
  projectId: number,
  variablesWithValues: VariableWithValues[]
): ProjectVariablesUpdate => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [pendingCellValues, setPendingCellValues] = useState<Map<number, VariableTableCell[][]>>(new Map());
  const [pendingImages, setPendingImages] = useState<Map<number, VariableValueImageValue[]>>(new Map());
  const [pendingDeletedImages, setPendingDeletedImages] = useState<Map<number, VariableValueImageValue[]>>(new Map());
  const [pendingNewImages, setPendingNewImages] = useState<Map<number, PhotoWithAttributes[]>>(new Map());
  const [pendingVariableValues, setPendingVariableValues] = useState<Map<number, VariableValueValue[]>>(new Map());
  const [removedVariableValues, setRemovedVariableValues] = useState<Map<number, VariableValueValue>>(new Map());

  const [updateVariableRequestId, setUpdateVariableRequestId] = useState<string>('');
  const [uploadRequestId, setUploadRequestId] = useState<string>('');
  const updateResult = useAppSelector(selectUpdateVariableValues(updateVariableRequestId));
  const uploadResult = useAppSelector(selectUploadImageValue(uploadRequestId));

  const [noOp, setNoOp] = useState(false);

  const setValues = (variableId: number, values: VariableValueValue[]) => {
    setPendingVariableValues(new Map(pendingVariableValues).set(variableId, values));
  };

  const setRemovedValue = (variableId: number, value: VariableValueValue) => {
    setRemovedVariableValues(new Map(removedVariableValues).set(variableId, value));
  };

  const setCellValues = (variableId: number, values: VariableTableCell[][]) => {
    setPendingCellValues(new Map(pendingCellValues).set(variableId, values));
  };

  const setImages = (variableId: number, values: VariableValueImageValue[]) => {
    setPendingImages(new Map(pendingImages).set(variableId, values));
  };

  const setDeletedImages = (variableId: number, values: VariableValueImageValue[]) => {
    setPendingDeletedImages(new Map(pendingDeletedImages).set(variableId, values));
  };

  const setNewImages = (variableId: number, values: PhotoWithAttributes[]) => {
    setPendingNewImages(new Map(pendingNewImages).set(variableId, values));
  };

  const update = useCallback(() => {
    let operations: Operation[] = [];

    pendingVariableValues.forEach((pendingValues, variableId) => {
      const variable = variablesWithValues.find((variableWithValues) => variableWithValues.id === variableId);
      if (!variable) {
        // This is impossible if the form is only displaying variables that were initialized within the hook
        snackbar.toastError(strings.GENERIC_ERROR);
        return;
      }

      operations = [
        ...operations,
        ...makeVariableValueOperations({
          pendingValues,
          removedValue: removedVariableValues.get(variable.id),
          variable,
        }),
      ];
    });

    pendingCellValues.forEach((pendingValues, variableId) => {
      const variable = variablesWithValues.find((variableWithValues) => variableWithValues.id === variableId);
      if (!variable) {
        // This is impossible if the form is only displaying variables that were initialized within the hook
        snackbar.toastError(strings.GENERIC_ERROR);
        return;
      }

      operations = [
        ...operations,
        ...makeVariableValueOperations({
          pendingCellValues: pendingValues,
          pendingValues: [],
          variable,
        }),
      ];
    });

    // handle image updates
    pendingImages.forEach((pendingValues) => {
      pendingValues.forEach((image) => {
        const newValue = { type: image.type, citation: image.citation, caption: image.caption };
        operations.push({
          operation: 'Update',
          valueId: image.id,
          value: newValue,
          existingValueId: image.id,
        });
      });
    });

    // handle image deletions
    pendingDeletedImages.forEach((pendingValues) => {
      pendingValues.forEach((deletedImage) => {
        operations.push({
          operation: 'Delete',
          valueId: deletedImage.id,
          existingValueId: deletedImage.id,
        });
      });
    });

    // handle image uploads
    const imageValuesToUpload: UploadImageValueRequestPayloadWithProjectId[] = [];
    pendingNewImages.forEach((pendingValues, variableId) => {
      const variable = variablesWithValues.find((variableWithValues) => variableWithValues.id === variableId);
      if (!variable) {
        // This is impossible if the form is only displaying variables that were initialized within the hook
        snackbar.toastError(strings.GENERIC_ERROR);
        return;
      }

      pendingValues.forEach((newImage) => {
        imageValuesToUpload.push({
          variableId: variable.id,
          file: newImage.file,
          caption: newImage.caption,
          citation: newImage.citation,
          projectId,
        });
      });
    });
    if (imageValuesToUpload.length > 0) {
      const request = dispatch(requestUploadManyImageValues(imageValuesToUpload));
      setUploadRequestId(request.requestId);
    }

    if (projectId === -1) {
      // This means the project ID, most likely being populated by a provider looking at
      // the router path, isn't initialized before the update is called
      snackbar.toastError(strings.GENERIC_ERROR);
    }

    if (operations.length > 0) {
      const request = dispatch(
        requestUpdateVariableValues({
          operations,
          projectId,
        })
      );

      setUpdateVariableRequestId(request.requestId);
    } else {
      // if there are no pending changes, set flag to true to fake success & exit
      setNoOp(true);
    }
  }, [
    pendingCellValues,
    pendingDeletedImages,
    pendingImages,
    pendingNewImages,
    pendingVariableValues,
    projectId,
    removedVariableValues,
    variablesWithValues,
  ]);

  useEffect(() => {
    if (updateResult?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else if (updateResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [projectId, updateResult]);

  return {
    pendingVariableValues,
    setCellValues,
    setDeletedImages,
    setImages,
    setNewImages,
    setRemovedValue,
    setValues,
    updateSuccess: noOp || updateResult?.status === 'success',
    uploadSuccess: Object.keys(pendingNewImages).length === 0 ? true : uploadResult?.status === 'success',
    update,
  };
};
