import React, { useCallback, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import {
  QuadratUpdateOperationPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EditQualitativeDataConfirmationModal from '../../EditQualitativeDataConfirmationModal';
import QuadratNotesComponent from './QuadratNotesComponent';
import useBiomassPlot from './useBiomassPlot';

type EditNotesModalProps = {
  onClose: () => void;
};

const EditNotesModal = ({ onClose }: EditNotesModalProps) => {
  const { strings } = useLocalization();
  const { biomassMeasurement, monitoringPlot, observationId } = useBiomassPlot();
  const [update] = useUpdateCompletedObservationPlotMutation();
  const snackbar = useSnackbar();

  const biomassMeasurements = biomassMeasurement;
  const [record, setRecord] = useForm(biomassMeasurements);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setRecord(biomassMeasurements);
  }, [biomassMeasurements, setRecord]);

  const recordQuadrats = record?.quadrats;
  const observationResultsAdHocPlot = monitoringPlot;

  const onSubmit = useCallback(() => {
    void (async () => {
      const northeastQuadratPayload: QuadratUpdateOperationPayload = {
        type: 'Quadrat',
        position: 'NortheastCorner',
        description: recordQuadrats?.find((q) => q.position === 'NortheastCorner')?.description,
      };

      const northwestQuadratPayload: QuadratUpdateOperationPayload = {
        type: 'Quadrat',
        position: 'NorthwestCorner',
        description: recordQuadrats?.find((q) => q.position === 'NorthwestCorner')?.description,
      };

      const southeastQuadratPayload: QuadratUpdateOperationPayload = {
        type: 'Quadrat',
        position: 'SoutheastCorner',
        description: recordQuadrats?.find((q) => q.position === 'SoutheastCorner')?.description,
      };

      const southwestQuadratPayload: QuadratUpdateOperationPayload = {
        type: 'Quadrat',
        position: 'SouthwestCorner',
        description: recordQuadrats?.find((q) => q.position === 'SouthwestCorner')?.description,
      };

      if (observationResultsAdHocPlot) {
        const payloads: QuadratUpdateOperationPayload[] = [
          northeastQuadratPayload,
          northwestQuadratPayload,
          southeastQuadratPayload,
          southwestQuadratPayload,
        ];

        const result = await update({
          observationId,
          plotId: observationResultsAdHocPlot.monitoringPlotId,
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
  }, [recordQuadrats, observationResultsAdHocPlot, onClose, update, observationId, snackbar]);

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
