import { createContext, useContext } from 'react';

import { ToDoItem } from 'src/types/ProjectToDo';

export type ToDoData = {
  projectId: number;
  allItems: ToDoItem[];
  toDoItems: ToDoItem[];
  upcomingItems: ToDoItem[];
};

// default values pointing to nothing
export const ToDoContext = createContext<ToDoData>({
  projectId: -1,
  allItems: [],
  toDoItems: [],
  upcomingItems: [],
});

export const useToDoData = () => useContext(ToDoContext);
