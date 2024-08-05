import React from 'react';

import { ViewProps } from '../DeliverableView/types';
import DocumentDeliverableCard from './DocumentDeliverableCard';
import QuestionsDeliverableCard from './QuestionsDeliverableCard';
import SpeciesDeliverableCard from './SpeciesDeliverableCard';

const DeliverableCard = ({ deliverable }: ViewProps) => {
  if (!deliverable) {
    return undefined;
  }

  return (
    <>
      {deliverable.type === 'Document' ? (
        <DocumentDeliverableCard deliverable={deliverable} />
      ) : deliverable.type === 'Questions' ? (
        <QuestionsDeliverableCard deliverable={deliverable} />
      ) : (
        <SpeciesDeliverableCard deliverable={deliverable} />
      )}
    </>
  );
};

export default DeliverableCard;
