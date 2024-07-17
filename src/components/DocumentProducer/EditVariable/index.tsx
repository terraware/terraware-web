import React, { useCallback, useState } from 'react';

import { Grid } from '@mui/material';
import { Button } from '@terraware/web-components';

import PageDialog from 'src/components/DocumentProducer/PageDialog';
import VariableDetailsInput from 'src/components/DocumentProducer/VariableDetailsInput';
import {
  selectGetVariableValues,
  selectUpdateVariableValues,
} from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectGetVariable } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Variable } from 'src/types/documentProducer/Variable';
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

export type EditVariableProps = {
  onFinish: (edited: boolean) => void;
  manifestId: number;
  projectId: number;
  variableId: number;
  sectionsUsed?: string[];
  onSectionClicked?: (sectionNumber: string) => void;
};

const EditVariable = (props: EditVariableProps): JSX.Element => {
  const { onFinish, projectId, variableId, sectionsUsed, onSectionClicked } = props;

  const dispatch = useAppDispatch();

  const [validate, setValidate] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');
  const [variable, setVariable] = useState<Variable>();
  const [values, setValues] = useState<VariableValueValue[]>();
  const [removedValues, setRemovedValues] = useState<VariableValueValue[]>();

  const selector = useAppSelector((state) => selectGetVariable(state, variableId));
  const valuesSelector = useAppSelector((state) => selectGetVariableValues(state, projectId, variableId));

  useSelectorProcessor(selector, setVariable);
  useSelectorProcessor(valuesSelector, setValues);

  const results = useAppSelector(selectUpdateVariableValues(requestId));

  const save = () => {
    setValidate(true);
    if (hasErrors) {
      return;
    }
    if (variable && variableId) {
      if (values?.length) {
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
            setRequestId(request.requestId);
          } else {
            const request = dispatch(
              requestUpdateVariableValues({
                operations: [{ operation: 'Append', variableId, value: newValue }],
                projectId: projectId,
              })
            );
            setRequestId(request.requestId);
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
              operations.push({ operation: 'Append', variableId, value: nV });
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
              projectId,
            })
          );
          setRequestId(request.requestId);
        }
      }
    }
  };

  const onCancel = useCallback(() => {
    setRequestId('');
    onFinish(false);
  }, []);

  const onSuccess = useCallback(() => {
    onFinish(true);
  }, [onFinish]);

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
    <PageDialog
      workflowState={requestId ? results : undefined}
      onSuccess={onSuccess}
      onClose={onCancel}
      open={true}
      title={strings.VARIABLE_DETAILS}
      size='medium'
      middleButtons={[
        <Button
          id='edit-variable-cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCancel}
          key='button-1'
        />,
        <Button id='edit-variable-save' label={strings.SAVE} onClick={save} key='button-2' />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <VariableDetailsInput
            values={values}
            setValues={(newValues: VariableValueValue[]) => setValues(newValues)}
            validate={validate}
            setHasErrors={(newValue: boolean) => setHasErrors(newValue)}
            variable={variable}
            addRemovedValue={onAddRemovedValue}
            sectionsUsed={sectionsUsed}
            onSectionClicked={onSectionClicked}
          />
        </Grid>
      </Grid>
    </PageDialog>
  );
};

export default EditVariable;
