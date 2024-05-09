import { isInTheFuture } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

import { DeliverableCategoryType, DeliverableStatusType, DeliverableTypeType } from './Deliverables';
import { ModuleEventSessionStatus, ModuleEventType } from './Module';

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

export type DeliverableSearchResultType = {
  id: number;
  module_id: number;
  module_name: string;
  project_id: number;
  category: DeliverableCategoryType;
  dueDate: string;
  name: string;
  position: number;
  status: DeliverableStatusType | null;
  type: DeliverableTypeType;
};

export class DeliverableToDoItem implements ToDoItem {
  id: number;
  moduleId: number;
  moduleName: string;
  projectId: number;
  category: DeliverableCategoryType;
  dueDate: DateTime;
  name: string;
  position: number;
  status: DeliverableStatusType;
  type: DeliverableTypeType;

  constructor(searchResult: DeliverableSearchResultType) {
    this.id = searchResult.id;
    this.category = searchResult.category;
    this.dueDate = DateTime.fromISO(searchResult.dueDate);
    this.name = searchResult.name;
    this.moduleId = searchResult.module_id;
    this.moduleName = searchResult.module_name;
    this.position = searchResult.position;
    this.projectId = searchResult.project_id;
    this.status = searchResult.status ?? 'Not Submitted';
    this.type = searchResult.type;
  }

  isCompleted = (): boolean => this.status == 'Approved' || this.status == 'Not Needed';

  getDate = (): DateTime => this.dueDate;

  getDisplayDateTimeString = (): string => this.dueDate.toFormat('EEEE, LLLL dd yyyy');

  getBadge = (): ToDoBadge => {
    switch (this.status) {
      case 'Approved':
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

export type EventSearchResultType = {
  id: number;
  module_id: number;
  module_name: string;
  projects_id: number;
  startTime: string;
  status: ModuleEventSessionStatus;
  type: ModuleEventType;
};

export class EventToDoItem implements ToDoItem {
  id: number;
  moduleId: number;
  moduleName: string;
  projectId: number;
  startTime: DateTime;
  status: ModuleEventSessionStatus;
  type: ModuleEventType;

  constructor(searchResult: EventSearchResultType) {
    this.id = searchResult.id;
    this.moduleId = searchResult.module_id;
    this.moduleName = searchResult.module_name;
    this.projectId = searchResult.projects_id;
    this.startTime = DateTime.fromISO(searchResult.startTime);
    this.status = searchResult.status;
    this.type = searchResult.type;
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
