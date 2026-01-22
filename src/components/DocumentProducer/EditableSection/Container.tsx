import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Button, DialogBox, Textfield, theme } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import VariableHistoryModal from 'src/components/Variables/VariableHistoryModal';
import VariableInternalComment from 'src/components/Variables/VariableInternalComment';
import { useUser } from 'src/providers';
import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateSectionVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesThunks';
import useWorkflowSuccess from 'src/redux/hooks/useWorkflowSuccess';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  NewSectionTextValuePayload,
  NewSectionVariableValuePayload,
  VariableValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';
import { NonUndefined } from 'src/types/utils';
import useSnackbar from 'src/utils/useSnackbar';

import Display from './Display';
import Edit from './Edit';
import EditVariableModal from './EditVariableModal';

type EditableSectionProps = {
  id?: string;
  docId: number;
  projectId: number;
  section: SectionVariableWithValues;
  allVariables: VariableWithValues[];
  onUpdate: () => void;
  onEdit: (editing: boolean) => void;
};

export default function EditableSectionContainer({
  id,
  docId,
  projectId,
  section,
  allVariables,
  onUpdate,
  onEdit,
}: EditableSectionProps): JSX.Element {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [sectionValues, setSectionValues] = useState<VariableValueValue[] | undefined>(section.values);
  const [editSectionValues, setEditSectionValues] = useState<VariableValueValue[] | undefined>(section.values);
  const [variableCitation, setVariableCitation] = useState<string>('');

  const [openEditVariableModal, setOpenEditVariableModal] = useState<boolean>(false);
  const [openVariableHistoryModal, setOpenVariableHistoryModal] = useState<boolean>(false);
  const [openEditCommentModal, setOpenEditCommenteModal] = useState<boolean>(false);
  const [clickedVariable, setClickedVariable] = useState<VariableWithValues>();
  const { isAllowed } = useUser();

  const variableValues = section?.variableValues || [];
  // For section variables, multiple variableValues are returned, so we need to find the one with the current ID
  let variableValue: VariableValue | undefined;
  if (section.type === 'Section') {
    variableValue = (section?.variableValues || []).find((value) => value.variableId === section.id);
  } else {
    variableValue = variableValues[0];
  }

  const [internalComment, setInternalComment] = useState(variableValue?.internalComment || '');

  const [editing, setEditing] = useState(false);
  const [updateVariableValuesRequestId, setUpdateVariableValuesRequestId] = useState<string>('');
  const updateVariableValuesRequest = useAppSelector(selectUpdateVariableValues(updateVariableValuesRequestId));

  const [updateInternalCommentRequestId, setUpdateInternalCommentRequestId] = useState<string>('');
  const updateInternalCommentRequest = useAppSelector(
    selectUpdateVariableWorkflowDetails(updateInternalCommentRequestId)
  );

  const [updateVariableWorkflowDetailsRequestId, setUpdateVariableWorkflowDetailsRequestId] = useState<string>('');
  const updateVariableWorkflowDetailsRequest = useAppSelector(
    selectUpdateVariableWorkflowDetails(updateVariableWorkflowDetailsRequestId)
  );

  useWorkflowSuccess({
    workflowState: updateVariableValuesRequest,
    onSuccess: () => {
      setEditing(false);
      onEdit(false);
      setSectionValues(editSectionValues);
      setUpdateVariableValuesRequestId('');
      setUpdateVariableWorkflowDetailsRequestId('');
      onUpdate();
    },
  });

  useEffect(() => {
    setSectionValues(section.values);
  }, [section.values]);

  const onEditHandler = () => {
    setEditSectionValues(sectionValues);
    setEditing(true);
    onEdit(true);
  };

  const onEditCommentHandler = () => {
    setOpenEditCommenteModal(true);
  };

  const onSaveHandler = useCallback(() => {
    const request = dispatch(
      requestUpdateSectionVariableValues({
        operation: 'Replace',
        variableId: section.id,
        values: (editSectionValues as (NewSectionTextValuePayload | NewSectionVariableValuePayload)[]) ?? [],
        projectId,
      })
    );
    setUpdateVariableValuesRequestId(request.requestId);
  }, [dispatch, projectId, section.id, editSectionValues]);

  const onCancelHandler = () => {
    setEditing(false);
    onEdit(false);

    // reset sectionValues
    setEditSectionValues(sectionValues);
  };

  const onUpdateInternalComment = useCallback(() => {
    const firstVariableValue = section.variableValues[0] || {};
    const status = firstVariableValue?.status || ('Not Submitted' as NonUndefined<VariableValue['status']>);
    const feedback = firstVariableValue?.feedback || '';

    const request = dispatch(
      requestUpdateVariableWorkflowDetails({ status, feedback, internalComment, projectId, variableId: section.id })
    );
    setUpdateInternalCommentRequestId(request.requestId);
    setOpenEditCommenteModal(false);
  }, [section.variableValues, section.id, dispatch, internalComment, projectId]);

  const onEditVariableValue = (variable?: VariableWithValues) => {
    if (variable === undefined) {
      return;
    }
    setClickedVariable(variable);
    setOpenEditVariableModal(true);
  };

  const variableUpdated = useCallback(
    (edited: boolean) => {
      if (edited) {
        onUpdate();
      }
      setOpenEditVariableModal(false);
    },
    [onUpdate]
  );

  useEffect(() => {
    if (updateInternalCommentRequest?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      onUpdate();
    } else if (updateInternalCommentRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, updateInternalCommentRequest, onUpdate]);

  useEffect(() => {
    if (updateVariableWorkflowDetailsRequest?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else if (updateVariableWorkflowDetailsRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, updateVariableWorkflowDetailsRequest]);

  const nameAndDescription = useMemo(() => {
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            fontWeight={section.renderHeading ? 600 : 400}
            fontStyle={section.renderHeading ? '' : 'italic'}
            color={section.renderHeading ? theme.palette.TwClrTxt : theme.palette.TwClrTxtSecondary}
          >
            {section.name}
          </Typography>
        </Box>

        {editing && section.description && (
          <Typography fontSize='14px' fontWeight={400} fontStyle='italic' paddingTop={theme.spacing(2)}>
            {section.description}
          </Typography>
        )}
      </>
    );
  }, [editing, section]);

  return (
    <>
      {openEditCommentModal && (
        <DialogBox
          onClose={() => setOpenEditCommenteModal(false)}
          open={openEditCommentModal}
          title={strings.INTERNAL_COMMENTS}
          size='large'
          middleButtons={[
            <Button
              id='cancelEditInternalComment'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              onClick={() => setOpenEditCommenteModal(false)}
              key='button-1'
            />,
            <Button
              id='updateInternalComment'
              label={strings.SAVE}
              onClick={() => onUpdateInternalComment()}
              key='button-2'
            />,
          ]}
        >
          <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
            <Grid item xs={12}>
              <TextField
                label={''}
                type='textarea'
                id='internalComment'
                onChange={(value) => setInternalComment(value as string)}
                value={internalComment}
                preserveNewlines
              />
            </Grid>
          </Grid>
        </DialogBox>
      )}
      {openVariableHistoryModal && clickedVariable && (
        <VariableHistoryModal
          open={openVariableHistoryModal}
          setOpen={setOpenVariableHistoryModal}
          projectId={projectId}
          variableId={clickedVariable.id}
        />
      )}
      {openEditVariableModal && clickedVariable && (
        <EditVariableModal
          display={!editing}
          onCancel={() => setOpenEditVariableModal(false)}
          onFinish={variableUpdated}
          projectId={projectId}
          setUpdateWorkflowRequestId={setUpdateVariableWorkflowDetailsRequestId}
          showVariableHistory={() => setOpenVariableHistoryModal(true)}
          variable={clickedVariable}
        />
      )}

      {editing ? (
        <Box
          id={id}
          sx={{
            background: theme.palette.TwClrBgActive,
            padding: theme.spacing(2),
            borderRadius: '16px',
          }}
        >
          <Box
            sx={{
              marginBottom: theme.spacing(2),
            }}
          >
            <VariableInternalComment editing={false} update={onUpdateInternalComment} variable={section} />
          </Box>

          {nameAndDescription}

          <Edit
            section={section}
            sectionValues={sectionValues}
            setSectionValues={setEditSectionValues}
            allVariables={allVariables}
            docId={docId}
            onEditVariableValue={onEditVariableValue}
          />

          <Grid paddingTop={theme.spacing(2)}>
            <Textfield
              type='text'
              label={strings.CITATION}
              id='citation'
              value={variableCitation}
              onChange={(newValue) => setVariableCitation(newValue as string)}
            />
          </Grid>
          <Box sx={{ paddingTop: theme.spacing(3), textAlign: 'right' }}>
            <Button
              id='edit-cancel'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              onClick={onCancelHandler}
            />
            <Button
              id='edit-save'
              label={strings.SAVE}
              priority='secondary'
              type='productive'
              onClick={onSaveHandler}
            />
          </Box>
        </Box>
      ) : (
        <Box
          id={id}
          sx={{
            padding: theme.spacing(2),
            borderRadius: '16px',
            '.edit-buttons': {
              display: 'none',
            },
            '&:hover': {
              backgroundColor: theme.palette.TwClrBgHover,

              '.edit-buttons': {
                display: isAllowed('UPDATE_DELIVERABLE') ? 'block' : 'none',
              },
            },
          }}
        >
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            {nameAndDescription}
            <Box display='flex' alignItems='center'>
              <Button
                id='edit'
                label={strings.EDIT}
                onClick={onEditHandler}
                icon='iconEdit'
                priority='secondary'
                className='edit-buttons'
                size='small'
                type='passive'
              />
              <Button
                id='edit'
                onClick={onEditCommentHandler}
                icon='iconComment'
                priority='secondary'
                className='edit-buttons'
                size='small'
                type='passive'
              />
            </Box>
          </Box>
          <Box
            sx={{
              marginBottom: theme.spacing(2),
            }}
          >
            <VariableInternalComment editing={false} update={onUpdateInternalComment} variable={section} />
          </Box>
          <Box sx={{ paddingTop: theme.spacing(1) }}>
            <Display
              allVariables={allVariables}
              projectId={projectId}
              onEditVariableValue={onEditVariableValue}
              sectionValues={sectionValues}
            />
          </Box>
        </Box>
      )}
    </>
  );
}
