import { useCallback, useEffect, useState } from 'react';

import { VariableTableCell } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { Operation, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import useSnackbar from 'src/utils/useSnackbar';

import { makeVariableValueOperations } from './util';

type ProjectVariablesUpdate = {
  pendingVariableValues: Map<number, VariableValueValue[]>;
  setCellValues: (variableId: number, values: VariableTableCell[][]) => void;
  setRemovedValue: (variableId: number, value: VariableValueValue) => void;
  setValues: (variableId: number, values: VariableValueValue[]) => void;
  updateSuccess: boolean;
  update: () => void;
};

export const useProjectVariablesUpdate = (
  projectId: number,
  variablesWithValues: VariableWithValues[]
): ProjectVariablesUpdate => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [pendingCellValues, setPendingCellValues] = useState<Map<number, VariableTableCell[][]>>(new Map());
  const [pendingVariableValues, setPendingVariableValues] = useState<Map<number, VariableValueValue[]>>(new Map());
  const [removedVariableValues, setRemovedVariableValues] = useState<Map<number, VariableValueValue>>(new Map());

  const [updateVariableRequestId, setUpdateVariableRequestId] = useState<string>('');
  const updateResult = useAppSelector(selectUpdateVariableValues(updateVariableRequestId));

  const setValues = (variableId: number, values: VariableValueValue[]) => {
    setPendingVariableValues(new Map(pendingVariableValues).set(variableId, values));
  };

  const setRemovedValue = (variableId: number, value: VariableValueValue) => {
    setRemovedVariableValues(new Map(removedVariableValues).set(variableId, value));
  };

  const setCellValues = (variableId: number, values: VariableTableCell[][]) => {
    setPendingCellValues(new Map(pendingCellValues).set(variableId, values));
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
        ...makeVariableValueOperations(variable, [], pendingValues, removedVariableValues.get(variable.id)),
      ];
    });

    pendingCellValues.forEach((pendingValues, variableId) => {
      const variable = variablesWithValues.find((variableWithValues) => variableWithValues.id === variableId);
      if (!variable) {
        // This is impossible if the form is only displaying variables that were initialized within the hook
        snackbar.toastError(strings.GENERIC_ERROR);
        return;
      }

      operations = [...operations, ...makeVariableValueOperations(variable, pendingValues, [])];
    });

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
    }
  }, [pendingCellValues, pendingVariableValues, projectId, variablesWithValues]);

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
    setRemovedValue,
    setValues,
    updateSuccess: updateResult?.status === 'success',
    update,
  };
};
