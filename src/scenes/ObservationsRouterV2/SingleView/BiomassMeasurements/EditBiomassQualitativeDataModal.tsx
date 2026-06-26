import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import {
  Button,
  DatePicker,
  DialogBox,
  Dropdown,
  DropdownItem,
  MultiSelect,
  Textfield,
} from '@terraware/web-components';
import { DateTime } from 'luxon';

import isEnabled from 'src/features';
import { useGetOneObservationResults } from 'src/hooks/observations';
import { useLocalization } from 'src/providers';
import {
  BiomassUpdateOperationPayload,
  ObservationPlotUpdateOperationPayload,
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
  const isAdditionalBiomassFieldsEnabled = isEnabled('Additional Biomass Fields');

  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
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
  const [waterPresence, setWaterPresence] = useState<'Yes' | 'No'>(() =>
    typeof initialFormData.biomassMeasurement.waterDepth === 'number' ? 'Yes' : 'No'
  );
  const [showWaterClearConfirm, setShowWaterClearConfirm] = useState(false);
  const [validateFields, setValidateFields] = useState(false);

  const hasWater = !isAdditionalBiomassFieldsEnabled || waterPresence === 'Yes';

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

  const onChangeWaterPresence = useCallback(
    (value: unknown) => {
      if (value === 'Yes') {
        setWaterPresence('Yes');
        setRecord((prev) => ({
          ...prev,
          biomassMeasurement: {
            ...prev.biomassMeasurement,
            waterDepth: typeof prev.biomassMeasurement.waterDepth === 'number' ? prev.biomassMeasurement.waterDepth : 0,
          },
        }));
      } else {
        setShowWaterClearConfirm(true);
      }
    },
    [setRecord]
  );

  const confirmClearWaterFields = useCallback(() => {
    setWaterPresence('No');
    setShowWaterClearConfirm(false);
    setRecord((prev) => ({
      ...prev,
      biomassMeasurement: {
        ...prev.biomassMeasurement,
        waterDepth: undefined,
        salinity: undefined,
        ph: undefined,
        tide: undefined,
        tideTime: undefined,
      },
    }));
  }, [setRecord]);

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

  const waterPresenceOptions = useMemo(
    () => [
      { label: strings.YES, value: 'Yes' },
      { label: strings.NO, value: 'No' },
    ],
    [strings.YES, strings.NO]
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

  const soilTypeOptions = useMemo(
    () => [
      { label: strings.SOIL_TYPE_CLAY, value: 'Clay' },
      { label: strings.SOIL_TYPE_SANDY_CLAY, value: 'SandyClay' },
      { label: strings.SOIL_TYPE_SANDY_CLAY_LOAM, value: 'SandyClayLoam' },
      { label: strings.SOIL_TYPE_CLAY_LOAM, value: 'ClayLoam' },
      { label: strings.SOIL_TYPE_SILTY_CLAY, value: 'SiltyClay' },
      { label: strings.SOIL_TYPE_SILTY_CLAY_LOAM, value: 'SiltyClayLoam' },
      { label: strings.SOIL_TYPE_SANDY_LOAM, value: 'SandyLoam' },
      { label: strings.SOIL_TYPE_LOAMY_SAND, value: 'LoamySand' },
      { label: strings.SOIL_TYPE_SAND, value: 'Sand' },
      { label: strings.SOIL_TYPE_LOAM, value: 'Loam' },
      { label: strings.SOIL_TYPE_SILT_LOAM, value: 'SiltLoam' },
      { label: strings.SOIL_TYPE_SILT, value: 'Silt' },
      { label: strings.SOIL_TYPE_UNKNOWN, value: 'Unknown' },
    ],
    [strings]
  );

  const isMangrove = useMemo(() => {
    return record.biomassMeasurement.forestType === 'Mangrove';
  }, [record]);

  const waterFieldsRequired = isAdditionalBiomassFieldsEnabled && isMangrove && waterPresence === 'Yes';

  const waterDepthError = useMemo(() => {
    if (!validateFields || !waterFieldsRequired) {
      return '';
    }
    const raw = record.biomassMeasurement?.waterDepth;
    const num = typeof raw === 'string' ? parseFloat(raw) : raw;
    return num === null || num === undefined || typeof num !== 'number' || isNaN(num) || num <= 0
      ? strings.REQUIRED_FIELD
      : '';
  }, [validateFields, waterFieldsRequired, record.biomassMeasurement?.waterDepth, strings.REQUIRED_FIELD]);

  const salinityError =
    validateFields && waterFieldsRequired && !record.biomassMeasurement?.salinity ? strings.REQUIRED_FIELD : '';
  const phError =
    validateFields && waterFieldsRequired && !record.biomassMeasurement?.ph ? strings.REQUIRED_FIELD : '';
  const tideError =
    validateFields && waterFieldsRequired && !record.biomassMeasurement?.tide ? strings.REQUIRED_FIELD : '';
  const tideTimeError =
    validateFields && waterFieldsRequired && !record.biomassMeasurement?.tideTime ? strings.REQUIRED_FIELD : '';

  const isValid = useMemo(() => {
    if (!waterFieldsRequired) {
      return true;
    }
    const raw = record.biomassMeasurement?.waterDepth;
    const num = typeof raw === 'string' ? parseFloat(raw) : raw;
    return (
      num !== null &&
      num !== undefined &&
      typeof num === 'number' &&
      !isNaN(num) &&
      num > 0 &&
      !!record.biomassMeasurement?.salinity &&
      !!record.biomassMeasurement?.ph &&
      !!record.biomassMeasurement?.tide &&
      !!record.biomassMeasurement?.tideTime
    );
  }, [waterFieldsRequired, record.biomassMeasurement]);

  const smallTreeCountValue = useMemo(
    () =>
      smallTreeCountOptions.find(
        (option) =>
          option.value[0] === record.biomassMeasurement.smallTreeCountLow &&
          option.value[1] === record.biomassMeasurement.smallTreeCountHigh
      )?.value,
    [record, smallTreeCountOptions]
  );

  const saveEditedData = useCallback(() => {
    void (async () => {
      const biomassPayload: BiomassUpdateOperationPayload = {
        type: 'Biomass',
        description: record.biomassMeasurement?.description,
        soilAssessment: record.biomassMeasurement?.soilAssessment,
        soilType: isAdditionalBiomassFieldsEnabled ? record.biomassMeasurement?.soilType : undefined,
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
        try {
          await update({
            observationId,
            plotId: results.adHocPlot.monitoringPlotId,
            updateObservationRequestPayload: {
              updates: [biomassPayload, plotPayload],
            },
          }).unwrap();
          setShowConfirmationModalOpened(false);
          setOpen(false);
        } catch (e) {
          snackbar.toastError();
          setShowConfirmationModalOpened(false);
          return;
        }
      }
    })();
  }, [isAdditionalBiomassFieldsEnabled, record, results, setOpen, update, observationId, snackbar]);

  return (
    open && (
      <>
        {showConfirmationModalOpened && (
          <EditQualitativeDataConfirmationModal
            onClose={() => setShowConfirmationModalOpened(false)}
            onSubmit={saveEditedData}
          />
        )}
        {showWaterClearConfirm && (
          <DialogBox
            onClose={() => setShowWaterClearConfirm(false)}
            open={true}
            title={strings.IS_THERE_WATER_IN_THIS_PLOT}
            size='medium'
            middleButtons={[
              <Button
                id='cancelClearWater'
                label={strings.CANCEL}
                priority='secondary'
                type='passive'
                onClick={() => setShowWaterClearConfirm(false)}
                size='medium'
                key='button-1'
              />,
              <Button
                id='confirmClearWater'
                label={strings.CONTINUE}
                type='destructive'
                onClick={confirmClearWaterFields}
                size='medium'
                key='button-2'
              />,
            ]}
            skrim={true}
            message={strings.WATER_FIELDS_WILL_BE_CLEARED}
          />
        )}
        {!showConfirmationModalOpened && !showWaterClearConfirm && (
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
                onClick={() => {
                  setValidateFields(true);
                  if (isValid) {
                    setShowConfirmationModalOpened(true);
                  }
                }}
                size='medium'
                key='button-2'
              />,
            ]}
            skrim={true}
            scrolled
          >
            <Box sx={{ textAlign: 'left' }}>
              <Textfield
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
                  <Textfield
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
                  {isAdditionalBiomassFieldsEnabled && (
                    <Dropdown
                      label={strings.IS_THERE_WATER_IN_THIS_PLOT}
                      selectedValue={waterPresence}
                      options={waterPresenceOptions}
                      onChange={onChangeWaterPresence}
                      sx={{ paddingTop: '16px' }}
                    />
                  )}
                  {hasWater && (
                    <>
                      <Box sx={{ display: 'flex', gap: 2, paddingTop: '16px' }}>
                        <Box sx={{ flex: 1 }}>
                          <Textfield
                            type='text'
                            label={strings.WATER_DEPTH_CM}
                            value={record.biomassMeasurement?.waterDepth ?? undefined}
                            id={'waterDepth'}
                            onChange={onChangeHandler('biomassMeasurement.waterDepth')}
                            errorText={waterDepthError}
                          />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Textfield
                            type='text'
                            label={strings.SALINITY_PPT}
                            value={record.biomassMeasurement?.salinity}
                            id={'salinity'}
                            onChange={onChangeHandler('biomassMeasurement.salinity')}
                            errorText={salinityError}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, paddingTop: '16px' }}>
                        <Box sx={{ flex: 1 }}>
                          <Textfield
                            type='text'
                            label={strings.PH}
                            value={record.biomassMeasurement?.ph}
                            id={'ph'}
                            onChange={onChangeHandler('biomassMeasurement.ph')}
                            errorText={phError}
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
                            errorText={tideError}
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
                        errorText={tideTimeError}
                      />
                    </>
                  )}
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
                sx={{ paddingTop: '16px' }}
              />

              <Textfield
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
                  <Textfield
                    type='textarea'
                    label={strings.SOIL_ASSESSMENT_DESCRIPTION_NOTES}
                    value={record.biomassMeasurement?.soilAssessment}
                    id={'soilAssessment'}
                    onChange={onChangeHandler('biomassMeasurement.soilAssessment')}
                    sx={{ height: '100%', 'flex-flow': 'column !important', '.textfield-value': { flex: 1 } }}
                  />
                </Box>
              </Box>

              {isAdditionalBiomassFieldsEnabled && (
                <Dropdown
                  label={strings.SOIL_TYPE}
                  selectedValue={record.biomassMeasurement?.soilType}
                  options={soilTypeOptions}
                  onChange={onChangeHandler('biomassMeasurement.soilType')}
                  sx={{ paddingTop: '16px' }}
                />
              )}
            </Box>
          </DialogBox>
        )}
      </>
    )
  );
};

export default EditBiomassQualitativeDataModal;
