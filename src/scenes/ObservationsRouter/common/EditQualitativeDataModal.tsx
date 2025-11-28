import React, { useCallback } from 'react';

import { Box } from '@mui/material';
import { Button, DialogBox, DropdownItem, MultiSelect } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import { useLocalization } from 'src/providers';
import { getPlotConditionsOptions } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload, PlotCondition } from 'src/types/Observations';

type EditQualitativeDataModalProps = {
  onClose: () => void;
  onSubmit: () => void;
  record: Partial<Omit<ObservationMonitoringPlotResultsPayload, 'species'>>;
  setRecord: React.Dispatch<React.SetStateAction<Partial<Omit<ObservationMonitoringPlotResultsPayload, 'species'>>>>;
};

const EditQualitativeDataModal = ({ onClose, onSubmit, record, setRecord }: EditQualitativeDataModalProps) => {
  const { activeLocale } = useLocalization();

  const plotConditionsMap = React.useMemo(() => {
    const options = getPlotConditionsOptions(activeLocale);
    return new Map(options.map((option) => [option.value, option]));
  }, [activeLocale]);

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
        newConditions.splice(foundIndex, 1);
        return { ...prev, conditions: newConditions };
      });
    },
    [setRecord]
  );

  const valueRender = useCallback((option: DropdownItem) => {
    return option.label;
  }, []);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.EDIT_OBSERVATION_DATA}
      size='medium'
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
      skrim={true}
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

        <TextField
          type='textarea'
          label={strings.FIELD_NOTES}
          value={record.notes}
          id={'notes'}
          sx={{ paddingTop: '16px' }}
        />
      </Box>
    </DialogBox>
  );
};

export default EditQualitativeDataModal;
