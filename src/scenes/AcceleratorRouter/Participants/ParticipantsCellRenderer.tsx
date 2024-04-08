import React from 'react';

import { makeStyles } from '@mui/styles';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function ParticipantsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value } = props;

  const createLinkToParticipant = () => {
    const to = APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW.replace(':participantId', `${row.id}`);
    return <Link to={to}>{value as React.ReactNode}</Link>;
  };

  if (column.key === 'name') {
    return <CellRenderer {...props} value={createLinkToParticipant()} className={classes.text} />;
  }

  if (column.key === 'project_name') {
    return <CellRenderer {...props} value={<TextTruncated stringList={value as string[]} />} />;
  }

  return <CellRenderer {...props} />;
}
