import { ClickAwayListener, IconButton, Theme, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { SpeciesProblemElement } from 'src/types/Species';
import Icon from '../common/icon/Icon';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import ProblemTooltip from './ProblemTooltip';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    fill: theme.palette.TwClrIcnWarning,
  },
  iconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    height: '48px',
  },
  customPopper: {
    pointerEvents: 'all',
  },
  customTooltip: {
    padding: 0,
    background: theme.palette.TwClrBg,
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    boxShadow: '0px 4px 8px rgba(58, 68, 69, 0.2)',
    borderRadius: '7px',
    color: theme.palette.TwClrTxt,
    fontSize: '12px',
    maxWidth: '350px',

    '& .MuiTooltip-arrow': {
      color: theme.palette.TwClrTxtInverse,
      '&:before': {
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
      },
    },
  },
}));
export default function SpeciesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index, onRowClick, reloadData } = props;
  const [openedTooltip, setOpenedTooltip] = useState(false);

  const handleClickAway = () => {
    setOpenedTooltip(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setOpenedTooltip(!openedTooltip);
  };

  if (column.key === 'problems') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          Array.isArray(value) ? (
            <ClickAwayListener onClickAway={handleClickAway}>
              <Tooltip
                placement='bottom-start'
                title={
                  <ProblemTooltip
                    problems={value as SpeciesProblemElement[]}
                    openedTooltip={openedTooltip}
                    setOpenedTooltip={setOpenedTooltip}
                    reloadData={reloadData}
                    onRowClick={onRowClick}
                  />
                }
                arrow
                open={openedTooltip}
                classes={{ popper: classes.customPopper, tooltip: classes.customTooltip }}
              >
                <IconButton className={classes.iconContainer} onClick={(event) => handleClick(event)}>
                  <Icon name='warning' className={classes.icon} />
                </IconButton>
              </Tooltip>
            </ClickAwayListener>
          ) : null
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}
