import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { Button, DatePicker, Dropdown, DropdownItem, Icon, MultiSelect, Textfield } from '@terraware/web-components';

import VariableWorkflowDetails from 'src/components/DocumentProducer/VariableWorkflowDetails';
import Link from 'src/components/common/Link';
import strings from 'src/strings';
import {
  SelectOptionPayload,
  SelectVariable,
  UpdateVariableWorkflowDetailsPayload,
  VariableWithValues,
} from 'src/types/documentProducer/Variable';
import {
  VariableValueDateValue,
  VariableValueEmailValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';

export type VariableDetailsInputProps = {
  display?: boolean;
  values: VariableValueValue[];
  setValues: (values: VariableValueValue[]) => void;
  validate: boolean;
  setHasErrors: (has: boolean) => void;
  variable: VariableWithValues;
  addRemovedValue: (value: VariableValueValue) => void;
  sectionsUsed?: string[];
  onSectionClicked?: (sectionNumber: string) => void;
  variableWorkflowDetails: UpdateVariableWorkflowDetailsPayload;
  setVariableWorkflowDetails: (details: UpdateVariableWorkflowDetailsPayload) => void;
};

const VariableDetailsInput = ({
  display,
  values,
  setValues,
  validate,
  setHasErrors,
  variable,
  addRemovedValue,
  sectionsUsed,
  onSectionClicked,
  variableWorkflowDetails,
  setVariableWorkflowDetails,
}: VariableDetailsInputProps): JSX.Element => {
  const [value, setValue] = useState<string | number | number[]>();
  const [citation, setCitation] = useState<string>();
  const [title, setTitle] = useState<string>();
  const theme = useTheme();

  const formElementStyles = { margin: theme.spacing(1, 0) };

  const valueError = useCallback(() => (value ? '' : strings.REQUIRED_FIELD), [value]);

  useEffect(() => {
    if (values?.length) {
      if (variable.type === 'Text') {
        const textValues = values as VariableValueTextValue[];
        setValue(textValues[0].textValue);
        setCitation(textValues[0].citation);
      }
      if (variable.type === 'Number') {
        const numberValues = values as VariableValueNumberValue[];
        setValue(numberValues[0].numberValue.toString());
        setCitation(numberValues[0].citation);
      }
      if (variable.type === 'Select') {
        const selectValues = values as VariableValueSelectValue[];
        setValue(selectValues[0].optionValues);
        setCitation(selectValues[0].citation);
      }
      if (variable.type === 'Date') {
        const dateValues = values as VariableValueDateValue[];
        setValue(dateValues[0].dateValue);
        setCitation(dateValues[0].citation);
      }
      if (variable.type === 'Email') {
        const emailValues = values as VariableValueEmailValue[];
        setValue(emailValues[0].emailValue);
        setCitation(emailValues[0].citation);
      }
      if (variable.type === 'Link') {
        const linkValues = values as VariableValueLinkValue[];
        setValue(linkValues[0].url);
        setCitation(linkValues[0].citation);
        setTitle(linkValues[0].title);
      }
    }
  }, [variable, values]);

  useEffect(() => {
    if (valueError()) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [valueError, setHasErrors]);

  const onChangeValueHandler = (newValue: any, id: string, index: number = 0) => {
    if (id === 'citation') {
      setCitation(newValue);
    } else if (id === 'title') {
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
            if (id === 'citation') {
              newValues[index].citation = newValue;
            } else {
              newValues[index].textValue = newValue;
            }
          } else {
            if (id === 'citation') {
              newValues.push({
                id: -1,
                listPosition: newValues.length,
                textValue: '',
                type: 'Text',
                citation: newValue,
              });
            } else {
              newValues.push({ id: -1, listPosition: newValues.length, textValue: newValue, type: 'Text' });
            }
          }
          setValues(newValues);
        } else {
          if (id === 'citation') {
            setValues([{ id: -1, listPosition: 0, textValue: '', type: 'Text', citation: newValue }]);
          } else {
            setValues([{ id: -1, listPosition: 0, textValue: newValue, type: 'Text' }]);
          }
        }
      }

      if (variable.type === 'Number') {
        if (values && values.length > 0) {
          const numberValues = values as VariableValueNumberValue[];
          const newValues = numberValues.map((nv) => ({ ...nv }));
          if (id === 'citation') {
            newValues[0].citation = newValue;
          } else {
            newValues[0].numberValue = newValue;
          }
          setValues(newValues);
        } else {
          if (id === 'citation') {
            setValues([{ id: -1, listPosition: 0, numberValue: 0, type: 'Number', citation: newValue }]);
          } else {
            setValues([{ id: -1, listPosition: 0, numberValue: newValue, type: 'Number' }]);
          }
        }
      }

      if (variable.type === 'Select') {
        if (values.length > 0) {
          const selectValues = values as VariableValueSelectValue[];
          const newValues = selectValues.map((sv) => ({ ...sv }));
          if (id === 'citation') {
            newValues[0].citation = newValue;
          } else {
            newValues[0].optionValues = variable.isMultiple ? newValue : [newValue];
          }
          setValues(newValues);
        } else {
          if (id === 'citation') {
            setValues([{ id: -1, listPosition: 0, optionValues: [], type: 'Select', citation: newValue }]);
          } else {
            setValues([
              { id: -1, listPosition: 0, optionValues: variable.isMultiple ? newValue : [newValue], type: 'Select' },
            ]);
          }
        }
      }
      if (variable.type === 'Date') {
        if (values && values.length > 0) {
          const dateValues = values as VariableValueDateValue[];
          const newValues = dateValues.map((dv) => ({ ...dv }));
          if (id === 'citation') {
            newValues[0].citation = newValue;
          } else {
            newValues[0].dateValue = newValue;
          }
          setValues(newValues);
        } else {
          setValues([{ id: -1, listPosition: 0, dateValue: newValue, type: 'Date' }]);
        }
      }
      if (variable.type === 'Email') {
        if (values && values.length > 0) {
          const emailValues = values as VariableValueEmailValue[];
          const newValues = emailValues.map((ev) => ({ ...ev }));
          if (id === 'citation') {
            newValues[0].citation = newValue;
          } else {
            newValues[0].emailValue = newValue;
          }
          setValues(newValues);
        } else {
          setValues([{ id: -1, listPosition: 0, emailValue: newValue, type: 'Email' }]);
        }
      }
      if (variable.type === 'Link') {
        if (values && values.length > 0) {
          const linkValues = values as VariableValueLinkValue[];
          const newValues = linkValues.map((lv) => ({ ...lv }));
          if (id === 'citation') {
            newValues[0].citation = newValue;
          } else if (id === 'title') {
            newValues[0].title = newValue;
          } else {
            newValues[0].url = newValue;
          }
          setValues(newValues);
        } else {
          if (id === 'citation') {
            setValues([{ id: -1, listPosition: 0, url: value?.toString() || '', type: 'Link', citation: newValue }]);
          } else if (id === 'title') {
            setValues([
              { id: -1, listPosition: 0, url: value?.toString() || '', type: 'Link', title: newValue, citation },
            ]);
          } else {
            setValues([{ id: -1, listPosition: 0, url: newValue, type: 'Link', title, citation }]);
          }
        }
      }
    } else {
      // if newValue is undefined, remove it from values
      if (variable.type === 'Text') {
        if (values) {
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

  return (
    <>
      <Textfield
        autoFocus
        id='name'
        label={strings.NAME}
        type='text'
        value={variable.name}
        display={true}
        sx={formElementStyles}
      />
      <Textfield
        id='description'
        label={strings.DESCRIPTION}
        type='text'
        value={variable.description}
        display={true}
        sx={formElementStyles}
      />

      {variable.type === 'Date' &&
        (display ? (
          <Typography sx={{ fontWeight: 500, paddingY: '8px' }}>{value?.toString()}</Typography>
        ) : (
          <DatePicker
            id='value'
            label={strings.VALUE}
            onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
            value={value?.toString()}
            errorText={validate ? valueError() : ''}
            aria-label='select date'
            sx={formElementStyles}
          />
        ))}

      {variable.type === 'Text' && (
        <>
          {(values.length ? (values as VariableValueTextValue[]) : [{ textValue: '' }])
            ?.map((tv) => tv.textValue)
            .map((iValue, index) => (
              <Box
                key={index}
                display='flex'
                alignItems='center'
                sx={{
                  position: 'relative',
                  marginBottom: theme.spacing(2),
                  paddingBottom: theme.spacing(2),
                  ...(variable.isList
                    ? {
                        borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                      }
                    : {}),
                }}
              >
                <Textfield
                  display={display}
                  errorText={validate ? valueError() : ''}
                  id='value'
                  key={`input-${index}`}
                  label={index === 0 ? strings.VALUE : ''}
                  onChange={(newValue: any) => onChangeValueHandler(newValue, 'value', index)}
                  sx={{ flex: 1 }}
                  type={variable.textType === 'SingleLine' ? 'text' : 'textarea'}
                  value={iValue?.toString()}
                />
                {variable.isList && !display && (
                  <IconButton
                    id={`delete-input-${index}`}
                    aria-label='delete'
                    size='small'
                    onClick={() => onDeleteInput(index)}
                    disabled={index === 0}
                    sx={index === 0 ? { 'margin-top': '20px' } : {}}
                  >
                    <Icon
                      name='iconSubtract'
                      size='medium'
                      fillColor={theme.palette.TwClrIcn}
                      style={index === 0 ? { opacity: 0.5 } : {}}
                    />
                  </IconButton>
                )}
              </Box>
            ))}
          {variable.isList && !display && (
            <Button priority='ghost' label={strings.ADD} icon='iconAdd' onClick={addInput} />
          )}
        </>
      )}

      {(variable.type === 'Number' || variable.type === 'Link' || variable.type === 'Email') && (
        <Textfield
          display={display}
          id='value'
          label={strings.VALUE}
          type={variable.type === 'Number' ? 'number' : 'text'}
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
          value={value?.toString()}
          errorText={validate ? valueError() : ''}
          sx={formElementStyles}
        />
      )}

      {variable.type === 'Select' &&
        !variable.isMultiple &&
        (display ? (
          <Typography sx={{ fontWeight: 500, paddingY: '8px' }}>
            {getOptions()?.find((option) => option.value === (value as number[])?.[0])?.label}
          </Typography>
        ) : (
          <Dropdown
            fullWidth
            label={strings.VALUE}
            onChange={(newValue: any) => onChangeValueHandler(newValue, 'value')}
            options={getOptions()}
            selectedValue={(value as number[])?.[0]}
          />
        ))}

      {variable.type === 'Select' &&
        variable.isMultiple &&
        (display ? (
          <Typography sx={{ fontWeight: 500, paddingY: '8px' }}>
            {variable.options
              ?.filter((option) => (value as number[])?.includes(option.id))
              .map((option) => option.name)
              .join(', ')}
          </Typography>
        ) : (
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
        ))}

      {variable.type === 'Link' && (
        <Textfield
          display={display}
          id='title'
          label={strings.TITLE}
          type='text'
          onChange={(newValue: any) => onChangeValueHandler(newValue, 'title')}
          sx={formElementStyles}
          value={title}
        />
      )}

      <Grid container>
        <Grid item xs={6}>
          <Textfield
            id='type'
            label={strings.TYPE}
            type='text'
            value={variable.type}
            display={true}
            sx={formElementStyles}
          />
        </Grid>
        <Grid item xs={6}>
          <Textfield
            id='instances'
            label={strings.INSTANCES}
            type='text'
            value={sectionsUsed?.length ?? 0}
            display={true}
            sx={formElementStyles}
          />
        </Grid>
        {sectionsUsed && (
          <Grid item xs={12}>
            <Typography
              sx={{
                color: theme.palette.TwClrTxtSecondary,
                fontSize: '14px',
                fontWeight: 400,
                marginBottom: theme.spacing(1.5),
              }}
            >
              {strings.SECTIONS_USED}
            </Typography>
            <Box marginBottom={theme.spacing(1.5)}>
              {sectionsUsed?.map((s, index) => (
                <>
                  {index > 0 ? ', ' : ''}
                  <Link onClick={() => onSectionClicked && onSectionClicked(s)}>{s}</Link>
                </>
              ))}
            </Box>
          </Grid>
        )}
        <Grid item xs={12}>
          <Textfield
            display={display}
            id='citation'
            label={strings.CITATION}
            type='text'
            onChange={(newValue: any) => onChangeValueHandler(newValue, 'citation')}
            sx={formElementStyles}
            value={citation}
          />
        </Grid>

        <VariableWorkflowDetails
          display={display}
          setVariableWorkflowDetails={setVariableWorkflowDetails}
          variableWorkflowDetails={variableWorkflowDetails}
        />
      </Grid>
    </>
  );
};

export default VariableDetailsInput;
