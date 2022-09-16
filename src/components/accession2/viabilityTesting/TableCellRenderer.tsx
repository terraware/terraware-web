import React from 'react';
import { Box, Typography } from '@mui/material';
import { Icon } from '@terraware/web-components';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles(() => ({
  syncIcon: {
    '& path': {
      fill: '#BD6931',
    },
  },
}));

export default function Renderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, index } = props;
  const defaultProps = { column, row, index };
  const { isMobile } = useDeviceInfo();

  const getValue = (iValue: React.ReactNode | unknown[], style?: object) => {
    const styleProps = style || {};
    return <Typography sx={{ ...styleProps, cursor: 'pointer' }}>{iValue}</Typography>;
  };

  const renderId = () => getValue(row.id, { color: '#0067C8' });

  const renderDate = () => {
    const { startDate, endDate } = row;
    const date = `${startDate} ${strings.TO.toLowerCase()} ${endDate || '--'}`;
    return getValue(date);
  };

  const renderTestType = () => {
    const { testType } = row;
    const label = () => {
      if (testType === 'Lab') {
        return strings.LAB_GERMINATION;
      } else if (testType === 'Nursery') {
        return strings.NURSERY_GERMINATION;
      } else {
        return strings.CUT_TEST;
      }
    };

    return getValue(label(), { color: '#708284' });
  };

  const renderMobileId = () => {
    return (
      <Box>
        {renderId()}
        {renderDate()}
        {renderTestType()}
      </Box>
    );
  };

  if (column.key === 'id') {
    if (isMobile) {
      return <CellRenderer {...defaultProps} value={renderMobileId()} />;
    } else {
      return <CellRenderer {...defaultProps} value={renderId()} />;
    }
  }

  if (column.key === 'startDate') {
    return <CellRenderer {...defaultProps} value={renderDate()} />;
  }

  if (column.key === 'testType') {
    return <CellRenderer {...defaultProps} value={renderTestType()} />;
  }

  if (column.key === 'viabilityPercent') {
    const { viabilityPercent } = row;
    if (!row.endDate || row.viabilityPercent === undefined) {
      return (
        <CellRenderer {...defaultProps} value={getValue(<Icon name='iconSynced' className={classes.syncIcon} />)} />
      );
    }

    return <CellRenderer {...defaultProps} value={getValue(`${viabilityPercent}%`)} />;
  }

  return <CellRenderer {...props} />;
}
