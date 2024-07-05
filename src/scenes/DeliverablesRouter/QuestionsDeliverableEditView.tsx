import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import Metadata from 'src/components/DeliverableView/Metadata';
import DeliverableVariableDetailsInput from 'src/components/DocumentProducer/DeliverableVariableDetailsInput';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import {
  requestListDeliverableVariablesValues,
  requestUpdateVariableValues,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListDeliverableVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
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
import useSnackbar from 'src/utils/useSnackbar';

const QuestionsDeliverableEditView = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { goToDeliverable } = useNavigateTo();
  const { currentDeliverable: deliverable, deliverableId, projectId } = useDeliverableData();

  const [pendingVariableValues, setPendingVariableValues] = useState<Map<number, VariableValueValue[]>>(new Map());
  const [removedVariableValues, setRemovedVariableValues] = useState<Map<number, VariableValueValue>>(new Map());
  const [updateVariableRequestId, setUpdateVariableRequestId] = useState<string>('');

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverableId, projectId)
  );

  useEffect(() => {
    if (!(deliverableId && projectId)) {
      return;
    }

    void dispatch(requestListDeliverableVariables(deliverableId));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId, projectId }));
  }, [deliverableId, projectId]);

  const handleOnCancel = useCallback(() => {
    goToDeliverable(deliverableId, projectId);
  }, [deliverableId, projectId]);

  const results = useAppSelector(selectUpdateVariableValues(updateVariableRequestId));

  useEffect(() => {
    if (!results) {
      return;
    }

    if (results.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      goToDeliverable(deliverableId, projectId);
    } else if (results.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [deliverableId, projectId, results]);

  const handleOnSave = () => {
    if (pendingVariableValues.size === 0) {
      return;
    }

    const operations: Operation[] = [];

    pendingVariableValues.forEach((pendingValues, variableId) => {
      const variable = variablesWithValues.find((variableWithValues) => variableWithValues.id === variableId);
      if (!variable) {
        // TODO figure out error handling for this case
        console.log('Variable not found');
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
        const firstValue = pendingValues[0] as VariableValueTextValue;
        valueIdToUpdate = firstValue.id;

        newValues = pendingValues.reduce((acc: NewTextValuePayload[], nV: VariableValueValue) => {
          if (nV.type === 'Text') {
            acc.push({ type: 'Text', textValue: nV.textValue });
          }
          return acc;
        }, []);
      }

      if (variable.type === 'Number') {
        const firstValue = pendingValues[0] as VariableValueNumberValue;
        valueIdToUpdate = firstValue.id;
        newValue = { type: 'Number', numberValue: firstValue.numberValue, citation: firstValue.citation };
      }

      if (variable.type === 'Select') {
        const firstValue = pendingValues[0] as VariableValueSelectValue;
        valueIdToUpdate = firstValue.id;
        newValue = { type: 'Select', optionIds: firstValue.optionValues, citation: firstValue.citation };
      }

      if (variable.type === 'Date') {
        const firstValue = pendingValues[0] as VariableValueDateValue;
        valueIdToUpdate = firstValue.id;
        newValue = { type: 'Date', dateValue: firstValue.dateValue, citation: firstValue.citation };
      }

      if (variable.type === 'Link') {
        const firstValue = pendingValues[0] as VariableValueLinkValue;
        valueIdToUpdate = firstValue.id;
        newValue = { type: 'Link', url: firstValue.url, citation: firstValue.citation, title: firstValue.title };
      }

      if (newValue) {
        if (pendingValues[0].id !== -1) {
          operations.push({
            operation: 'Update',
            valueId: valueIdToUpdate,
            value: newValue,
            existingValueId: valueIdToUpdate,
          });
        } else {
          operations.push({ operation: 'Append', variableId: variable.id, value: newValue });
        }
      }

      if (newValues) {
        newValues.forEach((nV, index) => {
          if (pendingValues[index].id !== -1) {
            operations.push({
              operation: 'Update',
              valueId: pendingValues[index].id,
              value: nV,
              existingValueId: pendingValues[index].id,
            });
          } else {
            operations.push({ operation: 'Append', variableId: variable.id, value: nV });
          }
        });

        // delete list of values removed
        const removedValue = removedVariableValues.get(variable.id);
        if (removedValue) {
          operations.push({
            operation: 'Delete',
            valueId: removedValue.id,
            existingValueId: removedValue.id,
          });
        }
      }
    });

    if (operations.length > 0) {
      console.log({ operations });
      const request = dispatch(
        requestUpdateVariableValues({
          operations,
          projectId: projectId,
        })
      );
      setUpdateVariableRequestId(request.requestId);
    }
  };

  const setValues = (variableId: number, values: VariableValueValue[]) => {
    setPendingVariableValues(new Map(pendingVariableValues).set(variableId, values));
  };

  const setRemovedValues = (variableId: number, value: VariableValueValue) => {
    setRemovedVariableValues(new Map(removedVariableValues).set(variableId, value));
  };

  if (!deliverable) {
    return null;
  }

  return (
    <WrappedPageForm
      cancelID={'cancelEditQuestionsDeliverable'}
      onCancel={handleOnCancel}
      onSave={handleOnSave}
      saveID={'saveEditQuestionsDeliverable'}
    >
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Metadata deliverable={deliverable} />
          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              marginBottom: theme.spacing(4),
              paddingTop: theme.spacing(3),
            }}
          >
            {variablesWithValues.map((variableWithValues: VariableWithValues, index: number) => (
              <Box key={index} sx={{ marginBottom: theme.spacing(4) }}>
                <Box sx={{ float: 'right', marginBottom: '16px', marginLeft: '16px' }}>
                  {/* <DeliverableStatusBadge status={variableWithValues.status} /> */}
                </Box>
                <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
                  <Grid item xs={12}>
                    <DeliverableVariableDetailsInput
                      values={variableWithValues.values}
                      setValues={(newValues: VariableValueValue[]) => setValues(variableWithValues.id, newValues)}
                      variable={variableWithValues}
                      addRemovedValue={(removedValue: VariableValueValue) =>
                        setRemovedValues(variableWithValues.id, removedValue)
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </WrappedPageForm>
  );
};

export default QuestionsDeliverableEditView;
