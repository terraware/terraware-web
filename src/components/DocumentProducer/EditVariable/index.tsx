import React, { useCallback, useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import { Button } from '@terraware/web-components';

import PageDialog from 'src/components/DocumentProducer/PageDialog';
import VariableDetailsInput from 'src/components/DocumentProducer/VariableDetailsInput';
import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UpdateVariableWorkflowDetailsPayload, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  NewDateValuePayload,
  NewLinkValuePayload,
  NewNumberValuePayload,
  NewSelectValuePayload,
  NewTextValuePayload,
  Operation,
  VariableValue,
  VariableValueDateValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';

export type EditVariableProps = {
  display?: boolean;
  onFinish: (edited: boolean) => void;
  projectId: number;
  variable: VariableWithValues;
  sectionsUsed?: string[];
  onSectionClicked?: (sectionNumber: string) => void;
  updateVariableWorkflowDetails?: (payload: UpdateVariableWorkflowDetailsPayload, variableId: number) => void;
};

const EditVariable = (props: EditVariableProps): JSX.Element => {
  const {
    display: displayProp = false,
    onFinish,
    onSectionClicked,
    projectId,
    sectionsUsed,
    updateVariableWorkflowDetails,
    variable,
  } = props;

  const dispatch = useAppDispatch();

  const variableValues = variable?.variableValues || [];

  // For section variables, multiple variableValues are returned, so we need to find the one with the current ID
  let variableValue: VariableValue | undefined;
  if (variable.type === 'Section') {
    variableValue = (variable?.variableValues || []).find((value) => value.variableId === variable.id);
  } else {
    variableValue = variableValues[0];
  }

  const [variableWorkflowDetails, setVariableWorkflowDetails] = useState<UpdateVariableWorkflowDetailsPayload>({
    feedback: variableValue?.feedback,
    internalComment: variableValue?.internalComment,
    status: variableValue?.status || 'Not Submitted',
  });

  const [display, setDisplay] = useState<boolean>(displayProp);
  const [validate, setValidate] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [updateVariableValuesRequestId, setUpdateVariableValuesRequestId] = useState<string>('');
  const [values, setValues] = useState<VariableValueValue[]>(variable.values);
  const [removedValues, setRemovedValues] = useState<VariableValueValue[]>();

  const updateVariableValueRequest = useAppSelector(selectUpdateVariableValues(updateVariableValuesRequestId));

  const [updateVariableWorkflowDetailsRequestId, setUpdateVariableWorkflowDetailsRequestId] = useState<string>('');
  const updateVariableWorkflowDetailsRequest = useAppSelector(
    selectUpdateVariableWorkflowDetails(updateVariableWorkflowDetailsRequestId)
  );

  useEffect(() => {
    if (updateVariableValueRequest?.status === 'success' && !updateVariableWorkflowDetailsRequestId) {
      const requestId = updateVariableWorkflowDetails?.(variableWorkflowDetails, variable.id);
      if (requestId) {
        setUpdateVariableWorkflowDetailsRequestId(requestId);
      }
    }
  }, [updateVariableValueRequest, updateVariableWorkflowDetailsRequestId, variableWorkflowDetails]);

  const save = () => {
    setValidate(true);
    if (hasErrors || !variable) {
      return;
    }

    if (values.length) {
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
          setUpdateVariableValuesRequestId(request.requestId);
        } else {
          const request = dispatch(
            requestUpdateVariableValues({
              operations: [{ operation: 'Append', variableId: variable.id, value: newValue }],
              projectId: projectId,
            })
          );
          setUpdateVariableValuesRequestId(request.requestId);
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
            projectId,
          })
        );
        setUpdateVariableValuesRequestId(request.requestId);
      }
    }
  };

  const onCancel = useCallback(() => {
    setUpdateVariableValuesRequestId('');
    setUpdateVariableWorkflowDetailsRequestId('');
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
      workflowState={
        updateVariableValueRequest?.status === 'success'
          ? updateVariableWorkflowDetailsRequest
          : updateVariableValueRequest
      }
      onSuccess={onSuccess}
      onClose={onCancel}
      open={true}
      title={strings.VARIABLE_DETAILS}
      scrolled
      size='medium'
      middleButtons={
        display
          ? undefined
          : [
              <Button
                id='edit-variable-cancel'
                label={strings.CANCEL}
                priority='secondary'
                type='passive'
                onClick={onCancel}
                key='button-1'
              />,
              <Button id='edit-variable-save' label={strings.SAVE} onClick={save} key='button-2' />,
            ]
      }
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12} sx={{ position: 'relative' }}>
          {display && (
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

          <VariableDetailsInput
            display={display}
            values={values}
            setValues={(newValues: VariableValueValue[]) => setValues(newValues)}
            validate={validate}
            setHasErrors={(newValue: boolean) => setHasErrors(newValue)}
            variable={variable}
            addRemovedValue={onAddRemovedValue}
            sectionsUsed={sectionsUsed}
            onSectionClicked={onSectionClicked}
            setVariableWorkflowDetails={setVariableWorkflowDetails}
            variableWorkflowDetails={variableWorkflowDetails}
          />
        </Grid>
      </Grid>
    </PageDialog>
  );
};

export default EditVariable;
