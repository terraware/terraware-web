import React from 'react';

import { makeStyles } from '@mui/styles';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { CohortPhaseType, getPhaseString } from 'src/types/Cohort';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function ParticipantProjectsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value } = props;

  const createLinkToProject = () => {
    const to = APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${row.id}`);
    return <Link to={to}>{value as React.ReactNode}</Link>;
  };

  if (column.key === 'name') {
    return <CellRenderer {...props} value={createLinkToProject()} className={classes.text} />;
  }

  if (column.key === 'phase') {
    return <CellRenderer {...props} value={getPhaseString(value as CohortPhaseType)} />;
  }

  return <CellRenderer {...props} />;
}
