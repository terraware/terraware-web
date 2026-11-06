import { useCallback, useEffect, useMemo, useState } from 'react';

import { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import { VariableTableCell, getInitialCellValues } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import useUploadImageValues from 'src/hooks/variables/useUploadImageValues';
import { useUpdateProjectVariableValuesMutation } from 'src/queries/generated/documentProducerValues';
import strings from 'src/strings';
import { TableVariableWithValues, Variable, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  Operation,
  UploadImageValueRequestPayloadWithProjectId,
  VariableValueImageValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';
import { missingRequiredFields } from 'src/utils/documentProducer/variables';
import useSnackbar from 'src/utils/useSnackbar';

import { makeVariableValueOperations } from './util';

const removeSavedEntries = <T>(current: Map<number, T>, saved: Map<number, T>) =>
  new Map([...current].filter(([id, value]) => !saved.has(id) || saved.get(id) !== value));

type ProjectVariablesUpdate = {
  hasVariableError: boolean;
  missingFields: boolean;
  pendingVariableValues: Map<number, VariableValueValue[]>;
  setCellValues: (variableId: number, values: VariableTableCell[][]) => void;
  setDeletedImages: (variableId: number, values: VariableValueImageValue[]) => void;
  setImages: (variableId: number, values: VariableValueImageValue[]) => void;
  setNewImages: (variableId: number, values: PhotoWithAttributes[]) => void;
  setRemovedValue: (variableId: number, value: VariableValueValue) => void;
  setValues: (variableId: number, values: VariableValueValue[]) => void;
  setVariableHasError: (variableId: number, value: boolean) => void;
  stagedVariableWithValues: VariableWithValues[];
  updateSuccess: boolean;
  uploadSuccess: boolean;
  update: (updateStatuses?: boolean) => boolean;
  updateAsync: (updateStatuses?: boolean) => Promise<{ hasChanges: boolean; succeeded: boolean }>;
};

export const useProjectVariablesUpdate = (
  projectId: number,
  variablesWithValues: VariableWithValues[]
): ProjectVariablesUpdate => {
  const [updateProjectVariableValues, updateResult] = useUpdateProjectVariableValuesMutation();
  const { uploadImageValues, status: uploadStatus } = useUploadImageValues();
  const snackbar = useSnackbar();

  const [pendingCellValues, setPendingCellValues] = useState<Map<number, VariableTableCell[][]>>(new Map());
  const [pendingImages, setPendingImages] = useState<Map<number, VariableValueImageValue[]>>(new Map());
  const [pendingDeletedImages, setPendingDeletedImages] = useState<Map<number, VariableValueImageValue[]>>(new Map());
  const [pendingNewImages, setPendingNewImages] = useState<Map<number, PhotoWithAttributes[]>>(new Map());
  const [pendingVariableValues, setPendingVariableValues] = useState<Map<number, VariableValueValue[]>>(new Map());
  const [displayVariableValues, setDisplayVariableValues] = useState<Map<number, VariableValueValue[]>>(new Map());
  const [displayCellValues, setDisplayCellValues] = useState<Map<number, VariableTableCell[][]>>(new Map());
  const [removedVariableValues, setRemovedVariableValues] = useState<Map<number, VariableValueValue>>(new Map());
  const [variableHasErrorMap, setVariableHasErrorMap] = useState<Map<Variable['id'], boolean>>(new Map());

  const [noOp, setNoOp] = useState(false);

  const setValues = useCallback((variableId: number, values: VariableValueValue[]) => {
    setPendingVariableValues((current) => new Map(current).set(variableId, values));
    setDisplayVariableValues((current) => new Map(current).set(variableId, values));
  }, []);

  const setRemovedValue = useCallback(
    (variableId: number, value: VariableValueValue) => {
      setRemovedVariableValues(new Map(removedVariableValues).set(variableId, value));
    },
    [removedVariableValues]
  );

  const setCellValues = useCallback((variableId: number, values: VariableTableCell[][]) => {
    setPendingCellValues((current) => new Map(current).set(variableId, values));
    setDisplayCellValues((current) => new Map(current).set(variableId, values));
  }, []);

  const setImages = useCallback(
    (variableId: number, values: VariableValueImageValue[]) => {
      setPendingImages(new Map(pendingImages).set(variableId, values));
    },
    [pendingImages]
  );

  const setDeletedImages = useCallback(
    (variableId: number, values: VariableValueImageValue[]) => {
      setPendingDeletedImages(new Map(pendingDeletedImages).set(variableId, values));
    },
    [pendingDeletedImages]
  );

  const setNewImages = useCallback(
    (variableId: number, values: PhotoWithAttributes[]) => {
      setPendingNewImages(new Map(pendingNewImages).set(variableId, values));
    },
    [pendingNewImages]
  );

  const stagedVariableWithValues: VariableWithValues[] = useMemo(() => {
    return variablesWithValues.map((variableWithValues) => {
      const pendingValues = displayVariableValues.get(variableWithValues.id);
      if (pendingValues !== undefined) {
        return { ...variableWithValues, values: pendingValues };
      } else {
        return variableWithValues;
      }
    });
  }, [displayVariableValues, variablesWithValues]);

  const stagedCellValues = useMemo(() => {
    const map = new Map<number, VariableTableCell[][]>();
    variablesWithValues
      .filter((variable): variable is TableVariableWithValues => variable.type === 'Table')
      .forEach((variable) => {
        const initialValues = getInitialCellValues(variable);
        const pendingValues = displayCellValues.get(variable.id);
        if (pendingValues !== undefined) {
          map.set(variable.id, pendingValues);
        } else {
          map.set(variable.id, initialValues);
        }
      });
    return map;
  }, [variablesWithValues, displayCellValues]);

  const missingFields = useMemo(
    () => missingRequiredFields(stagedVariableWithValues, stagedCellValues),
    [stagedVariableWithValues, stagedCellValues]
  );

  const startUpdate = useCallback(
    (updateStatuses?: boolean) => {
      let operations: Operation[] = [];

      if (projectId === -1) {
        // This means the project ID, most likely being populated by a provider looking at
        // the router path, isn't initialized before the update is called
        snackbar.toastError(strings.GENERIC_ERROR);
        return { hasChanges: false, completion: Promise.resolve(false) };
      }

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
      const requests: Promise<boolean>[] = [];
      if (imageValuesToUpload.length > 0) {
        requests.push(
          uploadImageValues(imageValuesToUpload, (image) => {
            const savedImage = pendingNewImages.get(image.variableId)?.find((photo) => photo.file === image.file);
            setPendingNewImages((current) => {
              const remaining = new Map(current);
              const photos = remaining.get(image.variableId)?.filter((photo) => photo !== savedImage);
              if (photos?.length) {
                remaining.set(image.variableId, photos);
              } else {
                remaining.delete(image.variableId);
              }
              return remaining;
            });
          })
        );
      }

      if (operations.length > 0) {
        requests.push(
          updateProjectVariableValues({
            projectId,
            updateVariableValuesRequestPayload: { operations, updateStatuses: updateStatuses ?? true },
          }).then((result) => {
            if ('error' in result) {
              return false;
            }
            setPendingVariableValues((current) => removeSavedEntries(current, pendingVariableValues));
            setPendingCellValues((current) => removeSavedEntries(current, pendingCellValues));
            setPendingImages((current) => removeSavedEntries(current, pendingImages));
            setPendingDeletedImages((current) => removeSavedEntries(current, pendingDeletedImages));
            setRemovedVariableValues((current) => removeSavedEntries(current, removedVariableValues));
            return true;
          })
        );
      } else {
        // if there are no pending changes, set flag to true to fake success & exit
        setNoOp(true);
      }

      return {
        hasChanges: operations.length > 0 || imageValuesToUpload.length > 0,
        completion: Promise.allSettled(requests).then((results) =>
          results.every((result) => result.status === 'fulfilled' && result.value)
        ),
      };
    },
    [
      pendingCellValues,
      pendingDeletedImages,
      pendingImages,
      pendingNewImages,
      pendingVariableValues,
      projectId,
      removedVariableValues,
      snackbar,
      updateProjectVariableValues,
      uploadImageValues,
      variablesWithValues,
    ]
  );

  const update = useCallback((updateStatuses?: boolean) => startUpdate(updateStatuses).hasChanges, [startUpdate]);
  const updateAsync = useCallback(
    async (updateStatuses?: boolean) => {
      const { hasChanges, completion } = startUpdate(updateStatuses);
      return { hasChanges, succeeded: await completion };
    },
    [startUpdate]
  );

  useEffect(() => {
    if (updateResult.isSuccess) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else if (updateResult.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, updateResult.isError, updateResult.isSuccess]);

  const updateSuccess = noOp || updateResult.isSuccess;

  const uploadSuccess = useMemo(
    () => (Object.keys(pendingNewImages).length === 0 ? true : uploadStatus === 'success'),
    [pendingNewImages, uploadStatus]
  );

  // Is there at least one variable with an error
  const hasVariableError = useMemo(() => {
    let hasError = false;
    // With es2015 this becomes a one-liner
    variableHasErrorMap.forEach((_hasError: boolean) => {
      hasError = hasError || _hasError;
    });
    return hasError;
  }, [variableHasErrorMap]);

  const setVariableHasError = useCallback(
    (variableId: number, hasError: boolean) => {
      if (variableHasErrorMap.get(variableId) !== hasError) {
        // Consider using es2015 or above so we can spread iterators and interact with Map a bit better
        const nextVariableHasErrorMap = new Map(variableHasErrorMap).set(variableId, hasError);
        setVariableHasErrorMap(nextVariableHasErrorMap);
      }
    },
    [variableHasErrorMap]
  );

  return useMemo(
    () => ({
      hasVariableError,
      pendingVariableValues: displayVariableValues,
      setCellValues,
      setDeletedImages,
      setImages,
      setNewImages,
      setRemovedValue,
      setValues,
      setVariableHasError,
      stagedVariableWithValues,
      updateSuccess,
      uploadSuccess,
      update,
      updateAsync,
      missingFields,
    }),
    [
      hasVariableError,
      displayVariableValues,
      setCellValues,
      setDeletedImages,
      setImages,
      setNewImages,
      setRemovedValue,
      setValues,
      setVariableHasError,
      stagedVariableWithValues,
      updateSuccess,
      uploadSuccess,
      update,
      updateAsync,
      missingFields,
    ]
  );
};
