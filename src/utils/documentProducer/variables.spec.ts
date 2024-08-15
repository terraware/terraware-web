import { DependencyCondition, DependencyConditions, VariableWithValues } from 'src/types/documentProducer/Variable';

import { variableDependencyMet } from './variables';

const variableWithNumberVariableDependencyGT0: VariableWithValues = {
  type: 'Number',
  name: 'Planting Density: Agroforestry (trees per ha)',
  id: 169,
  isList: false,
  deliverableId: 27,
  dependencyVariableStableId: '15',
  stableId: '16',
  decimalPlaces: 0,
  dependencyCondition: 'gt',
  dependencyValue: '0',
  position: 0,
  values: [],
  variableValues: [],
};

const dependedOnNumberVariableWithNoValue: VariableWithValues = {
  type: 'Number',
  name: 'Land Use Model: Agroforestry (ha)',
  id: 168,
  isList: false,
  description:
    'Planted or regenerated forest supplemented with plantings primarily to produce agricultural crops and other non-timber forest products (e.g. medicinal plants, honey, etc.). ',
  deliverableId: 27,
  stableId: '15',
  decimalPlaces: 0,
  position: 0,
  values: [],
  variableValues: [],
};

describe('variableDependencyMet - depended on variables with no values', () => {
  // All conditions should fail when there is no value in the depended on variable
  test.each(DependencyConditions)(
    'Dependency condition %s should fail if the depended on variable has no value',
    (dependencyCondition: DependencyCondition) => {
      const variableWithNumberVariableDependency: VariableWithValues = {
        ...variableWithNumberVariableDependencyGT0,
        dependencyCondition,
      };

      expect(
        variableDependencyMet(variableWithNumberVariableDependency, [dependedOnNumberVariableWithNoValue])
      ).toBeFalsy();
    }
  );
});

describe('variableDependencyMet - select variables', () => {
  it('should correctly identify whether or not a select variable dependency is met', () => {
    const variableWithSelectVariableDependency: VariableWithValues = {
      type: 'Number',
      name: 'Total Expansion Potential (ha)',
      id: 177,
      isList: false,
      deliverableId: 27,
      dependencyVariableStableId: '23',
      stableId: '24',
      decimalPlaces: 0,
      dependencyCondition: 'eq',
      dependencyValue: 'Yes',
      position: 0,
      values: [],
      variableValues: [],
    };

    const dependedOnSelectVariableWithNoValue: VariableWithValues = {
      type: 'Select',
      options: [
        {
          name: 'Yes',
          id: 243,
        },
        {
          name: 'No',
          id: 244,
        },
      ],
      name: 'Has Expansion Potential',
      id: 176,
      isMultiple: false,
      isList: false,
      deliverableId: 27,
      stableId: '23',
      position: 0,
      values: [],
      variableValues: [],
    };

    expect(
      variableDependencyMet(variableWithSelectVariableDependency, [dependedOnSelectVariableWithNoValue])
    ).toBeFalsy();

    // The variable is looking for "Yes" which has option value ID 243
    const dependedOnSelectVariableWithCorrectValue: VariableWithValues = {
      ...dependedOnSelectVariableWithNoValue,
      values: [
        {
          type: 'Select',
          id: 2592,
          listPosition: 0,
          optionValues: [243],
        },
      ],
      variableValues: [
        {
          status: 'In Review',
          variableId: 176,
          values: [
            {
              type: 'Select',
              id: 2592,
              listPosition: 0,
              optionValues: [243],
            },
          ],
        },
      ],
    };

    expect(
      variableDependencyMet(variableWithSelectVariableDependency, [dependedOnSelectVariableWithCorrectValue])
    ).toBeTruthy();

    // "No" is 244
    const dependedOnSelectVariableWithIncorrectValue: VariableWithValues = {
      ...dependedOnSelectVariableWithNoValue,
      values: [
        {
          type: 'Select',
          id: 2592,
          listPosition: 0,
          optionValues: [244],
        },
      ],
      variableValues: [
        {
          status: 'In Review',
          variableId: 176,
          values: [
            {
              type: 'Select',
              id: 2592,
              listPosition: 0,
              optionValues: [244],
            },
          ],
        },
      ],
    };

    expect(
      variableDependencyMet(variableWithSelectVariableDependency, [dependedOnSelectVariableWithIncorrectValue])
    ).toBeFalsy();
  });
});

describe('variableDependencyMet - number variables', () => {
  const dependedOnNumberVariableWith0Value: VariableWithValues = {
    ...dependedOnNumberVariableWithNoValue,
    values: [
      {
        type: 'Number',
        id: 2592,
        listPosition: 0,
        numberValue: 0,
      },
    ],
  };

  const dependedOnNumberVariableWith1Value: VariableWithValues = {
    ...dependedOnNumberVariableWithNoValue,
    values: [
      {
        type: 'Number',
        id: 2592,
        listPosition: 0,
        numberValue: 1,
      },
    ],
  };

  it('should correctly identify whether or not a number variable dependency is met - gt', () => {
    expect(
      variableDependencyMet(variableWithNumberVariableDependencyGT0, [dependedOnNumberVariableWith0Value])
    ).toBeFalsy();

    expect(
      variableDependencyMet(variableWithNumberVariableDependencyGT0, [dependedOnNumberVariableWith1Value])
    ).toBeTruthy();
  });

  it('should correctly identify whether or not a number variable dependency is met - gte', () => {
    const variableWithNumberVariableDependencyGTE0: VariableWithValues = {
      ...variableWithNumberVariableDependencyGT0,
      dependencyCondition: 'gte',
    };

    expect(
      variableDependencyMet(variableWithNumberVariableDependencyGTE0, [dependedOnNumberVariableWith0Value])
    ).toBeTruthy();

    const dependedOnNumberVariableWithMinus1Value: VariableWithValues = {
      ...dependedOnNumberVariableWithNoValue,
      values: [
        {
          type: 'Number',
          id: 2592,
          listPosition: 0,
          numberValue: -1,
        },
      ],
    };

    expect(
      variableDependencyMet(variableWithNumberVariableDependencyGTE0, [dependedOnNumberVariableWithMinus1Value])
    ).toBeFalsy();
  });

  it('should correctly identify whether or not a number variable dependency is met - lt', () => {
    // Checking for "less than 1"
    const variableWithNumberVariableDependencyLT1: VariableWithValues = {
      ...variableWithNumberVariableDependencyGT0,
      dependencyCondition: 'lt',
      dependencyValue: '1',
    };

    expect(
      variableDependencyMet(variableWithNumberVariableDependencyLT1, [dependedOnNumberVariableWith0Value])
    ).toBeTruthy();

    expect(
      variableDependencyMet(variableWithNumberVariableDependencyLT1, [dependedOnNumberVariableWith1Value])
    ).toBeFalsy();
  });

  it('should correctly identify whether or not a number variable dependency is met - lte', () => {
    const variableWithNumberVariableDependencyLTE0: VariableWithValues = {
      ...variableWithNumberVariableDependencyGT0,
      dependencyCondition: 'lte',
    };

    // Checking for "less than or equal to 0"
    expect(
      variableDependencyMet(variableWithNumberVariableDependencyLTE0, [dependedOnNumberVariableWith0Value])
    ).toBeTruthy();

    expect(
      variableDependencyMet(variableWithNumberVariableDependencyLTE0, [dependedOnNumberVariableWith1Value])
    ).toBeFalsy();
  });

  it('should correctly identify whether or not a number variable dependency is met - eq', () => {
    const variableWithNumberVariableDependencyEQ0: VariableWithValues = {
      ...variableWithNumberVariableDependencyGT0,
      dependencyCondition: 'eq',
    };

    // Checking for "equal to 0"
    expect(
      variableDependencyMet(variableWithNumberVariableDependencyEQ0, [dependedOnNumberVariableWith0Value])
    ).toBeTruthy();

    expect(
      variableDependencyMet(variableWithNumberVariableDependencyEQ0, [dependedOnNumberVariableWith1Value])
    ).toBeFalsy();
  });

  it('should correctly identify whether or not a number variable dependency is met - eq', () => {
    const variableWithNumberVariableDependencyEQ0: VariableWithValues = {
      ...variableWithNumberVariableDependencyGT0,
      dependencyCondition: 'neq',
    };

    // Checking for "equal to 0"
    expect(
      variableDependencyMet(variableWithNumberVariableDependencyEQ0, [dependedOnNumberVariableWith0Value])
    ).toBeFalsy();

    expect(
      variableDependencyMet(variableWithNumberVariableDependencyEQ0, [dependedOnNumberVariableWith1Value])
    ).toBeTruthy();
  });
});

describe('variableDependencyMet - text variables', () => {
  const dependedOnTextVariableWithFooValue: VariableWithValues = {
    ...dependedOnNumberVariableWithNoValue,
    type: 'Text',
    textType: 'SingleLine',
    values: [
      {
        type: 'Text',
        id: 2592,
        listPosition: 0,
        // Text match is case insensitive
        textValue: 'FoO',
      },
    ],
  };

  const dependedOnTextVariableWithBarValue: VariableWithValues = {
    ...dependedOnTextVariableWithFooValue,
    values: [
      {
        type: 'Text',
        id: 2592,
        listPosition: 0,
        textValue: 'bar',
      },
    ],
  };

  it('should correctly identify whether or not a text variable dependency is met - eq', () => {
    const variableWithTextVariableDependencyEQFoo: VariableWithValues = {
      ...variableWithNumberVariableDependencyGT0,
      dependencyCondition: 'eq',
      dependencyValue: 'foo',
    };

    expect(
      variableDependencyMet(variableWithTextVariableDependencyEQFoo, [dependedOnTextVariableWithFooValue])
    ).toBeTruthy();

    expect(
      variableDependencyMet(variableWithTextVariableDependencyEQFoo, [dependedOnTextVariableWithBarValue])
    ).toBeFalsy();
  });

  it('should correctly identify whether or not a text variable dependency is met - neq', () => {
    const variableWithTextVariableDependencyEQFoo: VariableWithValues = {
      ...variableWithNumberVariableDependencyGT0,
      dependencyCondition: 'neq',
      dependencyValue: 'foo',
    };

    expect(
      variableDependencyMet(variableWithTextVariableDependencyEQFoo, [dependedOnTextVariableWithFooValue])
    ).toBeFalsy();

    expect(
      variableDependencyMet(variableWithTextVariableDependencyEQFoo, [dependedOnTextVariableWithBarValue])
    ).toBeTruthy();
  });
});
