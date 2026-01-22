import React, { type JSX } from 'react';

import Metadata from 'src/components/DeliverableView/Metadata';
import { EditProps } from 'src/components/DeliverableView/types';
import SpeciesDeliverableTable from 'src/components/SpeciesDeliverableTable';
import Card from 'src/components/common/Card';

const SpeciesDeliverableCard = (props: EditProps): JSX.Element => {
  const { ...viewProps }: EditProps = props;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Metadata {...viewProps} />
      <SpeciesDeliverableTable deliverable={viewProps.deliverable} />
    </Card>
  );
};

export default SpeciesDeliverableCard;
