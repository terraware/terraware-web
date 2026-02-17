import React, { type JSX, ReactNode, useState } from 'react';

import { ClickAwayListener, IconButton, Popover, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { SpeciesProblemElement } from 'src/types/Species';

import Icon from '../../components/common/icon/Icon';
import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';
import ProblemTooltip from './ProblemTooltip';

export default function SpeciesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const theme = useTheme();
  const { column, row, value, index, onRowClick, reloadData } = props;

  const createLinkToSpeciesDetail = (iValue: ReactNode | unknown[]) => {
    return (
      <Link fontSize='16px' to={APP_PATHS.SPECIES_DETAILS.replace(':speciesId', row.id.toString())}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const handleClickAway = () => {
    handleClose();
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget);
    e.stopPropagation();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (column.key === 'problems') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          Array.isArray(value) ? (
            <>
              <IconButton
                onClick={(event) => handleClick(event)}
                sx={{
                  borderRadius: 0,
                  fontSize: '16px',
                  height: '48px',
                }}
              >
                <Icon name='warning' style={{ fill: theme.palette.TwClrIcnWarning }} />
              </IconButton>
              <ClickAwayListener onClickAway={handleClickAway}>
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <ProblemTooltip
                    problems={value as SpeciesProblemElement[]}
                    openedTooltip={Boolean(anchorEl)}
                    reloadData={reloadData}
                    onRowClick={onRowClick}
                    onClose={handleClose}
                  />
                </Popover>
              </ClickAwayListener>
            </>
          ) : null
        }
        row={row}
      />
    );
  } else if (['ecosystemTypes', 'growthForms'].includes(column.key)) {
    return (
      <CellRenderer
        index={index}
        row={row}
        column={column}
        value={
          <TextTruncated
            fontSize={16}
            stringList={(value ?? []) as string[]}
            width={150}
            listSeparator={strings.LIST_SEPARATOR_SECONDARY}
            moreText={strings.TRUNCATED_TEXT_MORE_LINK}
          />
        }
      />
    );
  } else if (column.key === 'scientificName') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToSpeciesDetail(value)}
        row={row}
        title={value as string}
      />
    );
  } else if (column.key === 'acceleratorProjects') {
    return (
      <CellRenderer
        {...props}
        value={
          <TextTruncated
            fontSize={16}
            stringList={(value || []) as string[]}
            moreText={strings.TRUNCATED_TEXT_MORE_LINK}
          />
        }
      />
    );
  }

  return <CellRenderer {...props} />;
}
