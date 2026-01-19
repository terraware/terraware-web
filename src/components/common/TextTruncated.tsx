import React, { type JSX } from 'react';

import { useTheme } from '@mui/material';
import { TextTruncated as Truncated } from '@terraware/web-components';

import strings from 'src/strings';

const COLUMN_WIDTH = 250;

export type Props = {
  width?: number;
  fontSize?: number;
  fontWeight?: number;
  listSeparator?: string;
  stringList: string[];
  moreText?: string;
};

export default function TextTruncated({
  width,
  fontSize,
  fontWeight,
  listSeparator,
  stringList,
  moreText,
}: Props): JSX.Element {
  const theme = useTheme();

  return (
    <Truncated
      stringList={stringList}
      maxLengthPx={width || COLUMN_WIDTH}
      textStyle={{ fontSize: fontSize || 14, fontWeight: fontWeight || 400 }}
      showAllStyle={{ padding: theme.spacing(2), fontSize: fontSize || 14 }}
      listSeparator={listSeparator || strings.LIST_SEPARATOR}
      moreSeparator={strings.TRUNCATED_TEXT_MORE_SEPARATOR}
      moreText={moreText}
    />
  );
}
