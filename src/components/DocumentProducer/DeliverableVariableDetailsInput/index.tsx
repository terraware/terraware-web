import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, IconButton, SxProps, useTheme } from '@mui/material';
import { Button, DatePicker, Dropdown, DropdownItem, Icon, MultiSelect, Textfield } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import {
  ImageVariableWithValues,
  SelectOptionPayload,
  SelectVariable,
  TableVariableWithValues,
  Variable,
} from 'src/types/documentProducer/Variable';
import {
  VariableValueDateValue,
  VariableValueEmailValue,
  VariableValueImageValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';
import { isEmailAddress } from 'src/utils/email';

import DeliverableEditImages from '../DeliverableEditImages';
import DeliverableEditTable from '../DeliverableEditTable';
import { PhotoWithAttributes } from '../EditImagesModal/PhotoSelector';
import { VariableTableCell } from '../EditableTableModal/helpers';

export type DeliverableVariableDetailsInputProps = {
  hideDescription?: boolean;
  values: VariableValueValue[];
  setCellValues?: (values: VariableTableCell[][]) => void;
  setDeletedImages: (values: VariableValueImageValue[]) => void;
  setImages: (values: VariableValueImageValue[]) => void;
  setNewImages: (values: PhotoWithAttributes[]) => void;
  setValues: (values: VariableValueValue[]) => void;
  setVariableHasError: (variableId: number, value: boolean) => void;
  variable: Variable;
  addRemovedValue: (value: VariableValueValue) => void;
  projectId: number;
  validateFields: boolean;
};

const DeliverableVariableDetailsInput = ({
  hideDescription,
  values,
  setCellValues,
  setDeletedImages,
  setImages,
  setNewImages,
  setValues,
  setVariableHasError,
  variable,
  addRemovedValue,
  projectId,
  validateFields,
}: DeliverableVariableDetailsInputProps): JSX.Element => {
  const { activeLocale } = useLocalization();

  const [value, setValue] = useState<string | number | number[]>();
  const [title, setTitle] = useState<string>();
  const theme = useTheme();

  const textFieldLabelStyles: SxProps = {
    '& label.textfield-label': {
      display: 'none',
    },
  };

  const formElementStyles: SxProps = {
    margin: 0,
    maxWidth: '33%',
  };

  useEffect(() => {
    if (values?.length) {
      if (variable.type === 'Text') {
        const textValues = values as VariableValueTextValue[];
        setValue(textValues[0].textValue);
      }
      if (variable.type === 'Number') {
        const numberValues = values as VariableValueNumberValue[];
        setValue(numberValues[0].numberValue.toString());
      }
      if (variable.type === 'Select') {
        const selectValues = values as VariableValueSelectValue[];
        setValue(selectValues[0].optionValues);
      }
      if (variable.type === 'Date') {
        const dateValues = values as VariableValueDateValue[];
        setValue(dateValues[0].dateValue);
      }
      if (variable.type === 'Email') {
        const emailValues = values as VariableValueEmailValue[];
        setValue(emailValues[0].emailValue);
      }
      if (variable.type === 'Link') {
        const linkValues = values as VariableValueLinkValue[];
        setValue(linkValues[0].url);
        setTitle(linkValues[0].title);
      }
    }
  }, [variable, values]);

  const onChangeValueHandler = (newValue: any, id: string, index: number = 0) => {
    if (id === 'title') {
      setTitle(newValue);
    } else if (variable.type !== 'Text') {
      setValue(newValue);
    }

    if (newValue !== undefined) {
      if (variable.type === 'Text') {
        if (values) {
          const textValues = values as VariableValueTextValue[];
          const newValues = textValues.map((tv) => ({ ...tv }));
          if (newValues[index]) {
            newValues[index].textValue = newValue;
          } else {
            newValues.push({ id: -1, listPosition: newValues.length, textValue: newValue, type: 'Text' });
          }
          setValues(newValues);
        } else {
          setValues([{ id: -1, listPosition: 0, textValue: newValue, type: 'Text' }]);
        }
      }

      if (variable.type === 'Number') {
        if (values.length > 0) {
          const numberValues = values as VariableValueNumberValue[];
          const newValues = numberValues.map((nv) => ({ ...nv }));

          newValues[0].numberValue = newValue;

          setValues(newValues);
        } else {
          setValues([{ id: -1, listPosition: 0, numberValue: newValue, type: 'Number' }]);
        }
      }

      if (variable.type === 'Select') {
        if (values.length > 0) {
          const selectValues = values as VariableValueSelectValue[];
          const newValues = selectValues.map((sv) => ({ ...sv }));

          newValues[0].optionValues = variable.isMultiple ? newValue : [newValue];

          setValues(newValues);
        } else {
          setValues([
            { id: -1, listPosition: 0, optionValues: variable.isMultiple ? newValue : [newValue], type: 'Select' },
          ]);
        }
      }

      if (variable.type === 'Date') {
        if (values.length > 0) {
          const dateValues = values as VariableValueDateValue[];
          const newValues = dateValues.map((dv) => ({ ...dv }));

          newValues[0].dateValue = newValue;

          setValues(newValues);
        } else {
          setValues([{ id: -1, listPosition: 0, dateValue: newValue, type: 'Date' }]);
        }
      }

      if (variable.type === 'Email') {
        if (values.length > 0) {
          const emailValues = values as VariableValueEmailValue[];
          const newValues = emailValues.map((ev) => ({ ...ev }));

          newValues[0].emailValue = newValue;

          setValues(newValues);
        } else {
          setValues([{ id: -1, listPosition: 0, emailValue: newValue, type: 'Email' }]);
        }
      }

      if (variable.type === 'Link') {
        if (values.length > 0) {
          const linkValues = values as VariableValueLinkValue[];
          const newValues = linkValues.map((lv) => ({ ...lv }));
          if (id === 'title') {
            newValues[0].title = newValue;
          } else {
            newValues[0].url = newValue;
          }
          setValues(newValues);
        } else {
          if (id === 'title') {
            setValues([{ id: -1, listPosition: 0, url: value?.toString() || '', type: 'Link', title: newValue }]);
          } else {
            setValues([{ id: -1, listPosition: 0, url: newValue, type: 'Link', title }]);
          }
        }
      }

      if (variable.type === 'Table') {
        if (newValue?.length) {
          const cellValues = newValue as VariableTableCell[][];
          setCellValues?.(cellValues);
        }
      }
    } else {
      // if newValue is undefined, remove it from values
      if (variable.type === 'Text') {
        if (values.length > 0) {
          const newValues = values.map((tv) => ({ ...tv }));
          newValues.splice(index, 1);
          setValues(newValues);
        }
      }
    }
  };

  const getOptions = () => {
    const selectVariable = variable as SelectVariable;
    return selectVariable.options.map((opt: SelectOptionPayload) => {
      return {
        label: opt.name,
        value: opt.id,
      } as DropdownItem;
    });
  };

  const addInput = () => {
    setValues([...(values || []), { id: -1, listPosition: values?.length || 0, textValue: '', type: 'Text' }]);
  };

  const onDeleteInput = (index: number) => {
    if (values.length) {
      const removed = values[index];
      // if removed value exists in backend, add it to be deleted when saving
      if (removed && removed.id !== -1) {
        addRemovedValue(removed);
      }

      const updatedInputs = [...values];
      updatedInputs.splice(index, 1);
      onChangeValueHandler(undefined, 'value', index);
      setValues(updatedInputs);
    }
  };

  const errorMessage = useMemo(() => {
    if (!activeLocale) {
      return '';
    }

    if (validateFields && variable.isRequired && !value) {
      return strings.REQUIRED_FIELD;
    }

    switch (variable.type) {
      case 'Number':
        if (value !== undefined) {
          const numValue = Number(value);
          const decimals: string | undefined = String(numValue).split('.')[1];
          if (Number.isNaN(numValue)) {
            return strings.VARIABLE_ERROR_NUMBER_NAN;
          }
          if (variable.minValue !== undefined && numValue < variable.minValue) {
            return strings.formatString(strings.VARIABLE_ERROR_NUMBER_MIN_LIMIT, variable.minValue).toString();
          }
          if (variable.maxValue !== undefined && numValue > variable.maxValue) {
            return strings.formatString(strings.VARIABLE_ERROR_NUMBER_MAX_LIMIT, variable.maxValue).toString();
          }
          if (variable.decimalPlaces !== undefined && decimals && decimals.length > variable.decimalPlaces) {
            return strings
              .formatString(strings.VARIABLE_ERROR_NUMBER_DECIMAL_PLACES, variable.decimalPlaces)
              .toString();
          }
        }
        return '';
      case 'Email':
        if (value !== undefined) {
          const stringValue = String(value);
          if (stringValue !== '' && !isEmailAddress(stringValue)) {
            return strings.INCORRECT_EMAIL_FORMAT;
          }
        }
        return '';
      case 'Date':
      case 'Image':
      case 'Link':
      case 'Section':
      case 'Select':
      case 'Table':
      case 'Text':
        return '';
    }
  }, [activeLocale, validateFields, variable, value]);

  useEffect(() => {
    if (errorMessage) {
      setVariableHasError(variable.id, true);
    } else {
      setVariableHasError(variable.id, false);
    }
  }, [errorMessage, setVariableHasError, variable.id]);

  return (
    <>
      {variable.description && hideDescription !== true && (
        <Textfield
          id='description'
          label=''
          type='text'
          value={variable.description}
          display={true}
          sx={[
            { marginTop: '-8px' },
            {
              '& p.textfield-value--display': {
                color: theme.palette.TwClrTxtSecondary,
                fontSize: '14px',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: '20px',
                paddingTop: 0,
                paddingBottom: '16px',
              },
            },
            textFieldLabelStyles,
          ]}
          required={variable.isRequired}
        />
      )}

      {variable.type === 'Date' && (
        <DatePicker
          id='value'
          label=''
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
          value={value?.toString()}
          aria-label='select date'
          sx={formElementStyles}
          errorText={errorMessage}
        />
      )}

      {variable.type === 'Text' && (
        <>
          {(values.length ? (values as VariableValueTextValue[]) : [{ textValue: '' }])
            ?.map((tv) => tv.textValue)
            .map((iValue, index) => (
              <Box key={index} display='flex' alignItems='center' sx={{ position: 'relative' }}>
                <Textfield
                  id='value'
                  key={`input-${index}`}
                  label=''
                  onChange={(newValue: any) => onChangeValueHandler(newValue, 'value', index)}
                  sx={[
                    formElementStyles,
                    {
                      flex: 1,
                      maxWidth: variable.textType === 'MultiLine' ? '100%' : (formElementStyles.maxWidth as string),
                    },
                  ]}
                  type={variable.textType === 'SingleLine' ? 'text' : 'textarea'}
                  value={iValue?.toString()}
                  required={variable.isRequired}
                  errorText={validateFields && !iValue && variable.isRequired ? strings.REQUIRED_FIELD : ''}
                />
                {variable.isList && (
                  <IconButton
                    id={`delete-input-${index}`}
                    aria-label='delete'
                    size='small'
                    onClick={() => onDeleteInput(index)}
                    disabled={index === 0}
                    sx={index === 0 ? { 'margin-top': '20px' } : {}}
                  >
                    <Icon
                      name='cancel'
                      size='medium'
                      fillColor={theme.palette.TwClrIcn}
                      style={index === 0 ? { opacity: 0.5 } : {}}
                    />
                  </IconButton>
                )}
              </Box>
            ))}
          {variable.isList && <Button priority='ghost' label={strings.ADD} icon='iconAdd' onClick={addInput} />}
        </>
      )}

      {(variable.type === 'Number' || variable.type === 'Link' || variable.type === 'Email') && (
        <Textfield
          id='value'
          label=''
          type={variable.type === 'Number' ? 'number' : 'text'}
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
          value={value?.toString()}
          sx={[formElementStyles, textFieldLabelStyles]}
          required={variable.isRequired}
          errorText={errorMessage}
        />
      )}

      {variable.type === 'Select' && !variable.isMultiple && (
        <Dropdown
          fullWidth
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
          options={getOptions()}
          selectedValue={(value as number[])?.[0]}
          sx={[formElementStyles, { paddingBottom: theme.spacing(1) }]}
          required={variable.isRequired}
          errorText={errorMessage}
        />
      )}

      {variable.type === 'Select' && variable.isMultiple && (
        <MultiSelect
          fullWidth
          onAdd={(item: number) => {
            const nextValues = [...((value as number[]) || []), item];
            onChangeValueHandler(nextValues, 'value');
          }}
          onRemove={(item: number) => {
            const nextValues = value ? (value as number[]).filter((v) => v !== item) : [];
            onChangeValueHandler(nextValues, 'value');
          }}
          options={new Map(variable.options?.map((option) => [option.id, option.name]))}
          selectedOptions={(value || []) as number[]}
          sx={[formElementStyles, { paddingBottom: theme.spacing(1) }]}
          valueRenderer={(val: string) => val}
          errorText={errorMessage}
        />
      )}

      {variable.type === 'Link' && (
        <Textfield
          id='title'
          label={strings.TITLE}
          type='text'
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'title')}
          sx={formElementStyles}
          value={title}
          required={variable.isRequired}
          errorText={errorMessage}
        />
      )}

      {variable.type === 'Table' && (
        <DeliverableEditTable
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
          variable={variable as TableVariableWithValues}
        />
      )}

      {variable.type === 'Image' && (
        <DeliverableEditImages
          projectId={projectId}
          setDeletedImages={setDeletedImages}
          setImages={setImages}
          setNewImages={setNewImages}
          variable={variable as ImageVariableWithValues}
        />
      )}
    </>
  );
};

export default DeliverableVariableDetailsInput;
