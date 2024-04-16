import { Descendant } from 'slate';

import { CustomElement, CustomText } from 'src/components/DocumentProducer/EditableSection/Edit';
import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueSelectValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';

export const editorDisplayVariableWithValues = (
  variable: VariableWithValues,
  separator: string,
  placeholder?: string,
  reference?: boolean
): string => {
  let result = '';
  switch (variable.type) {
    case 'Text':
    case 'Number':
    case 'Link':
    case 'Date':
      result = variable.values.map((v) => displayValue(v, placeholder)).join(separator);
      break;
    case 'Image':
      result = `${variable.name}: ${variable.values.length} ${strings.IMAGES}`;
      break;
    case 'Table':
      result = `${variable.name}: ${variable.values.length} ${strings.ENTRIES}`;
      break;
    case 'Select':
      const selectedValues = (variable.values[0] as VariableValueSelectValue)?.optionValues;
      result = `${variable.name}: ${
        variable.options
          .filter((o) => selectedValues?.includes(o.id))
          .map((o) => o.name)
          .join(', ') ||
        (placeholder ?? '')
      }`;
      break;
  }

  return (result || (placeholder ?? '')) + (reference ? ` (${strings.REFERENCE})` : '');
};

export const displayValue = (value: VariableValueValue, placeholder?: string): string => {
  switch (value.type) {
    case 'Text':
      return value.textValue;
    case 'Number':
      return String(value.numberValue);
    case 'Link':
      return value.title ?? value.url;
    case 'Date':
      return value.dateValue;
    default:
      return placeholder ?? '';
  }
};

export const editorValueFromVariableValue = (
  variableValue: VariableValueValue,
  allValues: VariableWithValues[]
): Descendant => {
  switch (variableValue.type) {
    case 'SectionText':
      return { text: variableValue.textValue ?? '' } as CustomText;
    case 'SectionVariable':
      const value = allValues.find((v) => v.id === variableValue.variableId);
      return {
        type: 'variable',
        variableId: value?.id,
        children: [{ text: '' }],
        reference: variableValue.usageType === 'Reference',
      } as CustomElement;
    default:
      return { text: '' } as CustomText;
  }
};

export const variableValueFromEditorValue = (
  editorValue: Descendant,
  allValues: VariableWithValues[],
  listPosition: number
): VariableValueValue => {
  if ((editorValue as CustomElement).variableId !== undefined) {
    return {
      id: -1,
      listPosition,
      type: 'SectionVariable',
      variableId: (editorValue as CustomElement).variableId!,
      displayStyle: (editorValue as CustomElement).reference ? undefined : 'Inline',
      usageType: (editorValue as CustomElement).reference ? 'Reference' : 'Injection',
    };
  }
  return {
    id: -1,
    listPosition,
    type: 'SectionText',
    textValue: (editorValue as CustomText).text,
  };
};
