import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import {
  QuadratUpdateOperationPayload,
  useGetObservationResultsQuery,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EditQualitativeDataConfirmationModal from '../../EditQualitativeDataConfirmationModal';
import QuadratNotesComponent from './QuadratNotesComponent';

type EditNotesModalProps = {
  onClose: () => void;
};

const EditNotesModal = ({ onClose }: EditNotesModalProps) => {
  const { strings } = useLocalization();
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetObservationResultsQuery({
    observationId,
  });
  const observationResults = useMemo(
    () => observationResultsResponse?.observation,
    [observationResultsResponse?.observation]
  );
  const [update] = useUpdateCompletedObservationPlotMutation();
  const snackbar = useSnackbar();

  const biomassMeasurements = observationResults?.biomassMeasurements;
  const [record, setRecord] = useForm(biomassMeasurements);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setRecord(biomassMeasurements);
  }, [biomassMeasurements, setRecord]);

  const onSubmit = useCallback(() => {
    void (async () => {
      const northeastQuadratPayload: QuadratUpdateOperationPayload = {
        type: 'Quadrat',
        position: 'NortheastCorner',
        description: record?.quadrats.find((q) => q.position === 'NortheastCorner')?.description,
      };

      const northwestQuadratPayload: QuadratUpdateOperationPayload = {
        type: 'Quadrat',
        position: 'NorthwestCorner',
        description: record?.quadrats.find((q) => q.position === 'NorthwestCorner')?.description,
      };

      const southeastQuadratPayload: QuadratUpdateOperationPayload = {
        type: 'Quadrat',
        position: 'SoutheastCorner',
        description: record?.quadrats.find((q) => q.position === 'SoutheastCorner')?.description,
      };

      const southwestQuadratPayload: QuadratUpdateOperationPayload = {
        type: 'Quadrat',
        position: 'SouthwestCorner',
        description: record?.quadrats.find((q) => q.position === 'SouthwestCorner')?.description,
      };

      if (observationResults?.adHocPlot) {
        const payloads: QuadratUpdateOperationPayload[] = [
          northeastQuadratPayload,
          northwestQuadratPayload,
          southeastQuadratPayload,
          southwestQuadratPayload,
        ];

        const result = await update({
          observationId,
          plotId: observationResults.adHocPlot.monitoringPlotId,
          updateObservationRequestPayload: {
            updates: payloads,
          },
        });

        if ('error' in result) {
          snackbar.toastError();
          return;
        }
      }
      onClose();
    })();
  }, [record?.quadrats, observationResults?.adHocPlot, onClose, update, observationId, snackbar]);

  const showModal = useCallback(() => {
    setShowWarning(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowWarning(false);
  }, []);

  const onConfirmSave = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

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
        <Button id='saveData' label={strings.SAVE} onClick={showModal} size='medium' key='button-2' />,
      ]}
    >
      {showWarning && <EditQualitativeDataConfirmationModal onClose={onCloseModal} onSubmit={onConfirmSave} />}
      {biomassMeasurements && (
        <Box sx={{ textAlign: 'left' }}>
          <QuadratNotesComponent quadrat='Northwest' record={record} setRecord={setRecord} />
          <QuadratNotesComponent quadrat='Northeast' record={record} setRecord={setRecord} />
          <QuadratNotesComponent quadrat='Southwest' record={record} setRecord={setRecord} />
          <QuadratNotesComponent quadrat='Southeast' record={record} setRecord={setRecord} />
        </Box>
      )}
    </DialogBox>
  );
};

export default EditNotesModal;
