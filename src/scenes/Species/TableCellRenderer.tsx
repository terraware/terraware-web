import { ClickAwayListener, IconButton, Theme, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { SpeciesProblemElement } from 'src/types/Species';
import Icon from '../../components/common/icon/Icon';
import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';
import ProblemTooltip from './ProblemTooltip';
import { TextTruncated } from '@terraware/web-components';
import strings from 'src/strings';
import { getRgbaFromHex } from 'src/utils/color';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';

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
    boxShadow: `0px 4px 8px ${getRgbaFromHex(theme.palette.TwClrShdw as string, 0.2)}`,
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

  const createLinkToSpeciesDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.SPECIES_DETAILS.replace(':speciesId', row.id.toString())}>{iValue as React.ReactNode}</Link>
    );
  };

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
  } else if (column.key === 'ecosystemTypes') {
    return (
      <CellRenderer
        index={index}
        row={row}
        column={column}
        value={
          <TextTruncated
            stringList={(value ?? []) as string[]}
            maxLengthPx={100}
            listSeparator={strings.LIST_SEPARATOR_SECONDARY}
            moreSeparator={strings.TRUNCATED_TEXT_MORE_SEPARATOR}
            moreText={strings.TRUNCATED_TEXT_MORE_LINK}
            textStyle={{ fontSize: '14px' }}
          />
        }
      />
    );
  } else if (column.key === 'scientificName') {
    return <CellRenderer index={index} column={column} value={createLinkToSpeciesDetail(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}
