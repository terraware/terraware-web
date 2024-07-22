import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DialogBox, DropdownItem, Message } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import { Crumb } from 'src/components/BreadCrumbs';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps } from 'src/components/DeliverableView/types';
import DeliverableDisplayVariableValue from 'src/components/DocumentProducer/DeliverableDisplayVariableValue';
import DeliverableVariableDetailsInput from 'src/components/DocumentProducer/DeliverableVariableDetailsInput';
import { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import { VariableTableCell } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useProjectVariablesUpdate } from 'src/hooks/useProjectVariablesUpdate';
import { useLocalization } from 'src/providers';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { requestListDeliverableVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import {
  selectDeliverableVariablesWithValues,
  selectUpdateVariableWorkflowDetails,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestListDeliverableVariables,
  requestUpdateVariableWorkflowDetails,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue, VariableValueImageValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import ApprovedDeliverableMessage from './ApprovedDeliverableMessage';
import RejectDialog from './RejectDialog';
import RejectedDeliverableMessage from './RejectedDeliverableMessage';
import VariableInternalComment from './VariableInternalComment';
import VariableStatusBadge from './VariableStatusBadge';

export type Props = EditProps & {
  isBusy?: boolean;
  showRejectDialog: () => void;
};

const QuestionBox = ({
  variable,
  projectId,
  index,
  reload,
}: {
  variable: VariableWithValues;
  projectId: number;
  index: number;
  reload: () => void;
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

  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);
  const [displayActions, setDisplyActions] = useState(false);
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

  const [modalFeedback, setModalFeedback] = useState(firstVariableValue?.feedback || '');

  useEffect(() => {
    if (updateVariableValueSuccess) {
      reload();
    }
  }, [updateVariableValueSuccess]);

  useEffect(() => {
    if (approveWorkflowDetailsResponse) {
      reload();
      snackbar.toastSuccess(strings.ANSWER_APPROVED);
    }
  }, [approveWorkflowDetailsResponse]);

  useEffect(() => {
    if (rejectWorkflowDetailsResponse) {
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
    setStatus('Rejected', feedback);
  };

  const approveItem = () => {
    setStatus('Approved');
  };

  const onEditItem = () => {
    setEditing(true);
  };

  const onUpdateInternalComment = (internalComment: string) => {
    const currentStatus: VariableStatusType = firstVariableValueStatus || 'Not Submitted';
    setStatus(currentStatus, undefined, internalComment);
  };

  const onSave = () => {
    if (pendingVariableValues.size === 0) {
      return;
    }

    update();

    setEditing(false);
  };

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'needs_translation': {
          setStatus('Needs Translation');
          break;
        }
        case 'not_needed': {
          setStatus('Not Needed');
          break;
        }
      }
    },
    [setStatus]
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
              onClick={() => setStatus('Rejected', modalFeedback)}
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
      <Box key={`question-${index}`}>
        {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectItem} />}
        <Box
          sx={{
            marginBottom: theme.spacing(4),
            '&:hover': {
              background: theme.palette.TwClrBgHover,
              '.actions': {
                display: 'block',
              },
            },
            background: displayActions ? theme.palette.TwClrBgHover : 'none',
            '& .actions': {
              display: displayActions ? 'block' : 'none',
            },
            padding: 2,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              float: 'right',
              marginBottom: '16px',
              marginLeft: '16px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <VariableStatusBadge status={firstVariableValueStatus} />
            <Box className='actions'>
              {!editing && (
                <Button
                  id='edit'
                  label={strings.EDIT}
                  onClick={onEditItem}
                  icon='iconEdit'
                  priority='secondary'
                  className='edit-button'
                  size='small'
                  type='passive'
                />
              )}
              <Button
                label={strings.REJECT_ACTION}
                onClick={() => setShowRejectDialog(true)}
                priority='secondary'
                type='destructive'
                disabled={firstVariableValueStatus === 'Rejected'}
              />
              <Button
                label={strings.APPROVE}
                onClick={approveItem}
                priority='secondary'
                disabled={firstVariableValueStatus === 'Approved'}
              />
              <OptionsMenu
                onOptionItemClick={onOptionItemClick}
                optionItems={optionItems}
                onOpen={() => setDisplyActions(true)}
                onClose={() => setDisplyActions(false)}
              />
            </Box>
          </Box>

          <Typography sx={{ fontWeight: '600', marginBottom: '16px' }}>{variable.name}</Typography>

          {!!variable.description && (
            <Typography
              sx={{
                color: 'rgba(0, 0, 0, 0.54)',
                fontSize: '14px',
                fontStyle: 'italic',
                lineHeight: '20px',
                marginBottom: '16px',
              }}
            >
              {variable.description}
            </Typography>
          )}

          <VariableInternalComment variable={variable} update={onUpdateInternalComment} editing={editing} />

          {editing && (
            <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
              <Grid item xs={12}></Grid>
              <Grid item xs={12}>
                <DeliverableVariableDetailsInput
                  values={variable.values}
                  setValues={(newValues: VariableValueValue[]) => setValues(variable.id, newValues)}
                  variable={variable}
                  addRemovedValue={(removedValue: VariableValueValue) => setRemovedValue(variable.id, removedValue)}
                  setCellValues={(newValues: VariableTableCell[][]) => setCellValues(variable.id, newValues)}
                  setDeletedImages={(newValues: VariableValueImageValue[]) => setDeletedImages(variable.id, newValues)}
                  setImages={(newValues: VariableValueImageValue[]) => setImages(variable.id, newValues)}
                  setNewImages={(newValues: PhotoWithAttributes[]) => setNewImages(variable.id, newValues)}
                  projectId={projectId}
                />
              </Grid>
            </Grid>
          )}

          {firstVariableValue?.feedback && (
            <Box marginBottom={theme.spacing(2)} display='flex' alignItems='center'>
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
                onClick={() => setEditing(false)}
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

const QuestionsDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: Props = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { deliverableId, projectId } = useDeliverableData();
  const dispatch = useAppDispatch();

  const reload = () => {
    void dispatch(requestListDeliverableVariables(deliverableId));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId, projectId }));
  };

  useEffect(() => {
    if (!(deliverableId && projectId)) {
      return;
    }

    void dispatch(requestListDeliverableVariables(deliverableId));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId, projectId }));
  }, [deliverableId, projectId]);

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverableId, projectId)
  );

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.ACCELERATOR_DELIVERABLES,
      },
    ],
    [activeLocale]
  );

  if (isMobile) {
    return <MobileMessage {...viewProps} />;
  }

  return (
    <>
      {/* TODO: render modals for Q&A items here? (Reject Answer, Edit Rejection Feedback, Edit Comments) */}

      <Page crumbs={crumbs} rightComponent={viewProps.callToAction} title={<TitleBar {...viewProps} />}>
        {props.isBusy && <BusySpinner />}
        <Box display='flex' flexDirection='column' flexGrow={1}>
          <ApprovedDeliverableMessage {...viewProps} />
          <RejectedDeliverableMessage {...viewProps} />
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            <Metadata {...viewProps} />
            {variablesWithValues.map((variableWithValues: VariableWithValues, index: number) => {
              return (
                <QuestionBox
                  variable={variableWithValues}
                  projectId={projectId}
                  index={index}
                  key={index}
                  reload={reload}
                />
              );
            })}
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default QuestionsDeliverableView;
