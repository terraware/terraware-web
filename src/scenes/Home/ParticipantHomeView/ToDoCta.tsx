import React from 'react';
import { useCallback } from 'react';

import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import strings from 'src/strings';
import { DeliverableToDoItem } from 'src/types/DeliverableToDoItem';
import { EventToDoItem, ToDoItem } from 'src/types/ProjectToDo';

import { useToDoData } from './ToDoProvider/Context';

interface ToDoCtaProps {
  toDo: ToDoItem;
}

const ToDoCta = ({ toDo }: ToDoCtaProps) => {
  const { projectId } = useToDoData();
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();
  const { isMobile } = useDeviceInfo();
  const trackEvent = useTrackEvent();

  const handleOnClick = useCallback(() => {
    if (projectId === -1) {
      return;
    }
    switch (toDo.getType()) {
      case 'Workshop':
      case 'One-on-One Session':
      case 'Live Session':
      case 'Recorded Session': {
        const event = toDo as EventToDoItem;

        trackEvent(MIXPANEL_EVENTS.PARTICIPANT_TODO_EVENT_VIEWED, {
          id: event.id,
          type: event.type,
          status: event.status,
          moduleId: event.moduleId,
        });
        return goToModuleEventSession(projectId, event.moduleId, event.id);
      }
      case 'Deliverable': {
        const deliverable = toDo as DeliverableToDoItem;
        trackEvent(MIXPANEL_EVENTS.PARTICIPANT_TODO_DELIVERABLE_VIEWED, {
          id: deliverable.id,
          type: deliverable.type,
          category: deliverable.category,
          status: deliverable.status,
          moduleId: deliverable.moduleId,
        });
        return goToDeliverable(deliverable.id, deliverable.projectId);
      }
    }
  }, [goToDeliverable, goToModuleEventSession, projectId, toDo, trackEvent]);

  return (
    <Button
      priority={'secondary'}
      style={isMobile ? { width: '100%' } : {}}
      label={strings.VIEW}
      onClick={handleOnClick}
    />
  );
};

export default ToDoCta;
