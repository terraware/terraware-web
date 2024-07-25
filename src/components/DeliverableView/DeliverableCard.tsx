import React from 'react-router-dom';

import DocumentDeliverableCard from './DocumentDeliverableCard';
import QuestionsDeliverableCard from './QuestionsDeliverableCard';
import SpeciesDeliverableCard from './SpeciesDeliverableCard';
import { ViewProps } from './types';

const DeliverableViewCard = (prop: ViewProps) => {
  const { deliverable } = prop;
  
  if (deliverable) {
    switch (deliverable.type) {
      case 'Document':
        return <DocumentDeliverableCard {...prop} />;
      case 'Questions':
        return <QuestionsDeliverableCard {...prop} />;
      case 'Species':
        return <SpeciesDeliverableCard {...prop} />;
      default:
        // TODO what should we do if the backend returns a type that the frontend isn't aware of yet/
        return null;
    }
  } else {
    return null;
  }
};

export default DeliverableViewCard;
