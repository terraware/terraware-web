import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { Button, DropdownItem } from '@terraware/web-components';

import PageDialog from 'src/components/DocumentProducer/PageDialog';
import VariableDetailsInput from 'src/components/DocumentProducer/VariableDetailsInput';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { useLocalization, useUser } from 'src/providers';
import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UpdateVariableWorkflowDetailsPayload, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  NewDateValuePayload,
  NewEmailValuePayload,
  NewLinkValuePayload,
  NewNumberValuePayload,
  NewSelectValuePayload,
  NewTextValuePayload,
  Operation,
  VariableValue,
  VariableValueDateValue,
  VariableValueEmailValue,
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
  setUpdateWorkflowRequestId?: (requestId: string) => void;
  showVariableHistory: () => void;
};

const EditVariable = (props: EditVariableProps): JSX.Element => {
  const {
    display: displayProp = false,
    onFinish,
    onSectionClicked,
    projectId,
    sectionsUsed,
    setUpdateWorkflowRequestId,
    showVariableHistory,
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

  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const [display, setDisplay] = useState<boolean>(displayProp);
  const [validate, setValidate] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [updateVariableValuesRequestId, setUpdateVariableValuesRequestId] = useState<string>('');
  const [values, setValues] = useState<VariableValueValue[]>(variable.values);
  const [removedValues, setRemovedValues] = useState<VariableValueValue[]>();

  const updateVariableValuesRequest = useAppSelector(selectUpdateVariableValues(updateVariableValuesRequestId));

  const [updateVariableWorkflowDetailsRequestId, setUpdateVariableWorkflowDetailsRequestId] = useState<string>('');
  const updateVariableWorkflowDetailsRequest = useAppSelector(
    selectUpdateVariableWorkflowDetails(updateVariableWorkflowDetailsRequestId)
  );

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

  const save = () => {
    setValidate(true);
    if (hasErrors || !variable) {
      return;
    }

    if (values.length) {
      let newValue:
        | NewDateValuePayload
        | NewEmailValuePayload
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
            acc.push({ type: 'Text', textValue: nV.textValue, citation: nV.citation });
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
      if (variable.type === 'Email') {
        const firstValue = values[0] as VariableValueEmailValue;
        valueIdToUpdate = firstValue.id;
        newValue = { type: 'Email', emailValue: firstValue.emailValue, citation: firstValue.citation };
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
              projectId,
              updateStatuses: false,
            })
          );
          setUpdateVariableValuesRequestId(request.requestId);
        } else {
          const request = dispatch(
            requestUpdateVariableValues({
              operations: [{ operation: 'Append', variableId: variable.id, value: newValue }],
              projectId,
              updateStatuses: false,
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
            updateStatuses: false,
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
  }, [onFinish]);

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
        updateVariableValuesRequest?.status === 'success'
          ? updateVariableWorkflowDetailsRequest
          : updateVariableValuesRequest
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
                sx={{ float: 'right', marginRight: '0px' }}
                type='passive'
              />
            )}
          </>

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
