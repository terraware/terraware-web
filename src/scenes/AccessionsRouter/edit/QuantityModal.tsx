import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, FormControlLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon, Textfield } from '@terraware/web-components';
import { SelectStyles } from '@terraware/web-components/components/Select/SelectT';
import _ from 'lodash';

import ConvertedValue from 'src/components/ConvertedValue';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Link from 'src/components/common/Link';
import Button from 'src/components/common/button/Button';
import { useUser } from 'src/providers';
import AccessionService from 'src/services/AccessionService';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { Unit, isUnitInPreferredSystem, usePreferredWeightUnits } from 'src/units';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EditState from './EditState';

export interface QuantityModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
  statusEdit?: boolean;
  title: string;
}

interface UnitsSelectorProps {
  onChange: (newValue: string) => void;
  selectedValue: any;
  selectStyles?: SelectStyles;
}

function UnitsSelector(props: UnitsSelectorProps): JSX.Element {
  const preferredUnits = usePreferredWeightUnits();

  return (
    <Dropdown
      options={preferredUnits}
      placeholder={strings.SELECT}
      onChange={props.onChange}
      selectedValue={props.selectedValue}
      fullWidth={true}
      selectStyles={props.selectStyles}
    />
  );
}

export default function QuantityModal(props: QuantityModalProps): JSX.Element {
  const { onClose, open, accession, reload, statusEdit } = props;

  const [record, setRecord, onChange] = useForm(accession);
  const [isSubsetOpen, setIsSubsetOpen] = useState(false);
  const [quantityError, setQuantityError] = useState(false);
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { userPreferences } = useUser();
  const { isMobile } = useDeviceInfo();
  const [isByWeight, setIsByWeight] = useState(accession.remainingQuantity?.units !== 'Seeds');
  const [subsetError, setSubsetError] = useState('');
  const [subsetWeightError, setSubsetWeightError] = useState('');
  const [subsetCountError, setSubsetCountError] = useState('');
  const [totalWeightError, setTotalWeightError] = useState('');
  const [remainingQuantityNotes, setRemainingQuantityNotes] = useState<string>('');
  const [remainingQuantityNotesError, setRemainingQuantityNotesError] = useState<boolean>(false);

  const quantityChanged = useMemo(() => {
    if (!accession.remainingQuantity) {
      // this is a first time quantity set and not considered a change of existing value
      return false;
    }
    return (
      record.remainingQuantity?.quantity?.toString() !== accession.remainingQuantity?.quantity?.toString() ||
      record.remainingQuantity?.units !== accession.remainingQuantity?.units
    );
  }, [record.remainingQuantity, accession.remainingQuantity]);

  useEffect(() => {
    if (isByWeight) {
      setIsSubsetOpen(true);
    } else {
      setIsSubsetOpen(false);
    }
  }, [isByWeight]);

  const validate = () => {
    let hasErrors = false;

    const quantity = parseFloat(record.remainingQuantity?.quantity as unknown as string);
    if (isNaN(quantity) || quantity < 0) {
      setQuantityError(true);
      hasErrors = true;
    } else {
      setQuantityError(false);
    }

    if (quantityChanged && !remainingQuantityNotes.trim()) {
      setRemainingQuantityNotesError(true);
      hasErrors = true;
    } else {
      setRemainingQuantityNotesError(false);
    }

    if (isByWeight || isSubsetOpen) {
      if (!record.subsetWeight?.quantity) {
        setSubsetWeightError(strings.REQUIRED_FIELD);
        hasErrors = true;
      } else if (record.subsetWeight.quantity <= 0) {
        setSubsetWeightError(strings.SUBSET_WEIGHT_POSITIVE);
        hasErrors = true;
      } else {
        setSubsetWeightError('');
      }
      if (!record.subsetCount) {
        setSubsetCountError(strings.REQUIRED_FIELD);
        hasErrors = true;
      } else if (record.subsetCount <= 0) {
        setSubsetCountError(strings.SUBSET_COUNT_POSITIVE);
        hasErrors = true;
      } else {
        setSubsetCountError('');
      }
    }
    return !hasErrors;
  };

  const saveQuantity = async () => {
    if (!validate()) {
      return;
    }
    const response = await AccessionService.updateAccession(
      record,
      false,
      quantityChanged ? remainingQuantityNotes : undefined
    );
    if (response.requestSucceeded) {
      reload();
      onCloseHandler();
    } else {
      snackbar.toastError();
    }
  };

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  useEffect(() => {
    if (open) {
      setRemainingQuantityNotes('');
    }
  }, [open]);

  const onChangeRemainingQuantity = (id: string, value: any) => {
    if (record) {
      if (id === 'seedsQuantity') {
        setRecord({
          ...record,
          remainingQuantity: {
            quantity: value,
            units: 'Seeds',
          },
        });
      } else {
        setRecord({
          ...record,
          remainingQuantity: {
            quantity: value,
            units: record.remainingQuantity?.units === 'Seeds' ? 'Grams' : record.remainingQuantity?.units || 'Grams',
          },
        });
      }
      setQuantityError(false);
    }
  };

  const onChangeStatus = (id: string, value: unknown) => {
    onChange(id, value);
  };

  const onCloseHandler = () => {
    setRecord(accession);
    setIsSubsetOpen(false);
    setIsByWeight(!(record.remainingQuantity?.units === 'Seeds'));
    onClose();
  };

  const showSubset = () => {
    setIsSubsetOpen(true);
  };

  const onChangeQuantityBy = (elem: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setIsByWeight(value === 'weight');
  };

  const onChangeRemainingQuantityUnit = (newValue: string) => {
    setTotalWeightError('');
    if (record) {
      setRecord({
        ...record,
        remainingQuantity: { quantity: record.remainingQuantity?.quantity || 0, units: newValue as Unit['value'] },
      });
    }
  };

  const onChangeSubsetWeight = (value: any) => {
    setSubsetWeightError('');
    setSubsetError('');
    setRecord({
      ...record,
      subsetWeight: { quantity: value, units: record.subsetWeight?.units || 'Grams' },
    });
  };

  const onChangeSubsetUnit = (newValue: string) => {
    setSubsetWeightError('');
    setSubsetError('');
    setRecord({
      ...record,
      subsetWeight: { quantity: record.subsetWeight?.quantity || 0, units: newValue as Unit['value'] },
    });
  };

  const onChangeSubsetCount = (value: number) => {
    setSubsetCountError('');
    onChange('subsetCount', value);
  };

  const onChangeRemainingQuantityNotes = (value: string) => {
    if (value.trim()) {
      setRemainingQuantityNotesError(false);
    }
    setRemainingQuantityNotes(value);
  };

  const hasChanged =
    (!statusEdit || accession.state !== record.state) &&
    (!_.isEqual(accession.remainingQuantity, record.remainingQuantity) ||
      !_.isEqual(accession.estimatedCount, record.estimatedCount) ||
      !_.isEqual(accession.subsetCount, record.subsetCount) ||
      !_.isEqual(accession.subsetWeight?.units, record.subsetWeight?.units) ||
      !_.isEqual(accession.subsetWeight?.quantity, record.subsetWeight?.quantity));

  return (
    <>
      <DialogBox
        scrolled={false}
        onClose={onCloseHandler}
        open={open}
        title={props.title}
        size='medium'
        middleButtons={[
          <Button
            id='cancelQuantity'
            label={strings.CANCEL}
            type='passive'
            onClick={onCloseHandler}
            priority='secondary'
            key='button-1'
          />,
          <Button
            id='saveQuantity'
            onClick={() => void saveQuantity()}
            label={strings.SAVE}
            key='button-2'
            disabled={!hasChanged}
          />,
        ]}
      >
        {statusEdit === true && (
          <Box sx={{ marginBottom: 2 }}>
            <EditState accession={accession} record={record} onChange={onChangeStatus} />
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} textAlign='left'>
            <Typography color={theme.palette.TwClrTxtSecondary} display='flex' fontSize={14}>
              {strings.SEED_QUANTITY_BY}
            </Typography>
            <RadioGroup
              name='radio-buttons-seed-quantity-by'
              defaultValue={accession.remainingQuantity?.units === 'Seeds' ? 'count' : 'weight'}
              onChange={onChangeQuantityBy}
            >
              <Grid item xs={12} textAlign='left' display='flex' flexDirection='row'>
                <FormControlLabel value='count' control={<Radio />} label={strings.COUNT} />
                <FormControlLabel value='weight' control={<Radio />} label={strings.WEIGHT} />
              </Grid>
            </RadioGroup>
          </Grid>
          <Grid item xs={12} textAlign='left'>
            {!isByWeight ? (
              <Textfield
                label={strings.SEED_COUNT}
                id='seedsQuantity'
                onChange={(value) => onChangeRemainingQuantity('seedsQuantity', Number(value))}
                type='number'
                min={0}
                value={
                  record.remainingQuantity?.units === 'Seeds'
                    ? record.remainingQuantity?.quantity.toString()
                    : record.estimatedCount?.toString()
                }
                errorText={
                  quantityError
                    ? record.remainingQuantity?.quantity
                      ? strings.INVALID_VALUE
                      : strings.REQUIRED_FIELD
                    : ''
                }
                disabledCharacters={[',', '.', '-']}
                required={true}
              />
            ) : (
              <Box display='flex' textAlign='left' alignItems='end'>
                <Textfield
                  label={strings.TOTAL_WEIGHT}
                  id='remainingQuantity'
                  onChange={(value) => onChangeRemainingQuantity('weight', value as number)}
                  type='number'
                  min={0}
                  disabledCharacters={['-']}
                  value={
                    record.remainingQuantity?.units === 'Seeds'
                      ? record.estimatedWeight?.quantity.toString()
                      : record.remainingQuantity?.quantity.toString()
                  }
                  errorText={totalWeightError}
                />
                <Box height={totalWeightError ? '85px' : 'auto'}>
                  <UnitsSelector
                    onChange={onChangeRemainingQuantityUnit}
                    selectedValue={
                      record.remainingQuantity?.units === 'Seeds'
                        ? record.estimatedWeight?.units
                        : record.remainingQuantity?.units
                    }
                    selectStyles={{ inputContainer: { marginLeft: theme.spacing(0.5) } }}
                  />
                </Box>
              </Box>
            )}
          </Grid>
          {record.remainingQuantity?.units &&
            record.remainingQuantity?.units !== 'Seeds' &&
            !isUnitInPreferredSystem(
              record.remainingQuantity.units,
              userPreferences.preferredWeightSystem as string
            ) && (
              <Grid item xs={12} textAlign='left'>
                <ConvertedValue
                  quantity={record.remainingQuantity.quantity}
                  unit={record.remainingQuantity.units}
                  showTooltip={true}
                />
              </Grid>
            )}

          <Grid item xs={12} textAlign='left'>
            <Textfield
              id='notes'
              value={remainingQuantityNotes}
              onChange={(value) => onChangeRemainingQuantityNotes(value as string)}
              type='textarea'
              label={strings.NOTES}
              errorText={remainingQuantityNotesError ? strings.REQUIRED_FIELD : ''}
              placeholder={strings.REMAINING_QUANTITY_NOTES_PLACEHOLDER}
              required
            />
          </Grid>

          <Grid item xs={12}>
            {!isSubsetOpen ? (
              <Box display='flex' justifyContent='flex-start'>
                <Link id='addNotes' onClick={showSubset} fontSize='16px'>
                  <Box display='flex' alignItems='center'>
                    <Icon
                      name='iconAdd'
                      style={{
                        fill: theme.palette.TwClrIcnBrand,
                        height: '20px',
                        width: '20px',
                      }}
                    />
                    &nbsp;{`${strings.ADD_SUBSET_WEIGHT_AND_COUNT}`}
                  </Box>
                </Link>
              </Box>
            ) : (
              <Box
                sx={{
                  borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                  paddingTop: theme.spacing(2),
                }}
              >
                <Grid container item justifyContent='space-between'>
                  <Grid container item xs={isMobile ? 12 : 7} spacing={1}>
                    <Grid item xs={8} textAlign='left'>
                      <Textfield
                        label={strings.SUBSET_WEIGHT}
                        id='subsetWeight'
                        onChange={(value) => onChangeSubsetWeight(value)}
                        type='number'
                        min={0}
                        disabledCharacters={['-']}
                        value={record.subsetWeight?.quantity}
                        errorText={subsetError || subsetWeightError}
                        tooltipTitle={strings.ENTER_SUBSET_WEIGHT_AND_COUNT}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Box height={subsetWeightError ? '85px' : subsetError ? '65px' : 'auto'} paddingTop='24px'>
                        <UnitsSelector onChange={onChangeSubsetUnit} selectedValue={record.subsetWeight?.units} />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item xs={isMobile ? 12 : 4} paddingTop={isMobile ? '4px' : '0px'} textAlign='left'>
                    <Textfield
                      label={strings.SUBSET_COUNT}
                      id='subsetCount'
                      onChange={(value) => onChangeSubsetCount(value as number)}
                      type='number'
                      min={1}
                      disabledCharacters={['.', ',', '-']}
                      value={record.subsetCount}
                      errorText={subsetCountError}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
