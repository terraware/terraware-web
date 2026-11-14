import React from 'react';
import { createPortal } from 'react-dom';

import { IconButton, Tooltip } from '@mui/material';
import {
  EditableTableInstanceV2,
  EditableTableToggleDensePaddingButtonV2,
  EditableTableToggleFiltersButtonV2,
  EditableTableToggleFullScreenButtonV2,
  Icon,
} from '@terraware/web-components';

import TableToolbarActions from 'src/components/common/table/TableToolbarActions';
import { useLocalization } from 'src/providers';
import { VariableUnion } from 'src/types/documentProducer/Variable';

import ColumnsModal from './ColumnsModal';
import { MatrixRow } from './matrixValues';

export type MatrixV2ToolbarProps = {
  table: EditableTableInstanceV2<MatrixRow>;
  allVariables?: VariableUnion[];
  showColumnsModal: boolean;
  onColumnsClick: () => void;
  onColumnsClose: () => void;
  onColumnsSelected: (columns: string[]) => void;
};

const MatrixV2Toolbar = ({
  table,
  allVariables,
  showColumnsModal,
  onColumnsClick,
  onColumnsClose,
  onColumnsSelected,
}: MatrixV2ToolbarProps) => {
  const { strings } = useLocalization();
  return (
    <TableToolbarActions>
      <EditableTableToggleFiltersButtonV2 table={table} />
      <Tooltip title={strings.MANAGE_COLUMNS}>
        <IconButton id='manageColumns' onClick={onColumnsClick}>
          <Icon name='iconColumns' />
        </IconButton>
      </Tooltip>
      <EditableTableToggleDensePaddingButtonV2 table={table} />
      <EditableTableToggleFullScreenButtonV2 table={table} />
      {showColumnsModal &&
        allVariables &&
        createPortal(
          <ColumnsModal
            table={table}
            allVariables={allVariables}
            onClose={onColumnsClose}
            onSave={onColumnsSelected}
          />,
          document.body
        )}
    </TableToolbarActions>
  );
};

export default MatrixV2Toolbar;
