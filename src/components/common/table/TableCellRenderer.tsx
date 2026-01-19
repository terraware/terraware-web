import type { JSX } from 'react';

import { CellDateRenderer, TableRowType, CellRenderer as WebComponentsCellRenderer } from '@terraware/web-components';
import { LocalizationProps } from '@terraware/web-components/components/table';
import { RendererProps } from '@terraware/web-components/components/table/types';

import strings from 'src/strings';

type CellRendererProps<T extends TableRowType> = Omit<RendererProps<T>, keyof LocalizationProps>;

export default function CellRenderer<T extends TableRowType>(props: CellRendererProps<T>): JSX.Element {
  return WebComponentsCellRenderer({
    ...props,
    booleanFalseText: strings.NO,
    booleanTrueText: strings.YES,
    editText: strings.EDIT,
  });
}

export { CellDateRenderer };
export type { TableRowType };
