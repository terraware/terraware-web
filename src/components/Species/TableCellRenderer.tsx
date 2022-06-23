import { ClickAwayListener, createStyles, IconButton, makeStyles, Theme, Tooltip } from '@material-ui/core';
import React, { useState } from 'react';
import strings from 'src/strings';
import { SpeciesProblemElement } from 'src/types/Species';
import Icon from '../common/icon/Icon';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import ProblemTooltip from './ProblemTooltip';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      fill: '#BD6931',
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
      background: '#ffffff',
      border: '1px solid #F2F4F5',
      borderRadius: '7px',
      color: '#4B5758',
      fontSize: '12px',

      '& .MuiTooltip-arrow': {
        color: '#ffffff',
        '&:before': {
          border: '1px solid #F2F4F5',
        },
      },
    },
  })
);
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

  const getConservationStatusString = (iRow: TableRowType) => {
    if (iRow.endangered && iRow.rare) {
      return strings.RARE_ENDANGERED;
    } else if (iRow.endangered) {
      return strings.ENDANGERED;
    } else if (iRow.rare) {
      return strings.RARE;
    } else {
      return '';
    }
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

  if (column.key === 'conservationStatus') {
    return <CellRenderer index={index} column={column} value={getConservationStatusString(row)} row={row} />;
  }

  return <CellRenderer {...props} />;
}
