import {
  SectionTextVariableValue,
  SectionVariableVariableValue,
  VariableValueValue,
  isSectionTextVariableValue,
  isSectionVariableVariableValue,
} from 'src/types/documentProducer/VariableValue';

export const hasMarkdownTableHeaderSeparatorRow = (input: string | undefined): boolean =>
  !!/\|\s*\-\-\-+\s*\|/g.exec(input || '');

const MarkdownTableRowRegex = () => /\|\s*([^|]*?)\s*(?=\|)/g;
export const hasMarkdownTableRow = (input: string | undefined): boolean => !!MarkdownTableRowRegex().exec(input || '');

const getMarkdownTableCellValues = (input: string): string[] => {
  const values: string[] = [];
  let match: RegExpMatchArray | null;
  // To ensure we keep an accurate index
  const regex = MarkdownTableRowRegex();
  while ((match = regex.exec(input)) !== null) {
    values.push(match[1].trim());
  }
  return values;
};

type PreviewValueDisplayUnion = VariableValueValue | TableElement;

type StartingValueId = VariableValueValue['id'];
type ValueIdsMap = Map<VariableValueValue['id'], VariableValueValue | VariableValueValue[]>;

type TableCell = string | SectionVariableVariableValue;

type TableElement = {
  startingValueId: StartingValueId;
  headers: string[];
  rows: TableCell[][];
};
export const isTableElement = (input: unknown): input is TableElement => {
  const cast = input as TableElement;
  return !!(cast.startingValueId && Array.isArray(cast.headers) && Array.isArray(cast.rows));
};

type TableElementWithValueIds = TableElement & {
  valueIds: ValueIdsMap;
};

const collectTableElement = (
  headerRow: SectionTextVariableValue,
  separatorRow: SectionTextVariableValue,
  inputValues: VariableValueValue[]
): TableElementWithValueIds => {
  const tableElement: TableElementWithValueIds = {
    headers: getMarkdownTableCellValues(headerRow.textValue),
    rows: [],
    startingValueId: headerRow.id,
    valueIds: new Map([
      [headerRow.id, headerRow],
      [separatorRow.id, separatorRow],
    ]),
  };

  const _inputValues = [...inputValues];

  let row: VariableValueValue | undefined;
  while ((row = _inputValues.shift()) !== undefined) {
    // Even if the first cell contains a variable reference, it will still start with a "|", which is a SectionText value
    // So if this is not a SectionText, then there are no correctly formatted rows after this header + separator
    if (!isSectionTextVariableValue(row)) {
      return tableElement;
    }

    // There must be the same number of cells as headers
    let cells: TableCell[] = getMarkdownTableCellValues(row.textValue);
    if (cells.length === tableElement.headers.length) {
      // All of the cells for this row are on the same line
      tableElement.valueIds.set(row.id, row);
      tableElement.rows.push(cells);
    } else if (cells.length < tableElement.headers.length) {
      // This indicates a partial row, which means a variable reference must immediately follow
      let nextRowPart: 'cell' | 'border' = 'cell';
      let nextValue: VariableValueValue | undefined;

      while (cells.length < tableElement.headers.length && (nextValue = _inputValues.shift()) !== undefined) {
        // The next value must be a variable reference
        if (nextRowPart === 'cell' && isSectionVariableVariableValue(nextValue)) {
          // This row is considered a table token
          tableElement.valueIds.set(row.id, row);

          // Here is where we add the variable reference value, for now we just use the ID
          cells.push(nextValue);
          tableElement.valueIds.set(nextValue.id, nextValue);

          // If the cell count is the same as the header count, this row is done.
          if (cells.length === tableElement.headers.length) {
            tableElement.rows.push(cells);
            // We must also consume the next value, since it must contain the border
            _inputValues.shift();
            continue;
          }

          // Since the cell count still does not match, we must continue looking for tokens for this row
          nextRowPart = 'border';
        } else if (nextRowPart === 'cell' && isSectionTextVariableValue(nextValue)) {
          // Attempt to continue collecting cells
          cells = cells.concat(getMarkdownTableCellValues(nextValue.textValue));
        } else if (nextRowPart === 'border' && isSectionTextVariableValue(nextValue)) {
          // If this is a border, it must start with a "|"
          if (nextValue.textValue.trim()[0] !== '|') {
            return tableElement;
          }
          // We can attempt to keep collecting cells
          cells = cells.concat(getMarkdownTableCellValues(nextValue.textValue));

          // If the cell count is the same as the header count, this row is done.
          if (cells.length === tableElement.headers.length) {
            tableElement.rows.push(cells);
          }
        } else {
          // This is not a properly formatted table
          return tableElement;
        }
      }
    } else {
      // The cell count is greater than the header count, this is not a correctly formatted table
      return tableElement;
    }
  }

  return tableElement;
};

const valueIsTableToken = (tableElements: TableElementWithValueIds[], value: VariableValueValue) =>
  tableElements.some((tableElement) => tableElement.valueIds.has(value.id));

const collectTableElements = (inputValues: VariableValueValue[]): TableElementWithValueIds[] => {
  // Duplicate values that have newlines
  const _inputValues = [...inputValues].flatMap((value): VariableValueValue | VariableValueValue[] => {
    if (!isSectionTextVariableValue(value)) {
      return value;
    }

    return value.textValue
      .split('\n')
      .filter((line) => line !== '')
      .map((line) => ({
        ...value,
        textValue: line,
      }));
  });

  const tableElements: TableElementWithValueIds[] = [];

  let headerRow: VariableValueValue | undefined;
  while ((headerRow = _inputValues.shift()) !== undefined) {
    // If we've already accounted for this token, nothing to do
    if (valueIsTableToken(tableElements, headerRow)) {
      continue;
    }

    // If this isn't a section text, it can't be the start of a new table
    if (!isSectionTextVariableValue(headerRow)) {
      continue;
    }

    // No header row, no table
    if (!hasMarkdownTableRow(headerRow.textValue)) {
      continue;
    }

    // Header row must have a separator immediately after
    const separatorRow = _inputValues.shift();
    if (!isSectionTextVariableValue(separatorRow) || !hasMarkdownTableHeaderSeparatorRow(separatorRow.textValue)) {
      // Put it back
      _inputValues.unshift(separatorRow as VariableValueValue);
      continue;
    }

    // We have a header and separator row, collect the entire table
    tableElements.push(collectTableElement(headerRow, separatorRow, _inputValues));
  }

  return tableElements;
};

/**
 * This function attempts to collect Markdown formatted tables from our section variable values. Section variable
 * values are a list of "section text" and "section variable" values, and a Markdown formatted table may be
 * made up of a few different combinations of these.
 *
 * These tables follow [this syntax](https://www.markdownguide.org/extended-syntax/#tables) for Markdown tables.
 *
 * For example, an entire table may be expressed within a single "section text" value, whic may look like:
 * SectionTextValue: "| Header1 | Header2 |\n|---|---|\n| Row1Cell1 | Row1Cell2 |"
 *
 * It can also be expressed over several "section text" values, usually split by the newline:
 * SectionTextValue: "| Header1 | Header2 |\n"
 * SectionTextValue: "|---|---|\n"
 * SectionTextValue: "| Row1Cell1 | Row1Cell2 |"
 *
 * It can also be expressed with "section variables" injected into cells, in combination with either aforementioned format:
 * Example 1 (injected variable is in row 1 cell 1)
 * SectionTextValue: "| Header1 | Header2 |\n|---|---|\n| "
 * SectionVariableValue: VariableId 123
 * SectionTextValue: "| Row1Cell2 |"
 *
 *
 * Example 2 (injected variable is in row 1 cell 1)
 * SectionTextValue: "| Header1 | Header2 |\n"
 * SectionTextValue: "|---|---|\n"
 * SectionTextValue: "| "
 * SectionVariableValue: VariableId 123
 * SectionTextValue: "| Row1Cell2 |"
 *
 * Please see the tests to see more concrete examples of how this data might be represented on the server side or after hydration in the FE
 *
 * This function will remove all section variable values that are part of a markdown table, and replace them with a single
 * table element which can be easily rendered.
 *
 * @param inputValues VariableValueValue[]
 * @returns PreviewValueDisplayUnion[] - this is just a union of the VariableValueValue and TableElement type
 */
export const collectTablesForPreview = (inputValues: VariableValueValue[]): PreviewValueDisplayUnion[] => {
  const tableElements: TableElementWithValueIds[] = collectTableElements(inputValues);

  const outputValues: PreviewValueDisplayUnion[] = [];
  const _inputValues = [...inputValues];

  for (const inputValue of _inputValues) {
    const tableElementStartingAtThisValue = tableElements.find(
      (tableElement) => tableElement.startingValueId === inputValue.id
    );

    if (tableElementStartingAtThisValue) {
      // This is the starting point of a table element, we want to add our custom table element object to the output
      // We can remove the valueIds since they are only using for the tokenization, not display
      const { headers, rows, startingValueId } = tableElementStartingAtThisValue;
      outputValues.push({
        headers,
        rows,
        startingValueId,
      });
      continue;
    } else if (valueIsTableToken(tableElements, inputValue)) {
      // This input value is part of an already collected table, we can ignore it
      continue;
    }

    // Otherwise, this is just a regular, non table input value
    outputValues.push(inputValue as PreviewValueDisplayUnion);
  }

  return outputValues;
};
