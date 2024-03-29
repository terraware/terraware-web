import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function PlantingSitesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index } = props;
  const isDraft = row.isDraft;

  const createLinkToPlantingSiteView = (iValue: React.ReactNode | unknown[]) => {
    const plantingSiteViewUrl = isDraft ? APP_PATHS.PLANTING_SITES_DRAFT_VIEW : APP_PATHS.PLANTING_SITES_VIEW;

    const to = plantingSiteViewUrl.replace(':plantingSiteId', row.id.toString());

    return <Link to={to}>{iValue as React.ReactNode}</Link>;
  };

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToPlantingSiteView(value)}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'draft') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={isDraft ? <DraftBadge /> : null}
        row={row}
        className={classes.text}
      />
    );
  }

  return <CellRenderer {...props} className={classes.text} />;
}

/**
 * Internal component that renders a Draft badge
 * TODO: extract out as a common web-component since we have a concept
 * of badges in other places.
 */
const DraftBadge = (): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
        border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0.5, 1),
        width: 'fit-content',
      }}
    >
      <Typography color={theme.palette.TwClrBrdrSecondary} fontSize='14px' fontWeight={500}>
        {strings.DRAFT}
      </Typography>
    </Box>
  );
};
