import React, { useEffect, useMemo, useState } from 'react';

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
  VariableValueImageValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';

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
  variable: Variable;
  addRemovedValue: (value: VariableValueValue) => void;
  projectId: number;
};

const DeliverableVariableDetailsInput = ({
  hideDescription,
  values,
  setCellValues,
  setDeletedImages,
  setImages,
  setNewImages,
  setValues,
  variable,
  addRemovedValue,
  projectId,
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
        const selectValues = values as VariableValueDateValue[];
        setValue(selectValues[0].dateValue);
      }
      if (variable.type === 'Link') {
        const selectValues = values as VariableValueLinkValue[];
        setValue(selectValues[0].url);
        setTitle(selectValues[0].title);
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
      case 'Date':
      case 'Image':
      case 'Link':
      case 'Section':
      case 'Select':
      case 'Table':
      case 'Text':
        return '';
    }
  }, [activeLocale, variable, value]);

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

      {(variable.type === 'Number' || variable.type === 'Link') && (
        <Textfield
          id='value'
          errorText={errorMessage}
          label=''
          type={variable.type === 'Number' ? 'number' : 'text'}
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
          value={value?.toString()}
          sx={[formElementStyles, textFieldLabelStyles]}
        />
      )}

      {variable.type === 'Select' && !variable.isMultiple && (
        <Dropdown
          fullWidth
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
          options={getOptions()}
          selectedValue={(value as number[])?.[0]}
          sx={[formElementStyles, { paddingBottom: theme.spacing(1) }]}
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
