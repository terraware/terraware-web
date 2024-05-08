import React from 'react';
import { useCallback } from 'react';

import { Button } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';
import { DeliverableToDoItem, EventToDoItem, ToDoItem } from 'src/types/ProjectToDo';

interface ToDoCtaProps {
  toDo: ToDoItem;
}

const ToDoCta = ({ toDo }: ToDoCtaProps) => {
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();

  const handleOnClick = useCallback(() => {
    switch (toDo.getType()) {
      case 'Workshop':
      case 'One-on-One Session':
      case 'Live Session':
        const event = toDo as EventToDoItem;
        return goToModuleEventSession(event.id, event.moduleId, event.projectId);
      case 'Deliverable':
        const deliverable = toDo as DeliverableToDoItem;
        return goToDeliverable(deliverable.id, deliverable.projectId);
    }
  }, [goToDeliverable, goToModuleEventSession, toDo]);

  return <Button label={strings.VIEW} onClick={handleOnClick} />;
};

export default ToDoCta;
