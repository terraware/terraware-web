import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem, Message } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import Metadata from 'src/components/DeliverableView/Metadata';
import { EditProps } from 'src/components/DeliverableView/types';
import DeliverableDisplayVariableValue from 'src/components/DocumentProducer/DeliverableDisplayVariableValue';
import DeliverableVariableDetailsInput from 'src/components/DocumentProducer/DeliverableVariableDetailsInput';
import { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import { VariableTableCell } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import VariableStatusBadge from 'src/components/Variables/VariableStatusBadge';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useProjectVariableWorklow } from 'src/hooks/useProjectVariableWorkflow';
import { useProjectVariablesUpdate } from 'src/hooks/useProjectVariablesUpdate';
import { useLocalization } from 'src/providers';
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
import { UpdateVariableWorkflowDetailsPayload, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueImageValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import {
  getDependingVariablesStableIdsFromOtherDeliverable,
  variableDependencyMet,
} from 'src/utils/documentProducer/variables';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import VariableRejectDialog from './RejectDialog';

const QuestionBox = ({
  editingId,
  hideStatusBadge,
  index,
  projectId,
  reload,
  setEditingId,
  setUpdatePendingId,
  variable,
}: {
  editingId?: number;
  hideStatusBadge?: boolean;
  index: number;
  projectId: number;
  reload: () => void;
  setEditingId: (id: number | undefined) => void;
  setUpdatePendingId: (variableId: number | undefined) => void;
  variable: VariableWithValues;
}): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const {
    pendingVariableValues,
    setCellValues,
    setDeletedImages,
    setImages,
    setNewImages,
    setRemovedValue,
    setValues,
    update,
  } = useProjectVariablesUpdate(projectId, [variable]);
  const { isAcceleratorApplicationRoute } = useAcceleratorConsole();
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [displayActions, setDisplayActions] = useState(false);
  const snackbar = useSnackbar();

  const {
    update: updateWorkflow,
    initialStatus,
    initialFeedback,
    initialInternalCommnet,
  } = useProjectVariableWorklow(projectId, variable);

  const [workflowDetails, , onChange] = useForm<UpdateVariableWorkflowDetailsPayload>({
    feedback: initialFeedback,
    internalComment: initialInternalCommnet,
    status: initialStatus,
  });

  const pendingValues: VariableValueValue[] | undefined = useMemo(
    () => pendingVariableValues.get(variable.id),
    [pendingVariableValues, variable.id]
  );

  const editing = useMemo(() => editingId === variable.id, [editingId, variable.id]);

  const onEditItem = useCallback(() => {
    setEditingId(variable.id);
  }, [setEditingId, variable]);

  const approveCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    reload();
    snackbar.toastSuccess(strings.ANSWER_APPROVED);
  }, [reload, snackbar]);

  const rejectCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    reload();
    snackbar.toastSuccess(strings.ANSWER_REJECTED);
  }, [reload, snackbar]);

  const updateCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    reload();
  }, [reload]);

  const approveItem = useCallback(() => {
    updateWorkflow('Approved', undefined, workflowDetails.internalComment, approveCallback);
  }, [workflowDetails, updateWorkflow, approveCallback]);

  const rejectItem = useCallback(
    (feedback: string) => {
      updateWorkflow('Rejected', feedback, workflowDetails.internalComment, rejectCallback);
    },
    [workflowDetails, updateWorkflow, rejectCallback]
  );

  const onSave = useCallback(() => {
    update(false);
    updateWorkflow(workflowDetails.status, workflowDetails.feedback, workflowDetails.internalComment, updateCallback);
  }, [update, updateCallback, updateWorkflow, workflowDetails]);

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'needs_translation': {
          updateWorkflow(
            'Needs Translation',
            workflowDetails.feedback,
            workflowDetails.internalComment,
            updateCallback
          );
          break;
        }
        case 'not_needed': {
          updateWorkflow('Not Needed', workflowDetails.feedback, workflowDetails.internalComment, updateCallback);
          break;
        }
      }
    },
    [workflowDetails, updateCallback, updateWorkflow]
  );

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NEEDS_TRANSLATION) as string,
              value: 'needs_translation',
              disabled: status === 'Needs Translation',
            },
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NOT_NEEDED) as string,
              value: 'not_needed',
              disabled: status === 'Not Needed',
            },
          ]
        : [],
    [activeLocale, status]
  );

  return (
    <>
      <Box data-variable-id={variable.id} key={`question-${index}`} sx={{ scrollMarginTop: '50vh' }}>
        {showRejectDialog && (
          <VariableRejectDialog
            onClose={() => setShowRejectDialog(false)}
            onSubmit={rejectItem}
            initialFeedback={initialFeedback}
          />
        )}
        <Box
          sx={{
            borderRadius: 2,
            '&:hover': {
              background: editing ? theme.palette.TwClrBgActive : theme.palette.TwClrBgHover,
              '.actions': {
                display: 'block',
              },
            },
            background: editing ? theme.palette.TwClrBgActive : displayActions ? theme.palette.TwClrBgHover : 'none',
            '& .actions': {
              display: displayActions ? 'block' : 'none',
            },
            marginBottom: theme.spacing(4),
            padding: 2,
            width: '100%',
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-apart',
              marginBottom: '16px',
              width: '100%',
            }}
          >
            <Typography
              sx={{ fontWeight: '600' }}
            >{`${variable.deliverableQuestion ?? variable.name} ${variable.isRequired ? '*' : ''}`}</Typography>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ margin: '4px', visibility: hideStatusBadge ? 'hidden' : 'visible' }}>
                <VariableStatusBadge status={initialStatus} />
              </Box>
              {!editingId && (
                <Box className='actions'>
                  <Button
                    id='edit'
                    label={strings.EDIT}
                    onClick={onEditItem}
                    icon='iconEdit'
                    priority='secondary'
                    className='edit-button'
                    size='small'
                    sx={{ '&.button': { margin: '4px' } }}
                    type='passive'
                  />
                  {!isAcceleratorApplicationRoute && (
                    <>
                      <Button
                        label={strings.REJECT_ACTION}
                        onClick={() => setShowRejectDialog(true)}
                        priority='secondary'
                        sx={{ '&.button': { margin: '4px' } }}
                        type='destructive'
                        disabled={status === 'Rejected'}
                      />
                      <Button
                        label={strings.APPROVE}
                        onClick={approveItem}
                        priority='secondary'
                        disabled={status === 'Approved'}
                        sx={{ '&.button': { margin: '4px' } }}
                      />
                      <OptionsMenu
                        onOptionItemClick={onOptionItemClick}
                        optionItems={optionItems}
                        onOpen={() => setDisplayActions(true)}
                        onClose={() => setDisplayActions(false)}
                        size='small'
                        sx={{ '& .button': { margin: '4px' }, marginLeft: 0 }}
                      />
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {!!variable.description && (
            <Typography
              sx={{
                color: 'rgba(0, 0, 0, 0.54)',
                fontSize: '14px',
                fontStyle: 'italic',
                lineHeight: '20px',
                marginY: '16px',
              }}
            >
              {variable.description}
            </Typography>
          )}

          {editing && (
            <Grid container spacing={3} sx={{ marginBottom: '24px', padding: 0 }} textAlign='left'>
              <Grid item xs={12}>
                <DeliverableVariableDetailsInput
                  hideDescription
                  values={pendingValues || variable.values}
                  setValues={(newValues: VariableValueValue[]) => setValues(variable.id, newValues)}
                  variable={variable}
                  addRemovedValue={(removedValue: VariableValueValue) => setRemovedValue(variable.id, removedValue)}
                  setCellValues={(newValues: VariableTableCell[][]) => setCellValues(variable.id, newValues)}
                  setDeletedImages={(newValues: VariableValueImageValue[]) => setDeletedImages(variable.id, newValues)}
                  setImages={(newValues: VariableValueImageValue[]) => setImages(variable.id, newValues)}
                  setNewImages={(newValues: PhotoWithAttributes[]) => setNewImages(variable.id, newValues)}
                  projectId={projectId}
                  validateFields={false}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type='textarea'
                  label={strings.INTERNAL_COMMENTS}
                  id='internalComment'
                  onChange={(value) => {
                    onChange('internalComment', value as string);
                  }}
                  sx={{ marginTop: theme.spacing(1) }}
                  value={workflowDetails.internalComment}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type='textarea'
                  label={strings.FEEDBACK}
                  id='feedback'
                  onChange={(value) => {
                    onChange('feedback', value as string);
                  }}
                  sx={{ marginTop: theme.spacing(1) }}
                  value={workflowDetails.feedback}
                />
              </Grid>
            </Grid>
          )}

          <Typography>
            {!editing && <DeliverableDisplayVariableValue projectId={projectId} variable={variable} />}
          </Typography>

          {workflowDetails.internalComment && !editing && (
            <Box marginY={theme.spacing(2)} display='flex' alignItems='center'>
              <Message
                body={
                  <Typography>
                    <span style={{ fontWeight: 600 }}>{strings.INTERNAL_COMMENTS}</span>{' '}
                    {workflowDetails.internalComment}
                  </Typography>
                }
                priority='info'
                type='page'
              />
            </Box>
          )}
          {workflowDetails.feedback && !editing && (
            <Box marginY={theme.spacing(2)} display='flex' alignItems='center'>
              <Message
                body={
                  <Typography>
                    <span style={{ fontWeight: 600 }}>{strings.FEEDBACK}</span> {workflowDetails.feedback}
                  </Typography>
                }
                priority='critical'
                type='page'
              />
            </Box>
          )}

          {editing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                id='cancel'
                label={strings.CANCEL}
                type='passive'
                onClick={() => setEditingId(undefined)}
                priority='secondary'
                key='button-1'
              />
              <Button id={'save'} onClick={onSave} label={strings.SAVE} key='button-2' priority='secondary' />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

const QuestionsDeliverableCard = (props: EditProps): JSX.Element => {
  const { deliverable, hideStatusBadge }: EditProps = props;
  const dispatch = useAppDispatch();

  const [editingId, setEditingId] = useState<number | undefined>();
  const [updatePendingId, setUpdatePendingId] = useState<number | undefined>();
  const [dependentVariableStableIds, setDependentVariableStableIds] = useState<string[]>([]);

  const reload = () => {
    void dispatch(requestListDeliverableVariables(deliverable.id));
    void dispatch(
      requestListDeliverableVariablesValues({ deliverableId: deliverable.id, projectId: deliverable.projectId })
    );
  };

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
  }, [deliverable, dependentVariableStableIds]);

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverable.id, deliverable.projectId)
  );

  useEffect(() => {
    if (variablesWithValues.length && updatePendingId) {
      const element = document.querySelector(`[data-variable-id="${updatePendingId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setUpdatePendingId(undefined);
    }
  }, [variablesWithValues]);

  const dependentVariablesWithValues = useAppSelector((state) =>
    selectSpecificVariablesWithValues(state, dependentVariableStableIds, deliverable.projectId)
  );

  const allDependentVariablesWithValues = useMemo(
    () =>
      dependentVariablesWithValues ? [...dependentVariablesWithValues, ...variablesWithValues] : variablesWithValues,
    [variablesWithValues, dependentVariablesWithValues]
  );

  useEffect(() => {
    const ids = getDependingVariablesStableIdsFromOtherDeliverable(variablesWithValues);
    setDependentVariableStableIds(ids);
  }, [variablesWithValues]);

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      <Metadata {...props} />
      {variablesWithValues.map((variableWithValues: VariableWithValues, index: number) =>
        variableDependencyMet(variableWithValues, allDependentVariablesWithValues) ? (
          <QuestionBox
            editingId={editingId}
            hideStatusBadge={hideStatusBadge}
            index={index}
            key={index}
            projectId={deliverable.projectId}
            reload={reload}
            setEditingId={setEditingId}
            setUpdatePendingId={setUpdatePendingId}
            variable={variableWithValues}
          />
        ) : null
      )}
    </Card>
  );
};

export default QuestionsDeliverableCard;
