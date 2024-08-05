import React from 'react';

import { ViewProps } from '../DeliverableView/types';
import DocumentDeliverableCard from './DocumentDeliverableCard';
import QuestionsDeliverableCard from './QuestionsDeliverableCard';
import SpeciesDeliverableCard from './SpeciesDeliverableCard';

const DeliverableCard = (props: ViewProps) => {
  const { deliverable } = props;

  if (!deliverable) {
    return undefined;
  }

  switch (deliverable.type) {
    case 'Document':
      return <DocumentDeliverableCard {...props} />;
    case 'Species':
      return <SpeciesDeliverableCard {...props} />;
    case 'Questions':
      return <QuestionsDeliverableCard {...props} />;
  }
};

export default DeliverableCard;
