import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { IconButton, Link, MenuItem, MenuList, Popover, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import stopPropagation from 'src/utils/stopPropagationEvent';
import ChangeQuantityModal from './ChangeQuantityModal';
import { Batch } from 'src/api/types/batch';

const useStyles = makeStyles(() => ({
  link: {
    color: '#0067C8',
  },
  text: {
    fontSize: '14px',
  },
}));

export type ModalValuesType = {
  type: string;
  openChangeQuantityModal: boolean;
};

export default function BatchesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index, onRowClick } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const [modalValues, setModalValues] = useState({ type: 'germinating', openChangeQuantityModal: false });

  const rowClick = (event?: React.SyntheticEvent) => {
    if (onRowClick) {
      if (event) {
        stopPropagation(event);
      }
      onRowClick();
    }
  };

  const createLinkToBatch = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link component='button' className={classes.link + ' ' + classes.text} onClick={rowClick}>
        {iValue}
      </Link>
    );
  };

  const createText = (iValue: React.ReactNode | unknown[]) => {
    return <Typography className={classes.text}>{iValue}</Typography>;
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    stopPropagation(event);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openChangeQuantityHandler = (type: string) => {
    handleClose();
    setModalValues({
      openChangeQuantityModal: true,
      type,
    });
  };

  if (column.key === 'withdraw') {
    return (
      <>
        <CellRenderer
          index={index}
          column={column}
          row={row}
          value={
            <Button
              id='withdraw-batch'
              label={strings.WITHDRAW}
              onClick={rowClick}
              size='small'
              priority='secondary'
              className={classes.text}
            />
          }
        />
      </>
    );
  }

  if (column.key === 'batchNumber') {
    return <CellRenderer {...props} value={createLinkToBatch(value)} />;
  }

  if (column.key === 'quantitiesMenu') {
    return (
      <CellRenderer
        index={index}
        column={column}
        row={row}
        value={
          <>
            <ChangeQuantityModal
              open={modalValues.openChangeQuantityModal}
              onClose={() => setModalValues({ openChangeQuantityModal: false, type: 'germinating' })}
              modalValues={modalValues}
              row={row as Batch}
              reload={onRowClick}
            />
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <MenuList sx={{ padding: theme.spacing(2, 0) }}>
                <MenuItem
                  id='change-germinating'
                  onClick={() => openChangeQuantityHandler('germinating')}
                  sx={{ padding: theme.spacing(1, 2) }}
                >
                  <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
                    {strings.CHANGE_GERMINATING_STATUS}
                  </Typography>
                </MenuItem>
                <MenuItem
                  id='change-not-ready'
                  onClick={() => openChangeQuantityHandler('not-ready')}
                  sx={{ padding: theme.spacing(1, 2) }}
                >
                  <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
                    {strings.CHANGE_NOT_READY_STATUS}
                  </Typography>
                </MenuItem>
              </MenuList>
            </Popover>
            <IconButton onClick={handleClick} size='small'>
              <Icon name='menuVertical' />
            </IconButton>
          </>
        }
      />
    );
  }

  return <CellRenderer {...props} value={createText(value)} />;
}
