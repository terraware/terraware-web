import React from 'react';

import { makeStyles } from '@mui/styles';
import { TextTruncated } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function PersonCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { activeLocale } = useLocalization();
  const classes = useStyles();
  const { column, row, index, value } = props;

  const createLinkToPerson = (iValue: React.ReactNode | unknown[]) => {
    const to = APP_PATHS.ACCELERATOR_PERSON.replace(':userId', `${row.id}`);
    return <Link to={to}>{iValue as React.ReactNode}</Link>;
  };

  if (column.key === 'email') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToPerson(value)}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'globalRoles') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          activeLocale ? (
            <TextTruncated
              stringList={row.globalRoles}
              maxLengthPx={200}
              listSeparator={strings.LIST_SEPARATOR_SECONDARY}
              moreSeparator={strings.TRUNCATED_TEXT_MORE_SEPARATOR}
              moreText={strings.TRUNCATED_TEXT_MORE_LINK}
              textStyle={{ fontSize: '14px' }}
            />
          ) : (
            row.globalRoles.join(',')
          )
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}
