import { Box, createStyles, Link, makeStyles, TableCell, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import NotesIcon from '@material-ui/icons/Notes';
import React, { ReactNode } from 'react';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';
import { RendererProps } from './types';

const useStyles = makeStyles((theme) =>
  createStyles({
    editIcon: {
      marginLeft: theme.spacing(1),
    },
    textRoot: {
      maxWidth: 400,
    },
  })
);

export type TableRowType = Record<string, any>;

export default function CellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, value, onRowClick, index } = props;
  const id = `row${index}-${column.key}`;
  if (column.type === 'date' && typeof value === 'string' && value) {
    return <CellDateRenderer id={id} value={value} />;
  } else if (column.type === 'notes' && value && typeof value === 'string') {
    return <CellNotesRenderer id={id} value={value} />;
  } else if (column.type === 'boolean') {
    return <CellBooleanRenderer id={id} value={value} />;
  } else if (column.type === 'edit') {
    return <CellEditRenderer id={id} onRowClick={onRowClick} />;
  }

  return <CellTextRenderer id={id} value={value} />;
}

export const cellDateFormatter = (value?: string): string | undefined => {
  if (value) {
    return new Date(value).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
};

export function CellDateRenderer({ id, value }: { id: string; value: string }): JSX.Element {
  return (
    <TableCell id={id} align='left'>
      <Typography component='p' variant='body1'>
        {cellDateFormatter(value)}
      </Typography>
    </TableCell>
  );
}

export function CellTextRenderer({
  id,
  value,
}: {
  id: string;
  value?: string | number | any[] | ReactNode;
}): JSX.Element {
  const classes = useStyles();
  return (
    <TableCell id={id} align='left'>
      <Typography component='p' variant='body1' noWrap classes={{ root: classes.textRoot }}>
        <span title={typeof value === 'string' ? value : ''}>{value}</span>
      </Typography>
    </TableCell>
  );
}

export function CellBooleanRenderer({
  id,
  value,
}: {
  id: string;
  value?: string | number | any[] | ReactNode;
}): JSX.Element {
  return (
    <TableCell id={id} align='left'>
      <Typography component='p' variant='body1'>
        {value === 'true' ? 'YES' : 'NO'}
      </Typography>
    </TableCell>
  );
}

export function CellNotesRenderer({ id, value }: { id: string; value?: string }): JSX.Element {
  return (
    <TableCell id={id} align='left'>
      <Typography id={id} component='p' variant='body1'>
        {value && value.length > 0 ? <NotesIcon /> : ''}
      </Typography>
    </TableCell>
  );
}

export function CellEditRenderer({ id, onRowClick }: { id: string; onRowClick?: () => void }): JSX.Element {
  const classes = useStyles();

  return (
    <TableCell id={id} align='left'>
      <Link
        id={`${id}-button`}
        href='#'
        onClick={(event: React.SyntheticEvent) => {
          preventDefaultEvent(event);
          if (onRowClick) {
            onRowClick();
          }
        }}
      >
        <Box display='flex'>
          <Typography component='p' variant='body1'>
            Edit
          </Typography>
          <EditIcon fontSize='small' className={classes.editIcon} />
        </Box>
      </Link>
    </TableCell>
  );
}
