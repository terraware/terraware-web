import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, DropdownItem, Message } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import Metadata from 'src/components/DeliverableView/Metadata';
import { EditProps } from 'src/components/DeliverableView/types';
import DeliverableDisplayVariableValue from 'src/components/DocumentProducer/DeliverableDisplayVariableValue';
import DeliverableVariableDetailsInput from 'src/components/DocumentProducer/DeliverableVariableDetailsInput';
import { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import { VariableTableCell } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useProjectVariablesUpdate } from 'src/hooks/useProjectVariablesUpdate';
import { useLocalization } from 'src/providers';
import {
  requestListDeliverableVariablesValues,
  requestListSpecificVariablesValues,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import {
  selectDeliverableVariablesWithValues,
  selectSpecificVariablesWithValues,
  selectUpdateVariableWorkflowDetails,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestListDeliverableVariables,
  requestListSpecificVariables,
  requestUpdateVariableWorkflowDetails,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue, VariableValueImageValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import {
  getDependingVariablesStableIdsFromOtherDeliverable,
  variableDependencyMet,
} from 'src/utils/documentProducer/variables';
import useSnackbar from 'src/utils/useSnackbar';

import VariableInternalComment from '../Variables/VariableInternalComment';
import VariableStatusBadge from '../Variables/VariableStatusBadge';
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
  const dispatch = useAppDispatch();
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
    updateSuccess: updateVariableValueSuccess,
  } = useProjectVariablesUpdate(projectId, [variable]);
  const { isAcceleratorApplicationRoute } = useAcceleratorConsole();
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [displayActions, setDisplayActions] = useState(false);
  const [showEditFeedbackModal, setShowEditFeedbackModal] = useState(false);
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState('');
  const [approvedRequestId, setApprovedRequestId] = useState('');
  const [rejectedRequestId, setRejectedRequestId] = useState('');
  const approveWorkflowDetailsResponse = useAppSelector(selectUpdateVariableWorkflowDetails(approvedRequestId));
  const rejectWorkflowDetailsResponse = useAppSelector(selectUpdateVariableWorkflowDetails(rejectedRequestId));
  const updateWorkflowDetailsResponse = useAppSelector(selectUpdateVariableWorkflowDetails(requestId));

  const firstVariableValue: VariableValue | undefined = (variable?.variableValues || [])[0];
  const firstVariableValueStatus: VariableStatusType | undefined = firstVariableValue?.status;
  const firstVariableValueFeedback: string | undefined = firstVariableValue?.feedback;
  const firstVariableValueInternalComment: string | undefined = firstVariableValue?.internalComment;

  const [modalFeedback, setModalFeedback] = useState(firstVariableValue?.feedback || '');

  const pendingValues: VariableValueValue[] | undefined = useMemo(
    () => pendingVariableValues.get(variable.id),
    [pendingVariableValues, variable.id]
  );

  const editing = useMemo(() => editingId === variable.id, [editingId, variable.id]);

  useEffect(() => {
    if (updateVariableValueSuccess) {
      reload();
    }
  }, [updateVariableValueSuccess]);

  useEffect(() => {
    if (approveWorkflowDetailsResponse?.status === 'success') {
      reload();
      snackbar.toastSuccess(strings.ANSWER_APPROVED);
    }
  }, [approveWorkflowDetailsResponse]);

  useEffect(() => {
    if (rejectWorkflowDetailsResponse?.status === 'success') {
      reload();
      snackbar.toastSuccess(strings.ANSWER_REJECTED);
    }
  }, [rejectWorkflowDetailsResponse]);

  useEffect(() => {
    if (updateWorkflowDetailsResponse?.status === 'success') {
      reload();
    }
  }, [updateWorkflowDetailsResponse]);

  const setStatus = (status: VariableStatusType, feedback?: string, internalComment?: string) => {
    const request = dispatch(
      requestUpdateVariableWorkflowDetails({ status, feedback, internalComment, projectId, variableId: variable.id })
    );
    setUpdatePendingId(variable.id);

    if (!internalComment) {
      if (status === 'Approved') {
        setApprovedRequestId(request.requestId);
      } else if (status === 'Rejected') {
        setRejectedRequestId(request.requestId);
      } else {
        setRequestId(request.requestId);
      }
    } else {
      setRequestId(request.requestId);
    }
  };

  const rejectItem = (feedback: string) => {
    setStatus('Rejected', feedback, firstVariableValueInternalComment);
  };

  const approveItem = () => {
    setStatus('Approved', undefined, firstVariableValueInternalComment);
  };

  const onEditItem = () => {
    setEditingId(variable.id);
  };

  const onUpdateInternalComment = (internalComment: string) => {
    const currentStatus: VariableStatusType = firstVariableValueStatus || 'Not Submitted';
    setStatus(currentStatus, firstVariableValueFeedback, internalComment);
  };

  const onSave = () => {
    setEditingId(undefined);

    update();
  };

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'needs_translation': {
          setStatus('Needs Translation', undefined, firstVariableValueInternalComment);
          break;
        }
        case 'not_needed': {
          setStatus('Not Needed', undefined, firstVariableValueInternalComment);
          break;
        }
      }
    },
    [firstVariableValueInternalComment, setStatus]
  );

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NEEDS_TRANSLATION) as string,
              value: 'needs_translation',
              disabled: firstVariableValueStatus === 'Needs Translation',
            },
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NOT_NEEDED) as string,
              value: 'not_needed',
              disabled: firstVariableValueStatus === 'Not Needed',
            },
          ]
        : [],
    [activeLocale, firstVariableValueStatus]
  );

  return (
    <>
      {showEditFeedbackModal && (
        <DialogBox
          onClose={() => setShowEditFeedbackModal(false)}
          open={showEditFeedbackModal}
          title={strings.REJECT}
          size='large'
          middleButtons={[
            <Button
              id='cancelEditFeedback'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              onClick={() => setShowEditFeedbackModal(false)}
              key='button-1'
            />,
            <Button
              id='updateFeedback'
              label={strings.SAVE}
              onClick={() => setStatus('Rejected', modalFeedback, firstVariableValueInternalComment)}
              key='button-2'
            />,
          ]}
        >
          <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
            <Grid item xs={12}>
              <TextField
                label={''}
                type='textarea'
                id='feedback'
                onChange={(value) => setModalFeedback(value as string)}
                value={modalFeedback}
                preserveNewlines
              />
            </Grid>
          </Grid>
        </DialogBox>
      )}
      <Box data-variable-id={variable.id} key={`question-${index}`} sx={{ scrollMarginTop: '50vh' }}>
        {showRejectDialog && <VariableRejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectItem} />}
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
                <VariableStatusBadge status={firstVariableValueStatus} />
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
                        disabled={firstVariableValueStatus === 'Rejected'}
                      />
                      <Button
                        label={strings.APPROVE}
                        onClick={approveItem}
                        priority='secondary'
                        disabled={firstVariableValueStatus === 'Approved'}
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

          <VariableInternalComment
            editing={editing}
            sx={{ marginY: theme.spacing(2) }}
            update={onUpdateInternalComment}
            variable={variable}
          />

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
            </Grid>
          )}

          {firstVariableValue?.feedback && (
            <Box marginY={theme.spacing(2)} display='flex' alignItems='center'>
              <Message
                body={
                  <Typography>
                    <span style={{ fontWeight: 600 }}>{strings.ANSWER_NOT_ACCEPETED}</span>{' '}
                    {firstVariableValue.feedback}
                    {editing && (
                      <Button
                        icon='iconEdit'
                        onClick={() => setShowEditFeedbackModal(true)}
                        priority='ghost'
                        size='small'
                        type='passive'
                        style={{
                          marginLeft: '-1px',
                          marginTop: '-1px',
                        }}
                      />
                    )}
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
