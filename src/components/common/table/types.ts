export interface TableColumnType {
  key: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'notes' | 'edit' | 'boolean';
}

export interface RendererProps<T> {
  index: number;
  row: T;
  column: TableColumnType;
  value?: string | number | unknown[];
  onRowClick?: () => void;
}

export type EnhancedTableDetailsRow = {
  [x: string]: string | number | [] | undefined;
};

export interface DetailsProps<T> {
  accessionId: string;
  index: number;
  expandText: string;
  rowName: string;
  defaultSort: string;
  columns: TableColumnType[];
  onClick: (parentValue: EnhancedTableDetailsRow) => void;
  onSelect: (
    value: EnhancedTableDetailsRow,
    parentValue: EnhancedTableDetailsRow
  ) => void;
  Renderer: (props: RendererProps<T>) => JSX.Element;
  row: EnhancedTableDetailsRow;
}

export interface DetailsRendererProps {
  index: number;
  row: EnhancedTableDetailsRow;
}
