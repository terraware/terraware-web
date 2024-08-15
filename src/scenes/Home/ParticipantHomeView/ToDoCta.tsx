import React from 'react';
import { useCallback } from 'react';

import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';
import { DeliverableToDoItem, EventToDoItem, ToDoItem } from 'src/types/ProjectToDo';
import { useMixpanel } from 'react-mixpanel-browser';

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

        mixpanel?.track('To-Do/Upcoming View Event', {
          'id': event.id,
          'type': event.type,
          'status': event.status,
          'moduleId': event.moduleId,
        });
        return goToModuleEventSession(event.projectId, event.moduleId, event.id);
      case 'Deliverable':
        const deliverable = toDo as DeliverableToDoItem;
        mixpanel?.track('To-Do/Upcoming View Deliverable', {
          'id': deliverable.id,
          'type': deliverable.type,
          'category': deliverable.category,
          'status': deliverable.status,
          'moduleId': deliverable.moduleId,
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
