import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Button, Textfield, theme } from '@terraware/web-components';

import VariableInternalComment from 'src/components/Variables/VariableInternalComment';
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

type EditableSectionProps = {
  id?: string;
  docId: number;
  projectId: number;
  section: SectionVariableWithValues;
  allVariables: VariableWithValues[];
  onUpdate: () => void;
};

export default function EditableSectionContainer({
  id,
  docId,
  projectId,
  section,
  allVariables,
  onUpdate,
}: EditableSectionProps): JSX.Element {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [sectionValues, setSectionValues] = useState<VariableValueValue[] | undefined>(section.values);
  const [editSectionValues, setEditSectionValues] = useState<VariableValueValue[] | undefined>(section.values);
  const [variableCitation, setVariableCitation] = useState<string>('');

  const [editing, setEditing] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const selector = useAppSelector(selectUpdateVariableValues(requestId));

  const [updateInternalCommentRequestId, setUpdateInternalCommentRequestId] = useState<string>('');
  const updateInternalCommentRequest = useAppSelector(
    selectUpdateVariableWorkflowDetails(updateInternalCommentRequestId)
  );

  useWorkflowSuccess({
    workflowState: selector,
    onSuccess: () => {
      setEditing(false);
      setSectionValues(editSectionValues);
      setRequestId('');
    },
  });

  useEffect(() => {
    setSectionValues(section.values);
  }, [section.values]);

  const onEditHandler = () => {
    setEditSectionValues(sectionValues);
    setEditing(true);
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
    setRequestId(request.requestId);
  }, [dispatch, docId, section.id, editSectionValues]);

  const onCancelHandler = () => {
    setEditing(false);

    // reset sectionValues
    setEditSectionValues(sectionValues);
  };

  const onUpdateInternalComment = useCallback(
    (internalComment: string) => {
      const firstVariableValue = section.variableValues[0] || {};
      const status = firstVariableValue?.status || ('Not Submitted' as NonUndefined<VariableValue['status']>);
      const feedback = firstVariableValue?.feedback || '';

      const request = dispatch(
        requestUpdateVariableWorkflowDetails({ status, feedback, internalComment, projectId, variableId: section.id })
      );
      setUpdateInternalCommentRequestId(request.requestId);
    },
    [section]
  );

  useEffect(() => {
    if (updateInternalCommentRequest?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else if (updateInternalCommentRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, updateInternalCommentRequest]);

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
  }, [editing, section, theme]);

  return editing ? (
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
        <VariableInternalComment editing update={onUpdateInternalComment} variable={section} />
      </Box>

      {nameAndDescription}

      <Edit
        section={section}
        sectionValues={sectionValues}
        setSectionValues={setEditSectionValues}
        allVariables={allVariables}
        docId={docId}
        projectId={projectId}
        onUpdate={onUpdate}
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
        <Button id='edit-cancel' label={strings.CANCEL} priority='secondary' type='passive' onClick={onCancelHandler} />
        <Button id='edit-save' label={strings.SAVE} priority='secondary' type='productive' onClick={onSaveHandler} />
      </Box>
    </Box>
  ) : (
    <Box
      id={id}
      sx={{
        padding: theme.spacing(2),
        borderRadius: '16px',
        '.edit-button': {
          display: 'none',
        },
        '&:hover': {
          backgroundColor: theme.palette.TwClrBgHover,

          '.edit-button': {
            display: 'block',
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
            className='edit-button'
            size='small'
            type='passive'
          />
        </Box>
      </Box>
      <Box sx={{ paddingTop: theme.spacing(1) }}>
        <Display docId={docId} sectionValues={sectionValues} allVariables={allVariables} />
      </Box>
    </Box>
  );
}
