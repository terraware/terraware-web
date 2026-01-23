import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

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
import { useLocalization, useUser } from 'src/providers';
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

import VariableHistoryModal from '../Variables/VariableHistoryModal';
import VariableInternalComment from '../Variables/VariableInternalComment';
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
    hasVariableError,
    pendingVariableValues,
    setCellValues,
    setDeletedImages,
    setImages,
    setNewImages,
    setRemovedValue,
    setValues,
    setVariableHasError,
    update,
  } = useProjectVariablesUpdate(projectId, [variable]);
  const { isAllowed } = useUser();
  const { isAcceleratorApplicationRoute } = useAcceleratorConsole();
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [showVariableHistoryModal, setShowVariableHistoryModal] = useState<boolean>(false);
  const [displayActions, setDisplayActions] = useState(false);
  const snackbar = useSnackbar();

  const {
    update: updateWorkflow,
    initialStatus,
    initialFeedback,
    initialInternalCommnet,
  } = useProjectVariableWorklow(projectId, variable);

  const [workflowDetails, , , onChangeCallback] = useForm<UpdateVariableWorkflowDetailsPayload>({
    feedback: initialFeedback,
    internalComment: initialInternalCommnet,
    status: initialStatus,
  });

  const pendingValues: VariableValueValue[] | undefined = useMemo(
    () => pendingVariableValues.get(variable.id),
    [pendingVariableValues, variable.id]
  );

  const editing = useMemo(() => editingId === variable.id, [editingId, variable.id]);

  const isAllowedUpdateDeliverable = isAllowed('UPDATE_DELIVERABLE');

  const onEditItem = useCallback(() => {
    setEditingId(variable.id);
  }, [setEditingId, variable]);

  const waitAndReload = useCallback(() => {
    setTimeout(() => reload(), 500);
  }, [reload]);

  const approveCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    waitAndReload();
    snackbar.toastSuccess(strings.ANSWER_APPROVED);
  }, [setUpdatePendingId, variable.id, waitAndReload, snackbar]);

  const rejectCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    waitAndReload();
    snackbar.toastSuccess(strings.UPDATE_REQUESTED);
  }, [setUpdatePendingId, variable.id, waitAndReload, snackbar]);

  const updateCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    waitAndReload();
  }, [setUpdatePendingId, variable.id, waitAndReload]);

  const approveItem = useCallback(() => {
    updateWorkflow('Approved', undefined, workflowDetails.internalComment, approveCallback);
  }, [workflowDetails, updateWorkflow, approveCallback]);

  const rejectItem = useCallback(
    (feedback: string) => {
      updateWorkflow('Rejected', feedback, workflowDetails.internalComment, rejectCallback);
    },
    [workflowDetails, updateWorkflow, rejectCallback]
  );

  const onUpdateInternalComment = useCallback(
    (internalComment: string) => {
      updateWorkflow(workflowDetails.status, workflowDetails.feedback, internalComment, updateCallback);
    },
    [workflowDetails, updateWorkflow, updateCallback]
  );

  const onSave = useCallback(() => {
    update(false);
    updateWorkflow(workflowDetails.status, workflowDetails.feedback, workflowDetails.internalComment, updateCallback);
    setEditingId(undefined);
  }, [setEditingId, update, updateCallback, updateWorkflow, workflowDetails]);

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
        case 'view_history': {
          setShowVariableHistoryModal(true);
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
              disabled: workflowDetails.status === 'Needs Translation',
            },
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NOT_NEEDED) as string,
              value: 'not_needed',
              disabled: workflowDetails.status === 'Not Needed',
            },
            {
              label: strings.VIEW_HISTORY,
              value: 'view_history',
            },
          ]
        : [],
    [activeLocale, workflowDetails.status]
  );

  return (
    <Box data-variable-id={variable.id} key={`question-${index}`} sx={{ scrollMarginTop: '50vh' }}>
      {showRejectDialog && (
        <VariableRejectDialog
          onClose={() => setShowRejectDialog(false)}
          onSubmit={rejectItem}
          initialFeedback={initialFeedback}
        />
      )}
      {showVariableHistoryModal && (
        <VariableHistoryModal
          open={showVariableHistoryModal}
          setOpen={setShowVariableHistoryModal}
          projectId={projectId}
          variableId={variable.id}
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
          <Box
            sx={{
              alignItems: 'start',
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <Typography fontSize={'14px'} fontWeight={'400'} lineHeight={'20px'}>
              {`ID#: ${variable.stableId}`}
            </Typography>
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
            <Box sx={{ margin: '4px', visibility: hideStatusBadge ? 'hidden' : 'visible' }}>
              <VariableStatusBadge status={initialStatus} />
            </Box>
            {!editingId && isAllowedUpdateDeliverable && (
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
                      label={strings.REQUEST_UPDATE_ACTION}
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
                setVariableHasError={setVariableHasError}
                projectId={projectId}
                validateFields={false}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type='textarea'
                label={strings.INTERNAL_COMMENTS}
                id='internalComment'
                onChange={onChangeCallback('internalComment')}
                sx={{ marginTop: theme.spacing(1) }}
                value={workflowDetails.internalComment}
              />
            </Grid>
            {workflowDetails.status === 'Rejected' && (
              <Grid item xs={12}>
                <TextField
                  type='textarea'
                  label={strings.FEEDBACK_SHARED_WITH_PROJECT}
                  id='feedback'
                  onChange={onChangeCallback('feedback')}
                  sx={{ marginTop: theme.spacing(1) }}
                  value={workflowDetails.feedback}
                />
              </Grid>
            )}
          </Grid>
        )}

        {workflowDetails.internalComment && !editing && (
          <VariableInternalComment
            editing={editing}
            sx={{ marginY: theme.spacing(2) }}
            update={onUpdateInternalComment}
            variable={variable}
          />
        )}
        {workflowDetails.status === 'Rejected' && workflowDetails.feedback && !editing && (
          <Box marginY={theme.spacing(2)} display='flex' alignItems='center'>
            <Message
              body={
                <Typography>
                  <span style={{ fontWeight: 600 }}>{strings.FEEDBACK_SHARED_WITH_PROJECT}</span>{' '}
                  {workflowDetails.feedback}
                </Typography>
              }
              priority='critical'
              type='page'
            />
          </Box>
        )}
        <Typography>
          {!editing && <DeliverableDisplayVariableValue projectId={projectId} variable={variable} />}
        </Typography>

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
            <Button
              id={'save'}
              onClick={onSave}
              label={strings.SAVE}
              disabled={hasVariableError}
              key='button-2'
              priority='secondary'
            />
          </Box>
        )}
      </Box>
    </Box>
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
  }, [updatePendingId, variablesWithValues]);

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
