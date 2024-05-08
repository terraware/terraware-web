import React, { useParams } from 'react-router-dom';

import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import Page from 'src/components/Page';

import DocumentDeliverableView from './DocumentDeliverableView';
import SpeciesDeliverableView from './SpeciesDeliverableView';

const DeliverableViewWrapper = () => {
  const { deliverableId, projectId } = useParams<{ deliverableId: string; projectId: string }>();

  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId), projectId: Number(projectId) });

  if (deliverable) {
    switch (deliverable.type) {
      case 'Document':
        return <DocumentDeliverableView deliverable={deliverable} />;
      case 'Species':
        return <SpeciesDeliverableView deliverable={deliverable} />;
      default:
        // TODO what should we do if the backend returns a type that the frontend isn't aware of yet/
        return null;
    }
  } else {
    return <Page isLoading={true} />;
  }
};

export default DeliverableViewWrapper;
