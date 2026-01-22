import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import Metadata from 'src/components/DeliverableView/Metadata';
import DeliverableVariableDetailsInput from 'src/components/DocumentProducer/DeliverableVariableDetailsInput';
import { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import { VariableTableCell } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import VariableStatusBadge from 'src/components/Variables/VariableStatusBadge';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import useApplicationPortal from 'src/hooks/useApplicationPortal';
import { useProjectVariablesUpdate } from 'src/hooks/useProjectVariablesUpdate';
import {
  requestListDeliverableVariablesValues,
  requestListSpecificVariablesValues,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import {
  selectDeliverableVariablesWithValues,
  selectSpecificVariablesWithValues,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestListDeliverableVariables,
  requestListSpecificVariables,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue, VariableValueImageValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import {
  getDependingVariablesStableIdsFromOtherDeliverable,
  variableDependencyMet,
} from 'src/utils/documentProducer/variables';
import useQuery from 'src/utils/useQuery';

import { EditProps } from './types';
import useCompleteDeliverable from './useCompleteDeliverable';

type QuestionBoxProps = {
  addRemovedValue: (value: VariableValueValue) => void;
  hideId?: boolean;
  hideStatusBadge?: boolean;
  index: number;
  pendingVariableValues: Map<number, VariableValueValue[]>;
  projectId: number;
  setCellValues?: (values: VariableTableCell[][]) => void;
  setDeletedImages: (values: VariableValueImageValue[]) => void;
  setImages: (values: VariableValueImageValue[]) => void;
  setNewImages: (values: PhotoWithAttributes[]) => void;
  setValues: (values: VariableValueValue[]) => void;
  setVariableHasError: (variableId: number, value: boolean) => void;
  variable: VariableWithValues;
  validateFields: boolean;
};

const QuestionBox = ({
  addRemovedValue,
  hideId,
  hideStatusBadge,
  index,
  projectId,
  pendingVariableValues,
  setCellValues,
  setDeletedImages,
  setImages,
  setNewImages,
  setValues,
  setVariableHasError,
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
            <Box
              sx={{
                alignItems: 'start',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-start',
                flexDirection: 'column',
              }}
            >
              {hideId !== true && (
                <Typography fontSize={'14px'} fontWeight={'400'} lineHeight={'20px'}>
                  {`${strings.ID}#: ${variable.stableId}`}
                </Typography>
              )}
              <Typography
                sx={{ fontWeight: '600' }}
              >{`${variable.deliverableQuestion ?? variable.name} ${variable.isRequired ? '*' : ''}`}</Typography>
            </Box>

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
          {!!firstVariableValue?.feedback && firstVariableValue?.status === 'Rejected' && (
            <Box marginBottom={2}>
              <Message body={firstVariableValue.feedback} priority='critical' type='page' />
            </Box>
          )}
          <DeliverableVariableDetailsInput
            values={pendingValues || variable.values}
            setCellValues={setCellValues}
            setDeletedImages={setDeletedImages}
            setImages={setImages}
            setNewImages={setNewImages}
            setVariableHasError={setVariableHasError}
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
};

const QuestionsDeliverableEditForm = (props: QuestionsDeliverableEditViewProps): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const query = useQuery();
  const { isApplicationPortal } = useApplicationPortal();
  const [dependentVariableStableIds, setDependentVariableStableIds] = useState<string[]>([]);

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

  const dependentVariablesWithValues = useAppSelector((state) =>
    selectSpecificVariablesWithValues(state, dependentVariableStableIds, deliverable.projectId)
  );

  const filteredVariablesWithValues = useMemo(
    () => variablesWithValues.filter((variable) => !variable.internalOnly),
    [variablesWithValues]
  );

  useEffect(() => {
    if (!filteredVariablesWithValues.length) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const scrollToVariableId = query.get('variableId');
      if (scrollToVariableId) {
        scrollToVariable(scrollToVariableId);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filteredVariablesWithValues, query, scrollToVariable]);

  const {
    hasVariableError,
    pendingVariableValues,
    setCellValues,
    setDeletedImages,
    setImages,
    setNewImages,
    setRemovedValue,
    setValues,
    setVariableHasError,
    stagedVariableWithValues,
    update,
    updateSuccess,
    uploadSuccess,
    missingFields,
  } = useProjectVariablesUpdate(deliverable.projectId, filteredVariablesWithValues);

  const { complete, incomplete } = useCompleteDeliverable();

  const allDependentVariablesWithValues = useMemo(
    () =>
      dependentVariablesWithValues
        ? [...dependentVariablesWithValues, ...stagedVariableWithValues]
        : stagedVariableWithValues,
    [stagedVariableWithValues, dependentVariablesWithValues]
  );

  useEffect(() => {
    if (!deliverable) {
      return;
    }

    void dispatch(requestListDeliverableVariables(deliverable.id));
    void dispatch(
      requestListDeliverableVariablesValues({ deliverableId: deliverable.id, projectId: deliverable.projectId })
    );
  }, [deliverable, dispatch]);

  useEffect(() => {
    if (!(deliverable && dependentVariableStableIds && dependentVariableStableIds.length > 0)) {
      return;
    }

    void dispatch(requestListSpecificVariables(dependentVariableStableIds));
    void dispatch(
      requestListSpecificVariablesValues({
        projectId: deliverable.projectId,
        variablesStableIds: dependentVariableStableIds,
      })
    );
  }, [deliverable, dependentVariableStableIds, dispatch]);

  useEffect(() => {
    const ids = getDependingVariablesStableIdsFromOtherDeliverable(variablesWithValues);
    setDependentVariableStableIds(ids);
  }, [variablesWithValues]);

  useEffect(() => {
    if (updateSuccess && uploadSuccess) {
      exit();
    }
  }, [exit, updateSuccess, uploadSuccess]);

  const handleOnSave = useCallback(() => {
    // If Questionnaire Deliverable is part of the Application and all fields are completed, mark deliverable as “Completed”
    if (isApplicationPortal) {
      if (!missingFields) {
        complete(deliverable);
      } else {
        incomplete(deliverable);
      }
    }

    const hasChanges = update();

    if (!hasChanges) {
      // If the user clicks save but there are no changes, just navigate them back to the deliverable
      exit();
      return;
    }
  }, [complete, deliverable, exit, incomplete, isApplicationPortal, missingFields, update]);

  return (
    <WrappedPageForm
      cancelID={'cancelEditQuestionsDeliverable'}
      onCancel={exit}
      onSave={handleOnSave}
      saveID={'saveEditQuestionsDeliverable'}
      saveDisabled={hasVariableError}
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
            {filteredVariablesWithValues.map((variableWithValues: VariableWithValues, index: number) =>
              variableDependencyMet(variableWithValues, allDependentVariablesWithValues) ? (
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
                  setVariableHasError={setVariableHasError}
                  variable={variableWithValues}
                  validateFields={false}
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
