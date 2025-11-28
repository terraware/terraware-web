import React, { useCallback, useMemo } from 'react';

import { Box } from '@mui/material';
import { Button, DatePicker, DialogBox, Dropdown, DropdownItem, MultiSelect } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { DateTime } from 'luxon';

import { useLocalization } from 'src/providers';
import { ObservationMonitoringPlotMediaPayload } from 'src/queries/generated/observations';
import { getPlotConditionsOptions } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { BiomassMeasurement, ObservationMonitoringPlotResultsPayload, PlotCondition } from 'src/types/Observations';

export type BiomassPlot = {
  monitoringPlotId: number;
  conditions?: PlotCondition[];
  notes?: string;
  biomassMeasurement?: BiomassMeasurement;
  media?: ObservationMonitoringPlotMediaPayload[];
};

type EditQualitativeDataModalProps = {
  onClose: () => void;
  onSubmit: () => void;
  record: Partial<Omit<ObservationMonitoringPlotResultsPayload, 'species'>> | BiomassPlot;
  setRecord: React.Dispatch<
    React.SetStateAction<Partial<Omit<ObservationMonitoringPlotResultsPayload, 'species'>> | BiomassPlot>
  >;
  observationId?: number;
};

const EditQualitativeDataModal = ({
  onClose,
  onSubmit,
  record,
  setRecord,
  observationId,
}: EditQualitativeDataModalProps) => {
  const PHOTO_URL = '/api/v1/tracking/observations/{observationId}/plots/{monitoringPlotId}/photos/{fileId}';
  const photoUrl = PHOTO_URL.replace('{observationId}', observationId?.toString() || '')
    .replace('{monitoringPlotId}', record.monitoringPlotId?.toString() || '')
    .replace('{fileId}', record.media?.find((m) => m.type === 'Soil')?.fileId.toString() || '');
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

  const onChangeNumberOfSmallTrees = useCallback(
    (value: unknown) => {
      const stringValue = value as string;
      const parts = stringValue.split('-');
      setRecord((prev) => ({
        ...prev,
        biomassMeasurement: {
          ...(prev as BiomassPlot).biomassMeasurement,
          smallTreeCountLow: parts[0]?.trim() || '',
          smallTreeCountHigh: parts[1]?.trim() || '',
        },
      }));
    },
    [setRecord]
  );

  const forestTypeOptions = useMemo(
    () => [
      {
        label: strings.TERRESTRIAL,
        value: 'Terrestrial',
      },
      {
        label: strings.MANGROVE,
        value: 'Mangrove',
      },
    ],
    []
  );

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
      scrolled
    >
      <Box sx={{ textAlign: 'left' }}>
        {'biomassMeasurement' in record && (
          <>
            <TextField
              type='textarea'
              label={strings.PLOT_DESCRIPTION}
              value={record.biomassMeasurement?.description}
              id={'notes'}
              onChange={onChangeHandler('biomassMeasurement.plotDescription')}
            />

            <Dropdown
              label={strings.TYPE_OF_FOREST}
              selectedValue={record.biomassMeasurement?.forestType}
              options={forestTypeOptions}
              onChange={onChangeHandler('biomassMeasurement.forestType')}
              sx={{ paddingTop: '16px' }}
            />

            <Box sx={{ display: 'flex', gap: 2, paddingTop: '16px' }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  type='text'
                  label={strings.NUMBER_OF_SMALL_TREES}
                  value={`${record.biomassMeasurement?.smallTreeCountLow}-${record.biomassMeasurement?.smallTreeCountHigh}`}
                  id={'numberOfSmallTrees'}
                  onChange={onChangeNumberOfSmallTrees}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  type='text'
                  label={strings.HERBACEOUS_COVER_PERCENT}
                  value={record.biomassMeasurement?.herbaceousCoverPercent}
                  id={'herbaceousCoverPercent'}
                  onChange={onChangeHandler('biomassMeasurement.herbaceousCoverPercent')}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, paddingTop: '16px' }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  type='text'
                  label={strings.WATER_DEPTH_M}
                  value={record.biomassMeasurement?.waterDepth}
                  id={'waterDepth'}
                  onChange={onChangeHandler('biomassMeasurement.waterDepth')}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  type='text'
                  label={strings.SALINITY_PPT}
                  value={record.biomassMeasurement?.salinity}
                  id={'salinity'}
                  onChange={onChangeHandler('biomassMeasurement.salinity')}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, paddingTop: '16px' }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  type='text'
                  label={strings.PH}
                  value={record.biomassMeasurement?.ph}
                  id={'ph'}
                  onChange={onChangeHandler('biomassMeasurement.ph')}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  type='text'
                  label={strings.TIDE}
                  value={record.biomassMeasurement?.tide}
                  id={'tide'}
                  onChange={onChangeHandler('biomassMeasurement.tide')}
                />
              </Box>
            </Box>

            <DatePicker
              id='startTime'
              label={strings.MEASUREMENT_TIME}
              value={record.biomassMeasurement?.tideTime}
              onDateChange={(value?: DateTime) => {
                onChangeHandler('biomassMeasurement.tideTime')(value?.toISO());
              }}
              aria-label='date-picker'
              showTime={true}
              sx={{ paddingTop: '16px' }}
            />
          </>
        )}

        <MultiSelect
          label={strings.PLOT_CONDITIONS}
          fullWidth={true}
          onAdd={onAddPlotCondition}
          onRemove={onRemovePlotCondition}
          options={plotConditionsMap}
          valueRenderer={valueRender}
          selectedOptions={record.conditions || []}
          sx={'biomassMeasurement' in record ? { paddingTop: '16px' } : undefined}
        />

        <TextField
          type='textarea'
          label={strings.FIELD_NOTES}
          value={record.notes}
          id={'notes'}
          sx={{ paddingTop: '16px' }}
          onChange={onChangeHandler('notes')}
        />

        {'biomassMeasurement' in record && (
          <Box display='flex'>
            <Box paddingRight={'16px'} paddingTop={'16px'}>
              <img
                src={`${photoUrl}?maxHeight=120`}
                alt={'soilAssessmentImage'}
                style={{
                  margin: 'auto auto',
                  objectFit: 'contain',
                  display: 'flex',
                  maxWidth: '210',
                  maxHeight: '210',
                }}
              />
            </Box>

            <Box sx={{ paddingTop: '16px', flex: 1 }}>
              <TextField
                type='textarea'
                label={strings.SOIL_ASSESSMENT_DESCRIPTION_NOTES}
                value={record.biomassMeasurement?.soilAssessment}
                id={'soilAssessment'}
                onChange={onChangeHandler('biomassMeasurement?.soilAssessment')}
                sx={{ height: '100%', 'flex-flow': 'column !important', '.textfield-value': { flex: 1 } }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </DialogBox>
  );
};

export default EditQualitativeDataModal;
