import React from 'react';

import Page from 'src/components/Page';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import ParticipantProjectSpeciesProvider from 'src/providers/ParticipantProject/ParticipantProjectSpeciesProvider';

import DocumentDeliverableView from './DocumentDeliverableView';
import SpeciesDeliverableView from './SpeciesDeliverableView';

const DeliverableViewWrapper = () => {
  const { currentDeliverable } = useDeliverableData();

  if (currentDeliverable) {
    switch (currentDeliverable.type) {
      case 'Document':
        return <DocumentDeliverableView deliverable={currentDeliverable} />;
      case 'Species':
        return (
          <ParticipantProjectSpeciesProvider>
            <SpeciesDeliverableView deliverable={currentDeliverable} />
          </ParticipantProjectSpeciesProvider>
        );
      default:
        // TODO what should we do if the backend returns a type that the frontend isn't aware of yet/
        return null;
    }
  } else {
    return <Page isLoading={true} />;
  }
};

export default DeliverableViewWrapper;
