import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';
import { TextTruncated } from '@terraware/web-components';
import strings from 'src/strings';
import ChangeQuantityModal from './view/ChangeQuantityModal';
import { Batch } from 'src/types/Batch';
import QuantitiesMenu from './view/QuantitiesMenu';

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
  const { column, row, value, index, reloadData } = props;
  const [modalValues, setModalValues] = useState({ type: 'germinating', openChangeQuantityModal: false });

  const getNamesList = (names: string) => {
    const namesArray = names.split('\r');
    return (
      <TextTruncated
        stringList={namesArray}
        maxLengthPx={COLUMN_WIDTH}
        textStyle={{ fontSize: 14 }}
        showAllStyle={{ padding: theme.spacing(2), fontSize: 14 }}
        listSeparator={strings.LIST_SEPARATOR}
        moreSeparator={strings.TRUNCATED_TEXT_MORE_SEPARATOR}
        moreText={strings.TRUNCATED_TEXT_MORE_LINK}
      />
    );
  };

  const createLinkToInventorySpeciesDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', row.species_id.toString())}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const createLinkToInventoryNurseryDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.INVENTORY_ITEM_FOR_NURSERY.replace(':nurseryId', row.facility_id.toString())}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const createLinkToInventoryBatchDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.INVENTORY_BATCH.replace(':batchId', row.batchId.toString())}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'facilityInventories' && typeof value === 'string') {
    return (
      <CellRenderer index={index} column={column} value={getNamesList(value)} row={row} className={classes.text} />
    );
  }

  if (column.key === 'subLocations' && typeof value === 'string') {
    return (
      <CellRenderer index={index} column={column} value={getNamesList(value)} row={row} className={classes.text} />
    );
  }

  if (column.key === 'species_scientificName') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.species_id ? createLinkToInventorySpeciesDetail(value) : strings.DELETED_SPECIES}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'facility_name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.facility_id ? createLinkToInventoryNurseryDetail(value) : undefined}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'batchNumber') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.batchId ? createLinkToInventoryBatchDetail(value) : undefined}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'quantitiesMenu') {
    return (
      <CellRenderer
        index={index}
        column={column}
        row={row}
        value={
          <>
            {modalValues.openChangeQuantityModal && (
              <ChangeQuantityModal
                onClose={() => setModalValues({ openChangeQuantityModal: false, type: 'germinating' })}
                modalValues={modalValues}
                row={row as Batch}
                reload={reloadData}
              />
            )}
            <QuantitiesMenu setModalValues={setModalValues} batch={row} />
          </>
        }
      />
    );
  }

  return <CellRenderer {...props} className={classes.text} />;
}
