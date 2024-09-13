import React from 'react';
import { useCallback } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import strings from 'src/strings';
import { DeliverableToDoItem, EventToDoItem, ToDoItem } from 'src/types/ProjectToDo';

interface ToDoCtaProps {
  toDo: ToDoItem;
}

const ToDoCta = ({ toDo }: ToDoCtaProps) => {
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();
  const { isMobile } = useDeviceInfo();
  const mixpanel = useMixpanel();

  const handleOnClick = useCallback(() => {
    switch (toDo.getType()) {
      case 'Workshop':
      case 'One-on-One Session':
      case 'Live Session':
        const event = toDo as EventToDoItem;

        mixpanel?.track(MIXPANEL_EVENTS.PART_EX_TO_DO_UPCOMING_VIEW_EVENT, {
          id: event.id,
          type: event.type,
          status: event.status,
          moduleId: event.moduleId,
        });
        return goToModuleEventSession(event.projectId, event.moduleId, event.id);
      case 'Deliverable':
        const deliverable = toDo as DeliverableToDoItem;
        mixpanel?.track(MIXPANEL_EVENTS.PART_EX_TO_DO_UPCOMING_VIEW_DELIVERABLE, {
          id: deliverable.id,
          type: deliverable.type,
          category: deliverable.category,
          status: deliverable.status,
          moduleId: deliverable.moduleId,
        });
        return goToDeliverable(deliverable.id, deliverable.projectId);
    }
  }, [goToDeliverable, goToModuleEventSession, toDo]);

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
