import React from 'react';

import { Story } from '@storybook/react';

import TextVariable, { TextVariableProps } from 'src/components/DocumentProducer/EditableSection/TextVariable';

const TextVariableTemplate: Story<TextVariableProps> = (args: TextVariableProps) => {
  return <TextVariable {...args} />;
};

export default {
  title: 'TextVariable',
  component: TextVariable,
};

export const EmptyVariable = TextVariableTemplate.bind({});

EmptyVariable.args = {
  icon: 'iconVariable',
  variable: {
    type: 'Number',
    position: 0,
    minValue: 0,
    name: 'Project Size',
    id: 60,
    decimalPlaces: 0,
    stableId: '1111',
    isList: false,
    isRequired: false,
    values: [],
    variableValues: [],
  },
};

export const NumberVariable = TextVariableTemplate.bind({});
NumberVariable.args = {
  icon: 'iconVariable',
  variable: {
    type: 'Number',
    position: 0,
    minValue: 0,
    name: 'Project Size',
    id: 60,
    decimalPlaces: 0,
    stableId: '1111',
    isList: false,
    isRequired: false,
    values: [
      {
        type: 'Number',
        id: 470,
        listPosition: 0,
        numberValue: 5,
      },
    ],
    variableValues: [
      {
        variableId: 60,
        status: 'Not Submitted',
        values: [
          {
            type: 'Number',
            id: 470,
            listPosition: 0,
            numberValue: 5,
          },
        ],
      },
    ],
  },
};

export const DeliverableVariable = TextVariableTemplate.bind({});
DeliverableVariable.args = {
  icon: 'iconVariable',
  variable: {
    deliverableId: 127,
    type: 'Number',
    position: 0,
    minValue: 0,
    name: 'Project Size',
    id: 60,
    decimalPlaces: 0,
    stableId: '1111',
    isList: false,
    isRequired: false,
    values: [
      {
        type: 'Number',
        id: 470,
        listPosition: 0,
        numberValue: 5,
      },
    ],
    variableValues: [
      {
        variableId: 60,
        status: 'Not Submitted',
        values: [
          {
            type: 'Number',
            id: 470,
            listPosition: 0,
            numberValue: 5,
          },
        ],
      },
    ],
  },
};

export const RejectedDeliverableVariable = TextVariableTemplate.bind({});
RejectedDeliverableVariable.args = {
  icon: 'iconVariable',
  variable: {
    deliverableId: 127,
    type: 'Number',
    position: 0,
    minValue: 0,
    name: 'Project Size',
    id: 60,
    decimalPlaces: 0,
    stableId: '1111',
    isList: false,
    isRequired: false,
    values: [
      {
        type: 'Number',
        id: 470,
        listPosition: 0,
        numberValue: 5,
      },
    ],
    variableValues: [
      {
        variableId: 60,
        status: 'Rejected',
        values: [
          {
            type: 'Number',
            id: 470,
            listPosition: 0,
            numberValue: 5,
          },
        ],
      },
    ],
  },
};
