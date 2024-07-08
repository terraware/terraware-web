import React, { useCallback, useEffect } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import Metadata from 'src/components/DeliverableView/Metadata';
import DeliverableVariableDetailsInput from 'src/components/DocumentProducer/DeliverableVariableDetailsInput';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useProjectVariablesUpdate } from 'src/hooks/useProjectVariablesUpdate';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { requestListDeliverableVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListDeliverableVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

const QuestionsDeliverableEditView = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { goToDeliverable } = useNavigateTo();
  const { currentDeliverable: deliverable, deliverableId, projectId } = useDeliverableData();

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverableId, projectId)
  );

  const { pendingVariableValues, setRemovedValue, setValues, update, updateSuccess } = useProjectVariablesUpdate(
    projectId,
    variablesWithValues
  );

  useEffect(() => {
    if (!(deliverableId && projectId)) {
      return;
    }

    void dispatch(requestListDeliverableVariables(deliverableId));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId, projectId }));
  }, [deliverableId, projectId]);

  const goToThisDeliverable = useCallback(() => {
    goToDeliverable(deliverableId, projectId);
  }, [deliverableId, projectId]);

  useEffect(() => {
    if (updateSuccess) {
      goToThisDeliverable();
    }
  }, [goToThisDeliverable, updateSuccess]);

  const handleOnSave = () => {
    if (pendingVariableValues.size === 0) {
      // If the user clicks save but there are no changes, just navigate them back to the deliverable
      goToThisDeliverable();
    }

    update();
  };

  if (!deliverable) {
    return null;
  }

  return (
    <WrappedPageForm
      cancelID={'cancelEditQuestionsDeliverable'}
      onCancel={goToThisDeliverable}
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
                        setRemovedValue(variableWithValues.id, removedValue)
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
