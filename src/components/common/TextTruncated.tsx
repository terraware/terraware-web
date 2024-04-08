import { useTheme } from '@mui/material';
import { TextTruncated as Truncated } from '@terraware/web-components';

import strings from 'src/strings';

const COLUMN_WIDTH = 250;

export type Props = {
  columnWidth?: number;
  fontSize?: number;
  listSeparator?: string;
  stringList: string[];
};

export default function TextTruncated({ columnWidth, fontSize, listSeparator, stringList }: Props): JSX.Element {
  const theme = useTheme();

  return (
    <Truncated
      stringList={stringList}
      maxLengthPx={columnWidth || COLUMN_WIDTH}
      textStyle={{ fontSize: fontSize || 14 }}
      showAllStyle={{ padding: theme.spacing(2), fontSize: fontSize || 14 }}
      listSeparator={listSeparator || strings.LIST_SEPARATOR}
      moreSeparator={strings.TRUNCATED_TEXT_MORE_SEPARATOR}
      moreText={strings.TRUNCATED_TEXT_MORE_LINK}
    />
  );
}
