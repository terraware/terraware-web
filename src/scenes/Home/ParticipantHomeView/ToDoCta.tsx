import React from 'react';
import { useCallback } from 'react';

import { Button } from '@terraware/web-components';
import { ButtonPriority } from '@terraware/web-components/components/Button/Button';

import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';

import { ToDoType } from './ToDo';

interface ToDoCtaProps {
  toDo: ToDoType;
}

const getCtaLabel = (type: ToDoType['type']): string => {
  switch (type) {
    case '1:1 Session':
    case 'Live Session':
      return strings.JOIN;
    default:
      return strings.VIEW;
  }
};

const ToDoCta = ({ toDo }: ToDoCtaProps) => {
  const { goToDeliverable, goToModuleEventSession } = useNavigateTo();

  const handleOnClick = useCallback(() => {
    if (toDo.deliverableId) {
      goToDeliverable(toDo.deliverableId, toDo.projectId);
    } else if (toDo.eventId) {
      goToModuleEventSession(toDo.eventId, toDo.moduleId);
    }
  }, [goToDeliverable, goToModuleEventSession, toDo]);

  // How do we determine if an event is ready to join? Probably answered by BE when it is ready
  let priority: ButtonPriority = 'primary';
  let disabled = false;
  if (toDo.type !== 'Deliverable') {
    priority = 'secondary';
    disabled = true;
  }

  return <Button label={getCtaLabel(toDo.type)} onClick={handleOnClick} priority={priority} disabled={disabled} />;
};

export default ToDoCta;
