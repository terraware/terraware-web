import { isInTheFuture } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

import {
  DeliverableCategoryType,
  DeliverableStatusTypeWithOverdue,
  DeliverableTypeType,
  ListDeliverablesElementWithOverdueAndDueDate,
} from './Deliverables';
import { ToDoBadge, ToDoItem, ToDoSection, ToDoType } from './ProjectToDo';

const ONE_DAY_IN_MILLIS = 1000 * 3600 * 24;

export class DeliverableToDoItem implements ToDoItem {
  id: number;
  moduleId: number;
  moduleName: string;
  projectId: number;
  category: DeliverableCategoryType;
  dueDate: DateTime;
  name: string;
  status: DeliverableStatusTypeWithOverdue;
  type: DeliverableTypeType;

  constructor(item: ListDeliverablesElementWithOverdueAndDueDate) {
    this.id = item.id;
    this.category = item.category;
    this.dueDate = DateTime.fromISO(item.dueDate);
    this.name = item.name;
    this.moduleId = item.moduleId;
    this.moduleName = item.moduleName;
    this.projectId = item.projectId;
    this.status = item.status ?? 'Not Submitted';
    this.type = item.type;
  }

  isCompleted = (): boolean => this.status === 'Approved' || this.status === 'Not Needed';

  getDate = (): DateTime => this.dueDate;

  getDisplayDateTimeString = (): string => this.dueDate.toFormat('EEEE, LLLL dd yyyy');

  getBadge = (): ToDoBadge => {
    switch (this.status) {
      case 'Approved':
      case 'Completed':
      case 'Not Needed':
        return 'Completed';
      case 'In Review':
      case 'Needs Translation':
        return 'In Review';
      case 'Not Submitted':
        if (Date.now() > this.dueDate.valueOf()) {
          return 'Overdue';
        } else {
          return 'Not Submitted';
        }
      case 'Rejected':
        if (Date.now() > this.dueDate.valueOf()) {
          return 'Overdue';
        } else {
          return 'Not Accepted';
        }
      case 'Overdue':
        return 'Overdue';
    }
  };

  getTitle = (): string => this.name;

  getType = (): ToDoType => 'Deliverable';

  getSection = (): ToDoSection => {
    if (this.isCompleted()) {
      return 'Completed';
    }

    if (isInTheFuture(this.dueDate) && this.dueDate.diffNow().toMillis() > ONE_DAY_IN_MILLIS * 7) {
      return 'Upcoming';
    } else {
      return 'To Do';
    }
  };
}
