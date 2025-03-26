import { Box, Grid, Typography } from '@mui/material';

import TextField from 'src/components/common/TextField';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { ProjectMetric, StandardMetric, SystemMetric } from 'src/types/AcceleratorReport';

const MetricBox = ({
  editingId,
  hideStatusBadge,
  index,
  projectId,
  reload,
  setEditingId,
  setUpdatePendingId,
  metric,
}: {
  editingId?: number;
  hideStatusBadge?: boolean;
  index: number;
  projectId: number;
  reload: () => void;
  setEditingId: (id: number | undefined) => void;
  setUpdatePendingId: (variableId: number | undefined) => void;
  metric: ProjectMetric | SystemMetric | StandardMetric;
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

  const waitAndReload = useCallback(() => {
    setTimeout(() => reload(), 500);
  }, [reload]);

  const approveCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    waitAndReload();
    snackbar.toastSuccess(strings.ANSWER_APPROVED);
  }, [waitAndReload, snackbar]);

  const rejectCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    waitAndReload();
    snackbar.toastSuccess(strings.UPDATE_REQUESTED);
  }, [waitAndReload, snackbar]);

  const updateCallback = useCallback(() => {
    setUpdatePendingId(variable.id);
    waitAndReload();
  }, [waitAndReload]);

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
    <Box data-metric-id={-1} key={`metric-${metric.name}`} sx={{ scrollMarginTop: '50vh' }}>
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
            <Typography sx={{ fontWeight: '600' }}>{metric.name}</Typography>
          </Box>

          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'flex-end',
            }}
          >
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
              </Box>
            )}
          </Box>
        </Box>

        {!!metric.description && (
          <Typography
            sx={{
              color: 'rgba(0, 0, 0, 0.54)',
              fontSize: '14px',
              fontStyle: 'italic',
              lineHeight: '20px',
              marginY: '16px',
            }}
          >
            {metric.description}
          </Typography>
        )}

        {editing && (
          <Grid container spacing={3} sx={{ marginBottom: '24px', padding: 0 }} textAlign='left'>
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

            {workflowDetails.status === 'Rejected' && (
              <Grid item xs={12}>
                <TextField
                  type='textarea'
                  label={strings.FEEDBACK_SHARED_WITH_PROJECT}
                  id='feedback'
                  onChange={(value) => {
                    onChange('feedback', value as string);
                  }}
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

export default MetricBox;
