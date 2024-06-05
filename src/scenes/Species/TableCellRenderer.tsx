import React, { ReactNode, useState } from 'react';

import { ClickAwayListener, IconButton, Tooltip, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { SpeciesProblemElement } from 'src/types/Species';
import { getRgbaFromHex } from 'src/utils/color';

import Icon from '../../components/common/icon/Icon';
import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';
import ProblemTooltip from './ProblemTooltip';

export default function SpeciesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const theme = useTheme();
  const { column, row, value, index, onRowClick, reloadData } = props;
  const [openedTooltip, setOpenedTooltip] = useState(false);

  const createLinkToSpeciesDetail = (iValue: ReactNode | unknown[]) => {
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
                sx={{
                  '& .MuiTooltip-popper': {
                    pointerEvents: 'all',
                  },
                  '& .MuiTooltip-tooltip': {
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
                }}
              >
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
              </Tooltip>
            </ClickAwayListener>
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
            stringList={(value ?? []) as string[]}
            columnWidth={100}
            listSeparator={strings.LIST_SEPARATOR_SECONDARY}
          />
        }
      />
    );
  } else if (column.key === 'scientificName') {
    return <CellRenderer index={index} column={column} value={createLinkToSpeciesDetail(value)} row={row} />;
  } else if (column.key === 'participantProjects') {
    return <CellRenderer {...props} value={<TextTruncated stringList={(value || []) as string[]} />} />;
  }

  return <CellRenderer {...props} />;
}
