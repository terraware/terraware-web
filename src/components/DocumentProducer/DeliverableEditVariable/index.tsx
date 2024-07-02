import React, { useState } from 'react';

import { Grid } from '@mui/material';

import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  NewDateValuePayload,
  NewLinkValuePayload,
  NewNumberValuePayload,
  NewSelectValuePayload,
  NewTextValuePayload,
  Operation,
  VariableValueDateValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';

import DeliverableVariableDetailsInput from '../DeliverableVariableDetailsInput';

export type EditVariableProps = {
  onFinish: (edited: boolean) => void;
  projectId: number;
  variable: VariableWithValues;
};

const DeliverableEditVariable = (props: EditVariableProps): JSX.Element => {
  const { onFinish, projectId, variable } = props;

  const dispatch = useAppDispatch();

  const [validate, setValidate] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [updateVariableRequestId, setUpdateVariableRequestId] = useState<string>('');
  const [values, setValues] = useState<VariableValueValue[]>(variable.values);
  const [removedValues, setRemovedValues] = useState<VariableValueValue[]>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const results = useAppSelector(selectUpdateVariableValues(updateVariableRequestId));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const save = () => {
    setValidate(true);
    if (hasErrors) {
      return;
    }

    if (!values?.length) {
      return;
    }

    let newValue:
      | NewDateValuePayload
      | NewTextValuePayload
      | NewNumberValuePayload
      | NewSelectValuePayload
      | NewLinkValuePayload
      | undefined;
    let newValues: NewTextValuePayload[] = [];
    let valueIdToUpdate = -1;
    if (variable.type === 'Text') {
      const firstValue = values[0] as VariableValueTextValue;
      valueIdToUpdate = firstValue.id;

      newValues = values.reduce((acc: NewTextValuePayload[], nV: VariableValueValue) => {
        if (nV.type === 'Text') {
          acc.push({ type: 'Text', textValue: nV.textValue });
        }
        return acc;
      }, []);
    }
    if (variable.type === 'Number') {
      const firstValue = values[0] as VariableValueNumberValue;
      valueIdToUpdate = firstValue.id;
      newValue = { type: 'Number', numberValue: firstValue.numberValue, citation: firstValue.citation };
    }
    if (variable.type === 'Select') {
      const firstValue = values[0] as VariableValueSelectValue;
      valueIdToUpdate = firstValue.id;
      newValue = { type: 'Select', optionIds: firstValue.optionValues, citation: firstValue.citation };
    }
    if (variable.type === 'Date') {
      const firstValue = values[0] as VariableValueDateValue;
      valueIdToUpdate = firstValue.id;
      newValue = { type: 'Date', dateValue: firstValue.dateValue, citation: firstValue.citation };
    }
    if (variable.type === 'Link') {
      const firstValue = values[0] as VariableValueLinkValue;
      valueIdToUpdate = firstValue.id;
      newValue = { type: 'Link', url: firstValue.url, citation: firstValue.citation, title: firstValue.title };
    }
    if (newValue) {
      if (values[0].id !== -1) {
        const request = dispatch(
          requestUpdateVariableValues({
            operations: [
              { operation: 'Update', valueId: valueIdToUpdate, value: newValue, existingValueId: valueIdToUpdate },
            ],
            projectId: projectId,
          })
        );
        setUpdateVariableRequestId(request.requestId);
      } else {
        const request = dispatch(
          requestUpdateVariableValues({
            operations: [{ operation: 'Append', variableId: variable.id, value: newValue }],
            projectId: projectId,
          })
        );
        setUpdateVariableRequestId(request.requestId);
      }
    }
    if (newValues) {
      const operations: Operation[] = [];
      newValues.forEach((nV, index) => {
        if (values[index].id !== -1) {
          operations.push({
            operation: 'Update',
            valueId: values[index].id,
            value: nV,
            existingValueId: values[index].id,
          });
        } else {
          operations.push({ operation: 'Append', variableId: variable.id, value: nV });
        }
      });

      // delete list of values removed
      if (removedValues) {
        removedValues.forEach((rV) => {
          operations.push({
            operation: 'Delete',
            valueId: rV.id,
            existingValueId: rV.id,
          });
        });
      }
      const request = dispatch(
        requestUpdateVariableValues({
          operations,
          projectId: projectId,
        })
      );
      setUpdateVariableRequestId(request.requestId);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onCancel = () => {
    setUpdateVariableRequestId('');
    onFinish(false);
  };

  const onAddRemovedValue = (newRemovedValue: VariableValueValue) => {
    setRemovedValues((prev) => {
      if (prev) {
        return [...prev, newRemovedValue];
      } else {
        return [newRemovedValue];
      }
    });
  };

  return (
    <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
      <Grid item xs={12}>
        <DeliverableVariableDetailsInput
          values={values}
          setValues={(newValues: VariableValueValue[]) => setValues(newValues)}
          validate={validate}
          setHasErrors={(newValue: boolean) => setHasErrors(newValue)}
          variable={variable}
          addRemovedValue={onAddRemovedValue}
        />
      </Grid>
    </Grid>
  );
};

export default DeliverableEditVariable;
