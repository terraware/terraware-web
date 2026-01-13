import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { Button, DatePicker, DialogBox, Dropdown, DropdownItem, MultiSelect } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { DateTime } from 'luxon';

import { useLocalization } from 'src/providers';
import {
  BiomassUpdateOperationPayload,
  ObservationPlotUpdateOperationPayload,
  useGetObservationResultsQuery,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { getPlotConditionsOptions } from 'src/redux/features/observations/utils';
import { BiomassMeasurement, PlotCondition } from 'src/types/Observations';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EditQualitativeDataConfirmationModal from '../../EditQualitativeDataConfirmationModal';

export type BiomassQualitativeFormData = {
  biomassMeasurement: BiomassMeasurement;
  conditions?: PlotCondition[];
  notes?: string;
};

type EditQualitativeDataModalProps = {
  initialFormData: BiomassQualitativeFormData;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const EditBiomassQualitativeDataModal = ({ initialFormData, open, setOpen }: EditQualitativeDataModalProps) => {
  const { activeLocale, strings } = useLocalization();
  const snackbar = useSnackbar();

  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const [update] = useUpdateCompletedObservationPlotMutation();
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

  const soilFileId = results?.adHocPlot?.media?.find((m) => m.type === 'Soil')?.fileId;
  const photoUrl =
    results && results.adHocPlot && soilFileId
      ? `/api/v1/tracking/observations/${results.observationId}/plots/${results.adHocPlot.monitoringPlotId}/photos/${soilFileId}`
      : undefined;

  const plotConditionsMap = React.useMemo(() => {
    const options = getPlotConditionsOptions(activeLocale);
    return new Map(options.map((option) => [option.value, option]));
  }, [activeLocale]);

  const [record, setRecord] = useForm<BiomassQualitativeFormData>(initialFormData);
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

  const onChangeNumberOfSmallTrees = useCallback(
    (value: unknown) => {
      const [low, high] = value as [number, number];
      setRecord((prev) => ({
        ...prev,
        biomassMeasurement: {
          ...prev.biomassMeasurement,
          smallTreeCountLow: low,
          smallTreeCountHigh: high,
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
    [strings.MANGROVE, strings.TERRESTRIAL]
  );

  const smallTreeCountOptions = useMemo(
    () => [
      { label: '0', value: [0, 0] },
      { label: '1-10', value: [1, 10] },
      { label: '11-50', value: [11, 50] },
      { label: '51-100', value: [51, 100] },
      { label: '101-500', value: [101, 500] },
      { label: '501-1000', value: [501, 1000] },
      { label: '+1000', value: [1001, 1001] },
    ],
    []
  );

  const isMangrove = useMemo(() => {
    return record.biomassMeasurement.forestType === 'Mangrove';
  }, [record]);

  const smallTreeCountValue = useMemo(() => {
    const low = record.biomassMeasurement.smallTreeCountLow.toString();
    const high = record.biomassMeasurement.smallTreeCountHigh.toString();

    if (low === '0' && high === '0') {
      return '0';
    }
    if (low === '1001' && high === '1001') {
      return '+1000';
    } else {
      return `${low}-${high}`;
    }
  }, [record]);

  const saveEditedData = useCallback(() => {
    void (async () => {
      const biomassPayload: BiomassUpdateOperationPayload = {
        type: 'Biomass',
        description: record.biomassMeasurement?.description,
        soilAssessment: record.biomassMeasurement?.soilAssessment,
        forestType: record.biomassMeasurement?.forestType,
        ph: record.biomassMeasurement?.ph,
        salinity: record.biomassMeasurement?.salinity,
        smallTreeCountHigh: record.biomassMeasurement?.smallTreeCountHigh,
        smallTreeCountLow: record.biomassMeasurement?.smallTreeCountLow,
        tide: record.biomassMeasurement?.tide,
        tideTime: record.biomassMeasurement?.tideTime,
        waterDepth: record.biomassMeasurement?.waterDepth,
        herbaceousCoverPercent: record.biomassMeasurement?.herbaceousCoverPercent,
      };

      const plotPayload: ObservationPlotUpdateOperationPayload = {
        type: 'ObservationPlot',
        conditions: record.conditions,
        notes: record.notes,
      };

      if (results?.adHocPlot?.monitoringPlotId) {
        const result = await update({
          observationId,
          plotId: results.adHocPlot.monitoringPlotId,
          updateObservationRequestPayload: {
            updates: [biomassPayload, plotPayload],
          },
        });

        if ('error' in result) {
          snackbar.toastError();
          return;
        }
        setShowConfirmationModalOpened(false);
        setOpen(false);
      }
    })();
  }, [record, results, setOpen, update, observationId, snackbar]);

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
              <TextField
                type='textarea'
                label={strings.PLOT_DESCRIPTION}
                value={record.biomassMeasurement?.description}
                id={'description'}
                onChange={onChangeHandler('biomassMeasurement.description')}
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
                  <Dropdown
                    label={strings.NUMBER_OF_SMALL_TREES}
                    selectedValue={smallTreeCountValue}
                    options={smallTreeCountOptions}
                    onChange={onChangeNumberOfSmallTrees}
                    id={'numberOfSmallTrees'}
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
              {isMangrove && (
                <>
                  <Box sx={{ display: 'flex', gap: 2, paddingTop: '16px' }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        type='text'
                        label={strings.WATER_DEPTH_CM}
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
                      <Dropdown
                        label={strings.TIDE}
                        selectedValue={record.biomassMeasurement?.tide}
                        id={'tide'}
                        onChange={onChangeHandler('biomassMeasurement.tide')}
                        options={[
                          { label: strings.LOW, value: 'Low' },
                          { label: strings.HIGH, value: 'High' },
                        ]}
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

              <Box display='flex'>
                <Box paddingRight={'16px'} paddingTop={'16px'}>
                  {photoUrl && (
                    <img
                      src={`${photoUrl}?maxHeight=120`}
                      alt={'soilAssessmentImage'}
                      style={{
                        margin: 'auto auto',
                        objectFit: 'contain',
                        display: 'flex',
                        maxWidth: '210px',
                        maxHeight: '210px',
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ paddingTop: '16px', flex: 1 }}>
                  <TextField
                    type='textarea'
                    label={strings.SOIL_ASSESSMENT_DESCRIPTION_NOTES}
                    value={record.biomassMeasurement?.soilAssessment}
                    id={'soilAssessment'}
                    onChange={onChangeHandler('biomassMeasurement.soilAssessment')}
                    sx={{ height: '100%', 'flex-flow': 'column !important', '.textfield-value': { flex: 1 } }}
                  />
                </Box>
              </Box>
            </Box>
          </DialogBox>
        )}
      </>
    )
  );
};

export default EditBiomassQualitativeDataModal;
