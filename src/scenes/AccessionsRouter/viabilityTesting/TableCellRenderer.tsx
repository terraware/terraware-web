import React from 'react';

import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { getCutTestViabilityPercent } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  syncIcon: {
    '& path': {
      fill: theme.palette.TwClrIcnWarning,
    },
  },
}));

export default function Renderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { column, row, index } = props;
  const defaultProps = { column, row, index };
  const { isMobile } = useDeviceInfo();

  const getValue = (iValue: React.ReactNode, style?: object) => {
    const styleProps = style || {};
    return <Typography sx={{ ...styleProps, cursor: 'pointer' }}>{iValue}</Typography>;
  };

  const renderId = () => (
    <Link
      onClick={() => {
        return;
      }}
      fontSize='16px'
    >
      #{row.id}
    </Link>
  );

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

    return getValue(label(), { color: theme.palette.TwClrTxtSecondary });
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
    const { testType, viabilityPercent } = row;

    const getViabilityPercent = () => {
      if (testType !== 'Cut') {
        return viabilityPercent;
      }
      return getCutTestViabilityPercent(row);
    };

    if (testType !== 'Cut' && (!row.endDate || row.viabilityPercent === undefined || !row.testResults?.length)) {
      return (
        <CellRenderer {...defaultProps} value={getValue(<Icon name='iconSynced' className={classes.syncIcon} />)} />
      );
    }

    return <CellRenderer {...defaultProps} value={getValue(`${getViabilityPercent()}%`, { fontWeight: 500 })} />;
  }

  return <CellRenderer {...props} />;
}
