import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { Button, DialogBox, DropdownItem, MultiSelect, Textfield } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import {
  ObservationPlotUpdateOperationPayload,
  UpdateCompletedObservationPlotApiArg,
  useGetObservationResultsQuery,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { getPlotConditionsOptions } from 'src/redux/features/observations/utils';
import EditQualitativeDataConfirmationModal from 'src/scenes/ObservationsRouterV2/EditQualitativeDataConfirmationModal';
import { PlotCondition } from 'src/types/Observations';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export type MonitoringPlotQualitativeFormData = {
  conditions: PlotCondition[];
  notes?: string;
};

type EditQualitativeDataModalProps = {
  initialFormData: MonitoringPlotQualitativeFormData;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const EditMonitoringPlotQualitativeDataModal = ({ initialFormData, open, setOpen }: EditQualitativeDataModalProps) => {
  const { activeLocale, strings } = useLocalization();
  const snackbar = useSnackbar();
  const params = useParams<{ observationId: string; monitoringPlotId: string }>();
  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const monitoringPlot = useMemo(
    () =>
      results?.isAdHoc
        ? results?.adHocPlot
        : results?.strata
            .flatMap((stratum) => stratum.substrata)
            ?.flatMap((substratum) => substratum?.monitoringPlots)
            .find((plot) => plot.monitoringPlotId === monitoringPlotId),
    [monitoringPlotId, results?.adHocPlot, results?.isAdHoc, results?.strata]
  );
  const [update] = useUpdateCompletedObservationPlotMutation();

  const plotConditionsMap = React.useMemo(() => {
    const options = getPlotConditionsOptions(activeLocale);
    return new Map(options.map((option) => [option.value, option]));
  }, [activeLocale]);

  const [record, setRecord] = useForm<MonitoringPlotQualitativeFormData>(initialFormData);
  const [showConfirmationModalOpened, setShowConfirmationModalOpened] = useState(false);

  const onAddPlotCondition = useCallback(
    (conditionId: PlotCondition) => {
      setRecord((prev) => {
        const newConditions = prev.conditions ? [...prev.conditions] : [];
        newConditions.push(conditionId);
        return { ...prev, conditions: newConditions };
      });
    },
    [setRecord]
  );

  const onRemovePlotCondition = useCallback(
    (conditionId: string) => {
      setRecord((prev) => {
        const newConditions = prev.conditions ? [...prev.conditions] : [];
        const foundIndex = newConditions.findIndex((cId) => cId === conditionId);
        if (foundIndex !== -1) {
          newConditions.splice(foundIndex, 1);
        }
        return { ...prev, conditions: newConditions };
      });
    },
    [setRecord]
  );

  const valueRender = useCallback((option: DropdownItem) => {
    return option.label;
  }, []);

  const onChangeField = useCallback(
    (value: string, fieldId: string) => {
      setRecord((prev) => {
        if (fieldId.includes('.')) {
          const [parent, child] = fieldId.split('.');
          return {
            ...prev,
            [parent]: {
              ...(prev as any)[parent],
              [child]: value,
            },
          };
        }
        return { ...prev, [fieldId]: value };
      });
    },
    [setRecord]
  );

  const onChangeHandler = useCallback(
    (fieldId: string) => (value: unknown) => {
      onChangeField(value as string, fieldId);
    },
    [onChangeField]
  );

  const saveEditedData = useCallback(() => {
    void (async () => {
      if (monitoringPlot) {
        const updatePayload: UpdateCompletedObservationPlotApiArg = {
          observationId,
          plotId: monitoringPlot.monitoringPlotId,
          updateObservationRequestPayload: {
            updates: [
              {
                type: 'ObservationPlot',
                conditions: record.conditions,
                notes: record.notes,
              } as ObservationPlotUpdateOperationPayload,
            ],
          },
        };

        try {
          await update(updatePayload).unwrap();
          setShowConfirmationModalOpened(false);
          setOpen(false);
        } catch (e) {
          snackbar.toastError();
          return;
        }
      }
    })();
  }, [monitoringPlot, observationId, record.conditions, record.notes, update, setOpen, snackbar]);
  return (
    open && (
      <>
        {showConfirmationModalOpened && (
          <EditQualitativeDataConfirmationModal
            onClose={() => setShowConfirmationModalOpened(false)}
            onSubmit={saveEditedData}
          />
        )}
        {!showConfirmationModalOpened && (
          <DialogBox
            onClose={() => setOpen(false)}
            open={true}
            title={strings.EDIT_OBSERVATION_DATA}
            size='medium'
            middleButtons={[
              <Button
                id='cancelEditData'
                label={strings.CANCEL}
                priority='secondary'
                type='passive'
                onClick={() => setOpen(false)}
                size='medium'
                key='button-1'
              />,
              <Button
                id='saveData'
                label={strings.SAVE}
                onClick={() => setShowConfirmationModalOpened(true)}
                size='medium'
                key='button-2'
              />,
            ]}
            skrim={true}
            scrolled
          >
            <Box sx={{ textAlign: 'left' }}>
              <MultiSelect
                label={strings.PLOT_CONDITIONS}
                fullWidth={true}
                onAdd={onAddPlotCondition}
                onRemove={onRemovePlotCondition}
                options={plotConditionsMap}
                valueRenderer={valueRender}
                selectedOptions={record.conditions || []}
              />

              <Textfield
                type='textarea'
                label={strings.FIELD_NOTES}
                value={record.notes}
                id={'notes'}
                sx={{ paddingTop: '16px' }}
                onChange={onChangeHandler('notes')}
              />
            </Box>
          </DialogBox>
        )}
      </>
    )
  );
};

export default EditMonitoringPlotQualitativeDataModal;
