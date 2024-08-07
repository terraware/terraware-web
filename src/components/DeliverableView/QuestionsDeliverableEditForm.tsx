import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

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
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue, VariableValueImageValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import useQuery from 'src/utils/useQuery';

import VariableStatusBadge from '../Variables/VariableStatusBadge';
import { EditProps } from './types';

type QuestionBoxProps = {
  addRemovedValue: (value: VariableValueValue) => void;
  hideStatusBadge?: boolean;
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
  hideStatusBadge,
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

  const firstVariableValue: VariableValue | undefined = (variable?.variableValues || [])[0];
  const firstVariableValueStatus: VariableStatusType | undefined = firstVariableValue?.status;

  return (
    <Box key={index} data-variable-id={variable.id}>
      <Grid container spacing={2} sx={{ marginBottom: '16px', padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-apart',
              width: '100%',
            }}
          >
            <Typography sx={{ fontWeight: '600' }}>{variable.name}</Typography>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ marginLeft: '16px' }}>
                {hideStatusBadge !== true && <VariableStatusBadge status={firstVariableValueStatus} />}
              </Box>
            </Box>
          </Box>
        </Grid>

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

type QuestionsDeliverableEditViewProps = EditProps & {
  exit: () => void;
};

const QuestionsDeliverableEditForm = (props: QuestionsDeliverableEditViewProps): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const query = useQuery();

  const { deliverable, exit, hideStatusBadge } = props;

  const scrollToVariable = useCallback((variableId: string) => {
    const element = document.querySelector(`[data-variable-id="${variableId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
    void dispatch(
      requestListDeliverableVariablesValues({ deliverableId: deliverable.id, projectId: deliverable.projectId })
    );
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
          <Metadata {...props} />
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
                hideStatusBadge={hideStatusBadge}
                index={index}
                key={index}
                pendingVariableValues={pendingVariableValues}
                projectId={deliverable.projectId}
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
  );
};

export default QuestionsDeliverableEditForm;
