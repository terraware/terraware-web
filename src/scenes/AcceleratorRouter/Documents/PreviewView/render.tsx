import React from 'react';

import { SectionVariableWithValues, VariableUnion, isSelectVariable } from 'src/types/documentProducer/Variable';
import {
  CombinedInjectedValue,
  DateVariableValue,
  ExistingVariableValueUnion,
  LinkVariableValue,
  NumberVariableValue,
  SelectVariableValue,
  TextVariableValue,
  isDateVariableValue,
  isLinkVariableValue,
  isNumberVariableValue,
  isSelectVariableValue,
  isTextVariableValue,
} from 'src/types/documentProducer/VariableValue';
import { memoize } from 'src/utils/memoize';

import { getSourceVariable } from './util';

const dateVariablePreview = (variableValue: DateVariableValue) => variableValue.dateValue;

const linkVariablePreview = (variableValue: LinkVariableValue): React.ReactElement => (
  <a href={variableValue.url}>{variableValue.url}</a>
);

const numberVariablePreview = (variableValue: NumberVariableValue) => variableValue.numberValue;

const selectVariablePreview = (
  variableValue: SelectVariableValue,
  combinedInjectedValue: CombinedInjectedValue,
  sectionVariable: SectionVariableWithValues
) => {
  // Attempt to find the source variable which will have the pretty names for the select options
  const sourceVariable: VariableUnion | undefined = getSourceVariable(combinedInjectedValue, sectionVariable);
  if (!sourceVariable || !isSelectVariable(sourceVariable)) {
    return variableValue.optionValues.join(',');
  }

  return variableValue.optionValues
    .map((optionValue: number) => {
      const foundOption = sourceVariable.options.find(
        (sourceVariableOption) => sourceVariableOption.id === optionValue
      );

      if (!foundOption) {
        return optionValue;
      }

      return foundOption.renderedText || foundOption.name;
    })
    .join(',');
};

const textVariablePreview = (variableValue: TextVariableValue) => variableValue.textValue;

export const getPrintValue = memoize(
  (
    combinedInjectedValue: CombinedInjectedValue,
    variableValue: ExistingVariableValueUnion,
    sectionVariable: SectionVariableWithValues
  ) =>
    // A typesafe `when` like in kotlin would be great here! I tried using my `switch (true)` janky `when` analogue
    // but it isn't typesafe according to the TS compiler!
    (isTextVariableValue(variableValue) ? textVariablePreview(variableValue) : false) ||
    (isNumberVariableValue(variableValue) ? numberVariablePreview(variableValue) : false) ||
    (isDateVariableValue(variableValue) ? dateVariablePreview(variableValue) : false) ||
    (isSelectVariableValue(variableValue)
      ? selectVariablePreview(variableValue, combinedInjectedValue, sectionVariable)
      : false) ||
    (isLinkVariableValue(variableValue) ? linkVariablePreview(variableValue) : false) ||
    ''
);
