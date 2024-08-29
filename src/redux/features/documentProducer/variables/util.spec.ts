import { Variable } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

import { mergeVariablesAndValues } from './util';

describe('mergeVariablesAndValues', () => {
  it('correctly merges table variables with values associated to outdated variables', () => {
    const tableStableId = '1130';
    const tableVariableIdCurrent = 250;

    const columnStableIdLocalName = '1131';
    const columnVariableIdLocalNameCurrent = 251;

    const columnStableIdFamily = '1132';
    const columnVariableIdFamilyCurrent = 252;

    const row1IdCurrent = 2616;
    const row2IdCurrent = 2622;

    const variables: Variable[] = [
      {
        type: 'Table',
        columns: [
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Local Name',
              id: columnVariableIdLocalNameCurrent,
              stableId: columnStableIdLocalName,
              isList: false,
              textType: 'SingleLine',
            },
          },
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Family',
              id: columnVariableIdFamilyCurrent,
              stableId: columnStableIdFamily,
              isList: false,
              textType: 'SingleLine',
            },
          },
        ],
        isRequired: false,
        position: 0,
        name: 'Invasive species to remove',
        id: tableVariableIdCurrent,
        stableId: tableStableId,
        isList: true,
        deliverableId: 27,
        deliverableQuestion:
          'What are the invasive and problematic species that would need to be removed during land preparation?',
        tableStyle: 'Horizontal',
      },
    ];

    const values: VariableValue[] = [
      {
        status: 'In Review',
        variableId: tableVariableIdCurrent,
        values: [
          {
            type: 'Table',
            id: row1IdCurrent,
            listPosition: 0,
          },
          {
            type: 'Table',
            id: row2IdCurrent,
            listPosition: 1,
          },
        ],
      },
      {
        status: 'In Review',
        variableId: columnVariableIdLocalNameCurrent,
        rowValueId: row1IdCurrent,
        values: [
          {
            type: 'Text',
            id: 2517,
            listPosition: 0,
            textValue: 'Row 1 local name',
          },
        ],
      },
      {
        status: 'In Review',
        variableId: columnVariableIdLocalNameCurrent,
        rowValueId: row2IdCurrent,
        values: [
          {
            type: 'Text',
            id: 2624,
            listPosition: 0,
            textValue: 'Row 2 local name',
          },
        ],
      },
      {
        status: 'In Review',
        variableId: columnVariableIdFamilyCurrent,
        rowValueId: row1IdCurrent,
        values: [
          {
            type: 'Text',
            id: 2518,
            listPosition: 0,
            textValue: 'Row 1 family',
          },
        ],
      },
      {
        status: 'In Review',
        variableId: columnVariableIdFamilyCurrent,
        rowValueId: row2IdCurrent,
        values: [
          {
            type: 'Text',
            id: 2625,
            listPosition: 0,
            textValue: 'Row 2 family',
          },
        ],
      },
    ];

    const expected = [
      {
        type: 'Table',
        columns: [
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Local Name',
              id: columnVariableIdLocalNameCurrent,
              stableId: columnStableIdLocalName,
              isList: false,
              textType: 'SingleLine',
              values: [
                {
                  type: 'Text',
                  id: 2517,
                  listPosition: 0,
                  textValue: 'Row 1 local name',
                },
                {
                  type: 'Text',
                  id: 2624,
                  listPosition: 0,
                  textValue: 'Row 2 local name',
                },
              ],
              variableValues: [
                {
                  status: 'In Review',
                  variableId: columnVariableIdLocalNameCurrent,
                  rowValueId: row1IdCurrent,
                  values: [
                    {
                      type: 'Text',
                      id: 2517,
                      listPosition: 0,
                      textValue: 'Row 1 local name',
                    },
                  ],
                },
                {
                  status: 'In Review',
                  variableId: columnVariableIdLocalNameCurrent,
                  rowValueId: row2IdCurrent,
                  values: [
                    {
                      type: 'Text',
                      id: 2624,
                      listPosition: 0,
                      textValue: 'Row 2 local name',
                    },
                  ],
                },
              ],
            },
          },
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Family',
              id: columnVariableIdFamilyCurrent,
              stableId: columnStableIdFamily,
              isList: false,
              textType: 'SingleLine',
              values: [
                {
                  type: 'Text',
                  id: 2518,
                  listPosition: 0,
                  textValue: 'Row 1 family',
                },
                {
                  type: 'Text',
                  id: 2625,
                  listPosition: 0,
                  textValue: 'Row 2 family',
                },
              ],
              variableValues: [
                {
                  status: 'In Review',
                  variableId: columnVariableIdFamilyCurrent,
                  rowValueId: row1IdCurrent,
                  values: [
                    {
                      type: 'Text',
                      id: 2518,
                      listPosition: 0,
                      textValue: 'Row 1 family',
                    },
                  ],
                },
                {
                  status: 'In Review',
                  variableId: columnVariableIdFamilyCurrent,
                  rowValueId: row2IdCurrent,
                  values: [
                    {
                      type: 'Text',
                      id: 2625,
                      listPosition: 0,
                      textValue: 'Row 2 family',
                    },
                  ],
                },
              ],
            },
          },
        ],
        isRequired: false,
        position: 0,
        name: 'Invasive species to remove',
        id: tableVariableIdCurrent,
        stableId: tableStableId,
        isList: true,
        deliverableId: 27,
        deliverableQuestion:
          'What are the invasive and problematic species that would need to be removed during land preparation?',
        tableStyle: 'Horizontal',
        values: [
          {
            type: 'Table',
            id: row1IdCurrent,
            listPosition: 0,
          },
          {
            type: 'Table',
            id: row2IdCurrent,
            listPosition: 1,
          },
        ],
        variableValues: [
          {
            status: 'In Review',
            variableId: tableVariableIdCurrent,
            values: [
              {
                type: 'Table',
                id: row1IdCurrent,
                listPosition: 0,
              },
              {
                type: 'Table',
                id: row2IdCurrent,
                listPosition: 1,
              },
            ],
          },
        ],
      },
    ];

    expect(mergeVariablesAndValues(variables, values)).toEqual(expected);
  });

  it('correctly merges table variables with values associated to outdated variables', () => {
    const tableStableId = '1130';
    const tableVariableIdCurrent = 250;
    const tableVariableIdOutdated = 188;

    const columnStableIdLocalName = '1131';
    const columnVariableIdLocalNameCurrent = 251;
    const columnVariableIdLocalNameOutdated = 189;

    const columnStableIdFamily = '1132';
    const columnVariableIdFamilyCurrent = 252;
    const columnVariableIdFamilyOutdated = 190;

    const row1IdCurrent = 2616;
    const row1IdOutdated = 2516;

    const row2IdCurrent = 2622;
    const row2IdOutdated = 2522;

    const variables: Variable[] = [
      {
        type: 'Table',
        columns: [
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Local Name',
              id: columnVariableIdLocalNameCurrent,
              stableId: columnStableIdLocalName,
              isList: false,
              replacesVariableId: columnVariableIdLocalNameOutdated,
              textType: 'SingleLine',
            },
          },
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Family',
              id: columnVariableIdFamilyCurrent,
              stableId: columnStableIdFamily,
              isList: false,
              replacesVariableId: columnVariableIdFamilyOutdated,
              textType: 'SingleLine',
            },
          },
        ],
        isRequired: false,
        position: 0,
        name: 'Invasive species to remove',
        id: tableVariableIdCurrent,
        stableId: tableStableId,
        isList: true,
        deliverableId: 27,
        deliverableQuestion:
          'What are the invasive and problematic species that would need to be removed during land preparation?',
        replacesVariableId: tableVariableIdOutdated,
        tableStyle: 'Horizontal',
      },
      {
        type: 'Table',
        columns: [
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Local Name',
              id: columnVariableIdLocalNameOutdated,
              stableId: '1131',
              isList: false,
              deliverableId: 27,
              replacesVariableId: 129,
              textType: 'SingleLine',
            },
          },
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              description: 'Test description',
              name: 'Family',
              id: columnVariableIdFamilyOutdated,
              stableId: columnStableIdFamily,
              isList: false,
              deliverableId: 27,
              replacesVariableId: 130,
              textType: 'SingleLine',
            },
          },
        ],
        isRequired: false,
        position: 0,
        name: 'Invasive species to remove',
        id: tableVariableIdOutdated,
        stableId: tableStableId,
        isList: true,
        deliverableId: 27,
        deliverableQuestion:
          'What are the invasive and problematic species that would need to be removed during land preparation?',
        replacesVariableId: 128,
        tableStyle: 'Horizontal',
      },
    ];

    const values: VariableValue[] = [
      {
        status: 'In Review',
        variableId: tableVariableIdCurrent,
        values: [
          {
            type: 'Table',
            id: row1IdCurrent,
            listPosition: 0,
          },
          {
            type: 'Table',
            id: row2IdCurrent,
            listPosition: 1,
          },
        ],
      },
      {
        status: 'In Review',
        variableId: tableVariableIdOutdated,
        values: [
          {
            type: 'Table',
            id: row1IdOutdated,
            listPosition: 0,
          },
          {
            type: 'Table',
            id: row2IdOutdated,
            listPosition: 1,
          },
        ],
      },
      {
        status: 'In Review',
        variableId: columnVariableIdLocalNameOutdated,
        rowValueId: row1IdOutdated,
        values: [
          {
            type: 'Text',
            id: 2517,
            listPosition: 0,
            textValue: 'Row 1 local name',
          },
        ],
      },
      {
        status: 'In Review',
        variableId: columnVariableIdLocalNameOutdated,
        rowValueId: row2IdOutdated,
        values: [
          {
            type: 'Text',
            id: 2624,
            listPosition: 0,
            textValue: 'Row 2 local name',
          },
        ],
      },
      {
        status: 'In Review',
        variableId: columnVariableIdFamilyOutdated,
        rowValueId: row1IdOutdated,
        values: [
          {
            type: 'Text',
            id: 2518,
            listPosition: 0,
            textValue: 'Row 1 family',
          },
        ],
      },
      {
        status: 'In Review',
        variableId: columnVariableIdFamilyOutdated,
        rowValueId: row2IdOutdated,
        values: [
          {
            type: 'Text',
            id: 2625,
            listPosition: 0,
            textValue: 'Row 2 family',
          },
        ],
      },
    ];

    const expected = [
      {
        type: 'Table',
        columns: [
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Local Name',
              id: columnVariableIdLocalNameCurrent,
              stableId: columnStableIdLocalName,
              isList: false,
              replacesVariableId: columnVariableIdLocalNameOutdated,
              replacementColumnVariableId: columnVariableIdLocalNameCurrent,
              textType: 'SingleLine',
              values: [
                {
                  type: 'Text',
                  id: 2517,
                  listPosition: 0,
                  textValue: 'Row 1 local name',
                },
                {
                  type: 'Text',
                  id: 2624,
                  listPosition: 0,
                  textValue: 'Row 2 local name',
                },
              ],
              variableValues: [
                {
                  status: 'In Review',
                  variableId: columnVariableIdLocalNameOutdated,
                  rowValueId: row1IdOutdated,
                  values: [
                    {
                      type: 'Text',
                      id: 2517,
                      listPosition: 0,
                      textValue: 'Row 1 local name',
                    },
                  ],
                },
                {
                  status: 'In Review',
                  variableId: columnVariableIdLocalNameOutdated,
                  rowValueId: row2IdOutdated,
                  values: [
                    {
                      type: 'Text',
                      id: 2624,
                      listPosition: 0,
                      textValue: 'Row 2 local name',
                    },
                  ],
                },
              ],
            },
          },
          {
            isHeader: false,
            variable: {
              type: 'Text',
              isRequired: false,
              position: 0,
              name: 'Family',
              id: columnVariableIdFamilyCurrent,
              stableId: columnStableIdFamily,
              isList: false,
              replacesVariableId: columnVariableIdFamilyOutdated,
              replacementColumnVariableId: columnVariableIdFamilyCurrent,
              textType: 'SingleLine',
              values: [
                {
                  type: 'Text',
                  id: 2518,
                  listPosition: 0,
                  textValue: 'Row 1 family',
                },
                {
                  type: 'Text',
                  id: 2625,
                  listPosition: 0,
                  textValue: 'Row 2 family',
                },
              ],
              variableValues: [
                {
                  status: 'In Review',
                  variableId: columnVariableIdFamilyOutdated,
                  rowValueId: row1IdOutdated,
                  values: [
                    {
                      type: 'Text',
                      id: 2518,
                      listPosition: 0,
                      textValue: 'Row 1 family',
                    },
                  ],
                },
                {
                  status: 'In Review',
                  variableId: columnVariableIdFamilyOutdated,
                  rowValueId: row2IdOutdated,
                  values: [
                    {
                      type: 'Text',
                      id: 2625,
                      listPosition: 0,
                      textValue: 'Row 2 family',
                    },
                  ],
                },
              ],
            },
          },
        ],
        isRequired: false,
        position: 0,
        name: 'Invasive species to remove',
        id: tableVariableIdCurrent,
        stableId: tableStableId,
        isList: true,
        deliverableId: 27,
        deliverableQuestion:
          'What are the invasive and problematic species that would need to be removed during land preparation?',
        replacesVariableId: tableVariableIdOutdated,
        tableStyle: 'Horizontal',
        values: [
          {
            type: 'Table',
            id: row1IdOutdated,
            listPosition: 0,
          },
          {
            type: 'Table',
            id: row2IdOutdated,
            listPosition: 1,
          },
        ],
        variableValues: [
          {
            status: 'In Review',
            variableId: tableVariableIdOutdated,
            replacementVariableId: tableVariableIdCurrent,
            values: [
              {
                type: 'Table',
                id: row1IdOutdated,
                listPosition: 0,
              },
              {
                type: 'Table',
                id: row2IdOutdated,
                listPosition: 1,
              },
            ],
          },
        ],
      },
    ];

    expect(mergeVariablesAndValues(variables, values)).toEqual(expected);
  });
});
