import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
import { getRawValue, variableDependencyMet } from 'src/utils/documentProducer/variables';
import useQuery from 'src/utils/useQuery';

import VariableStatusBadge from '../Variables/VariableStatusBadge';
import { EditProps } from './types';
import useCompleteDeliverable from './useCompleteDeliverable';

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
  validateFields: boolean;
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
  validateFields,
}: QuestionBoxProps): JSX.Element => {
  const pendingValues: VariableValueValue[] | undefined = useMemo(
    () => pendingVariableValues.get(variable.id),
    [pendingVariableValues, variable.id]
  );

  const firstVariableValue: VariableValue | undefined = (variable?.variableValues || [])[0];
  const firstVariableValueStatus: VariableStatusType | undefined = firstVariableValue?.status;

  return (
    <Box key={index} data-variable-id={variable.id}>
      <Grid container spacing={2} sx={{ marginBottom: '32px', padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-apart',
              width: '100%',
            }}
          >
            <Typography sx={{ fontWeight: '600' }}>{variable.deliverableQuestion ?? variable.name}</Typography>

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
            validateFields={validateFields}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

type QuestionsDeliverableEditViewProps = EditProps & {
  exit: () => void;
  isPrescreen?: boolean;
};

const QuestionsDeliverableEditForm = (props: QuestionsDeliverableEditViewProps): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const query = useQuery();

  const { deliverable, exit, hideStatusBadge, isPrescreen } = props;
  const [validateFields, setValidateFields] = useState<boolean>(false);

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

  const { complete } = useCompleteDeliverable();

  const stagedVariableWithValues: VariableWithValues[] = useMemo(() => {
    return variablesWithValues.map((variableWithValues) => {
      const pendingValues = pendingVariableValues.get(variableWithValues.id);
      if (pendingValues !== undefined) {
        return { ...variableWithValues, values: pendingValues };
      } else {
        return variableWithValues;
      }
    });
  }, [pendingVariableValues, variablesWithValues]);

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

  const validateForm = () => {
    const allRequiredVariables = stagedVariableWithValues.filter((v) => v.isRequired);

    const missingRequiredFields = allRequiredVariables.some((variable) => {
      let hasEmptyValue = false;
      const values = variable.values;
      if (!values || values.length === 0 || getRawValue(variable) === undefined || getRawValue(variable) === '') {
        hasEmptyValue = true;
      }
      return hasEmptyValue;
    });

    if (missingRequiredFields) {
      return false;
    }

    return true;
  };

  const handleOnSave = () => {
    if (!validateForm()) {
      setValidateFields(true);
      return;
    }

    // If Questionnaire Deliverable is part of the Application/Pre-screen mark deliverable as “Completed”
    if (isPrescreen) {
      complete(deliverable);
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
            {variablesWithValues.map((variableWithValues: VariableWithValues, index: number) =>
              variableDependencyMet(variableWithValues, stagedVariableWithValues) ? (
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
                  validateFields={validateFields}
                />
              ) : null
            )}
          </Box>
        </Card>
      </Box>
    </WrappedPageForm>
  );
};

export default QuestionsDeliverableEditForm;
