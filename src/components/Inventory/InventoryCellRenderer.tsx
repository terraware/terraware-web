import React from 'react';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';
import { TextTruncated } from '@terraware/web-components';
import strings from 'src/strings';

const COLUMN_WIDTH = 250;

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function InventoryCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { column, row, value, index } = props;

  const getNurseriesNames = (nurseries: string) => {
    const nurseriesArray = nurseries.split('\r');
    return (
      <TextTruncated
        stringList={nurseriesArray}
        maxLengthPx={COLUMN_WIDTH}
        textStyle={{ fontSize: 14 }}
        showAllStyle={{ padding: theme.spacing(2), fontSize: 14 }}
        listSeparator={strings.LIST_SEPARATOR}
        moreSeparator={strings.TRUNCATED_TEXT_MORE_SEPARATOR}
        moreText={strings.TRUNCATED_TEXT_MORE_LINK}
      />
    );
  };

  const createLinkToInventoryDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', row.species_id.toString())}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'facilityInventories' && typeof value === 'string') {
    return (
      <CellRenderer index={index} column={column} value={getNurseriesNames(value)} row={row} className={classes.text} />
    );
  }

  if (column.key === 'species_scientificName') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.species_id ? createLinkToInventoryDetail(value) : strings.DELETED_SPECIES}
        row={row}
        className={classes.text}
      />
    );
  }

  return <CellRenderer {...props} className={classes.text} />;
}
