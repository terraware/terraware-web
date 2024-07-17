import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Button, Textfield, theme } from '@terraware/web-components';

import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateSectionVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import useWorkflowSuccess from 'src/redux/hooks/useWorkflowSuccess';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  NewSectionTextValuePayload,
  NewSectionVariableValuePayload,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';

import Display from './Display';
import Edit from './Edit';

type EditableSectionProps = {
  docId: number;
  projectId: number;
  section: SectionVariableWithValues;
  allVariables: VariableWithValues[];
  onUpdate: () => void;
  manifestId: number;
};

export default function EditableSectionContainer({
  docId,
  projectId,
  section,
  allVariables,
  onUpdate,
  manifestId,
}: EditableSectionProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [sectionValues, setSectionValues] = useState<VariableValueValue[] | undefined>(section.values);
  const [editSectionValues, setEditSectionValues] = useState<VariableValueValue[] | undefined>(section.values);
  const [variableCitation, setVariableCitation] = useState<string>('');

  const [editing, setEditing] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const selector = useAppSelector(selectUpdateVariableValues(requestId));
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

  const renderNameAndDescription = () => {
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

        {editing && (
          <Typography fontSize='14px' fontWeight={400} fontStyle='italic' paddingTop={theme.spacing(2)}>
            {section.description}
          </Typography>
        )}
      </>
    );
  };

  return editing ? (
    <Box
      sx={{
        background: theme.palette.TwClrBgActive,
        padding: theme.spacing(2),
        borderRadius: '16px',
      }}
    >
      {renderNameAndDescription()}

      <Edit
        section={section}
        sectionValues={sectionValues}
        setSectionValues={setEditSectionValues}
        allVariables={allVariables}
        docId={docId}
        projectId={projectId}
        onUpdate={onUpdate}
        manifestId={manifestId}
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
        {renderNameAndDescription()}
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
