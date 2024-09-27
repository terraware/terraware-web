import React from 'react';

import { TableColumnType } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import strings from 'src/strings';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';
import { CohortModule } from 'src/types/Module';

import ModuleDeliverablesCellRenderer from './ModuleDeliverablesCellRenderer';

export interface ModuleDeliverablesModalProps {
  onClose: () => void;
  deliverables?: ListDeliverablesElementWithOverdue[];
  moduleToEdit?: CohortModule;
  cohortId?: number;
}

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.DELIVERABLES,
    type: 'string',
  },
  {
    key: 'id',
    name: strings.DELIVERABLE_ID,
    type: 'string',
  },
];

export default function ModuleDeliverablesModal(props: ModuleDeliverablesModalProps): JSX.Element {
  const { onClose, deliverables, moduleToEdit, cohortId } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={`${moduleToEdit?.title} - ${strings.DELIVERABLES}`}
      size='large'
      middleButtons={[
        <Button
          id='close'
          label={strings.CLOSE}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
      ]}
      scrolled={true}
    >
      <Table
        id='module-deliverables-table'
        columns={columns}
        rows={deliverables?.map((del) => ({ ...del, cohortId: cohortId })) || []}
        orderBy='name'
        Renderer={ModuleDeliverablesCellRenderer}
      />
    </DialogBox>
  );
}
