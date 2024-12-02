import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import { collectTablesForPreview, isMarkdownTableHeaderSeparatorRow, isMarkdownTableRow } from './util';

describe('collectTablesForPreview', () => {
  it('collects the tables for use in document preview', () => {
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
});

describe('isMarkdownTableHeaderSeparatorRow', () => {
  it('correctly determines if a row of text indicates a markdown table header seperator row', () => {
    expect(isMarkdownTableHeaderSeparatorRow('')).toBeFalsy();
    expect(isMarkdownTableHeaderSeparatorRow(undefined)).toBeFalsy();
    // Must be 3 consecutive hyphens https://www.markdownguide.org/extended-syntax/#tables
    expect(isMarkdownTableHeaderSeparatorRow('|-|')).toBeFalsy();
    expect(isMarkdownTableHeaderSeparatorRow('||')).toBeFalsy();

    // Characters after the last closed cell will be ignored
    expect(isMarkdownTableHeaderSeparatorRow('|---|--')).toBeTruthy();
    expect(isMarkdownTableHeaderSeparatorRow('|---|---|\n')).toBeTruthy();
  });
});

describe('isMarkdownTableRow', () => {
  it('correctly determines if a row of text indicates a markdown table row', () => {
    expect(isMarkdownTableRow('')).toBeFalsy();
    expect(isMarkdownTableRow(undefined)).toBeFalsy();

    // At least one cell must be closed
    expect(isMarkdownTableRow('|Foo')).toBeFalsy();
    // Characters after the last closed cell will be ignored
    expect(isMarkdownTableRow('|Foo|Bar')).toBeTruthy();

    // Can be a row with empty cells
    expect(isMarkdownTableRow('||Foo| ')).toBeTruthy();
    // Spaces are OK
    expect(isMarkdownTableRow('|| Foo |')).toBeTruthy();
  });
});
