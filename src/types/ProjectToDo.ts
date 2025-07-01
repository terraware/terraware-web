import { DateTime } from 'luxon';

import { ModuleEventStatus, ModuleEventType, ModuleEventWithStartTime } from './Module';

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

  isCompleted = (): boolean => this.status === 'Ended';

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
