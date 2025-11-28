import React, { useCallback, useMemo } from 'react';

import { Box } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';

import QuadratNotesComponent from './QuadratNotesComponent';

type EditNotesModalProps = {
  onClose: () => void;
  observationId: number;
};

const EditNotesModal = ({ onClose, observationId }: EditNotesModalProps) => {
  const { data: GetObservationResultsApiResponse } = useGetObservationResultsQuery({ observationId });

  const observationResults = useMemo(
    () => GetObservationResultsApiResponse?.observation,
    [GetObservationResultsApiResponse]
  );

  const biomassMeasurements = observationResults?.biomassMeasurements;
  const [record, setRecord] = useForm(biomassMeasurements);

  const onSubmit = useCallback(() => {
    // save notes to BE
  }, []);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.EDIT_NOTES}
      size='medium'
      scrolled
      middleButtons={[
        <Button
          id='cancelEditData'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          key='button-1'
        />,
        <Button id='saveData' label={strings.SAVE} onClick={onSubmit} size='medium' key='button-2' />,
      ]}
    >
      <Box sx={{ textAlign: 'left' }}>
        <QuadratNotesComponent quadrat='Northwest' record={record} setRecord={setRecord} />
        <QuadratNotesComponent quadrat='Northeast' record={record} setRecord={setRecord} />
        <QuadratNotesComponent quadrat='Southwest' record={record} setRecord={setRecord} />
        <QuadratNotesComponent quadrat='Southeast' record={record} setRecord={setRecord} />
      </Box>
    </DialogBox>
  );
};

export default EditNotesModal;
