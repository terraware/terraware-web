import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import Metadata from 'src/components/DeliverableView/Metadata';
import DeliverableVariableDetailsInput from 'src/components/DocumentProducer/DeliverableVariableDetailsInput';
import { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import { VariableTableCell } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useProjectVariablesUpdate } from 'src/hooks/useProjectVariablesUpdate';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { requestListDeliverableVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListDeliverableVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueImageValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import useQuery from 'src/utils/useQuery';

type QuestionBoxProps = {
  addRemovedValue: (value: VariableValueValue) => void;
  index: number;
  pendingVariableValues: Map<number, VariableValueValue[]>;
  projectId: number;
  setCellValues?: (values: VariableTableCell[][]) => void;
  setDeletedImages: (values: VariableValueImageValue[]) => void;
  setImages: (values: VariableValueImageValue[]) => void;
  setNewImages: (values: PhotoWithAttributes[]) => void;
  setValues: (values: VariableValueValue[]) => void;
  variable: VariableWithValues;
};

const QuestionBox = ({
  addRemovedValue,
  index,
  projectId,
  pendingVariableValues,
  setCellValues,
  setDeletedImages,
  setImages,
  setNewImages,
  setValues,
  variable,
}: QuestionBoxProps): JSX.Element => {
  const pendingValues: VariableValueValue[] | undefined = useMemo(
    () => pendingVariableValues.get(variable.id),
    [pendingVariableValues, variable.id]
  );

  return (
    <Box key={index} data-variable-id={variable.id}>
      {/* <Box sx={{ float: 'right', marginBottom: '16px', marginLeft: '16px' }}>
        <DeliverableStatusBadge status={variable.status} />
      </Box> */}
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <DeliverableVariableDetailsInput
            values={pendingValues || variable.values}
            setCellValues={setCellValues}
            setDeletedImages={setDeletedImages}
            setImages={setImages}
            setNewImages={setNewImages}
            setValues={setValues}
            variable={variable}
            addRemovedValue={addRemovedValue}
            projectId={projectId}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const QuestionsDeliverableEditView = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { goToDeliverable } = useNavigateTo();
  const query = useQuery();
  const { currentDeliverable: deliverable, deliverableId, projectId } = useDeliverableData();

  const scrollToVariable = useCallback((variableId: string) => {
    const element = document.querySelector(`[data-variable-id="${variableId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverableId, projectId)
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
  } = useProjectVariablesUpdate(projectId, variablesWithValues);

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
    if (updateSuccess && uploadSuccess) {
      goToThisDeliverable();
    }
  }, [goToThisDeliverable, updateSuccess, uploadSuccess]);

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
    <TfMain>
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
                <QuestionBox
                  addRemovedValue={(removedValue: VariableValueValue) =>
                    setRemovedValue(variableWithValues.id, removedValue)
                  }
                  index={index}
                  key={index}
                  pendingVariableValues={pendingVariableValues}
                  projectId={projectId}
                  setCellValues={(newValues: VariableTableCell[][]) => setCellValues(variableWithValues.id, newValues)}
                  setDeletedImages={(newValues: VariableValueImageValue[]) =>
                    setDeletedImages(variableWithValues.id, newValues)
                  }
                  setImages={(newValues: VariableValueImageValue[]) => setImages(variableWithValues.id, newValues)}
                  setNewImages={(newValues: PhotoWithAttributes[]) => setNewImages(variableWithValues.id, newValues)}
                  setValues={(newValues: VariableValueValue[]) => setValues(variableWithValues.id, newValues)}
                  variable={variableWithValues}
                />
              ))}
            </Box>
          </Card>
        </Box>
      </WrappedPageForm>
    </TfMain>
  );
};

export default QuestionsDeliverableEditView;
