import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueSelectValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';

import { TextElement, VariableElement, isVariableElement } from './types';

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
      result = `${variable.values.length} ${strings.IMAGES}`;
      break;
    case 'Table':
      result = `${variable.values.length} ${strings.ENTRIES}`;
      break;
    case 'Select':
      const selectedValues = (variable.values[0] as VariableValueSelectValue)?.optionValues;
      result =
        variable.options
          .filter((o) => selectedValues?.includes(o.id))
          .map((o) => o.name)
          .join(', ') ||
        (placeholder ?? '');
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
): VariableElement | TextElement => {
  switch (variableValue.type) {
    case 'SectionText':
      return { type: 'text', children: [{ text: variableValue.textValue ?? '' }] };
    case 'SectionVariable':
      const value = allValues.find((v) => v.id === variableValue.variableId);
      return {
        type: 'variable',
        variableId: value?.id,
        children: [{ text: '' }],
        reference: variableValue.usageType === 'Reference',
      };
    default:
      return { type: 'text', children: [{ text: '' }] };
  }
};

export const variableValueFromEditorValue = (
  editorValue: VariableElement | TextElement,
  listPosition: number
): VariableValueValue => {
  if (isVariableElement(editorValue)) {
    return {
      id: -1,
      listPosition,
      type: 'SectionVariable',
      variableId: editorValue.variableId!,
      displayStyle: editorValue.reference ? undefined : 'Inline',
      usageType: editorValue.reference ? 'Reference' : 'Injection',
    };
  }

  return {
    id: -1,
    listPosition,
    type: 'SectionText',
    // Can we get rid of this? TextElement and CustomText should be the same thing. The SectionElement should be the only
    // one with `children` if possible
    textValue: editorValue.children[0].text,
  };
};
