import { isInTheFuture } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

import {
  DeliverableCategoryType,
  DeliverableStatusTypeWithOverdue,
  DeliverableTypeType,
  ListDeliverablesElementWithOverdueAndDueDate,
} from './Deliverables';
import { ModuleEventStatus, ModuleEventType, ModuleEventWithStartTime } from './Module';

const ONE_DAY_IN_MILLIS = 1000 * 3600 * 24;

export type ToDoBadge = 'Not Submitted' | 'Event' | 'In Review' | 'Not Accepted' | 'Overdue' | 'Completed';
export type ToDoType = 'Deliverable' | ModuleEventType;
export type ToDoSection = 'To Do' | 'Upcoming' | 'Completed';

export interface ToDoItem {
  /**
   * returns true if this To-Do Item is completed
   */
  isCompleted(): boolean;

  /**
   * returns the date for sorting to-do items
   */
  getDate(): DateTime;

  /**
   * returns the date time string for displaying
   */
  getDisplayDateTimeString(): string;

  /**
   * returns the badge tag of the to do item
   */
  getBadge(): ToDoBadge;

  /**
   * returns the title of the to do item
   */
  getTitle(): string;

  /**
   * returns the types of to do items
   */
  getType(): ToDoType;

  /**
   * returns the section of the to do list it should be in
   */
  getSection(): ToDoSection;
}

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

  isCompleted = (): boolean => this.status == 'Approved' || this.status == 'Not Needed';

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

export class EventToDoItem implements ToDoItem {
  id: number;
  moduleId: number;
  moduleName: string;
  startTime: DateTime;
  status: ModuleEventStatus;
  type: ModuleEventType;

  constructor(event: ModuleEventWithStartTime) {
    this.id = event.id;
    this.moduleId = event.moduleId;
    this.moduleName = event.moduleName;
    this.startTime = DateTime.fromISO(event.startTime);
    this.status = event.status;
    this.type = event.type;
  }

  isCompleted = (): boolean => this.status == 'Ended';

  getDate = (): DateTime => this.startTime;

  getDisplayDateTimeString = (): string => this.startTime.toFormat('EEEE, LLLL dd, hh:mm a ZZZZ');

  getBadge = (): ToDoBadge => 'Event';

  getTitle = (): string => this.moduleName;

  getType = (): ToDoType => this.type;

  getSection = (): ToDoSection => {
    switch (this.status) {
      case 'Not Started':
        return 'Upcoming';
      case 'Starting Soon':
      case 'In Progress':
        return 'To Do';
      case 'Ended':
        return 'Completed';
    }
  };
}

export const compareToDoItems = (left: ToDoItem, right: ToDoItem): number => {
  const leftDate = left.getDate();
  const rightDate = right.getDate();

  const leftMidnight = leftDate.startOf('day');
  const rightMidnight = leftDate.startOf('day');

  if (leftMidnight < rightMidnight) {
    return -1;
  } else if (leftMidnight > rightMidnight) {
    return 1;
  } else {
    // Always order Events before Deliverables if they fall on the same day
    if (left instanceof EventToDoItem && !(right instanceof EventToDoItem)) {
      return -1;
    } else if (!(left instanceof EventToDoItem) && right instanceof EventToDoItem) {
      return 1;
    } else {
      return leftDate.toMillis() - rightDate.toMillis();
    }
  }
};
