import React from 'react';

import { ViewProps } from '../DeliverableView/types';
import DocumentDeliverableCard from './DocumentDeliverableCard';
import QuestionsDeliverableCard from './QuestionsDeliverableCard';
import SpeciesDeliverableCard from './SpeciesDeliverableCard';

const DeliverableCard = ({ deliverable }: ViewProps) => {
  if (!deliverable) {
    return undefined;
  }

  switch (deliverable.type) {
    case 'Document':
      return <DocumentDeliverableCard deliverable={deliverable} />;
    case 'Species':
      return <SpeciesDeliverableCard deliverable={deliverable} />;
    case 'Questions':
      return <QuestionsDeliverableCard deliverable={deliverable} />;
  }
};

export default DeliverableCard;
