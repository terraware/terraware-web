import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import { collectTablesForPreview, hasMarkdownTableHeaderSeparatorRow, hasMarkdownTableRow } from './markdown-table';

describe('collectTablesForPreview', () => {
  it('collects the tables for use in document preview, each line is a new section text', () => {
    const filler1: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 371547,
        listPosition: 0,
        textValue: 'The communities involved are ',
      },
      {
        type: 'SectionVariable',
        id: 371548,
        listPosition: 1,
        variableId: 916,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 371553,
        listPosition: 2,
        textValue: "Here's a table that was added via markdown to the section's default text",
      },
    ];

    const filler2: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 371559,
        listPosition: 8,
        textValue: '\n',
      },
      {
        type: 'SectionText',
        id: 371560,
        listPosition: 9,
        textValue: 'The table is done',
      },
    ];

    const inputValues: VariableValueValue[] = [
      ...filler1,
      {
        type: 'SectionText',
        id: 371554,
        listPosition: 3,
        textValue: '| Name | Role     | City           |\n',
      },
      {
        type: 'SectionText',
        id: 371555,
        listPosition: 4,
        textValue: '| --- | -------- | -------------- |\n',
      },
      {
        type: 'SectionText',
        id: 371556,
        listPosition: 5,
        textValue: '| John | PM       | New York       |\n',
      },
      {
        type: 'SectionText',
        id: 371557,
        listPosition: 6,
        // Can handle empty cells with or without a space
        textValue: '| Jane || Paris |\n',
      },
      {
        type: 'SectionText',
        id: 371558,
        listPosition: 7,
        // Can handle empty cells with or without a space
        textValue: '| Mike |Engineer| |',
      },
      ...filler2,
    ];

    expect(collectTablesForPreview(inputValues)).toEqual([
      ...filler1,
      {
        startingValueId: 371554,
        headers: ['Name', 'Role', 'City'],
        rows: [
          ['John', 'PM', 'New York'],
          ['Jane', '', 'Paris'],
          ['Mike', 'Engineer', ''],
        ],
      },
      ...filler2,
    ]);
  });

  it('collects the tables for use in document preview, single section text with newlines', () => {
    const filler1: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 371547,
        listPosition: 0,
        textValue: 'The communities involved are ',
      },
      {
        type: 'SectionVariable',
        id: 371548,
        listPosition: 1,
        variableId: 916,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 371553,
        listPosition: 2,
        textValue: "Here's a table that was added via markdown to the section's default text",
      },
    ];

    const filler2: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 371559,
        listPosition: 4,
        textValue: '\n',
      },
      {
        type: 'SectionText',
        id: 371560,
        listPosition: 5,
        textValue: 'The table is done',
      },
    ];

    const inputValues: VariableValueValue[] = [
      ...filler1,
      {
        type: 'SectionText',
        id: 371554,
        listPosition: 3,
        textValue:
          '| Name | Role     | City           |\n| --- | -------- | -------------- |\n| John | PM       | New York       |\n| Jane || Paris |\n| Mike |Engineer| |',
      },
      ...filler2,
    ];

    expect(collectTablesForPreview(inputValues)).toEqual([
      ...filler1,
      {
        startingValueId: 371554,
        headers: ['Name', 'Role', 'City'],
        rows: [
          ['John', 'PM', 'New York'],
          ['Jane', '', 'Paris'],
          ['Mike', 'Engineer', ''],
        ],
      },
      ...filler2,
    ]);
  });

  it('collects the tables for use in document preview, section texts with newlines and variable injection', () => {
    const filler1: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 371547,
        listPosition: 0,
        textValue: 'The communities involved are ',
      },
      {
        type: 'SectionVariable',
        id: 371548,
        listPosition: 1,
        variableId: 916,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 371553,
        listPosition: 2,
        textValue: "Here's a table that was added via markdown to the section's default text",
      },
    ];

    const filler2: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 371557,
        listPosition: 6,
        textValue: '\n',
      },
      {
        type: 'SectionText',
        id: 371558,
        listPosition: 7,
        textValue: 'The table is done',
      },
    ];

    const inputValues: VariableValueValue[] = [
      ...filler1,
      {
        type: 'SectionText',
        id: 371554,
        listPosition: 3,
        textValue:
          '| Name | Role     | City           |\n| --- | -------- | -------------- |\n| John | PM       | New York       |\n| Jane ||',
      },
      {
        type: 'SectionVariable',
        id: 371555,
        listPosition: 4,
        variableId: 916,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 371556,
        listPosition: 5,
        textValue: ' |\n| Mike |Engineer| |',
      },
      ...filler2,
    ];

    expect(collectTablesForPreview(inputValues)).toEqual([
      ...filler1,
      {
        startingValueId: 371554,
        headers: ['Name', 'Role', 'City'],
        rows: [
          ['John', 'PM', 'New York'],
          [
            'Jane',
            '',
            {
              type: 'SectionVariable',
              id: 371555,
              listPosition: 4,
              variableId: 916,
              usageType: 'Injection',
              displayStyle: 'Inline',
            },
          ],
          ['Mike', 'Engineer', ''],
        ],
      },
      ...filler2,
    ]);
  });

  it('collects the tables for use in document preview, section texts with a variable injection within other text within a cell', () => {
    const inputValues: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 687,
        listPosition: 0,
        textValue:
          '| Document | Requirement | Applicability|\n| --- | --- | --- |\n| VCS Standard v4.7 (3.1.2) | Projects shall apply methodologies eligible under the VCS Program. | Project is eligible under ',
      },
      {
        type: 'SectionVariable',
        id: 688,
        listPosition: 1,
        variableId: 240,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 689,
        listPosition: 2,
        textValue: '. |\n',
      },
    ];

    expect(collectTablesForPreview(inputValues)).toEqual([
      {
        startingValueId: 687,
        headers: ['Document', 'Requirement', 'Applicability'],
        rows: [
          [
            'VCS Standard v4.7 (3.1.2)',
            'Projects shall apply methodologies eligible under the VCS Program.',
            [
              'Project is eligible under ',
              {
                type: 'SectionVariable',
                id: 688,
                listPosition: 1,
                variableId: 240,
                usageType: 'Injection',
                displayStyle: 'Inline',
              },
              '. ',
            ],
          ],
        ],
      },
    ]);
  });

  it('collects the tables for use in document preview, section texts with multiple variable injections within other text within a cell', () => {
    const inputValues: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 687,
        listPosition: 0,
        textValue:
          '| Document | Requirement | Applicability|\n| --- | --- | --- |\n| VCS Standard v4.7 (3.1.4) | Projects and the implementation of project activities shall not lead to the violation of any applicable law, regardless of whether or not the law is enforced. | The project ',
      },
      {
        type: 'SectionVariable',
        id: 690,
        listPosition: 3,
        variableId: 245,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 691,
        listPosition: 4,
        textValue: ' complies with local and national laws and regulations, and ',
      },
      {
        type: 'SectionVariable',
        id: 692,
        listPosition: 5,
        variableId: 246,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 693,
        listPosition: 6,
        textValue: ' lead to the violation of any laws. |\n',
      },
    ];

    expect(collectTablesForPreview(inputValues)).toEqual([
      {
        startingValueId: 687,
        headers: ['Document', 'Requirement', 'Applicability'],
        rows: [
          [
            'VCS Standard v4.7 (3.1.4)',
            'Projects and the implementation of project activities shall not lead to the violation of any applicable law, regardless of whether or not the law is enforced.',
            [
              'The project ',
              {
                type: 'SectionVariable',
                id: 690,
                listPosition: 3,
                variableId: 245,
                usageType: 'Injection',
                displayStyle: 'Inline',
              },
              ' complies with local and national laws and regulations, and ',
              {
                type: 'SectionVariable',
                id: 692,
                listPosition: 5,
                variableId: 246,
                usageType: 'Injection',
                displayStyle: 'Inline',
              },
              ' lead to the violation of any laws. ',
            ],
          ],
        ],
      },
    ]);
  });

  it('collects the tables for use in document preview, section texts with multiple variable injections within other text within multiple cells', () => {
    const inputValues: VariableValueValue[] = [
      {
        type: 'SectionText',
        id: 687,
        listPosition: 0,
        textValue:
          '| Document | Requirement | Applicability|\n| --- | --- | --- |\n| VCS Standard v4.7 (3.1.2) | Projects shall apply methodologies eligible under the VCS Program. | Project is eligible under ',
      },
      {
        type: 'SectionVariable',
        id: 688,
        listPosition: 1,
        variableId: 240,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 689,
        listPosition: 2,
        textValue:
          '. |\n| VCS Standard v4.7 (3.1.4) | Projects and the implementation of project activities shall not lead to the violation of any applicable law, regardless of whether or not the law is enforced. | The project ',
      },
      {
        type: 'SectionVariable',
        id: 690,
        listPosition: 3,
        variableId: 245,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 691,
        listPosition: 4,
        textValue: ' complies with local and national laws and regulations, and ',
      },
      {
        type: 'SectionVariable',
        id: 692,
        listPosition: 5,
        variableId: 246,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 693,
        listPosition: 6,
        textValue:
          ' lead to the violation of any laws. |\n| VCS Standard v4.7 (3.2.1) | There are currently six AFOLU project categories eligible under the VCS Program: ARR, ALM, IFM, REDD+, ACoGS, and WRC. | The project is ',
      },
      {
        type: 'SectionVariable',
        id: 694,
        listPosition: 7,
        variableId: 218,
        usageType: 'Injection',
        displayStyle: 'Inline',
      },
      {
        type: 'SectionText',
        id: 695,
        listPosition: 8,
        textValue: ' and is therefore eligible under the VCS program. |',
      },
    ];

    expect(collectTablesForPreview(inputValues)).toEqual([
      {
        startingValueId: 687,
        headers: ['Document', 'Requirement', 'Applicability'],
        rows: [
          [
            'VCS Standard v4.7 (3.1.2)',
            'Projects shall apply methodologies eligible under the VCS Program.',
            [
              'Project is eligible under ',
              {
                type: 'SectionVariable',
                id: 688,
                listPosition: 1,
                variableId: 240,
                usageType: 'Injection',
                displayStyle: 'Inline',
              },
              '. ',
            ],
          ],
          [
            'VCS Standard v4.7 (3.1.4)',
            'Projects and the implementation of project activities shall not lead to the violation of any applicable law, regardless of whether or not the law is enforced.',
            [
              'The project ',
              {
                type: 'SectionVariable',
                id: 690,
                listPosition: 3,
                variableId: 245,
                usageType: 'Injection',
                displayStyle: 'Inline',
              },
              ' complies with local and national laws and regulations, and ',
              {
                type: 'SectionVariable',
                id: 692,
                listPosition: 5,
                variableId: 246,
                usageType: 'Injection',
                displayStyle: 'Inline',
              },
              ' lead to the violation of any laws. ',
            ],
          ],
          [
            'VCS Standard v4.7 (3.2.1)',
            'There are currently six AFOLU project categories eligible under the VCS Program: ARR, ALM, IFM, REDD+, ACoGS, and WRC.',
            [
              'The project is ',
              {
                type: 'SectionVariable',
                id: 694,
                listPosition: 7,
                variableId: 218,
                usageType: 'Injection',
                displayStyle: 'Inline',
              },
              ' and is therefore eligible under the VCS program. ',
            ],
          ],
        ],
      },
    ]);
  });
});

describe('hasMarkdownTableHeaderSeparatorRow', () => {
  it('correctly determines if a row of text indicates a markdown table header seperator row', () => {
    expect(hasMarkdownTableHeaderSeparatorRow('')).toBeFalsy();
    expect(hasMarkdownTableHeaderSeparatorRow(undefined)).toBeFalsy();
    // Must be 3 consecutive hyphens https://www.markdownguide.org/extended-syntax/#tables
    expect(hasMarkdownTableHeaderSeparatorRow('|-|')).toBeFalsy();
    expect(hasMarkdownTableHeaderSeparatorRow('||')).toBeFalsy();

    // Characters after the last closed cell will be ignored
    expect(hasMarkdownTableHeaderSeparatorRow('|---|--')).toBeTruthy();
    expect(hasMarkdownTableHeaderSeparatorRow('|---|---|\n')).toBeTruthy();
  });
});

describe('hasMarkdownTableRow', () => {
  it('correctly determines if a row of text indicates a markdown table row', () => {
    expect(hasMarkdownTableRow('')).toBeFalsy();
    expect(hasMarkdownTableRow(undefined)).toBeFalsy();

    // At least one cell must be closed
    expect(hasMarkdownTableRow('|Foo')).toBeFalsy();
    // Characters after the last closed cell will be ignored
    expect(hasMarkdownTableRow('|Foo|Bar')).toBeTruthy();

    // Can be a row with empty cells
    expect(hasMarkdownTableRow('||Foo| ')).toBeTruthy();
    // Spaces are OK
    expect(hasMarkdownTableRow('|| Foo |')).toBeTruthy();
  });
});
