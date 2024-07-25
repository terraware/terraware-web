import React, { useCallback, useEffect } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import Metadata from 'src/components/DeliverableView/Metadata';
import DeliverableVariableDetailsInput from 'src/components/DocumentProducer/DeliverableVariableDetailsInput';
import { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import { VariableTableCell } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import { useProjectVariablesUpdate } from 'src/hooks/useProjectVariablesUpdate';
import { requestListDeliverableVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListDeliverableVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueImageValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import useQuery from 'src/utils/useQuery';
import { Deliverable } from 'src/types/Deliverables';

type QuestionsDeliverableEditFormProp = {
  deliverable: Deliverable;
  exit: () => void;
}

const QuestionsDeliverableEditForm = ({ deliverable, exit } : QuestionsDeliverableEditFormProp): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const query = useQuery();

  const scrollToVariable = useCallback((variableId: string) => {
    const element = document.querySelector(`[data-variable-id="${variableId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, []);

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverable.id, deliverable.projectId)
  );

  useEffect(() => {
    if (!variablesWithValues.length) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const scrollToVariableId = query.get('variableId');
      if (scrollToVariableId) {
        scrollToVariable(scrollToVariableId);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [variablesWithValues]);

  const {
    pendingVariableValues,
    setCellValues,
    setDeletedImages,
    setImages,
    setNewImages,
    setRemovedValue,
    setValues,
    update,
    updateSuccess,
    uploadSuccess,
  } = useProjectVariablesUpdate(deliverable.projectId, variablesWithValues);

  useEffect(() => {
    if (!deliverable) {
      return;
    }

    void dispatch(requestListDeliverableVariables(deliverable.id));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId: deliverable.id, projectId: deliverable.projectId }));
  }, [deliverable]);

  useEffect(() => {
    if (updateSuccess && uploadSuccess) {
      exit();
    }
  }, [exit, updateSuccess, uploadSuccess]);

  const handleOnSave = () => {
    if (pendingVariableValues.size === 0) {
      // If the user clicks save but there are no changes, just navigate them back to the deliverable
      exit();
    }

    update();
  };

  if (!deliverable) {
    return null;
  }

  return (
    <WrappedPageForm
      cancelID={'cancelEditQuestionsDeliverable'}
      onCancel={exit}
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
              <Box key={index} sx={{ marginBottom: theme.spacing(4) }} data-variable-id={variableWithValues.id}>
                <Box sx={{ float: 'right', marginBottom: '16px', marginLeft: '16px' }}>
                  {/* <DeliverableStatusBadge status={variableWithValues.status} /> */}
                </Box>
                <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
                  <Grid item xs={12}>
                    <DeliverableVariableDetailsInput
                      values={variableWithValues.values}
                      setCellValues={(newValues: VariableTableCell[][]) =>
                        setCellValues(variableWithValues.id, newValues)
                      }
                      setDeletedImages={(newValues: VariableValueImageValue[]) =>
                        setDeletedImages(variableWithValues.id, newValues)
                      }
                      setImages={(newValues: VariableValueImageValue[]) =>
                        setImages(variableWithValues.id, newValues)
                      }
                      setNewImages={(newValues: PhotoWithAttributes[]) =>
                        setNewImages(variableWithValues.id, newValues)
                      }
                      setValues={(newValues: VariableValueValue[]) => setValues(variableWithValues.id, newValues)}
                      variable={variableWithValues}
                      addRemovedValue={(removedValue: VariableValueValue) =>
                        setRemovedValue(variableWithValues.id, removedValue)
                      }
                      projectId={deliverable.projectId}
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

export default QuestionsDeliverableEditForm;
