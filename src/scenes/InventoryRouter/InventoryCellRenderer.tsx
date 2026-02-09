import React, { type JSX, useState } from 'react';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import ChangeQuantityModal from 'src/scenes/InventoryRouter/view/ChangeQuantityModal';
import QuantitiesMenu from 'src/scenes/InventoryRouter/view/QuantitiesMenu';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';
import useQuery from 'src/utils/useQuery';

export default function InventoryCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const query = useQuery();
  const { column, row, value, index, reloadData } = props;
  const [modalValues, setModalValues] = useState({ type: 'germinating', openChangeQuantityModal: false });

  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
    },
  };

  const getNamesList = (names: string) => {
    const namesArray = names.split('\r');
    return <TextTruncated fontSize={16} stringList={namesArray} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />;
  };

  const createLinkWithQuery = (path: string, iValue: React.ReactNode | unknown[]) => {
    const queryString = query.toString();

    let to = path;
    if (queryString) {
      to += `?${queryString}`;
    }

    return (
      <Link fontSize='16px' to={to}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const createLinkToInventorySpeciesDetail = (iValue: React.ReactNode | unknown[]) =>
    createLinkWithQuery(APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', row.id.toString()), iValue);

  const createLinkToInventoryNurseryDetail = (iValue: React.ReactNode | unknown[]) =>
    createLinkWithQuery(APP_PATHS.INVENTORY_ITEM_FOR_NURSERY.replace(':nurseryId', row.facility_id.toString()), iValue);

  const createLinkToInventoryBatchDetail = (iValue: React.ReactNode | unknown[]) =>
    createLinkWithQuery(APP_PATHS.INVENTORY_BATCH.replace(':batchId', row.batchId.toString()), iValue);

  if (column.key === 'facilityInventories' && typeof value === 'string') {
    return (
      <CellRenderer
        component={'span'}
        index={index}
        column={column}
        value={getNamesList(value)}
        row={row}
        sx={textStyles}
      />
    );
  }

  if (column.key === 'subLocations' && typeof value === 'string') {
    return (
      <CellRenderer
        component={'span'}
        index={index}
        column={column}
        value={getNamesList(value)}
        row={row}
        sx={textStyles}
      />
    );
  }

  if (column.key === 'scientificName') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.id ? createLinkToInventorySpeciesDetail(value) : strings.DELETED_SPECIES}
        row={row}
        sx={textStyles}
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
        sx={textStyles}
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
        sx={textStyles}
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

  return <CellRenderer {...props} sx={textStyles} />;
}
